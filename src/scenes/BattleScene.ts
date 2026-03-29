import Phaser from "phaser";
import { registry } from "../data/registry";
import { DIFFICULTY_RULES, GAME_FONT, THEME } from "../game/theme";
import { worldState } from "../game/worldState";
import type {
  BattleResult,
  TrainerPartyMember,
  WildEncounterDefinition,
} from "../types/world";

type BattleSceneData = {
  playerCreatureId: string;
  battleId?: string;
  wildEncounter?: WildEncounterDefinition;
};

type RuntimeCreature = {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  moveName: string;
  movePower: number;
  color: number;
  level: number;
};

export class BattleScene extends Phaser.Scene {
  private battleId?: string;
  private player!: RuntimeCreature;
  private enemyParty!: RuntimeCreature[];
  private enemyIndex = 0;
  private infoText!: Phaser.GameObjects.Text;
  private playerHpText!: Phaser.GameObjects.Text;
  private enemyHpText!: Phaser.GameObjects.Text;
  private attackButton!: Phaser.GameObjects.Text;
  private runButton!: Phaser.GameObjects.Text;
  private bannerText!: Phaser.GameObjects.Text;
  private playerBar!: Phaser.GameObjects.Rectangle;
  private enemyBar!: Phaser.GameObjects.Rectangle;
  private playerSprite!: Phaser.GameObjects.Image;
  private enemySprite!: Phaser.GameObjects.Image;
  private resolved = false;
  private actionLocked = true;
  private battleSource: "trainer" | "wild" = "trainer";
  private introText = "";
  private rewardText = "";
  private encounteredCreatureId?: string;

  constructor() {
    super("BattleScene");
  }

  init(data: BattleSceneData): void {
    this.battleId = data.battleId;
    this.player = this.buildCreature(data.playerCreatureId);
    this.enemyIndex = 0;
    this.resolved = false;
    this.actionLocked = true;

    if (data.wildEncounter) {
      this.battleSource = "wild";
      this.encounteredCreatureId = data.wildEncounter.creatureId;
      this.introText = `A wild ${registry.creatures[data.wildEncounter.creatureId].name} appeared in ${data.wildEncounter.zoneLabel}.`;
      this.rewardText = `The wild ${registry.creatures[data.wildEncounter.creatureId].name} was driven back into the area.`;
      this.enemyParty = [this.buildWildCreature(data.wildEncounter)];
      return;
    }

    this.battleSource = "trainer";
    this.encounteredCreatureId = undefined;
    const battle = registry.trainerBattles[data.battleId!];
    this.introText = battle.intro;
    this.rewardText = battle.reward;
    this.enemyParty = battle.party.map((member) => this.buildPartyCreature(member));
  }

