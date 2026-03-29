import Phaser from "phaser";
import { registry } from "../data/registry";
import { getStoryProfile, getStoryStatus } from "../data/stories";
import { getStoryVisualTheme, toHexColor, type StoryVisualTheme } from "../game/storyVisuals";
import { getTerrainStyle, isWaterTone } from "../game/terrainRender";
import { createUiPanel } from "../game/uiSkin";
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
  WorldPatch,
} from "../types/world";

const MAX_SPEED = 190;
const ACCELERATION = 0.22;
const INTERACTION_RANGE = 90;

type Interactable =
  | { kind: "npc"; data: NpcPlacement; prompt: string }
  | { kind: "trainer"; data: TrainerPlacement; prompt: string }
  | { kind: "exit"; data: ExitDefinition; prompt: string }
  | { kind: "world"; data: InteractablePlacement; prompt: string };

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

  private get storyStatus() {
    return getStoryStatus(worldState);
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
        ? this.activeStory.openingMessage
        : `You arrived in ${this.map.title}. ${this.storyStatus.currentObjective}`,
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
      .text(40, 102, "Arrow keys/WASD move. E interacts. C opens party. H opens help. R resets progress.", {
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
        ? { label: "LOOT", tint: THEME.success, fill: this.visualTheme.horizon, radius: 26 }
        : worldItem.kind === "quest"
          ? { label: "CLUE", tint: this.visualTheme.accent, fill: this.visualTheme.skyTop, radius: 30 }
          : { label: "READ", tint: this.visualTheme.accentSoft, fill: this.visualTheme.skyTop, radius: 24 };

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
      const block = this.add.rectangle(
        wall.x + wall.width / 2,
        wall.y + wall.height / 2,
        wall.width,
        wall.height,
        0x24533b,
      );
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

    for (const npc of this.map.npcs) {
      const sprite = this.physics.add.staticSprite(npc.x, npc.y, "npc");
      sprite.setTint(npc.color);
      sprite.setSize(24, 32);
      sprite.setOffset(3, 10);
      sprite.setDepth(npc.y);
      this.addCharacterIdleTween(sprite, npc.id);
    }

    for (const trainer of this.map.trainers) {
      const sprite = this.physics.add.staticSprite(trainer.x, trainer.y, "trainer");
      sprite.setTint(trainer.color);
      sprite.setSize(24, 32);
      sprite.setOffset(3, 10);
      sprite.setDepth(trainer.y);
      this.addCharacterIdleTween(sprite, trainer.id);
    }
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

    for (const npc of this.map.npcs) {
      const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, npc.x, npc.y);
      if (distance < INTERACTION_RANGE && distance < nearestDistance) {
        nearest = { kind: "npc", data: npc, prompt: `Press E to talk to ${npc.name}` };
        nearestDistance = distance;
      }
    }

    for (const trainer of this.map.trainers) {
      const distance = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        trainer.x,
        trainer.y,
      );
      if (distance < INTERACTION_RANGE && distance < nearestDistance) {
        const defeated = Boolean(worldState.defeatedBattles[trainer.battleId]);
        nearest = {
          kind: "trainer",
          data: trainer,
          prompt: defeated
            ? `Press E to talk to ${trainer.trainerClass} ${trainer.name}`
            : `Press E to challenge ${trainer.trainerClass} ${trainer.name}`,
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
        `Exploring ${this.map.title}. ${this.encounterZone.label}. ${this.storyStatus.chapterTitle}. Goal: ${this.storyStatus.objectiveShort}`,
      );
    } else {
      this.hudText.setText(
        `Arrow keys/WASD move. E interacts. C opens party. ${this.storyStatus.chapterTitle}. Goal: ${this.storyStatus.objectiveShort}`,
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
    this.setMessage(`Wild rustling... ${registry.creatures[wildEncounter.creatureId].name} appears!`);
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
      const npc = interactable.data;
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

    const trainer = interactable.data;
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
              ? `${creatureName} joined your team and was added to your battle buddies.`
              : `${creatureName} joined your team. Open the party menu with C to add it to your battle buddies.`,
          );
          saveWorldState();
        } else {
          this.setMessage(`${creatureName} retreated. Your team already knows this route well.`);
        }
      } else {
        this.setMessage(`${creatureName} retreated. The tall grass settles down for a moment.`);
      }
    } else if (result.outcome === "lose") {
      this.setMessage("Your team needs more training. Try another route or battle again.");
    } else {
      this.setMessage("You slipped out of the battle and returned to the field.");
    }
    this.lastPlayerPosition.set(this.player.x, this.player.y);
    this.encounterTravel = 0;
    this.refreshStatus();
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
      `Hero: ${PLAYER_AVATARS[worldState.selectedAvatar].label}\nLead: ${leadCreatureName}\nParty: ${worldState.selectedPartyCreatureIds.length}/3\nOwned: ${worldState.ownedCreatureIds.length}\nVictories: ${defeatedCount}\nDiscoveries: ${collectedCount}`,
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
    const title = this.add.text(-panelWidth / 2 + 24, -panelHeight / 2 + 20, "Field Guide", {
      fontFamily: GAME_FONT,
      fontSize: "28px",
      color: THEME.text,
      fontStyle: "bold",
    });
    const body = this.add.text(
      -panelWidth / 2 + 24,
      -panelHeight / 2 + 66,
      [
        "Move: Arrow keys or WASD",
        "Interact: E",
        "Party menu: C",
        "Help: H",
        "Reset progress: R",
        "",
        `Hero: ${PLAYER_AVATARS[worldState.selectedAvatar].label}`,
        `Lead buddy: ${registry.creatures[worldState.selectedPartyCreatureIds[0]]?.name ?? worldState.activeCreatureId}`,
        `Battle buddies: ${worldState.selectedPartyCreatureIds.length}/3`,
        `Owned allies: ${worldState.ownedCreatureIds.length}`,
        `Story: ${this.activeStory.storyTitle}`,
        `Act: ${this.storyStatus.actLabel}`,
        `Difficulty: ${DIFFICULTY_RULES[worldState.selectedDifficulty].label}`,
        "",
        `Goal: ${this.storyStatus.currentObjective}`,
        `Next landmark: ${this.storyStatus.nextLandmark}`,
        "",
        `Mystery: ${this.activeStory.regionalMystery}`,
        "",
        `Liora's read: ${this.activeStory.mentorHook}`,
        "",
        `Route: ${this.storyStatus.routeLabel}`,
        "",
        `Arc: ${this.activeStory.longArc}`,
        "",
        `Chapter note: ${this.storyStatus.chapterSummary}`,
        "",
        `Asset direction: ${Object.values({ ...registry.maps }).length} maps are ready for a CC0-first art swap.`,
      ].join("\n"),
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
    this.setMessage("Progress reset. Mossgrove Town is fresh again.");
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
      `${registry.creatures[worldState.selectedPartyCreatureIds[0]]?.name ?? "Lead buddy"} is now leading your ${worldState.selectedPartyCreatureIds.length}-buddy party.`,
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
    sprite: Phaser.Physics.Arcade.Sprite,
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
    const markerLabel = exit.markerLabel ?? (borderExit ? "EXIT" : "DOOR");

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
