import Phaser from "phaser";
import { registry } from "../data/registry";
import { getStoryProfile } from "../data/stories";
import { resetWorldState, saveWorldState, worldState } from "../game/worldState";
import { DIFFICULTY_RULES, GAME_FONT, PLAYER_AVATARS, THEME } from "../game/theme";
import type {
  BattleResult,
  EncounterSlot,
  EncounterZone,
  ExitDefinition,
  InteractablePlacement,
  MapModule,
  NpcPlacement,
  TrainerPlacement,
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
    reset: Phaser.Input.Keyboard.Key;
  };
  private player!: Phaser.Physics.Arcade.Sprite;
  private map!: MapModule;
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

  constructor() {
    super("OverworldScene");
  }

  create(): void {
    this.bindInput();
    this.loadCurrentMap(true);

    this.game.events.on("battle-complete", this.handleBattleComplete, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.game.events.off("battle-complete", this.handleBattleComplete, this);
    });
  }

  update(_time: number, delta: number): void {
    if (Phaser.Input.Keyboard.JustDown(this.keys.help)) {
      this.toggleHelp();
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

  private bindInput(): void {
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.keys = this.input.keyboard!.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      interact: Phaser.Input.Keyboard.KeyCodes.E,
      help: Phaser.Input.Keyboard.KeyCodes.H,
      reset: Phaser.Input.Keyboard.KeyCodes.R,
    }) as OverworldScene["keys"];
  }

  private loadCurrentMap(initial = false): void {
    this.map = registry.maps[worldState.currentMapId];
    const spawn = this.map.spawnPoints[worldState.currentSpawnId];

    this.children.removeAll();
    this.physics.world.colliders.destroy();
    this.physics.world.setBounds(0, 0, this.map.width, this.map.height);
    this.cameras.main.setBounds(0, 0, this.map.width, this.map.height);
    this.cameras.main.setBackgroundColor(this.map.backgroundColor);

    this.renderMap();
    this.createUi();
    this.spawnPlayer(spawn.x, spawn.y);
    this.lastPlayerPosition.set(spawn.x, spawn.y);
    this.encounterTravel = 0;
    this.areaText.setText(this.map.title);
    this.setMessage(initial ? this.activeStory.openingMessage : `You arrived in ${this.map.title}.`);
    this.refreshStatus();
    saveWorldState();

    if (initial) {
      this.cameras.main.fadeIn(240, 8, 19, 31);
    }
  }

  private createUi(): void {
    const width = Number(this.scale.gameSize.width);
    const height = Number(this.scale.gameSize.height);

    this.createPanel(width - 48, 64, 24, 18, THEME.panelFill, THEME.panelStroke, 0.92);
    this.areaText = this.add
      .text(40, 28, "", {
        fontFamily: GAME_FONT,
        fontSize: "22px",
        color: THEME.text,
        fontStyle: "bold",
      })
      .setScrollFactor(0)
      .setDepth(30);

    this.createPanel(width - 48, 60, 24, 88, THEME.promptFill, THEME.panelStroke, 0.88);
    this.hudText = this.add
      .text(40, 102, "Arrow keys/WASD move. E interacts. H opens help. R resets progress.", {
        fontFamily: GAME_FONT,
        fontSize: "17px",
        color: THEME.textMuted,
        wordWrap: { width: width - 90 },
      })
      .setScrollFactor(0)
      .setDepth(30);

    this.createPanel(250, 108, width - 274, 18, THEME.promptFill, THEME.panelStroke, 0.9);
    this.statusText = this.add
      .text(width - 258, 32, "", {
        fontFamily: GAME_FONT,
        fontSize: "16px",
        color: THEME.textMuted,
        wordWrap: { width: 220 },
      })
      .setScrollFactor(0)
      .setDepth(30);

    this.createPanel(width - 48, 56, 24, height - 156, THEME.promptFill, THEME.panelStroke, 0.92);
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

    this.createPanel(width - 48, 88, 24, height - 88, THEME.panelFill, THEME.panelStroke, 0.94);
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
    fillColor: number,
    strokeColor: number,
    alpha: number,
  ): void {
    this.add
      .rectangle(x + width / 2, y + height / 2, width, height, fillColor, alpha)
      .setOrigin(0.5)
      .setStrokeStyle(2, strokeColor)
      .setScrollFactor(0)
      .setDepth(25);
  }

  private renderMap(): void {
    this.tweens.killAll();
    const graphics = this.add.graphics();

    for (const patch of this.map.patches) {
      graphics.fillStyle(patch.color, patch.alpha ?? 1);
      graphics.fillRect(patch.x, patch.y, patch.width, patch.height);
      if (patch.strokeColor !== undefined) {
        graphics.lineStyle(3, patch.strokeColor, 0.9);
        graphics.strokeRect(patch.x, patch.y, patch.width, patch.height);
      }
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

    for (const decoration of this.map.decorations) {
      this.add
        .image(decoration.x, decoration.y, decoration.textureKey)
        .setTint(decoration.tint ?? 0xffffff)
        .setScale(decoration.scale ?? 1)
        .setAlpha(decoration.alpha ?? 1)
        .setDepth(decoration.y);
    }

    for (const worldItem of this.map.interactives) {
      if (worldItem.once && worldState.collectedInteractives[worldItem.id]) {
        continue;
      }

      this.add
        .image(worldItem.x, worldItem.y, worldItem.textureKey)
        .setTint(worldItem.tint ?? 0xffffff)
        .setDepth(worldItem.y);
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

  private spawnPlayer(x: number, y: number): void {
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

  private handleMovement(_delta: number): void {
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
    this.player.setDepth(this.player.y);
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

    for (const worldItem of this.map.interactives) {
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

    for (const exit of this.map.exits) {
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
        `Exploring ${this.map.title}. ${this.encounterZone.label}. Goal: ${this.activeStory.objectiveShort}`,
      );
    } else {
      this.hudText.setText(
        `Arrow keys/WASD move. E interacts. Goal: ${this.activeStory.objectiveShort}`,
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
        playerCreatureId: "spriglet",
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
        playerCreatureId: "spriglet",
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
      const creatureName = result.encounteredCreatureId
        ? registry.creatures[result.encounteredCreatureId]?.name
        : "wild creature";
      this.setMessage(`${creatureName} retreated. The tall grass settles down for a moment.`);
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
    this.statusText.setText(
      `Hero: ${PLAYER_AVATARS[worldState.selectedAvatar].label}\nStory: ${this.activeStory.storyTitle}\nVictories: ${defeatedCount}\nDiscoveries: ${collectedCount}`,
    );
  }

  private createHelpPanel(width: number, height: number): Phaser.GameObjects.Container {
    const panelWidth = 520;
    const panelHeight = 320;
    const panel = this.add.container(width / 2, height / 2).setScrollFactor(0).setDepth(40);

    const backdrop = this.add
      .rectangle(0, 0, panelWidth, panelHeight, THEME.battleFill, 0.96)
      .setStrokeStyle(3, THEME.panelStroke);
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
        "Help: H",
        "Reset progress: R",
        "",
        `Hero: ${PLAYER_AVATARS[worldState.selectedAvatar].label}`,
        `Story: ${this.activeStory.storyTitle}`,
        `Difficulty: ${DIFFICULTY_RULES[worldState.selectedDifficulty].label}`,
        "",
        `Goal: ${this.activeStory.startingObjective}`,
        "",
        `Mystery: ${this.activeStory.regionalMystery}`,
        "",
        `Liora's read: ${this.activeStory.mentorHook}`,
        "",
        `Asset direction: ${Object.values({ ...registry.maps }).length} maps are ready for a CC0-first art swap.`,
      ].join("\n"),
      {
        fontFamily: GAME_FONT,
        fontSize: "18px",
        color: THEME.textMuted,
        wordWrap: { width: panelWidth - 48 },
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
}
