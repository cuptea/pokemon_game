import Phaser from "phaser";
import { registry } from "../data/registry";
import { GAME_FONT, THEME } from "../game/theme";
import type { BattleResult, TrainerPartyMember } from "../types/world";

type BattleSceneData = {
  battleId: string;
  playerCreatureId: string;
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
};

export class BattleScene extends Phaser.Scene {
  private battleId!: string;
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
  private playerSprite!: Phaser.GameObjects.Rectangle;
  private enemySprite!: Phaser.GameObjects.Rectangle;
  private resolved = false;
  private actionLocked = true;

  constructor() {
    super("BattleScene");
  }

  init(data: BattleSceneData): void {
    this.battleId = data.battleId;

    const battle = registry.trainerBattles[data.battleId];
    this.player = this.buildCreature(data.playerCreatureId);
    this.enemyParty = battle.party.map((member) => this.buildPartyCreature(member));
    this.enemyIndex = 0;
    this.resolved = false;
    this.actionLocked = true;
  }

  create(): void {
    this.cameras.main.fadeIn(120, 7, 19, 31);

    this.add
      .rectangle(480, 320, 960, 640, THEME.battleFill, 0.96)
      .setStrokeStyle(4, THEME.panelStroke);

    this.add.text(34, 24, "Battle Test", {
      fontFamily: GAME_FONT,
      fontSize: "34px",
      color: THEME.text,
      fontStyle: "bold",
    });

    this.add
      .rectangle(690, 160, 220, 92, THEME.promptFill, 0.82)
      .setStrokeStyle(2, THEME.panelStroke);
    this.add
      .rectangle(220, 420, 260, 116, THEME.promptFill, 0.82)
      .setStrokeStyle(2, THEME.panelStroke);

    this.enemySprite = this.add
      .rectangle(720, 210, 150, 150, this.currentEnemy.color)
      .setStrokeStyle(4, 0xffffff);
    this.playerSprite = this.add
      .rectangle(220, 380, 180, 180, this.player.color)
      .setStrokeStyle(4, 0xffffff);

    this.bannerText = this.add.text(34, 72, "", {
      fontFamily: GAME_FONT,
      fontSize: "18px",
      color: THEME.textDark,
      backgroundColor: "#f6bd60",
      padding: { x: 12, y: 8 },
    });

    this.enemyHpText = this.add.text(580, 88, "", {
      fontFamily: GAME_FONT,
      fontSize: "22px",
      color: THEME.text,
      fontStyle: "bold",
    });
    this.playerHpText = this.add.text(66, 480, "", {
      fontFamily: GAME_FONT,
      fontSize: "22px",
      color: THEME.text,
      fontStyle: "bold",
    });

    this.add.rectangle(580, 146, 210, 16, 0x30475e).setOrigin(0, 0.5);
    this.enemyBar = this.add
      .rectangle(580, 146, 210, 16, THEME.success)
      .setOrigin(0, 0.5);
    this.add.rectangle(66, 540, 220, 16, 0x30475e).setOrigin(0, 0.5);
    this.playerBar = this.add
      .rectangle(66, 540, 220, 16, THEME.accentAlt)
      .setOrigin(0, 0.5);

    this.add
      .rectangle(480, 582, 896, 92, THEME.panelFill, 0.94)
      .setStrokeStyle(2, THEME.panelStroke);
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
    this.setActionButtonsEnabled(false);
    this.setBanner(registry.trainerBattles[this.battleId].intro, THEME.accent);
    this.infoText.setText(`Trainer sends out ${this.currentEnemy.name}. Choose your moment.`);

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
        fontSize: "23px",
        color: THEME.textDark,
        backgroundColor: "#f6bd60",
        padding: { x: 14, y: 10 },
      })
      .setInteractive({ useHandCursor: true });

    button.on("pointerdown", () => {
      if (this.actionLocked) {
        return;
      }
      onClick();
    });
    button.on("pointerover", () => {
      if (!this.actionLocked) {
        button.setStyle({ backgroundColor: "#ffd88b" });
      }
    });
    button.on("pointerout", () => button.setStyle({ backgroundColor: "#f6bd60" }));
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
        this.setBanner(`Trainer sends out ${this.currentEnemy.name}`, THEME.accent);
        this.infoText.setText(`${faintedName} fainted. ${this.currentEnemy.name} steps into battle.`);
        this.time.delayedCall(700, () => this.setActionButtonsEnabled(true));
      } else {
        this.infoText.setText(`${faintedName} fainted. The trainer's party is out of creatures.`);
        this.time.delayedCall(700, () => this.finishBattle("win"));
      }
    });
  }

  private animateImpact(
    target: Phaser.GameObjects.Rectangle,
    damage: number,
    popupColor: number,
    onComplete: () => void,
  ): void {
    const originalX = target.x;
    const originalY = target.y;
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
        target.setFillStyle(popupColor);
        this.cameras.main.shake(90, 0.003);
      },
      onComplete: () => {
        target.setPosition(originalX, originalY);
        target.setFillStyle(target === this.enemySprite ? this.currentEnemy.color : this.player.color);
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
    const targetWidth = bar === this.enemyBar ? 210 * clamped : 220 * clamped;

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
    return Math.max(2, attacker.attack + attacker.movePower - defender.defense);
  }

  private refreshHud(): void {
    this.enemyHpText.setText(
      `${this.currentEnemy.name}\nHP ${this.currentEnemy.hp}/${this.currentEnemy.maxHp}\nParty ${this.enemyIndex + 1}/${this.enemyParty.length}`,
    );
    this.playerHpText.setText(
      `${this.player.name}\nHP ${this.player.hp}/${this.player.maxHp}`,
    );
  }

  private refreshEnemySprite(): void {
    this.enemySprite.setFillStyle(this.currentEnemy.color);
  }

  private finishBattle(outcome: BattleResult["outcome"]): void {
    if (this.resolved) {
      return;
    }

    this.resolved = true;
    this.setActionButtonsEnabled(false);

    if (outcome === "win") {
      this.setBanner("Victory", THEME.success);
      this.infoText.setText("The battle is won. The route ahead feels earned.");
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
    };
  }

  private buildPartyCreature(member: TrainerPartyMember): RuntimeCreature {
    return this.buildCreature(member.creatureId);
  }

  private get currentEnemy(): RuntimeCreature {
    return this.enemyParty[this.enemyIndex];
  }
}
