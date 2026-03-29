import Phaser from "phaser";
import { getBattleCreatureArt } from "../data/battleCreatureArt";
import { pickBattleQuizQuestion, type BattleQuizQuestion } from "../data/quiz";
import { registry } from "../data/registry";
import {
  evaluateQuizAnswer,
  getQuizTimeLimitMs,
  getQuizWarningTimeMs,
} from "../game/quizBattle";
import { createUiPanel } from "../game/uiSkin";
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
  private quizButtons: Phaser.GameObjects.Text[] = [];
  private quizHotkeys!: {
    quiz: Phaser.Input.Keyboard.Key;
    one: Phaser.Input.Keyboard.Key;
    two: Phaser.Input.Keyboard.Key;
    three: Phaser.Input.Keyboard.Key;
  };
  private quizHintText!: Phaser.GameObjects.Text;
  private bannerText!: Phaser.GameObjects.Text;
  private playerBar!: Phaser.GameObjects.Rectangle;
  private enemyBar!: Phaser.GameObjects.Rectangle;
  private playerSprite!: Phaser.GameObjects.Image;
  private enemySprite!: Phaser.GameObjects.Image;
  private playerSpriteBaseScale = 1.02;
  private enemySpriteBaseScale = 0.92;
  private playerSpriteHome = new Phaser.Math.Vector2(220, 374);
  private enemySpriteHome = new Phaser.Math.Vector2(720, 206);
  private resolved = false;
  private actionLocked = true;
  private battleSource: "trainer" | "wild" = "trainer";
  private introText = "";
  private rewardText = "";
  private encounteredCreatureId?: string;
  private currentQuiz: BattleQuizQuestion | null = null;
  private quizTimerFill!: Phaser.GameObjects.Rectangle;
  private quizTimerText!: Phaser.GameObjects.Text;
  private quizTimerEvent?: Phaser.Time.TimerEvent;
  private quizTickerEvent?: Phaser.Time.TimerEvent;
  private askedQuizIds = new Set<string>();
  private quizStartedAt = 0;
  private quizTimeLimitMs = 0;
  private quizStreak = 0;

  constructor() {
    super("BattleScene");
  }

  init(data: BattleSceneData): void {
    this.battleId = data.battleId;
    this.player = this.buildCreature(data.playerCreatureId);
    this.enemyIndex = 0;
    this.resolved = false;
    this.actionLocked = true;
    this.currentQuiz = null;
    this.askedQuizIds.clear();
    this.quizStreak = 0;
    this.quizStartedAt = 0;
    this.quizTimeLimitMs = 0;

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
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.handleShutdown, this);
    this.events.once(Phaser.Scenes.Events.DESTROY, this.handleShutdown, this);

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

    this.add.text(34, 24, this.battleSource === "wild" ? "Wild Encounter" : "Trainer Battle", {
      fontFamily: GAME_FONT,
      fontSize: "34px",
      color: THEME.text,
      fontStyle: "bold",
    });

    createUiPanel({
      scene: this,
      x: 554,
      y: 108,
      width: 272,
      height: 112,
      variant: "cool",
    });
    createUiPanel({
      scene: this,
      x: 34,
      y: 368,
      width: 308,
      height: 148,
      variant: "cool",
    });
    createUiPanel({
      scene: this,
      x: 518,
      y: 228,
      width: 300,
      height: 166,
      variant: "cool",
    });
    createUiPanel({
      scene: this,
      x: 518,
      y: 440,
      width: 300,
      height: 140,
      variant: "cool",
    });

    this.enemySprite = this.add.image(
      this.enemySpriteHome.x,
      this.enemySpriteHome.y,
      this.getCreatureTextureKey(this.currentEnemy, "enemy"),
    );
    this.playerSprite = this.add.image(
      this.playerSpriteHome.x,
      this.playerSpriteHome.y,
      this.getCreatureTextureKey(this.player, "player"),
    );
    this.applyCreatureVisual(this.enemySprite, this.currentEnemy, "enemy");
    this.applyCreatureVisual(this.playerSprite, this.player, "player");

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
      fontStyle: "bold",
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
    this.add.text(528, 244, "QUESTION", {
      fontFamily: GAME_FONT,
      fontSize: "14px",
      color: THEME.textMuted,
      fontStyle: "bold",
    });
    this.quizHintText = this.add.text(
      528,
      268,
      "Press START QUIZ ATTACK or tap Q to reveal the current question.",
      {
        fontFamily: GAME_FONT,
        fontSize: "18px",
        color: THEME.text,
        fontStyle: "bold",
        wordWrap: { width: 272 },
        lineSpacing: 6,
      },
    );
    this.add.rectangle(528, 430, 250, 10, 0x30475e, 0.9).setOrigin(0, 0.5);
    this.quizTimerFill = this.add
      .rectangle(528, 430, 250, 10, THEME.accentAlt, 1)
      .setOrigin(0, 0.5)
      .setVisible(false);
    this.add
      .text(528, 410, "QUIZ TIMER", {
        fontFamily: GAME_FONT,
        fontSize: "14px",
        color: THEME.textMuted,
        fontStyle: "bold",
      })
      .setVisible(true);
    this.quizTimerText = this.add.text(780, 408, "", {
      fontFamily: GAME_FONT,
      fontSize: "14px",
      color: "#ffe8a3",
      fontStyle: "bold",
    });

    createUiPanel({
      scene: this,
      x: 32,
      y: 534,
      width: 896,
      height: 96,
      variant: "warm",
    });
    this.infoText = this.add.text(40, 546, "", {
      fontFamily: GAME_FONT,
      fontSize: "21px",
      color: THEME.textMuted,
      wordWrap: { width: 880 },
    });

    this.attackButton = this.createActionButton(
      570,
      472,
      "Start Quiz Attack",
      () => this.beginQuizTurn(),
    );
    this.runButton = this.createActionButton(570, 520, "Run", () =>
      this.finishBattle("escape"),
    );
    this.quizButtons = [
      this.createActionButton(528, 448, "", () => this.answerQuiz(0), 250),
      this.createActionButton(528, 496, "", () => this.answerQuiz(1), 250),
      this.createActionButton(528, 544, "", () => this.answerQuiz(2), 250),
    ];
    this.setQuizButtonsVisible(false);
    this.quizHotkeys = this.input.keyboard!.addKeys({
      quiz: Phaser.Input.Keyboard.KeyCodes.Q,
      one: Phaser.Input.Keyboard.KeyCodes.ONE,
      two: Phaser.Input.Keyboard.KeyCodes.TWO,
      three: Phaser.Input.Keyboard.KeyCodes.THREE,
    }) as BattleScene["quizHotkeys"];
    this.quizHotkeys.quiz.on("down", () => this.beginQuizTurn());
    this.quizHotkeys.one.on("down", () => this.answerQuiz(0));
    this.quizHotkeys.two.on("down", () => this.answerQuiz(1));
    this.quizHotkeys.three.on("down", () => this.answerQuiz(2));

    this.refreshEnemySprite();
    this.refreshHud();
    this.startCreatureIdleAnimations();
    this.playOpeningAnimation();
    this.setActionButtonsEnabled(false);
    this.setBanner(this.introText, THEME.accent);
    this.infoText.setText(
      this.battleSource === "wild"
        ? `${this.currentEnemy.name} blocks the path. Press START QUIZ ATTACK to open the question.`
        : `Trainer sends out ${this.currentEnemy.name}. Press START QUIZ ATTACK to open the question.`,
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
    fixedWidth?: number,
  ): Phaser.GameObjects.Text {
    const button = this.add
      .text(x, y, label, {
        fontFamily: GAME_FONT,
        fontSize: "22px",
        color: THEME.text,
        padding: { x: 16, y: 10 },
        fontStyle: "bold",
        align: "center",
        fixedWidth,
      })
      .setInteractive({ useHandCursor: true });
    button.setStroke("#08131f", 4);
    button.setShadow(0, 2, "#08131f", 0, false, true);

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
        button.setStyle({ color: "#ffe8a3" });
        button.setScale(1.03);
      }
    });
    button.on("pointerout", () => {
      button.setStyle({ color: THEME.text });
      button.setScale(1);
    });
    return button;
  }

  private styleQuizButton(
    button: Phaser.GameObjects.Text,
    state: "idle" | "correct" | "wrong" | "warning",
  ): void {
    if (state === "correct") {
      button.setStyle({ color: "#b7efc5" });
      button.setScale(1.05);
      return;
    }
    if (state === "wrong") {
      button.setStyle({ color: "#ff9b9b" });
      button.setScale(1.02);
      return;
    }
    if (state === "warning") {
      button.setStyle({ color: "#ffe8a3" });
      button.setScale(1.04);
      return;
    }
    button.setStyle({ color: THEME.text });
    button.setScale(1);
  }

  private revealQuizAnswer(selectedIndex: number | undefined, correctChoiceId: string | undefined): void {
    for (let index = 0; index < this.quizButtons.length; index += 1) {
      const button = this.quizButtons[index];
      const choice = this.currentQuiz?.choices[index];

      if (choice?.id === correctChoiceId) {
        this.styleQuizButton(button, "correct");
      } else if (selectedIndex !== undefined && index === selectedIndex) {
        this.styleQuizButton(button, "wrong");
      } else {
        this.styleQuizButton(button, "idle");
      }
    }
  }

  private updateQuizTimerText(): void {
    if (!this.currentQuiz || this.quizTimeLimitMs <= 0 || this.quizStartedAt <= 0) {
      this.quizTimerText.setText("");
      return;
    }

    const remainingMs = Math.max(0, this.quizTimeLimitMs - (this.time.now - this.quizStartedAt));
    const warningMs = getQuizWarningTimeMs(this.quizTimeLimitMs);
    this.quizTimerText.setText(`${(remainingMs / 1000).toFixed(1)}s`);
    this.quizTimerText.setColor(remainingMs <= warningMs ? "#ff9b9b" : "#ffe8a3");
  }

  private setActionButtonsEnabled(enabled: boolean): void {
    this.actionLocked = !enabled;
    this.attackButton.setAlpha(enabled ? 1 : 0.6);
    this.runButton.setAlpha(enabled ? 1 : 0.6);
    this.quizHintText.setAlpha(enabled ? 0.95 : 0.45);
    if (enabled) {
      this.attackButton.setVisible(true);
      this.runButton.setVisible(true);
      this.quizHintText.setVisible(true);
    }
  }

  private setQuizButtonsVisible(visible: boolean): void {
    for (const button of this.quizButtons) {
      button.setVisible(visible);
      button.setAlpha(visible ? 1 : 0);
    }
    this.quizTimerFill.setVisible(visible);
    this.quizTimerText.setVisible(visible);
    this.quizHintText.setVisible(!visible);
  }

  private clearQuizState(): void {
    this.currentQuiz = null;
    this.quizTimerEvent?.remove(false);
    this.quizTimerEvent = undefined;
    this.quizTickerEvent?.remove(false);
    this.quizTickerEvent = undefined;
    this.tweens.killTweensOf(this.quizTimerFill);
    this.setQuizButtonsVisible(false);
    this.quizTimerFill.displayWidth = 250;
    this.quizTimerText.setText("");
    this.quizHintText.setText("Press START QUIZ ATTACK or tap Q to reveal the current question.");
    this.quizStartedAt = 0;
    this.quizTimeLimitMs = 0;
  }

  private handleShutdown(): void {
    this.clearQuizState();
    this.input.keyboard?.removeAllKeys(true);
  }

  private beginQuizTurn(): void {
    if (this.resolved || this.actionLocked) {
      return;
    }

    this.setActionButtonsEnabled(false);
    this.attackButton.setVisible(false);
    this.runButton.setVisible(false);
    this.currentQuiz = pickBattleQuizQuestion({
      battleSource: this.battleSource,
      playerMoveName: this.player.moveName,
      enemyCreatureId: this.currentEnemy.id,
      enemyMoveName: this.currentEnemy.moveName,
      playerLevel: this.player.level,
      enemyLevel: this.currentEnemy.level,
      enemyPartySize: this.enemyParty.length,
      enemyPartyIndex: this.enemyIndex,
      excludeIds: [...this.askedQuizIds],
    });
    this.askedQuizIds.add(this.currentQuiz.id);
    this.setBanner(
      this.quizStreak > 1 ? `Quiz Attack x${this.quizStreak}` : "Quiz Attack",
      THEME.accentAlt,
    );
    this.quizHintText.setText(this.currentQuiz.prompt);
    this.infoText.setText(
      `Press 1, 2, or 3, or click an answer before time runs out.${this.quizStreak > 0 ? ` Streak: ${this.quizStreak}.` : ""}`,
    );
    this.currentQuiz.choices.forEach((choice, index) => {
      this.quizButtons[index].setText(`${index + 1}. ${choice.label}`);
      this.styleQuizButton(this.quizButtons[index], "idle");
    });
    this.setQuizButtonsVisible(true);
    this.quizTimeLimitMs = getQuizTimeLimitMs(this.battleSource, this.enemyIndex);
    this.quizStartedAt = this.time.now;
    this.quizTimerFill.setFillStyle(
      this.battleSource === "trainer" ? THEME.accent : THEME.accentAlt,
    );
    this.tweens.add({
      targets: this.quizTimerFill,
      displayWidth: 0,
      duration: this.quizTimeLimitMs,
      ease: "Linear",
    });
    this.updateQuizTimerText();
    this.quizTickerEvent = this.time.addEvent({
      delay: 90,
      loop: true,
      callback: () => this.updateQuizTimerText(),
    });
    this.quizTimerEvent = this.time.delayedCall(this.quizTimeLimitMs, () => this.handleQuizTimeout());
    this.actionLocked = false;
  }

  private answerQuiz(index: number): void {
    if (this.resolved || this.actionLocked || !this.currentQuiz) {
      return;
    }

    this.actionLocked = true;
    const choice = this.currentQuiz.choices[index];
    const correct = choice?.isCorrect ?? false;
    const correctChoice = this.currentQuiz.choices.find((quizChoice) => quizChoice.isCorrect);
    const evaluation = evaluateQuizAnswer({
      battleSource: this.battleSource,
      correct,
      elapsedMs: Math.max(0, this.time.now - this.quizStartedAt),
      timeLimitMs: this.quizTimeLimitMs,
      streak: this.quizStreak,
      enemyPartyIndex: this.enemyIndex,
    });
    this.quizStreak = evaluation.nextStreak;
    this.revealQuizAnswer(index, correctChoice?.id);

    if (!correct) {
      this.setBanner(evaluation.banner, THEME.danger);
      this.infoText.setText(
        `${choice?.label ?? "That answer"} was wrong. Correct answer: ${correctChoice?.label ?? "unknown"}. ${this.currentEnemy.name} takes the opening and strikes first.`,
      );
      this.time.delayedCall(evaluation.revealDelayMs, () => {
        this.clearQuizState();
        this.resolveEnemyTurn(0, evaluation.enemyPunishBonus, "missed quiz");
      });
      return;
    }

    this.setBanner(evaluation.banner, THEME.success);
    const baseDamage = this.calculateDamage(this.player, this.currentEnemy);
    const playerDamage = Math.max(
      2,
      Math.round(baseDamage * evaluation.damageMultiplier) + evaluation.flatDamageBonus,
    );
    this.infoText.setText(
      `${correctChoice?.label ?? "That answer"} was right. ${this.player.name} turns it into ${playerDamage} damage with ${this.player.moveName}.${this.quizStreak > 1 ? ` Streak ${this.quizStreak} is live.` : ""}`,
    );
    this.time.delayedCall(evaluation.revealDelayMs, () => {
      this.clearQuizState();
      this.currentEnemy.hp = Math.max(0, this.currentEnemy.hp - playerDamage);
      this.animateImpact(this.enemySprite, playerDamage, THEME.accent, () => {
        this.tweenHpBar(this.enemyBar, this.currentEnemy.hp / this.currentEnemy.maxHp);
        this.refreshHud();

        if (this.currentEnemy.hp === 0) {
          this.handleEnemyFaint();
          return;
        }

        this.time.delayedCall(420, () => this.resolveEnemyTurn(playerDamage, 0));
      });
    });
  }

  private handleQuizTimeout(): void {
    if (this.resolved || this.actionLocked || !this.currentQuiz) {
      return;
    }

    this.actionLocked = true;
    const correctChoice = this.currentQuiz.choices.find((quizChoice) => quizChoice.isCorrect);
    const evaluation = evaluateQuizAnswer({
      battleSource: this.battleSource,
      correct: false,
      timedOut: true,
      elapsedMs: this.quizTimeLimitMs,
      timeLimitMs: this.quizTimeLimitMs,
      streak: this.quizStreak,
      enemyPartyIndex: this.enemyIndex,
    });
    this.quizStreak = evaluation.nextStreak;
    this.revealQuizAnswer(undefined, correctChoice?.id);
    this.setBanner(evaluation.banner, THEME.accent);
    this.infoText.setText(
      `${this.player.name} missed the opening. Correct answer: ${correctChoice?.label ?? "unknown"}. ${this.currentEnemy.name} counters immediately.`,
    );
    this.time.delayedCall(evaluation.revealDelayMs, () => {
      this.clearQuizState();
      this.resolveEnemyTurn(0, evaluation.enemyPunishBonus, "timeout");
    });
  }

  private resolveEnemyTurn(
    playerDamage: number,
    enemyPunishBonus = 0,
    punishLabel?: string,
  ): void {
    const enemyDamage = this.calculateDamage(this.currentEnemy, this.player) + enemyPunishBonus;
    this.player.hp = Math.max(0, this.player.hp - enemyDamage);
    this.infoText.setText(
      enemyPunishBonus > 0
        ? `${this.currentEnemy.name} punishes the ${punishLabel ?? "miss"} with ${this.currentEnemy.moveName} for ${enemyDamage} damage.`
        : `${this.player.name} dealt ${playerDamage}. ${this.currentEnemy.name} answered with ${this.currentEnemy.moveName}.`,
    );

    this.animateImpact(this.playerSprite, enemyDamage, THEME.danger, () => {
      this.tweenHpBar(this.playerBar, this.player.hp / this.player.maxHp);
      this.refreshHud();

      if (this.player.hp === 0) {
        this.time.delayedCall(450, () => this.finishBattle("lose"));
        return;
      }

      this.time.delayedCall(260, () => {
        this.setBanner(`Quiz your move against ${this.currentEnemy.name}`, THEME.accentAlt);
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
        this.time.delayedCall(700, () => {
          this.attackButton.setVisible(true);
          this.runButton.setVisible(true);
          this.setActionButtonsEnabled(true);
        });
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
      `${this.player.name}  Lv ${this.player.level}\nHP ${this.player.hp}/${this.player.maxHp}\nQuiz Move ${this.player.moveName}`,
    );
  }

  private refreshEnemySprite(): void {
    this.applyCreatureVisual(this.enemySprite, this.currentEnemy, "enemy");
    this.refreshIdleTween(this.enemySprite, this.enemySpriteBaseScale, 1.8, 620);
  }

  private finishBattle(outcome: BattleResult["outcome"]): void {
    if (this.resolved) {
      return;
    }

    this.resolved = true;
    this.clearQuizState();
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
    this.refreshIdleTween(this.playerSprite, this.playerSpriteBaseScale, -1.8, 560);
    this.refreshIdleTween(this.enemySprite, this.enemySpriteBaseScale, 1.8, 620);
  }

  private playOpeningAnimation(): void {
    this.playerSprite.setPosition(this.playerSpriteHome.x - 52, this.playerSpriteHome.y);
    this.enemySprite.setPosition(this.enemySpriteHome.x + 70, this.enemySpriteHome.y);

    this.tweens.add({
      targets: this.playerSprite,
      x: this.playerSpriteHome.x,
      duration: 360,
      ease: "Back.easeOut",
    });

    this.playEnemySendOutAnimation();
  }

  private playEnemySendOutAnimation(): void {
    this.enemySprite.setPosition(this.enemySpriteHome.x + 70, this.enemySpriteHome.y);
    this.tweens.add({
      targets: this.enemySprite,
      x: this.enemySpriteHome.x,
      duration: 360,
      ease: "Back.easeOut",
    });
  }

  private refreshIdleTween(
    target: Phaser.GameObjects.Image,
    baseScale: number,
    angle: number,
    duration: number,
  ): void {
    this.tweens.killTweensOf(target);
    target.setScale(baseScale);
    target.setAngle(0);

    this.tweens.add({
      targets: target,
      scaleX: baseScale * 1.04,
      scaleY: baseScale * 0.98,
      angle,
      duration,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }

  private applyCreatureVisual(
    target: Phaser.GameObjects.Image,
    creature: RuntimeCreature,
    side: "player" | "enemy",
  ): void {
    const art = getBattleCreatureArt(creature.id);
    const textureKey = this.getCreatureTextureKey(creature, side);
    const usingGenerated = textureKey.startsWith("battle-creature-");
    const homeX =
      (side === "player" ? 220 : 720) +
      (side === "player" ? art?.playerOffsetX ?? 0 : art?.enemyOffsetX ?? 0);
    const homeY =
      (side === "player" ? 374 : 206) +
      (side === "player" ? art?.playerOffsetY ?? 0 : art?.enemyOffsetY ?? 0);
    const baseScale = usingGenerated
      ? side === "player"
        ? 1.02
        : 0.92
      : side === "player"
        ? art?.playerScale ?? 2.45
        : art?.enemyScale ?? 2.55;

    target.setTexture(textureKey);
    target.setPosition(homeX, homeY);
    target.setScale(baseScale);
    target.setFlipX(side === "enemy" && usingGenerated);

    if (side === "player") {
      this.playerSpriteBaseScale = baseScale;
      this.playerSpriteHome.set(homeX, homeY);
      return;
    }

    this.enemySpriteBaseScale = baseScale;
    this.enemySpriteHome.set(homeX, homeY);
  }

  private getCreatureTextureKey(
    creature: RuntimeCreature,
    side: "player" | "enemy",
  ): string {
    const art = getBattleCreatureArt(creature.id);
    const preferredKeys =
      side === "player"
        ? [art?.backKey, art?.frontKey]
        : [art?.frontKey, art?.backKey];

    for (const key of preferredKeys) {
      if (key && this.textures.exists(key)) {
        return key;
      }
    }

    this.ensureCreatureTexture(creature);
    return `battle-creature-${creature.id}`;
  }

  private ensureCreatureTexture(creature: RuntimeCreature): void {
    const textureKey = `battle-creature-${creature.id}`;
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