  create(): void {
    this.cameras.main.fadeIn(120, 7, 19, 31);
    this.ensureCreatureTexture(this.player);
    this.ensureCreatureTexture(this.currentEnemy);

    this.add.image(480, 320, "battle_bg");
    this.add
      .rectangle(480, 320, 960, 640, THEME.battleFill, 0.96)
      .setStrokeStyle(4, THEME.panelStroke);
    this.add
      .ellipse(728, 250, 250, 70, 0x091522, 0.7)
      .setStrokeStyle(3, THEME.panelStroke, 0.35);
    this.add
      .ellipse(228, 436, 290, 86, 0x0c1b2b, 0.78)
      .setStrokeStyle(3, THEME.panelStroke, 0.38);
    this.add
      .ellipse(728, 242, 164, 30, this.currentEnemy.color, 0.22)
      .setStrokeStyle(2, 0xffffff, 0.14);
    this.add
      .ellipse(228, 424, 188, 36, this.player.color, 0.24)
      .setStrokeStyle(2, 0xffffff, 0.16);
    this.add
      .rectangle(726, 232, 280, 2, 0xffffff, 0.08)
      .setAngle(-6);
    this.add
      .rectangle(232, 414, 300, 2, 0xffffff, 0.1)
      .setAngle(4);

    this.add.text(34, 24, this.battleSource === "wild" ? "Wild Encounter" : "Battle Test", {
      fontFamily: GAME_FONT,
      fontSize: "34px",
      color: THEME.text,
      fontStyle: "bold",
    });

    this.add
      .rectangle(690, 160, 250, 104, THEME.promptFill, 0.84)
      .setStrokeStyle(3, THEME.panelStroke);
    this.add
      .rectangle(220, 420, 286, 128, THEME.promptFill, 0.84)
      .setStrokeStyle(3, THEME.panelStroke);

    this.enemySprite = this.add
      .image(720, 206, this.getCreatureTextureKey(this.currentEnemy))
      .setScale(0.92)
      .setFlipX(true);
    this.playerSprite = this.add
      .image(220, 374, this.getCreatureTextureKey(this.player))
      .setScale(1.02);

    this.add
      .text(720, 296, "FOE", {
        fontFamily: GAME_FONT,
        fontSize: "16px",
        color: THEME.textDark,
        backgroundColor: "#d9f0ff",
        padding: { x: 10, y: 4 },
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    this.add
      .text(220, 504, "ALLY", {
        fontFamily: GAME_FONT,
        fontSize: "16px",
        color: THEME.textDark,
        backgroundColor: "#ffe066",
        padding: { x: 10, y: 4 },
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.bannerText = this.add.text(34, 72, "", {
      fontFamily: GAME_FONT,
      fontSize: "18px",
      color: THEME.textDark,
      backgroundColor: "#f6bd60",
      padding: { x: 12, y: 8 },
    });

    this.enemyHpText = this.add.text(566, 86, "", {
      fontFamily: GAME_FONT,
      fontSize: "21px",
      color: THEME.text,
      fontStyle: "bold",
    });
    this.playerHpText = this.add.text(52, 470, "", {
      fontFamily: GAME_FONT,
      fontSize: "21px",
      color: THEME.text,
      fontStyle: "bold",
    });

    this.add.rectangle(566, 150, 226, 18, 0x30475e).setOrigin(0, 0.5);
    this.enemyBar = this.add
      .rectangle(566, 150, 226, 18, THEME.success)
      .setOrigin(0, 0.5);
    this.add.rectangle(52, 534, 236, 18, 0x30475e).setOrigin(0, 0.5);
    this.playerBar = this.add
      .rectangle(52, 534, 236, 18, THEME.accentAlt)
      .setOrigin(0, 0.5);

    this.add
      .rectangle(480, 582, 896, 92, THEME.panelFill, 0.95)
      .setStrokeStyle(3, THEME.panelStroke);
    this.infoText = this.add.text(40, 546, "", {
      fontFamily: GAME_FONT,
      fontSize: "21px",
      color: THEME.textMuted,
      wordWrap: { width: 880 },
    });

    this.attackButton = this.createActionButton(
      570,
      472,
      `Attack with ${this.player.moveName}`,
      () => this.takeTurn(),
    );
    this.runButton = this.createActionButton(570, 520, "Run", () =>
      this.finishBattle("escape"),
    );

    this.refreshEnemySprite();
    this.refreshHud();
    this.startCreatureIdleAnimations();
    this.playOpeningAnimation();
    this.setActionButtonsEnabled(false);
    this.setBanner(this.introText, THEME.accent);
    this.infoText.setText(
      this.battleSource === "wild"
        ? `${this.currentEnemy.name} blocks the path. Choose your moment.`
        : `Trainer sends out ${this.currentEnemy.name}. Choose your moment.`,
    );

    this.time.delayedCall(850, () => {
      this.setActionButtonsEnabled(true);
      this.actionLocked = false;
    });
  }

  private createActionButton(
    x: number,
    y: number,
    label: string,
    onClick: () => void,
  ): Phaser.GameObjects.Text {
    const button = this.add
      .text(x, y, label, {
        fontFamily: GAME_FONT,
        fontSize: "22px",
        color: THEME.textDark,
        backgroundColor: "#f6bd60",
        padding: { x: 16, y: 10 },
        fontStyle: "bold",
      })
      .setInteractive({ useHandCursor: true });
    button.setStroke("#fff3bf", 2);

    button.on("pointerdown", () => {
      if (this.actionLocked) {
        return;
      }
      onClick();
      if (!this.actionLocked) {
        button.setScale(0.98);
        this.time.delayedCall(80, () => button.setScale(1));
      }
    });
    button.on("pointerover", () => {
      if (!this.actionLocked) {
        button.setStyle({ backgroundColor: "#ffd88b", color: "#08131f" });
        button.setScale(1.03);
      }
    });
    button.on("pointerout", () => {
      button.setStyle({ backgroundColor: "#f6bd60", color: THEME.textDark });
      button.setScale(1);
    });
    return button;
  }

  private setActionButtonsEnabled(enabled: boolean): void {
    this.actionLocked = !enabled;
    this.attackButton.setAlpha(enabled ? 1 : 0.6);
    this.runButton.setAlpha(enabled ? 1 : 0.6);
  }

  private takeTurn(): void {
    if (this.resolved || this.actionLocked) {
      return;
    }

    this.setActionButtonsEnabled(false);

    const playerDamage = this.calculateDamage(this.player, this.currentEnemy);
    this.currentEnemy.hp = Math.max(0, this.currentEnemy.hp - playerDamage);
    this.infoText.setText(`${this.player.name} used ${this.player.moveName}.`);
    this.animateImpact(this.enemySprite, playerDamage, THEME.accent, () => {
      this.tweenHpBar(this.enemyBar, this.currentEnemy.hp / this.currentEnemy.maxHp);
      this.refreshHud();

      if (this.currentEnemy.hp === 0) {
        this.handleEnemyFaint();
        return;
      }

      this.time.delayedCall(420, () => this.resolveEnemyTurn(playerDamage));
    });
  }

  private resolveEnemyTurn(playerDamage: number): void {
    const enemyDamage = this.calculateDamage(this.currentEnemy, this.player);
    this.player.hp = Math.max(0, this.player.hp - enemyDamage);
    this.infoText.setText(
      `${this.player.name} dealt ${playerDamage}. ${this.currentEnemy.name} answered with ${this.currentEnemy.moveName}.`,
    );

    this.animateImpact(this.playerSprite, enemyDamage, THEME.danger, () => {
      this.tweenHpBar(this.playerBar, this.player.hp / this.player.maxHp);
      this.refreshHud();

      if (this.player.hp === 0) {
        this.time.delayedCall(450, () => this.finishBattle("lose"));
        return;
      }

      this.time.delayedCall(260, () => {
        this.setBanner(`Your move against ${this.currentEnemy.name}`, THEME.accentAlt);
        this.setActionButtonsEnabled(true);
      });
    });
  }

  private handleEnemyFaint(): void {
    const faintedName = this.currentEnemy.name;
    this.setBanner(`${faintedName} fainted`, THEME.success);

    this.time.delayedCall(380, () => {
      if (this.enemyIndex < this.enemyParty.length - 1) {
        this.enemyIndex += 1;
        this.refreshEnemySprite();
        this.refreshHud();
        this.playEnemySendOutAnimation();
        this.setBanner(
          this.battleSource === "wild"
            ? `${this.currentEnemy.name} rushes in`
            : `Trainer sends out ${this.currentEnemy.name}`,
          THEME.accent,
        );
        this.infoText.setText(
          this.battleSource === "wild"
            ? `${faintedName} fainted. Another wild creature lunges forward.`
            : `${faintedName} fainted. ${this.currentEnemy.name} steps into battle.`,
        );
        this.time.delayedCall(700, () => this.setActionButtonsEnabled(true));
      } else {
        this.infoText.setText(
          this.battleSource === "wild"
            ? `${faintedName} fainted. The grass settles down.`
            : `${faintedName} fainted. The trainer's party is out of creatures.`,
        );
        this.time.delayedCall(700, () => this.finishBattle("win"));
      }
    });
  }

  private animateImpact(
    target: Phaser.GameObjects.Image,
    damage: number,
    popupColor: number,
    onComplete: () => void,
  ): void {
    const originalX = target.x;
    const originalY = target.y;
    const originalScaleX = target.scaleX;
    const originalScaleY = target.scaleY;
    const popup = this.add.text(target.x - 12, target.y - 70, `-${damage}`, {
      fontFamily: GAME_FONT,
      fontSize: "26px",
      color: "#ffffff",
      stroke: "#08131f",
      strokeThickness: 4,
    });

    this.tweens.add({
      targets: target,
      x: target.x + 12,
      yoyo: true,
      duration: 70,
      repeat: 2,
      onStart: () => {
        target.setTintFill(popupColor);
        this.cameras.main.shake(90, 0.003);
      },
      scaleX: originalScaleX * 1.06,
      scaleY: originalScaleY * 0.94,
      onComplete: () => {
        target.setPosition(originalX, originalY);
        target.setScale(originalScaleX, originalScaleY);
        target.clearTint();
        onComplete();
      },
    });

    popup.setTint(popupColor);
    this.tweens.add({
      targets: popup,
      y: popup.y - 34,
      alpha: 0,
      duration: 520,
      onComplete: () => popup.destroy(),
    });
  }

  private tweenHpBar(bar: Phaser.GameObjects.Rectangle, ratio: number): void {
    const clamped = Phaser.Math.Clamp(ratio, 0, 1);
    const targetWidth = bar === this.enemyBar ? 226 * clamped : 236 * clamped;

    this.tweens.add({
      targets: bar,
      displayWidth: Math.max(0, targetWidth),
      duration: 260,
      ease: "Quad.easeOut",
      onUpdate: () => {
        if (clamped < 0.35) {
          bar.setFillStyle(THEME.danger);
        } else if (clamped < 0.65) {
          bar.setFillStyle(THEME.accent);
        } else {
          bar.setFillStyle(bar === this.enemyBar ? THEME.success : THEME.accentAlt);
        }
      },
    });
  }

  private setBanner(text: string, color: number): void {
    this.bannerText.setText(text);
    this.bannerText.setBackgroundColor(`#${color.toString(16).padStart(6, "0")}`);
  }

  private calculateDamage(attacker: RuntimeCreature, defender: RuntimeCreature): number {
    const difficultyMultiplier =
      attacker === this.player
        ? 1
        : DIFFICULTY_RULES[worldState.selectedDifficulty].enemyAttackMultiplier;

    return Math.max(
      2,
      Math.round((attacker.attack + attacker.movePower - defender.defense) * difficultyMultiplier),
    );
  }

  private refreshHud(): void {
    this.enemyHpText.setText(
      `${this.currentEnemy.name}  Lv ${this.currentEnemy.level}\nHP ${this.currentEnemy.hp}/${this.currentEnemy.maxHp}\nParty ${this.enemyIndex + 1}/${this.enemyParty.length}`,
    );
    this.playerHpText.setText(
      `${this.player.name}  Lv ${this.player.level}\nHP ${this.player.hp}/${this.player.maxHp}\nMove ${this.player.moveName}`,
    );
  }

  private refreshEnemySprite(): void {
    this.ensureCreatureTexture(this.currentEnemy);
    this.enemySprite.setTexture(this.getCreatureTextureKey(this.currentEnemy));
    this.enemySprite.setFlipX(true);
  }

  private finishBattle(outcome: BattleResult["outcome"]): void {
    if (this.resolved) {
      return;
    }

    this.resolved = true;
    this.setActionButtonsEnabled(false);

    if (outcome === "win") {
      this.setBanner("Victory", THEME.success);
      this.infoText.setText(this.rewardText || "The battle is won. The route ahead feels earned.");
    } else if (outcome === "lose") {
      this.setBanner("Defeat", THEME.danger);
      this.infoText.setText("Your team needs more training before the next challenge.");
    } else {
      this.setBanner("Retreat", THEME.accent);
      this.infoText.setText("You stepped out of the battle and returned to the overworld.");
    }

    this.time.delayedCall(820, () => {
      this.cameras.main.fadeOut(160, 7, 19, 31);
      this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
        this.game.events.emit("battle-complete", {
          battleId: this.battleId,
          outcome,
          source: this.battleSource,
          encounteredCreatureId: this.encounteredCreatureId,
        } satisfies BattleResult);
        this.scene.resume("OverworldScene");
        this.scene.stop();
      });
    });
  }

  private buildCreature(creatureId: string): RuntimeCreature {
    const creature = registry.creatures[creatureId];
    const move = registry.moves[creature.moveId];

    return {
      id: creature.id,
      name: creature.name,
      hp: creature.maxHp,
      maxHp: creature.maxHp,
      attack: creature.attack,
      defense: creature.defense,
      moveName: move.name,
      movePower: move.power,
      color: creature.color,
      level: 5,
    };
  }

  private buildPartyCreature(member: TrainerPartyMember): RuntimeCreature {
    return {
      ...this.buildCreature(member.creatureId),
      level: member.level,
    };
  }

  private buildWildCreature(member: WildEncounterDefinition): RuntimeCreature {
    return {
      ...this.buildCreature(member.creatureId),
      level: member.level,
    };
  }

  private get currentEnemy(): RuntimeCreature {
    return this.enemyParty[this.enemyIndex];
  }

  private startCreatureIdleAnimations(): void {
    this.tweens.add({
      targets: this.playerSprite,
      scaleX: 1.05,
      scaleY: 0.98,
      angle: -1.8,
      duration: 560,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    this.tweens.add({
      targets: this.enemySprite,
      scaleX: 0.96,
      scaleY: 0.9,
      angle: 1.8,
      duration: 620,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }

  private playOpeningAnimation(): void {
    this.playerSprite.setX(170);
    this.enemySprite.setX(790);

    this.tweens.add({
      targets: this.playerSprite,
      x: 220,
      duration: 360,
      ease: "Back.easeOut",
    });

    this.playEnemySendOutAnimation();
  }

  private playEnemySendOutAnimation(): void {
    this.enemySprite.setX(790);
    this.tweens.add({
      targets: this.enemySprite,
      x: 720,
      duration: 360,
      ease: "Back.easeOut",
    });
  }

  private getCreatureTextureKey(creature: RuntimeCreature): string {
    return `battle-creature-${creature.id}`;
  }

  private ensureCreatureTexture(creature: RuntimeCreature): void {
    const textureKey = this.getCreatureTextureKey(creature);
    if (this.textures.exists(textureKey)) {
      return;
    }

    const g = this.make.graphics({ x: 0, y: 0 }, false);
    const seed = creature.id.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const variant = seed % 4;
    const accent = Phaser.Display.Color.IntegerToColor(creature.color).brighten(24).color;
    const shadow = 0x08131f;
    const bodyY = 124;
    const centerX = 110;

    g.fillStyle(shadow, 0.45);
    g.fillEllipse(centerX, 186, 118, 28);

    g.fillStyle(shadow, 1);
    g.fillEllipse(centerX, bodyY + 4, 122, 104);
    g.fillCircle(centerX, 72, 44);

    if (variant === 0) {
      g.fillTriangle(centerX - 34, 44, centerX - 10, 6, centerX + 2, 50);
      g.fillTriangle(centerX + 34, 44, centerX + 10, 6, centerX - 2, 50);
      g.fillEllipse(centerX + 48, 130, 34, 74);
    } else if (variant === 1) {
      g.fillTriangle(centerX - 54, 124, centerX - 84, 102, centerX - 64, 156);
      g.fillTriangle(centerX + 54, 124, centerX + 84, 102, centerX + 64, 156);
      g.fillEllipse(centerX, 38, 72, 28);
    } else if (variant === 2) {
      g.fillEllipse(centerX - 58, 118, 42, 82);
      g.fillEllipse(centerX + 58, 118, 42, 82);
      g.fillTriangle(centerX - 18, 26, centerX, 0, centerX + 18, 26);
    } else {
      g.fillTriangle(centerX - 26, 48, centerX - 48, 18, centerX - 6, 32);
      g.fillTriangle(centerX + 26, 48, centerX + 48, 18, centerX + 6, 32);
      g.fillEllipse(centerX + 50, 150, 58, 24);
    }

    g.fillStyle(creature.color, 1);
    g.fillEllipse(centerX, bodyY, 110, 94);
    g.fillCircle(centerX, 70, 38);

    if (variant === 0) {
      g.fillTriangle(centerX - 32, 44, centerX - 12, 14, centerX + 2, 52);
      g.fillTriangle(centerX + 32, 44, centerX + 12, 14, centerX - 2, 52);
      g.fillStyle(accent, 0.95);
      g.fillEllipse(centerX + 42, 128, 24, 60);
    } else if (variant === 1) {
      g.fillStyle(accent, 0.95);
      g.fillTriangle(centerX - 50, 124, centerX - 72, 110, centerX - 56, 148);
      g.fillTriangle(centerX + 50, 124, centerX + 72, 110, centerX + 56, 148);
      g.fillEllipse(centerX, 42, 56, 18);
    } else if (variant === 2) {
      g.fillStyle(accent, 0.9);
      g.fillEllipse(centerX - 54, 118, 30, 70);
      g.fillEllipse(centerX + 54, 118, 30, 70);
      g.fillTriangle(centerX - 14, 28, centerX, 8, centerX + 14, 28);
    } else {
      g.fillStyle(accent, 0.9);
      g.fillTriangle(centerX - 22, 48, centerX - 38, 24, centerX - 8, 34);
      g.fillTriangle(centerX + 22, 48, centerX + 38, 24, centerX + 8, 34);
      g.fillEllipse(centerX + 48, 150, 46, 16);
    }

    g.fillStyle(0xf8f9fa, 0.95);
    g.fillEllipse(centerX - 12, 66, 11, 16);
    g.fillEllipse(centerX + 12, 66, 11, 16);
    g.fillStyle(shadow, 1);
    g.fillCircle(centerX - 12, 68, 3);
    g.fillCircle(centerX + 12, 68, 3);
    g.fillStyle(0xfff3bf, 0.8);
    g.fillEllipse(centerX, 110, 42, 20);
    g.fillStyle(0xffffff, 0.12);
    g.fillEllipse(centerX - 12, 98, 30, 44);
    g.lineStyle(4, 0xffffff, 0.9);
    g.strokeEllipse(centerX, bodyY, 106, 90);
    g.lineStyle(3, shadow, 0.65);
    g.strokeEllipse(centerX, bodyY, 114, 98);

    g.generateTexture(textureKey, 220, 220);
    g.destroy();
  }
}
