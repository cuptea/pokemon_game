import Phaser from "phaser";
import { getBattleCreatureArt } from "../data/battleCreatureArt";
import { registry } from "../data/registry";
import { getStoryProfile } from "../data/stories";
import {
  getAvatarLabel,
  getDifficultyLabel,
  getLocalizedStoryStatus,
  getLocalizedStorySurface,
  t,
} from "../game/i18n";
import { submitLeaderboardFromCurrentWorldState } from "../services/leaderboard";
import { getStoryVisualTheme, toHexColor, type StoryVisualTheme } from "../game/storyVisuals";
import { getTerrainStyle, isWaterTone } from "../game/terrainRender";
import { createUiPanel } from "../game/uiSkin";
import { createCenteredRoamBounds, createZoneRoamBounds, pickRoamTarget, type RoamBounds } from "../game/wander";
import { resetWorldState, saveWorldState, worldState } from "../game/worldState";
import { DIFFICULTY_RULES, GAME_FONT, PLAYER_AVATARS, THEME } from "../game/theme";
import type {
  BattleResult,
  DecorationPlacement,
  EncounterSlot,
  EncounterZone,
  ExitDefinition,
  Facing,
  HeroMapOverride,
  InteractablePlacement,
  MapModule,
  NpcPlacement,
  TrainerPlacement,
  WildEncounterDefinition,
  WorldPatch,
} from "../types/world";

const MAX_SPEED = 190;
const ACCELERATION = 0.22;
const INTERACTION_RANGE = 90;

type Interactable =
  | { kind: "npc"; data: NpcActor; prompt: string }
  | { kind: "trainer"; data: TrainerActor; prompt: string }
  | { kind: "wild"; data: WildRoamerActor; prompt: string }
  | { kind: "exit"; data: ExitDefinition; prompt: string }
  | { kind: "world"; data: InteractablePlacement; prompt: string };

type BaseRoamingActor = {
  id: string;
  sprite: Phaser.GameObjects.Image;
  roamBounds: RoamBounds;
  speed: number;
  pauseUntil: number;
  moveTween?: Phaser.Tweens.Tween;
};

type NpcActor = BaseRoamingActor & {
  kind: "npc";
  data: NpcPlacement;
};

type TrainerActor = BaseRoamingActor & {
  kind: "trainer";
  data: TrainerPlacement;
};

type WildRoamerActor = BaseRoamingActor & {
  kind: "wild";
  data: WildEncounterDefinition;
  zoneId: string;
};

export class OverworldScene extends Phaser.Scene {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keys!: {
    up: Phaser.Input.Keyboard.Key;
    down: Phaser.Input.Keyboard.Key;
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
    interact: Phaser.Input.Keyboard.Key;
    help: Phaser.Input.Keyboard.Key;
    party: Phaser.Input.Keyboard.Key;
    reset: Phaser.Input.Keyboard.Key;
  };
  private player!: Phaser.Physics.Arcade.Sprite;
  private playerShadow!: Phaser.GameObjects.Ellipse;
  private map!: MapModule;
  private visualTheme!: StoryVisualTheme;
  private promptText!: Phaser.GameObjects.Text;
  private messageText!: Phaser.GameObjects.Text;
  private hudText!: Phaser.GameObjects.Text;
  private areaText!: Phaser.GameObjects.Text;
  private currentInteractable: Interactable | null = null;
  private encounterZone: EncounterZone | null = null;
  private interactionLockedUntil = 0;
  private transitionLocked = false;
  private encounterTravel = 0;
  private lastPlayerPosition = new Phaser.Math.Vector2();
  private statusText!: Phaser.GameObjects.Text;
  private helpPanel!: Phaser.GameObjects.Container;
  private helpVisible = false;
  private walkCycle = 0;
  private facing: Facing = "down";
  private npcActors: NpcActor[] = [];
  private trainerActors: TrainerActor[] = [];
  private wildActors: WildRoamerActor[] = [];

  constructor() {
    super("OverworldScene");
  }

  create(): void {
    this.bindInput();
    this.loadCurrentMap(true);

    this.game.events.on("battle-complete", this.handleBattleComplete, this);
    this.game.events.on("party-updated", this.handlePartyUpdated, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.game.events.off("battle-complete", this.handleBattleComplete, this);
      this.game.events.off("party-updated", this.handlePartyUpdated, this);
    });
  }

  update(_time: number, delta: number): void {
    if (Phaser.Input.Keyboard.JustDown(this.keys.help)) {
      this.toggleHelp();
    }

    if (Phaser.Input.Keyboard.JustDown(this.keys.party)) {
      this.openPartyMenu();
      return;
    }

    if (Phaser.Input.Keyboard.JustDown(this.keys.reset)) {
      this.resetProgress();
      return;
    }

    this.handleMovement(delta);
    this.updateRoamingActors();
    this.updateCurrentInteractable();
    this.updateEncounterState();
    this.maybeTriggerWildEncounter();

    if (
      Phaser.Input.Keyboard.JustDown(this.keys.interact) &&
      this.currentInteractable &&
      !this.isInteractionLocked
    ) {
      this.handleInteraction(this.currentInteractable);
    }
  }

  private get isInteractionLocked(): boolean {
    return this.transitionLocked || this.time.now < this.interactionLockedUntil;
  }

  private get activeStory() {
    return getStoryProfile(worldState.selectedAvatar);
  }

  private get localizedStory() {
    return getLocalizedStorySurface(worldState.selectedAvatar);
  }

  private get localizedStoryStatus() {
    return getLocalizedStoryStatus(worldState);
  }

  private get availableExits(): ExitDefinition[] {
    return this.activeExits.filter(
      (exit) => !exit.availableTo || exit.availableTo.includes(worldState.selectedAvatar),
    );
  }

  private get activePatches() {
    return [...this.map.patches, ...(this.map.heroPatches?.[worldState.selectedAvatar] ?? [])];
  }

  private get activeDecorations() {
    return [
      ...this.map.decorations,
      ...(this.map.heroDecorations?.[worldState.selectedAvatar] ?? []),
    ];
  }

  private get activeBackgroundColor() {
    return this.map.heroBackgroundColor?.[worldState.selectedAvatar] ?? this.map.backgroundColor;
  }

  private get activeInteractives() {
    return this.mergeHeroOverrides(
      this.map.interactives,
      this.map.heroInteractives?.[worldState.selectedAvatar],
    );
  }

  private get activeExits() {
    return this.mergeHeroOverrides(this.map.exits, this.map.heroExits?.[worldState.selectedAvatar]);
  }

  private bindInput(): void {
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.keys = this.input.keyboard!.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      interact: Phaser.Input.Keyboard.KeyCodes.E,
      help: Phaser.Input.Keyboard.KeyCodes.H,
      party: Phaser.Input.Keyboard.KeyCodes.C,
      reset: Phaser.Input.Keyboard.KeyCodes.R,
    }) as OverworldScene["keys"];
  }

  private mergeHeroOverrides<T extends { id: string }>(
    baseItems: T[],
    heroOverrides?: HeroMapOverride<T>,
  ): T[] {
    if (!heroOverrides || heroOverrides.length === 0) {
      return baseItems;
    }

    const overrideMap = new Map(heroOverrides.map((item) => [item.id, item]));
    const merged = baseItems.map((item) => ({
      ...item,
      ...(overrideMap.get(item.id) ?? {}),
    }));
    const knownIds = new Set(baseItems.map((item) => item.id));

    for (const override of heroOverrides) {
      if (!knownIds.has(override.id)) {
        merged.push(override as T);
      }
    }

    return merged;
  }

  private loadCurrentMap(initial = false): void {
    this.map = registry.maps[worldState.currentMapId];
    this.visualTheme = getStoryVisualTheme(worldState.selectedAvatar, this.map.id);
    const spawn = this.map.spawnPoints[worldState.currentSpawnId];

    this.npcActors = [];
    this.trainerActors = [];
    this.wildActors = [];
    this.currentInteractable = null;
    this.children.removeAll();
    this.physics.world.colliders.destroy();
    this.physics.world.setBounds(0, 0, this.map.width, this.map.height);
    this.cameras.main.setBounds(0, 0, this.map.width, this.map.height);
    this.cameras.main.setBackgroundColor(this.activeBackgroundColor);

    this.renderMap();
    this.createUi();
    this.spawnPlayer(spawn.x, spawn.y);
    this.lastPlayerPosition.set(spawn.x, spawn.y);
    this.encounterTravel = 0;
    this.areaText.setText(this.map.title);
    this.setMessage(
      initial
        ? this.localizedStory.openingMessage
        : t("overworld.arrived", {
            map: this.map.title,
            objective: this.localizedStoryStatus.currentObjective,
          }),
    );
    this.refreshStatus();
    saveWorldState();

    if (initial) {
      this.cameras.main.fadeIn(240, 8, 19, 31);
    }
  }

  private createUi(): void {
    const width = Number(this.scale.gameSize.width);
    const height = Number(this.scale.gameSize.height);

    this.createPanel(width - 48, 64, 24, 18, "warm", THEME.panelStroke, 0.92);
    this.areaText = this.add
      .text(40, 28, "", {
        fontFamily: GAME_FONT,
        fontSize: "22px",
        color: THEME.text,
        fontStyle: "bold",
      })
      .setScrollFactor(0)
      .setDepth(30);

    this.createPanel(width - 48, 60, 24, 88, "cool", THEME.panelStroke, 0.88);
    this.hudText = this.add
      .text(40, 102, t("overworld.hud_default"), {
        fontFamily: GAME_FONT,
        fontSize: "17px",
        color: THEME.textMuted,
        wordWrap: { width: width - 90 },
      })
      .setScrollFactor(0)
      .setDepth(30);

    this.createPanel(250, 108, width - 274, 18, "cool", THEME.panelStroke, 0.9);
    this.statusText = this.add
      .text(width - 258, 32, "", {
        fontFamily: GAME_FONT,
        fontSize: "16px",
        color: THEME.textMuted,
        wordWrap: { width: 220 },
      })
      .setScrollFactor(0)
      .setDepth(30);

    this.createPanel(width - 48, 56, 24, height - 156, "cool", THEME.panelStroke, 0.92);
    this.promptText = this.add
      .text(40, height - 142, "", {
        fontFamily: GAME_FONT,
        fontSize: "18px",
        color: "#fefae0",
        fontStyle: "bold",
      })
      .setScrollFactor(0)
      .setDepth(30)
      .setVisible(false);

    this.createPanel(width - 48, 88, 24, height - 88, "warm", THEME.panelStroke, 0.94);
    this.messageText = this.add
      .text(40, height - 72, "", {
        fontFamily: GAME_FONT,
        fontSize: "21px",
        color: THEME.text,
        wordWrap: { width: width - 90 },
      })
      .setScrollFactor(0)
      .setDepth(30);

    this.helpPanel = this.createHelpPanel(width, height);
  }

  private createPanel(
    width: number,
    height: number,
    x: number,
    y: number,
    variant: "warm" | "cool",
    strokeColor: number,
    alpha: number,
  ): void {
    createUiPanel({
      scene: this,
      x,
      y,
      width,
      height,
      variant,
      alpha,
      depth: 25,
      scrollFactor: 0,
      strokeColor,
    });
  }

  private renderBackdrop(): void {
    const centerX = this.map.width / 2;
    const centerY = this.map.height / 2;
    const skyGlow = this.add
      .rectangle(centerX, centerY * 0.42, this.map.width + 120, this.map.height * 0.68, this.visualTheme.skyTop, 0.22)
      .setDepth(-90);
    const hazeBand = this.add
      .tileSprite(centerX, 180, this.map.width + 180, 240, this.visualTheme.overlayTexture)
      .setTint(this.visualTheme.haze)
      .setAlpha(0.07)
      .setDepth(-88);

    this.tweens.add({
      targets: hazeBand,
      tilePositionX: this.visualTheme.atmosphere === "mist" ? 96 : 52,
      duration: this.visualTheme.atmosphere === "mist" ? 24000 : 18000,
      repeat: -1,
      ease: "Linear",
    });
    this.tweens.add({
      targets: skyGlow,
      alpha: { from: 0.16, to: 0.26 },
      duration: 3200,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    for (let index = 0; index < 6; index += 1) {
      const width = 340 + index * 90;
      const height = 90 + (index % 3) * 28;
      this.add
        .ellipse(120 + index * 280, 260 + (index % 2) * 22, width, height, this.visualTheme.horizon, 0.2)
        .setDepth(-86 + index);
    }

    for (let index = 0; index < 16; index += 1) {
      const mote =
        this.visualTheme.atmosphere === "mist"
          ? this.add.ellipse(
              Phaser.Math.Between(40, this.map.width - 40),
              Phaser.Math.Between(120, this.map.height - 120),
              Phaser.Math.Between(28, 54),
              Phaser.Math.Between(8, 18),
              this.visualTheme.haze,
              0.08,
            )
          : this.add.ellipse(
              Phaser.Math.Between(40, this.map.width - 40),
              Phaser.Math.Between(120, this.map.height - 120),
              this.visualTheme.atmosphere === "embers" ? 4 : 7,
              this.visualTheme.atmosphere === "embers" ? 4 : 10,
              this.visualTheme.atmosphere === "embers" ? this.visualTheme.accent : this.visualTheme.accentSoft,
              this.visualTheme.atmosphere === "embers" ? 0.42 : 0.14,
            );
      mote.setDepth(-72 + (index % 3));
      this.tweens.add({
        targets: mote,
        x: mote.x + Phaser.Math.Between(-50, 50),
        y: mote.y + Phaser.Math.Between(
          this.visualTheme.atmosphere === "embers" ? -80 : -20,
          this.visualTheme.atmosphere === "mist" ? 10 : -70,
        ),
        alpha:
          this.visualTheme.atmosphere === "mist"
            ? { from: 0.04, to: 0.12 }
            : this.visualTheme.atmosphere === "embers"
              ? { from: 0.22, to: 0.55 }
              : { from: 0.08, to: 0.22 },
        duration: Phaser.Math.Between(3600, 7200),
        yoyo: true,
        repeat: -1,
        delay: index * 110,
        ease: "Sine.easeInOut",
      });
    }
  }

  private addPatchAccent(patch: WorldPatch): void {
    if (!isWaterTone(patch.color)) {
      return;
    }

    for (let index = 0; index < 3; index += 1) {
      const shimmer = this.add
        .rectangle(
          patch.x + patch.width * (0.18 + index * 0.27),
          patch.y + patch.height * (0.22 + index * 0.2),
          Math.max(36, patch.width * 0.26),
          3,
          0xffffff,
          0.12,
        )
        .setAngle(-7)
        .setDepth(patch.y + patch.height / 2 + index);
      this.tweens.add({
        targets: shimmer,
        alpha: { from: 0.04, to: 0.16 },
        x: shimmer.x + 16,
        duration: 1800 + index * 260,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    }
  }

  private drawDecorationAura(decoration: DecorationPlacement): void {
    if (!["tower", "dock", "house", "sign"].includes(decoration.textureKey)) {
      return;
    }

    const scale = (decoration.scale ?? 1) * this.getWorldTextureScale(decoration.textureKey);
    const aura = this.add
      .ellipse(
        decoration.x,
        decoration.y + 12,
        Math.max(44, 76 * scale),
        Math.max(18, 26 * scale),
        decoration.textureKey === "tower" ? this.visualTheme.accent : this.visualTheme.accentSoft,
        decoration.textureKey === "sign" ? 0.12 : 0.16,
      )
      .setDepth(decoration.y - 2);
    this.tweens.add({
      targets: aura,
      alpha: { from: aura.alpha * 0.65, to: aura.alpha * 1.15 },
      duration: decoration.textureKey === "tower" ? 1400 : 2000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }

  private drawInteractableMarker(worldItem: InteractablePlacement): void {
    const defaults =
      worldItem.kind === "loot"
        ? { label: t("overworld.marker_loot"), tint: THEME.success, fill: this.visualTheme.horizon, radius: 26 }
        : worldItem.kind === "quest"
          ? {
              label: t("overworld.marker_clue"),
              tint: this.visualTheme.accent,
              fill: this.visualTheme.skyTop,
              radius: 30,
            }
          : {
              label: t("overworld.marker_read"),
              tint: this.visualTheme.accentSoft,
              fill: this.visualTheme.skyTop,
              radius: 24,
            };

    const tint = worldItem.markerTint ?? defaults.tint;
    const fill = worldItem.markerFill ?? defaults.fill;
    const labelText = worldItem.markerLabel ?? defaults.label;
    const radius = worldItem.markerRadius ?? defaults.radius;

    const aura = this.add
      .ellipse(
        worldItem.x,
        worldItem.y + 14,
        radius * 2.5,
        Math.max(16, radius * 0.95),
        tint,
        worldItem.kind === "quest" ? 0.22 : 0.18,
      )
      .setDepth(worldItem.y - 4);
    const beacon = this.add
      .circle(worldItem.x, worldItem.y - 22, Math.max(9, radius * 0.34), tint, 0.95)
      .setStrokeStyle(2, 0xf8f9fa, 0.9)
      .setDepth(worldItem.y - 2);
    const label = this.add
      .text(worldItem.x, worldItem.y - 48, labelText, {
        fontFamily: GAME_FONT,
        fontSize: "12px",
        color: "#f8f9fa",
        backgroundColor: toHexColor(fill),
        padding: { x: 6, y: 3 },
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setDepth(worldItem.y - 1);

    this.tweens.add({
      targets: [aura, beacon, label],
      alpha: { from: 0.68, to: 1 },
      duration: worldItem.kind === "quest" ? 760 : 980,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
    this.tweens.add({
      targets: [beacon, label],
      y: "-=5",
      duration: worldItem.kind === "loot" ? 1280 : 940,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }

  private renderMap(): void {
    this.tweens.killAll();
    this.renderBackdrop();
    const graphics = this.add.graphics();

    for (const patch of this.activePatches) {
      this.drawTerrainPatch(graphics, patch);
    }

    for (const wall of this.map.walls) {
      const block = this.drawWallBoundary(wall);
      this.physics.add.existing(block, true);
    }

    for (const decoration of this.activeDecorations) {
      this.drawDecorationAura(decoration);
      this.add
        .image(decoration.x, decoration.y, decoration.textureKey)
        .setTint(decoration.tint ?? 0xffffff)
        .setScale((decoration.scale ?? 1) * this.getWorldTextureScale(decoration.textureKey))
        .setAlpha(decoration.alpha ?? 1)
        .setDepth(decoration.y);
    }

    for (const exit of this.availableExits) {
      this.drawExitMarker(exit);
    }

    for (const worldItem of this.activeInteractives) {
      if (worldItem.once && worldState.collectedInteractives[worldItem.id]) {
        continue;
      }

      this.drawInteractableMarker(worldItem);
      const itemSprite = this.add
        .image(worldItem.x, worldItem.y, worldItem.textureKey)
        .setTint(worldItem.tint ?? 0xffffff)
        .setScale(this.getWorldTextureScale(worldItem.textureKey))
        .setDepth(worldItem.y);

      if (worldItem.kind !== "sign") {
        this.tweens.add({
          targets: itemSprite,
          y: itemSprite.y - 4,
          duration: worldItem.kind === "quest" ? 920 : 1160,
          yoyo: true,
          repeat: -1,
          ease: "Sine.easeInOut",
        });
      }
    }

    this.npcActors = this.map.npcs.map((npc) => this.spawnNpcActor(npc));
    this.trainerActors = this.map.trainers.map((trainer) => this.spawnTrainerActor(trainer));
    this.wildActors = this.spawnWildRoamers();
  }

  private spawnNpcActor(npc: NpcPlacement): NpcActor {
    const sprite = this.add
      .image(npc.x, npc.y, "npc")
      .setTint(npc.color)
      .setDepth(npc.y);
    const actor: NpcActor = {
      kind: "npc",
      id: npc.id,
      data: npc,
      sprite,
      roamBounds: createCenteredRoamBounds(npc.x, npc.y, 56, this.map.width, this.map.height),
      speed: 26,
      pauseUntil: this.time.now + Phaser.Math.Between(150, 900),
    };
    this.addCharacterIdleTween(sprite, npc.id);
    return actor;
  }

  private spawnTrainerActor(trainer: TrainerPlacement): TrainerActor {
    const sprite = this.add
      .image(trainer.x, trainer.y, "trainer")
      .setTint(trainer.color)
      .setDepth(trainer.y);
    const actor: TrainerActor = {
      kind: "trainer",
      id: trainer.id,
      data: trainer,
      sprite,
      roamBounds: createCenteredRoamBounds(
        trainer.x,
        trainer.y,
        64,
        this.map.width,
        this.map.height,
      ),
      speed: 28,
      pauseUntil: this.time.now + Phaser.Math.Between(250, 1100),
    };
    this.addCharacterIdleTween(sprite, trainer.id);
    return actor;
  }

  private spawnWildRoamers(): WildRoamerActor[] {
    const actors: WildRoamerActor[] = [];

    for (const zone of this.map.encounterZones) {
      const encounter = this.rollEncounter(zone);
      if (!encounter) {
        continue;
      }

      const roamBounds = createZoneRoamBounds(zone, 36);
      const spawn = pickRoamTarget(roamBounds);
      const art = getBattleCreatureArt(encounter.creatureId);
      const textureKey = art?.frontKey ?? "npc";
      const scale = art ? Math.max(0.42, art.enemyScale * 0.28) : 0.62;
      const tint = registry.creatures[encounter.creatureId]?.color ?? 0xffffff;
      const sprite = this.add
        .image(spawn.x, spawn.y, textureKey)
        .setScale(scale)
        .setTint(tint)
        .setDepth(spawn.y);
      const actor: WildRoamerActor = {
        kind: "wild",
        id: `wild-${zone.id}-${encounter.creatureId}`,
        data: encounter,
        zoneId: zone.id,
        sprite,
        roamBounds,
        speed: 24,
        pauseUntil: this.time.now + Phaser.Math.Between(200, 1000),
      };
      this.addCharacterIdleTween(sprite, actor.id);
      actors.push(actor);
    }

    return actors;
  }

  private updateRoamingActors(): void {
    if (this.transitionLocked || this.helpVisible) {
      return;
    }

    for (const actor of [...this.npcActors, ...this.trainerActors, ...this.wildActors]) {
      actor.sprite.setDepth(actor.sprite.y);

      if (actor.moveTween?.isPlaying()) {
        continue;
      }

      if (this.time.now < actor.pauseUntil) {
        continue;
      }

      this.startActorWander(actor);
    }
  }

  private startActorWander(actor: NpcActor | TrainerActor | WildRoamerActor): void {
    const target = pickRoamTarget(actor.roamBounds);
    const distance = Phaser.Math.Distance.Between(actor.sprite.x, actor.sprite.y, target.x, target.y);

    if (distance < 10) {
      actor.pauseUntil = this.time.now + Phaser.Math.Between(500, 1400);
      return;
    }

    actor.moveTween = this.tweens.add({
      targets: actor.sprite,
      x: target.x,
      y: target.y,
      duration: Math.max(700, (distance / actor.speed) * 1000),
      ease: "Sine.easeInOut",
      onUpdate: () => {
        actor.sprite.setDepth(actor.sprite.y);
      },
      onComplete: () => {
        actor.moveTween = undefined;
        actor.pauseUntil = this.time.now + Phaser.Math.Between(650, 1800);
      },
    });
  }

  private getWorldTextureScale(textureKey: string): number {
    switch (textureKey) {
      case "tree":
        return 3.4;
      case "fence":
        return 2.8;
      case "sign":
        return 2.4;
      case "dock":
        return 2.6;
      default:
        return 1;
    }
  }

  private drawTerrainPatch(graphics: Phaser.GameObjects.Graphics, patch: WorldPatch): void {
    const terrainStyle = getTerrainStyle(this.map.id, patch);

    if (terrainStyle.textureKey) {
      const terrain = this.add
        .tileSprite(
          patch.x + patch.width / 2,
          patch.y + patch.height / 2,
          patch.width,
          patch.height,
          terrainStyle.textureKey,
        )
        .setDepth(-24);
      terrain.tileScaleX = 2;
      terrain.tileScaleY = 2;

      if (terrainStyle.overlayAlpha > 0) {
        graphics.fillStyle(patch.color, terrainStyle.overlayAlpha);
        graphics.fillRect(patch.x, patch.y, patch.width, patch.height);
      }
    } else {
      graphics.fillStyle(patch.color, patch.alpha ?? 1);
      graphics.fillRect(patch.x, patch.y, patch.width, patch.height);
    }

    if (patch.strokeColor !== undefined) {
      graphics.lineStyle(3, patch.strokeColor, terrainStyle.textureKey ? 0.72 : 0.9);
      graphics.strokeRect(patch.x, patch.y, patch.width, patch.height);
    }

    this.addPatchAccent(patch);
  }

  private drawWallBoundary(wall: {
    x: number;
    y: number;
    width: number;
    height: number;
  }): Phaser.GameObjects.Rectangle {
    const centerX = wall.x + wall.width / 2;
    const centerY = wall.y + wall.height / 2;
    const isBorderWall =
      wall.x <= 0 ||
      wall.y <= 0 ||
      wall.x + wall.width >= this.map.width ||
      wall.y + wall.height >= this.map.height;
    const isHorizontal = wall.width >= wall.height;
    const fillColor = isBorderWall ? 0x18304b : 0x1e3b2f;
    const strokeColor = isBorderWall ? this.visualTheme.accentSoft : 0xb08968;
    const stripeColor = isBorderWall ? this.visualTheme.haze : 0xe9c46a;
    const postColor = isBorderWall ? this.visualTheme.accent : 0x7f5539;
    const alpha = isBorderWall ? 0.9 : 0.82;

    const body = this.add
      .rectangle(centerX, centerY, wall.width, wall.height, fillColor, alpha)
      .setStrokeStyle(3, strokeColor, 0.98)
      .setDepth(centerY - 6);

    const inset = this.add
      .rectangle(
        centerX,
        centerY,
        Math.max(10, wall.width - 10),
        Math.max(10, wall.height - 10),
        isBorderWall ? this.visualTheme.horizon : 0x24533b,
        isBorderWall ? 0.38 : 0.34,
      )
      .setStrokeStyle(1, stripeColor, 0.55)
      .setDepth(centerY - 5);

    const markerCount = Math.max(2, Math.floor((isHorizontal ? wall.width : wall.height) / 42));
    for (let index = 0; index < markerCount; index += 1) {
      const progress = markerCount === 1 ? 0.5 : index / (markerCount - 1);
      const markerX = isHorizontal ? wall.x + progress * wall.width : centerX;
      const markerY = isHorizontal ? centerY : wall.y + progress * wall.height;
      const marker = this.add
        .rectangle(
          markerX,
          markerY,
          isHorizontal ? 10 : Math.max(14, wall.width - 12),
          isHorizontal ? Math.max(14, wall.height - 12) : 10,
          postColor,
          isBorderWall ? 0.82 : 0.72,
        )
        .setDepth(centerY - 4);

      if (isBorderWall) {
        marker.setStrokeStyle(1, stripeColor, 0.5);
      }
    }

    if (isBorderWall) {
      const warningLine = this.add
        .rectangle(
          centerX,
          centerY,
          isHorizontal ? wall.width : Math.max(8, wall.width - 20),
          isHorizontal ? Math.max(8, wall.height - 20) : wall.height,
          stripeColor,
          0.18,
        )
        .setDepth(centerY - 3);

      this.tweens.add({
        targets: [body, inset, warningLine],
        alpha: { from: isHorizontal ? 0.78 : 0.74, to: 1 },
        duration: 1100,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    }

    return body;
  }

  private spawnPlayer(x: number, y: number): void {
    this.playerShadow = this.add
      .ellipse(x, y + 18, 18, 8, THEME.shadow, 0.28)
      .setDepth(y - 1);

    this.player = this.physics.add.sprite(
      x,
      y,
      PLAYER_AVATARS[worldState.selectedAvatar].textureKey,
    );
    this.player.setCollideWorldBounds(true);
    this.player.setSize(24, 32);
    this.player.setOffset(3, 10);
    this.player.setDepth(y);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);

    const staticBodies = this.physics.world.staticBodies.getArray();
    for (const body of staticBodies) {
      const gameObject = body.gameObject as Phaser.GameObjects.GameObject | null;
      if (gameObject) {
        this.physics.add.collider(this.player, gameObject);
      }
    }
  }

  private handleMovement(delta: number): void {
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    let targetX = 0;
    let targetY = 0;

    if (!this.isInteractionLocked) {
      if (this.cursors.left.isDown || this.keys.left.isDown) {
        targetX = -MAX_SPEED;
      } else if (this.cursors.right.isDown || this.keys.right.isDown) {
        targetX = MAX_SPEED;
      }

      if (this.cursors.up.isDown || this.keys.up.isDown) {
        targetY = -MAX_SPEED;
      } else if (this.cursors.down.isDown || this.keys.down.isDown) {
        targetY = MAX_SPEED;
      }
    }

    const vector = new Phaser.Math.Vector2(targetX, targetY);
    if (vector.lengthSq() > 0) {
      vector.normalize().scale(MAX_SPEED);
    }

    const nextVelocityX = Phaser.Math.Linear(body.velocity.x, vector.x, ACCELERATION);
    const nextVelocityY = Phaser.Math.Linear(body.velocity.y, vector.y, ACCELERATION);

    body.setVelocity(
      Math.abs(nextVelocityX) < 6 ? 0 : nextVelocityX,
      Math.abs(nextVelocityY) < 6 ? 0 : nextVelocityY,
    );
    this.updatePlayerAnimation(delta, body.velocity.x, body.velocity.y);
    this.player.setDepth(this.player.y);
  }

  private updatePlayerAnimation(delta: number, velocityX: number, velocityY: number): void {
    const moving = Math.abs(velocityX) > 18 || Math.abs(velocityY) > 18;
    const dominantHorizontal = Math.abs(velocityX) > Math.abs(velocityY);

    if (dominantHorizontal && Math.abs(velocityX) > 8) {
      this.facing = velocityX < 0 ? "left" : "right";
      this.player.setFlipX(velocityX < 0);
    } else if (Math.abs(velocityY) > 8) {
      this.facing = velocityY < 0 ? "up" : "down";
    }

    if (!moving) {
      this.walkCycle = 0;
      this.player.setAngle(Phaser.Math.Linear(this.player.angle, 0, 0.28));
      this.player.setScale(
        Phaser.Math.Linear(this.player.scaleX, 1, 0.24),
        Phaser.Math.Linear(this.player.scaleY, 1, 0.24),
      );
      this.playerShadow
        .setPosition(this.player.x, this.player.y + 18)
        .setSize(
          Phaser.Math.Linear(this.playerShadow.width, 18, 0.22),
          Phaser.Math.Linear(this.playerShadow.height, 8, 0.22),
        )
        .setDepth(this.player.y - 1);
      return;
    }

    this.walkCycle += delta * 0.022;
    const step = Math.sin(this.walkCycle);
    const stride = Math.abs(step);
    const angle = dominantHorizontal ? step * 6 : step * 2.2;
    const scaleX = dominantHorizontal ? 1 + stride * 0.05 : 1 - stride * 0.03;
    let scaleY = dominantHorizontal ? 1 - stride * 0.05 : 1 + stride * 0.05;

    if (this.facing === "up") {
      scaleY -= 0.03;
    } else if (this.facing === "down") {
      scaleY += 0.02;
    }

    this.player.setAngle(angle);
    this.player.setScale(scaleX, scaleY);
    this.playerShadow
      .setPosition(this.player.x, this.player.y + 18)
      .setSize(18 - stride * 2, 8 - stride)
      .setDepth(this.player.y - 1);
  }

  private updateCurrentInteractable(): void {
    let nearest: Interactable | null = null;
    let nearestDistance = Number.POSITIVE_INFINITY;

    for (const npc of this.npcActors) {
      const distance = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        npc.sprite.x,
        npc.sprite.y,
      );
      if (distance < INTERACTION_RANGE && distance < nearestDistance) {
        nearest = {
          kind: "npc",
          data: npc,
          prompt: t("overworld.prompt_talk", { name: npc.data.name }),
        };
        nearestDistance = distance;
      }
    }

    for (const trainer of this.trainerActors) {
      const distance = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        trainer.sprite.x,
        trainer.sprite.y,
      );
      if (distance < INTERACTION_RANGE && distance < nearestDistance) {
        const defeated = Boolean(worldState.defeatedBattles[trainer.data.battleId]);
        nearest = {
          kind: "trainer",
          data: trainer,
          prompt: defeated
            ? t("overworld.prompt_trainer_talk", {
                trainerClass: trainer.data.trainerClass,
                name: trainer.data.name,
              })
            : t("overworld.prompt_challenge", {
                trainerClass: trainer.data.trainerClass,
                name: trainer.data.name,
              }),
        };
        nearestDistance = distance;
      }
    }

    for (const wildActor of this.wildActors) {
      const distance = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        wildActor.sprite.x,
        wildActor.sprite.y,
      );
      if (distance < INTERACTION_RANGE && distance < nearestDistance) {
        nearest = {
          kind: "wild",
          data: wildActor,
          prompt: t("overworld.prompt_wild", { name: registry.creatures[wildActor.data.creatureId].name }),
        };
        nearestDistance = distance;
      }
    }

    for (const worldItem of this.activeInteractives) {
      if (worldItem.once && worldState.collectedInteractives[worldItem.id]) {
        continue;
      }

      const distance = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        worldItem.x,
        worldItem.y,
      );

      if (distance < INTERACTION_RANGE && distance < nearestDistance) {
        nearest = { kind: "world", data: worldItem, prompt: worldItem.prompt };
        nearestDistance = distance;
      }
    }

    for (const exit of this.availableExits) {
      const zone = new Phaser.Geom.Rectangle(exit.x, exit.y, exit.width, exit.height);
      if (Phaser.Geom.Rectangle.Contains(zone, this.player.x, this.player.y)) {
        nearest = { kind: "exit", data: exit, prompt: exit.prompt };
        nearestDistance = 0;
      }
    }

    this.currentInteractable = nearest;

    if (nearest) {
      this.promptText.setVisible(true).setText(nearest.prompt);
    } else {
      this.promptText.setVisible(false);
    }
  }

  private updateEncounterState(): void {
    this.encounterZone = null;

    for (const zone of this.map.encounterZones) {
      if (
        Phaser.Geom.Rectangle.Contains(
          new Phaser.Geom.Rectangle(zone.x, zone.y, zone.width, zone.height),
          this.player.x,
          this.player.y,
        )
      ) {
        this.encounterZone = zone;
        break;
      }
    }

    if (this.encounterZone) {
      this.hudText.setText(
        t("overworld.hud_exploring", {
          map: this.map.title,
          zone: this.encounterZone.label,
          chapter: this.localizedStoryStatus.chapterTitle,
          objective: this.localizedStoryStatus.objectiveShort,
        }),
      );
    } else {
      this.hudText.setText(
        t("overworld.hud_controls", {
          chapter: this.localizedStoryStatus.chapterTitle,
          objective: this.localizedStoryStatus.objectiveShort,
        }),
      );
    }
  }

  private maybeTriggerWildEncounter(): void {
    if (this.isInteractionLocked || !this.encounterZone) {
      this.lastPlayerPosition.set(this.player.x, this.player.y);
      return;
    }

    const body = this.player.body as Phaser.Physics.Arcade.Body;
    if (body.speed < 25) {
      this.lastPlayerPosition.set(this.player.x, this.player.y);
      return;
    }

    if (
      this.wildActors.some(
        (actor) =>
          Phaser.Math.Distance.Between(this.player.x, this.player.y, actor.sprite.x, actor.sprite.y) <
          120,
      )
    ) {
      this.lastPlayerPosition.set(this.player.x, this.player.y);
      return;
    }

    this.encounterTravel += Phaser.Math.Distance.Between(
      this.lastPlayerPosition.x,
      this.lastPlayerPosition.y,
      this.player.x,
      this.player.y,
    );
    this.lastPlayerPosition.set(this.player.x, this.player.y);

    if (this.encounterTravel < 95) {
      return;
    }

    this.encounterTravel = 0;
    if (
      Math.random() >
      0.2 * DIFFICULTY_RULES[worldState.selectedDifficulty].encounterRateMultiplier
    ) {
      return;
    }

    const wildEncounter = this.rollEncounter(this.encounterZone);
    if (!wildEncounter) {
      return;
    }

    this.transitionLocked = true;
    this.player.setVelocity(0, 0);
    this.setMessage(
      t("overworld.wild_appears", {
        name: registry.creatures[wildEncounter.creatureId].name,
      }),
    );
    this.cameras.main.fadeOut(160, 8, 19, 31);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.launch("BattleScene", {
        playerPartyCreatureIds: [...worldState.selectedPartyCreatureIds],
        wildEncounter,
      });
      this.scene.pause();
    });
  }

  private handleInteraction(interactable: Interactable): void {
    this.interactionLockedUntil = this.time.now + 260;

    if (interactable.kind === "exit") {
      this.transitionToMap(interactable.data);
      return;
    }

    if (interactable.kind === "world") {
      const worldItem = interactable.data;
      const collected = Boolean(worldState.collectedInteractives[worldItem.id]);
      const override = worldItem.storyKey
        ? this.activeStory.dialogueByKey[worldItem.storyKey]
        : undefined;
      const lines = collected
        ? override?.collectedLines ?? worldItem.collectedLines ?? worldItem.lines
        : override?.lines ?? worldItem.lines;
      this.setMessage(lines.join(" "));

      if (worldItem.once && !collected) {
        worldState.collectedInteractives[worldItem.id] = true;
        saveWorldState();
        this.time.delayedCall(120, () => this.loadCurrentMap());
      }
      return;
    }

    if (interactable.kind === "npc") {
      const npc = interactable.data.data;
      const defeated = npc.battleId ? Boolean(worldState.defeatedBattles[npc.battleId]) : false;
      const override = npc.storyKey ? this.activeStory.dialogueByKey[npc.storyKey] : undefined;
      const lines = defeated
        ? override?.defeatedLines ?? npc.defeatedLines ?? npc.lines
        : override?.lines ?? npc.lines;
      this.setMessage(lines.join(" "));

      if (npc.battleId && !defeated) {
        this.launchBattle(npc.battleId);
      }
      return;
    }

    if (interactable.kind === "wild") {
      this.launchWildBattle(interactable.data);
      return;
    }

    const trainer = interactable.data.data;
    const defeated = Boolean(worldState.defeatedBattles[trainer.battleId]);
    this.setMessage((defeated ? trainer.defeatedLines : trainer.lines).join(" "));

    if (!defeated) {
      this.launchBattle(trainer.battleId);
    }
  }

  private transitionToMap(exit: ExitDefinition): void {
    if (this.transitionLocked) {
      return;
    }

    this.transitionLocked = true;
    this.player.setVelocity(0, 0);
    this.cameras.main.fadeOut(180, 8, 19, 31);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      worldState.currentMapId = exit.targetMapId;
      worldState.currentSpawnId = exit.targetSpawnId;
      saveWorldState();
      this.loadCurrentMap();
      this.cameras.main.fadeIn(220, 8, 19, 31);
      this.time.delayedCall(240, () => {
        this.transitionLocked = false;
      });
    });
  }

  private launchBattle(battleId: string): void {
    if (this.transitionLocked) {
      return;
    }

    this.transitionLocked = true;
    this.player.setVelocity(0, 0);
    this.cameras.main.fadeOut(160, 8, 19, 31);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.launch("BattleScene", {
        battleId,
        playerPartyCreatureIds: [...worldState.selectedPartyCreatureIds],
      });
      this.scene.pause();
    });
  }

  private launchWildBattle(actor: WildRoamerActor): void {
    if (this.transitionLocked) {
      return;
    }

    this.wildActors = this.wildActors.filter((wildActor) => wildActor.id !== actor.id);
    actor.moveTween?.stop();
    actor.sprite.destroy();

    this.transitionLocked = true;
    this.player.setVelocity(0, 0);
    this.setMessage(
      t("overworld.wild_appears", {
        name: registry.creatures[actor.data.creatureId].name,
      }),
    );
    this.cameras.main.fadeOut(160, 8, 19, 31);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.launch("BattleScene", {
        playerPartyCreatureIds: [...worldState.selectedPartyCreatureIds],
        wildEncounter: actor.data,
      });
      this.scene.pause();
    });
  }

  private handleBattleComplete(result: BattleResult): void {
    this.scene.resume();
    this.transitionLocked = false;
    this.cameras.main.fadeIn(220, 8, 19, 31);

    if (result.source === "trainer" && result.outcome === "win" && result.battleId) {
      worldState.defeatedBattles[result.battleId] = true;
      const reward = registry.trainerBattles[result.battleId]?.reward;
      if (reward) {
        this.setMessage(reward);
      }
      saveWorldState();
    } else if (result.source === "wild" && result.outcome === "win") {
      const capturedId = result.encounteredCreatureId;
      const creatureName = capturedId ? registry.creatures[capturedId]?.name : "wild creature";
      if (capturedId && registry.creatures[capturedId]) {
        const alreadyOwned = worldState.ownedCreatureIds.includes(capturedId);
        if (!alreadyOwned) {
          worldState.ownedCreatureIds = [...worldState.ownedCreatureIds, capturedId];
          if (worldState.selectedPartyCreatureIds.length < 3) {
            worldState.selectedPartyCreatureIds = [
              ...worldState.selectedPartyCreatureIds,
              capturedId,
            ];
          }
          worldState.activeCreatureId =
            worldState.selectedPartyCreatureIds[0] ?? capturedId;
          this.setMessage(
            worldState.selectedPartyCreatureIds.includes(capturedId)
              ? t("overworld.joined_team_added", { name: creatureName })
              : t("overworld.joined_team", { name: creatureName }),
          );
          saveWorldState();
        } else {
          this.setMessage(t("overworld.already_owned", { name: creatureName }));
        }
      } else {
        this.setMessage(t("overworld.grass_settles", { name: creatureName }));
      }
    } else if (result.outcome === "lose") {
      this.setMessage(t("overworld.lose_training"));
    } else {
      this.setMessage(t("overworld.escape_field"));
    }
    this.lastPlayerPosition.set(this.player.x, this.player.y);
    this.encounterTravel = 0;
    this.refreshStatus();
    if (result.outcome === "win") {
      void submitLeaderboardFromCurrentWorldState();
    }
  }

  private setMessage(message: string): void {
    this.messageText.setText(message);
  }

  private refreshStatus(): void {
    const defeatedCount = Object.keys(worldState.defeatedBattles).length;
    const collectedCount = Object.keys(worldState.collectedInteractives).length;
    const leadCreatureName =
      registry.creatures[worldState.selectedPartyCreatureIds[0]]?.name ??
      worldState.selectedPartyCreatureIds[0] ??
      worldState.activeCreatureId;
    this.statusText.setText(
      t("overworld.status", {
        hero: getAvatarLabel(worldState.selectedAvatar),
        lead: leadCreatureName,
        party: worldState.selectedPartyCreatureIds.length,
        owned: worldState.ownedCreatureIds.length,
        victories: defeatedCount,
        discoveries: collectedCount,
      }),
    );
  }

  private createHelpPanel(width: number, height: number): Phaser.GameObjects.Container {
    const panelWidth = 560;
    const panelHeight = 520;
    const panel = this.add.container(width / 2, height / 2).setScrollFactor(0).setDepth(40);

    const backdrop = createUiPanel({
      scene: this,
      x: -panelWidth / 2,
      y: -panelHeight / 2,
      width: panelWidth,
      height: panelHeight,
      variant: "warm",
      alpha: 1,
    });
    const title = this.add.text(-panelWidth / 2 + 24, -panelHeight / 2 + 20, t("overworld.help_title"), {
      fontFamily: GAME_FONT,
      fontSize: "28px",
      color: THEME.text,
      fontStyle: "bold",
    });
    const localizedStory = this.localizedStory;
    const localizedStatus = this.localizedStoryStatus;
    const body = this.add.text(
      -panelWidth / 2 + 24,
      -panelHeight / 2 + 66,
      t("overworld.help_body", {
        hero: getAvatarLabel(worldState.selectedAvatar),
        lead:
          registry.creatures[worldState.selectedPartyCreatureIds[0]]?.name ??
          worldState.activeCreatureId,
        party: worldState.selectedPartyCreatureIds.length,
        owned: worldState.ownedCreatureIds.length,
        story: localizedStory.storyTitle,
        act: localizedStatus.actLabel,
        difficulty: getDifficultyLabel(worldState.selectedDifficulty),
        goal: localizedStatus.currentObjective,
        nextLandmark: localizedStatus.nextLandmark,
        mystery: localizedStory.regionalMystery,
        mentor: localizedStory.mentorHook,
        route: localizedStatus.routeLabel,
        arc: localizedStory.longArc,
        chapterSummary: localizedStatus.chapterSummary,
        mapCount: Object.keys(registry.maps).length,
      }),
      {
        fontFamily: GAME_FONT,
        fontSize: "15px",
        color: THEME.textMuted,
        wordWrap: { width: panelWidth - 48 },
        lineSpacing: 2,
      },
    );

    panel.add([backdrop, title, body]);
    panel.setVisible(false);
    return panel;
  }

  private toggleHelp(): void {
    this.helpVisible = !this.helpVisible;
    this.helpPanel.setVisible(this.helpVisible);
    this.interactionLockedUntil = this.time.now + 120;
    if (this.helpVisible) {
      this.player.setVelocity(0, 0);
    }
  }

  private resetProgress(): void {
    const avatar = worldState.selectedAvatar;
    const difficulty = worldState.selectedDifficulty;
    resetWorldState();
    worldState.selectedAvatar = avatar;
    worldState.selectedDifficulty = difficulty;
    worldState.introCompleted = true;
    saveWorldState();
    this.helpVisible = false;
    if (this.helpPanel) {
      this.helpPanel.setVisible(false);
    }
    this.transitionLocked = false;
    this.interactionLockedUntil = this.time.now + 180;
    this.loadCurrentMap();
    this.setMessage(t("overworld.progress_reset"));
  }

  private openPartyMenu(): void {
    if (this.transitionLocked || this.helpVisible) {
      return;
    }

    this.player.setVelocity(0, 0);
    this.interactionLockedUntil = this.time.now + 160;
    this.scene.launch("PartyScene");
    this.scene.pause();
  }

  private handlePartyUpdated(): void {
    this.scene.resume();
    this.transitionLocked = false;
    this.refreshStatus();
    this.setMessage(
      t("overworld.party_lead", {
        name:
          registry.creatures[worldState.selectedPartyCreatureIds[0]]?.name ??
          t("overworld.lead_fallback"),
        partySize: worldState.selectedPartyCreatureIds.length,
      }),
    );
  }

  private rollEncounter(zone: EncounterZone) {
    const table = registry.encounterTables[zone.tableId];
    if (!table || table.slots.length === 0) {
      return null;
    }

    const totalWeight = table.slots.reduce((sum, slot) => sum + slot.weight, 0);
    let roll = Math.random() * totalWeight;
    let chosen: EncounterSlot | undefined;

    for (const slot of table.slots) {
      roll -= slot.weight;
      if (roll <= 0) {
        chosen = slot;
        break;
      }
    }

    chosen ??= table.slots[table.slots.length - 1];
    return {
      creatureId: chosen.creatureId,
      level: Phaser.Math.Between(chosen.minLevel, chosen.maxLevel),
      zoneLabel: zone.label,
    };
  }

  private addCharacterIdleTween(
    sprite: Phaser.GameObjects.Image,
    seed: string,
  ): void {
    const delay = seed.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0) % 400;

    this.tweens.add({
      targets: sprite,
      scaleX: 1.04,
      scaleY: 0.97,
      angle: 1.5,
      duration: 580,
      delay,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }

  private drawExitMarker(exit: ExitDefinition): void {
    const centerX = exit.x + exit.width / 2;
    const centerY = exit.y + exit.height / 2;
    const borderExit =
      exit.x <= 52 ||
      exit.y <= 52 ||
      exit.x + exit.width >= this.map.width - 52 ||
      exit.y + exit.height >= this.map.height - 52;
    const accent =
      exit.markerTint ??
      (borderExit ? this.visualTheme.accentSoft : this.visualTheme.accent);
    const labelColor =
      exit.markerFill ??
      (borderExit ? this.visualTheme.haze : this.visualTheme.accentSoft);
    const markerLabel =
      exit.markerLabel ?? (borderExit ? t("overworld.marker_exit") : t("overworld.marker_door"));

    const threshold = this.add
      .rectangle(
        centerX,
        centerY,
        Math.max(26, exit.width),
        Math.max(24, exit.height),
        borderExit ? this.visualTheme.horizon : this.visualTheme.skyBottom,
        borderExit ? 0.28 : 0.36,
      )
      .setStrokeStyle(2, accent, 0.95)
      .setDepth(centerY - 3);

    const highlight = this.add
      .rectangle(
        centerX,
        centerY,
        Math.max(18, exit.width - 12),
        Math.max(14, exit.height - 12),
        labelColor,
        borderExit ? 0.24 : 0.28,
      )
      .setDepth(centerY - 2);

    this.tweens.add({
      targets: [threshold, highlight],
      alpha: { from: borderExit ? 0.3 : 0.4, to: borderExit ? 0.62 : 0.74 },
      duration: 820,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    if (borderExit) {
      const arrow = this.add
        .text(centerX, centerY - Math.max(26, exit.height) / 2 - 8, markerLabel, {
          fontFamily: GAME_FONT,
          fontSize: "14px",
          color: "#f8f9fa",
          backgroundColor: toHexColor(this.visualTheme.skyTop),
          padding: { x: 8, y: 4 },
          fontStyle: "bold",
        })
        .setOrigin(0.5)
        .setDepth(centerY - 8);

      this.tweens.add({
        targets: arrow,
        y: arrow.y - 6,
        duration: 700,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
      return;
    }

    const lintel = this.add
      .rectangle(centerX, exit.y - 8, Math.max(40, exit.width + 12), 8, accent, 0.95)
      .setDepth(exit.y - 7);
    const sideLeft = this.add
      .rectangle(exit.x - 4, centerY, 8, Math.max(26, exit.height + 10), 0x7f5539, 0.92)
      .setDepth(centerY - 4);
    const sideRight = this.add
      .rectangle(exit.x + exit.width + 4, centerY, 8, Math.max(26, exit.height + 10), 0x7f5539, 0.92)
      .setDepth(centerY - 4);
    const doorLabel = this.add
      .text(centerX, exit.y - 24, markerLabel, {
        fontFamily: GAME_FONT,
        fontSize: "13px",
        color: toHexColor(this.visualTheme.skyTop),
        backgroundColor: toHexColor(labelColor),
        padding: { x: 6, y: 3 },
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setDepth(exit.y - 10);

    this.tweens.add({
      targets: [lintel, sideLeft, sideRight, doorLabel],
      alpha: { from: 0.72, to: 1 },
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }
}
