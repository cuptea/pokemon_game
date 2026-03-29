import Phaser from "phaser";
import { getBattleCreatureArt } from "../data/battleCreatureArt";
import { pickBattleQuizQuestion, type BattleQuizQuestion } from "../data/quiz";
import { registry } from "../data/registry";
import {
  buildRuntimeCreature,
  buildTrainerRuntimeCreature,
  buildWildRuntimeCreature,
  calculateBattleDamage,
  type RuntimeCreature,
} from "../game/battleModel";
import { t } from "../game/i18n";
import {
  evaluateQuizAnswer,
  getQuizTimeLimitMs,
  getQuizWarningTimeMs,
} from "../game/quizBattle";
import { getStoryVisualTheme, toHexColor, type StoryVisualTheme } from "../game/storyVisuals";
import { finalizeBattleTransition } from "../game/battleTransition";
import { createUiPanel } from "../game/uiSkin";
import { GAME_FONT, THEME } from "../game/theme";
import { worldState } from "../game/worldState";
import type {
  BattleResult,
  WildEncounterDefinition,
} from "../types/world";

type BattleSceneData = {
  playerCreatureId?: string;
  playerPartyCreatureIds?: string[];
  battleId?: string;
  wildEncounter?: WildEncounterDefinition;
};

export class BattleScene extends Phaser.Scene {
  private battleId?: string;
  private playerParty!: RuntimeCreature[];
  private playerIndex = 0;
  private enemyParty!: RuntimeCreature[];
  private enemyIndex = 0;
  private infoText!: Phaser.GameObjects.Text;
  private promptSupportText!: Phaser.GameObjects.Text;
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
  private quizPromptFrame!: Phaser.GameObjects.Rectangle;
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
  private visualTheme!: StoryVisualTheme;
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
    const playerPartyIds =
      data.playerPartyCreatureIds?.length && data.playerPartyCreatureIds.length > 0
        ? data.playerPartyCreatureIds
        : [data.playerCreatureId ?? worldState.activeCreatureId];
    this.playerParty = playerPartyIds.map((creatureId) =>
      buildRuntimeCreature(creatureId, registry),
    );
    this.playerIndex = 0;
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
      this.introText = `${t("battle.wild_encounter")}: ${registry.creatures[data.wildEncounter.creatureId].name} (${data.wildEncounter.zoneLabel})`;
      this.rewardText = t("battle.won_default");
      this.enemyParty = [buildWildRuntimeCreature(data.wildEncounter, registry)];
      return;
    }

    this.battleSource = "trainer";
    this.encounteredCreatureId = undefined;
    const battle = registry.trainerBattles[data.battleId!];
    this.introText = battle.intro;
    this.rewardText = battle.reward;
    this.enemyParty = battle.party.map((member) => buildTrainerRuntimeCreature(member, registry));
  }

  create(): void {
    this.visualTheme = getStoryVisualTheme(worldState.selectedAvatar, worldState.currentMapId);
    this.cameras.main.fadeIn(120, 7, 19, 31);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.handleShutdown, this);
    this.events.once(Phaser.Scenes.Events.DESTROY, this.handleShutdown, this);

    this.drawBattleBackdrop();
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
      .ellipse(228, 424, 188, 36, this.currentPlayer.color, 0.24)
      .setStrokeStyle(2, 0xffffff, 0.16);
    this.add
      .rectangle(726, 232, 280, 2, 0xffffff, 0.08)
      .setAngle(-6);
    this.add
      .rectangle(232, 414, 300, 2, 0xffffff, 0.1)
      .setAngle(4);
    if (this.battleSource === "trainer") {
      this.add.rectangle(480, 320, 760, 12, this.visualTheme.horizon, 0.16);
      this.add.rectangle(174, 410, 210, 6, this.visualTheme.accent, 0.16).setAngle(-8);
      this.add.rectangle(780, 238, 210, 6, this.visualTheme.accentSoft, 0.16).setAngle(8);
      this.add.rectangle(106, 320, 5, 250, this.visualTheme.haze, 0.12).setAngle(12);
      this.add.rectangle(854, 320, 5, 250, this.visualTheme.haze, 0.12).setAngle(-12);
    } else {
      for (let index = 0; index < 5; index += 1) {
        this.add.ellipse(96 + index * 96, 454 + (index % 2) * 8, 66, 18, this.visualTheme.horizon, 0.2);
        this.add.ellipse(622 + index * 54, 280 + (index % 2) * 6, 44, 12, this.visualTheme.horizon, 0.16);
      }
    }

    this.add.text(34, 24, this.battleSource === "wild" ? t("battle.wild_encounter") : t("battle.trainer_battle"), {
      fontFamily: GAME_FONT,
      fontSize: "34px",
      color: THEME.text,
      fontStyle: "bold",
    });
    this.add
      .tileSprite(480, 56, 900, 24, this.visualTheme.overlayTexture)
      .setTint(this.visualTheme.accent)
      .setAlpha(0.14);
    this.add
      .text(866, 26, this.battleSource === "wild" ? t("battle.field_threat") : t("battle.tactical_duel"), {
        fontFamily: GAME_FONT,
        fontSize: "14px",
        color: toHexColor(this.visualTheme.skyTop),
        backgroundColor: toHexColor(this.visualTheme.accentSoft),
        padding: { x: 10, y: 5 },
        fontStyle: "bold",
      })
      .setOrigin(1, 0);

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
      this.getCreatureTextureKey(this.currentPlayer, "player"),
    );
    this.applyCreatureVisual(this.enemySprite, this.currentEnemy, "enemy");
    this.applyCreatureVisual(this.playerSprite, this.currentPlayer, "player");

    this.add
      .text(720, 296, t("battle.foe"), {
        fontFamily: GAME_FONT,
        fontSize: "16px",
        color: THEME.textDark,
        backgroundColor: "#d9f0ff",
        padding: { x: 10, y: 4 },
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    this.add
      .text(720, 318, this.battleSource === "wild" ? t("battle.roaming_creature") : t("battle.trainer_party"), {
        fontFamily: GAME_FONT,
        fontSize: "12px",
        color: THEME.textMuted,
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    this.add
      .text(220, 504, t("battle.ally"), {
        fontFamily: GAME_FONT,
        fontSize: "16px",
        color: THEME.textDark,
        backgroundColor: "#ffe066",
        padding: { x: 10, y: 4 },
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    this.add
      .text(220, 526, t("battle.team_lead"), {
        fontFamily: GAME_FONT,
        fontSize: "12px",
        color: THEME.textMuted,
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
    this.add.text(528, 244, t("battle.question"), {
      fontFamily: GAME_FONT,
      fontSize: "14px",
      color: THEME.textMuted,
      fontStyle: "bold",
    });
    this.quizPromptFrame = this.add
      .rectangle(668, 318, 286, 132)
      .setStrokeStyle(2, this.visualTheme.accentSoft, 0.72)
      .setDepth(2);
    this.add
      .rectangle(668, 318, 286, 132, this.visualTheme.haze, 0.05)
      .setDepth(1.5);
    this.quizHintText = this.add.text(
      528,
      268,
      t("battle.quiz_intro"),
      {
        fontFamily: GAME_FONT,
        fontSize: "18px",
        color: THEME.text,
        fontStyle: "bold",
        wordWrap: { width: 272 },
        lineSpacing: 6,
      },
    );
    this.promptSupportText = this.add.text(
      528,
      370,
      this.battleSource === "wild"
        ? t("battle.quiz_support_wild")
        : t("battle.quiz_support_trainer"),
      {
        fontFamily: GAME_FONT,
        fontSize: "14px",
        color: THEME.textMuted,
        fontStyle: "bold",
        wordWrap: { width: 272 },
        lineSpacing: 4,
      },
    );
    this.add.rectangle(528, 430, 250, 10, 0x30475e, 0.9).setOrigin(0, 0.5);
    this.quizTimerFill = this.add
      .rectangle(528, 430, 250, 10, THEME.accentAlt, 1)
      .setOrigin(0, 0.5)
      .setVisible(false);
    this.add
      .text(528, 410, t("battle.quiz_timer"), {
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
    this.add.text(40, 538, t("battle.battle_log"), {
      fontFamily: GAME_FONT,
      fontSize: "14px",
      color: THEME.textMuted,
      fontStyle: "bold",
    });
    this.infoText = this.add.text(40, 546, "", {
      fontFamily: GAME_FONT,
      fontSize: "19px",
      color: THEME.textMuted,
      wordWrap: { width: 880 },
    });
    this.add.text(528, 444, t("battle.command"), {
      fontFamily: GAME_FONT,
      fontSize: "14px",
      color: THEME.textMuted,
      fontStyle: "bold",
    });

    this.attackButton = this.createActionButton(
      570,
      472,
      t("battle.start_quiz_attack"),
      () => this.beginQuizTurn(),
      "accent",
    );
    this.runButton = this.createActionButton(570, 520, t("battle.run"), () => this.finishBattle("escape"), "cool");
    this.quizButtons = [
      this.createActionButton(528, 448, "", () => this.answerQuiz(0), "cool", 250),
      this.createActionButton(528, 496, "", () => this.answerQuiz(1), "cool", 250),
      this.createActionButton(528, 544, "", () => this.answerQuiz(2), "cool", 250),
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
        ? t("battle.opening_wild", {
            name: this.currentEnemy.name,
            intro: t("battle.quiz_intro"),
          })
        : t("battle.opening_trainer", {
            label: t("battle.trainer_battle"),
            name: this.currentEnemy.name,
            intro: t("battle.quiz_intro"),
          }),
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
    tone: "accent" | "cool" = "cool",
    fixedWidth?: number,
  ): Phaser.GameObjects.Text {
    const palette = this.getButtonPalette(tone);
    const button = this.add
      .text(x, y, label, {
        fontFamily: GAME_FONT,
        fontSize: "22px",
        color: THEME.text,
        backgroundColor: toHexColor(palette.fill),
        padding: { x: 16, y: 10 },
        fontStyle: "bold",
        align: "center",
        fixedWidth,
      })
      .setInteractive({ useHandCursor: true });
    button.setData("buttonTone", tone);
    button.setData("buttonState", "idle");
    button.setStroke(toHexColor(palette.stroke), 4);
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
      if (!this.actionLocked && button.getData("buttonState") === "idle") {
        button.setStyle({ color: toHexColor(palette.textHover), backgroundColor: toHexColor(palette.fillHover) });
        button.setScale(1.03);
      }
    });
    button.on("pointerout", () => {
      this.styleQuizButton(
        button,
        (button.getData("buttonState") as "idle" | "correct" | "wrong" | "warning") ?? "idle",
      );
    });
    return button;
  }

  private getButtonPalette(tone: "accent" | "cool") {
    if (tone === "accent") {
      return {
        fill: this.visualTheme.accent,
        fillHover: this.visualTheme.accentSoft,
        stroke: this.visualTheme.skyTop,
        textHover: this.visualTheme.skyTop,
      };
    }

    return {
      fill: this.visualTheme.skyBottom,
      fillHover: this.visualTheme.haze,
      stroke: this.visualTheme.skyTop,
      textHover: this.visualTheme.skyTop,
    };
  }

  private drawBattleBackdrop(): void {
    this.add.image(480, 320, "battle_bg").setTint(this.visualTheme.haze).setAlpha(0.32);
    const skyTexture = this.add
      .tileSprite(480, 170, 1040, 280, this.visualTheme.overlayTexture)
      .setTint(this.visualTheme.haze)
      .setAlpha(0.09);
    this.tweens.add({
      targets: skyTexture,
      tilePositionX: this.visualTheme.atmosphere === "mist" ? 72 : 42,
      duration: this.visualTheme.atmosphere === "mist" ? 18000 : 14000,
      repeat: -1,
      ease: "Linear",
    });

    this.add.rectangle(480, 120, 960, 240, this.visualTheme.skyTop, 0.38);
    this.add.rectangle(480, 270, 960, 240, this.visualTheme.skyBottom, 0.24);

    if (this.visualTheme.silhouette === "water") {
      this.add.ellipse(480, 250, 820, 84, this.visualTheme.horizon, 0.2);
      this.add.ellipse(620, 234, 220, 30, this.visualTheme.haze, 0.16);
      this.add.ellipse(320, 228, 180, 22, this.visualTheme.haze, 0.1);
    } else if (this.visualTheme.silhouette === "roots") {
      for (let index = 0; index < 5; index += 1) {
        this.add.ellipse(120 + index * 190, 248 + (index % 2) * 18, 220, 92, this.visualTheme.horizon, 0.24);
      }
      this.add.rectangle(480, 280, 960, 34, this.visualTheme.horizon, 0.22);
    } else {
      for (let index = 0; index < 4; index += 1) {
        this.add.ellipse(160 + index * 220, 246 + (index % 2) * 12, 280, 96, this.visualTheme.horizon, 0.24);
      }
      this.add.rectangle(480, 292, 960, 44, this.visualTheme.horizon, 0.24);
    }

    const stageGlow = this.add.ellipse(480, 320, 820, 280, this.visualTheme.accentSoft, 0.08);
    this.tweens.add({
      targets: stageGlow,
      alpha: { from: 0.04, to: 0.11 },
      duration: 2200,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    for (let index = 0; index < 14; index += 1) {
      const mote =
        this.visualTheme.atmosphere === "mist"
          ? this.add.ellipse(
              Phaser.Math.Between(80, 880),
              Phaser.Math.Between(80, 420),
              Phaser.Math.Between(24, 48),
              Phaser.Math.Between(8, 18),
              this.visualTheme.haze,
              0.08,
            )
          : this.add.ellipse(
              Phaser.Math.Between(80, 880),
              Phaser.Math.Between(80, 420),
              this.visualTheme.atmosphere === "embers" ? 4 : 6,
              this.visualTheme.atmosphere === "embers" ? 4 : 9,
              this.visualTheme.atmosphere === "embers" ? this.visualTheme.accent : this.visualTheme.accentSoft,
              this.visualTheme.atmosphere === "embers" ? 0.46 : 0.14,
            );
      this.tweens.add({
        targets: mote,
        x: mote.x + Phaser.Math.Between(-28, 28),
        y: mote.y + Phaser.Math.Between(this.visualTheme.atmosphere === "embers" ? -52 : -10, this.visualTheme.atmosphere === "mist" ? 12 : -40),
        alpha:
          this.visualTheme.atmosphere === "mist"
            ? { from: 0.04, to: 0.11 }
            : this.visualTheme.atmosphere === "embers"
              ? { from: 0.22, to: 0.6 }
              : { from: 0.08, to: 0.2 },
        duration: Phaser.Math.Between(2800, 5200),
        repeat: -1,
        yoyo: true,
        delay: index * 120,
        ease: "Sine.easeInOut",
      });
    }
  }

  private styleQuizButton(
    button: Phaser.GameObjects.Text,
    state: "idle" | "correct" | "wrong" | "warning",
  ): void {
    const tone = (button.getData("buttonTone") as "accent" | "cool" | undefined) ?? "cool";
    const palette = this.getButtonPalette(tone);
    button.setData("buttonState", state);

    if (state === "correct") {
      button.setStyle({ color: "#08131f", backgroundColor: "#b7efc5" });
      button.setStroke("#0d3b2e", 4);
      button.setScale(1.05);
      return;
    }
    if (state === "wrong") {
      button.setStyle({ color: "#ffffff", backgroundColor: "#a01f2f" });
      button.setStroke("#ffd7d7", 4);
      button.setScale(1.02);
      return;
    }
    if (state === "warning") {
      button.setStyle({ color: "#08131f", backgroundColor: "#ffe8a3" });
      button.setStroke("#8a5a00", 4);
      button.setScale(1.04);
      return;
    }
    button.setStyle({ color: THEME.text, backgroundColor: toHexColor(palette.fill) });
    button.setStroke(toHexColor(palette.stroke), 4);
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
    this.promptSupportText.setColor(remainingMs <= warningMs ? "#ffe8a3" : THEME.textMuted);
    this.quizPromptFrame.setStrokeStyle(
      2,
      remainingMs <= warningMs ? THEME.accent : this.visualTheme.accent,
      remainingMs <= warningMs ? 1 : 0.96,
    );

    for (const button of this.quizButtons) {
      if (button.getData("buttonState") === "idle") {
        this.styleQuizButton(button, remainingMs <= warningMs ? "warning" : "idle");
      }
    }
  }

  private setActionButtonsEnabled(enabled: boolean): void {
    this.actionLocked = !enabled;
    this.attackButton.setAlpha(enabled ? 1 : 0.6);
    this.runButton.setAlpha(enabled ? 1 : 0.6);
    this.quizHintText.setAlpha(enabled ? 0.95 : 0.45);
    this.promptSupportText.setAlpha(enabled ? 0.92 : 0.5);
    this.quizPromptFrame.setAlpha(enabled ? 0.82 : 0.48);
    if (enabled) {
      this.attackButton.setVisible(true);
      this.runButton.setVisible(true);
      this.quizHintText.setVisible(true);
      this.promptSupportText.setVisible(true);
    }
  }

  private setQuizButtonsVisible(visible: boolean): void {
    for (const button of this.quizButtons) {
      button.setVisible(visible);
      button.setAlpha(visible ? 1 : 0);
    }
    this.quizTimerFill.setVisible(visible);
    this.quizTimerText.setVisible(visible);
    this.quizHintText.setVisible(true);
    this.quizHintText.setAlpha(visible ? 1 : 0.92);
    this.promptSupportText.setVisible(true);
    this.promptSupportText.setAlpha(visible ? 0.98 : 0.84);
    this.quizPromptFrame.setStrokeStyle(
      2,
      visible ? this.visualTheme.accent : this.visualTheme.accentSoft,
      visible ? 0.96 : 0.62,
    );
    if (visible) {
      this.tweens.add({
        targets: this.quizPromptFrame,
        alpha: { from: 0.6, to: 1 },
        duration: 620,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    } else {
      this.tweens.killTweensOf(this.quizPromptFrame);
      this.quizPromptFrame.setAlpha(0.82);
    }
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
    this.quizHintText.setText(
      this.battleSource === "wild"
        ? t("battle.quiz_intro")
        : t("battle.quiz_intro"),
    );
    this.promptSupportText.setText(
      this.battleSource === "wild"
        ? t("battle.quiz_support_wild")
        : t("battle.quiz_support_trainer"),
    );
    this.promptSupportText.setColor(THEME.textMuted);
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
      playerMoveName: this.currentPlayer.moveName,
      enemyCreatureId: this.currentEnemy.id,
      enemyMoveName: this.currentEnemy.moveName,
      playerLevel: this.currentPlayer.level,
      enemyLevel: this.currentEnemy.level,
      enemyPartySize: this.enemyParty.length,
      enemyPartyIndex: this.enemyIndex,
      excludeIds: [...this.askedQuizIds],
    });
    this.askedQuizIds.add(this.currentQuiz.id);
    this.setBanner(
      this.quizStreak > 1
        ? t("battle.banner_quiz_streak", { count: this.quizStreak })
        : t("battle.banner_quiz_attack"),
      THEME.accentAlt,
    );
    this.quizHintText.setText(this.currentQuiz.prompt);
    this.promptSupportText.setText(
      this.battleSource === "wild"
        ? t("battle.quiz_support_wild")
        : t("battle.quiz_support_trainer"),
    );
    this.promptSupportText.setColor(THEME.textMuted);
    this.infoText.setText(
      `${t("battle.answer_controls")} ${t("battle.answer_reward")}${this.quizStreak > 0 ? ` ${t("battle.banner_quiz_streak", { count: this.quizStreak })}.` : ""}`,
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
      this.setBanner(t("battle.banner_wrong_answer"), THEME.danger);
      this.promptSupportText.setText(t("battle.wrong_support"));
      this.promptSupportText.setColor("#ffb3b3");
      this.quizPromptFrame.setStrokeStyle(2, THEME.danger, 0.96);
      this.infoText.setText(
        t("battle.wrong_log", {
          enemy: this.currentEnemy.name,
          move: this.currentEnemy.moveName,
          player: this.currentPlayer.name,
          damage: this.calculateDamage(this.currentEnemy, this.currentPlayer) + evaluation.enemyPunishBonus,
        }),
      );
      this.time.delayedCall(evaluation.revealDelayMs, () => {
        this.clearQuizState();
        this.resolveEnemyTurn(evaluation.enemyPunishBonus);
      });
      return;
    }

    this.setBanner(
      evaluation.grade === "perfect"
        ? this.quizStreak > 1
          ? t("battle.banner_perfect_streak", { count: this.quizStreak })
          : t("battle.banner_perfect_answer")
        : this.quizStreak > 1
          ? t("battle.banner_correct_streak", { count: this.quizStreak })
          : t("battle.banner_correct_answer"),
      THEME.success,
    );
    this.promptSupportText.setText(
      evaluation.grade === "perfect"
        ? t("battle.correct_support")
        : t("battle.correct_support"),
    );
    this.promptSupportText.setColor("#b7efc5");
    this.quizPromptFrame.setStrokeStyle(2, THEME.success, 0.96);
    const baseDamage = this.calculateDamage(this.currentPlayer, this.currentEnemy);
    const playerDamage = Math.max(
      2,
      Math.round(baseDamage * evaluation.damageMultiplier) + evaluation.flatDamageBonus,
    );
    this.infoText.setText(
      t("battle.correct_log", {
        player: this.currentPlayer.name,
        move: this.currentPlayer.moveName,
        damage: playerDamage,
        enemy: this.currentEnemy.name,
      }),
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

        this.time.delayedCall(420, () => this.resolveEnemyTurn());
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
    this.setBanner(t("battle.banner_too_slow"), THEME.accent);
    this.promptSupportText.setText(t("battle.timeout_support"));
    this.promptSupportText.setColor("#ffe8a3");
    this.quizPromptFrame.setStrokeStyle(2, THEME.accent, 0.96);
    this.infoText.setText(
      t("battle.timeout_log", {
        enemy: this.currentEnemy.name,
        move: this.currentEnemy.moveName,
        player: this.currentPlayer.name,
        damage: this.calculateDamage(this.currentEnemy, this.currentPlayer) + evaluation.enemyPunishBonus,
      }),
    );
    this.time.delayedCall(evaluation.revealDelayMs, () => {
      this.clearQuizState();
      this.resolveEnemyTurn(evaluation.enemyPunishBonus);
    });
  }

  private resolveEnemyTurn(enemyPunishBonus = 0): void {
    const enemyDamage =
      this.calculateDamage(this.currentEnemy, this.currentPlayer) + enemyPunishBonus;
    this.currentPlayer.hp = Math.max(0, this.currentPlayer.hp - enemyDamage);
    this.infoText.setText(
      enemyPunishBonus > 0
        ? t("battle.wrong_log", {
            enemy: this.currentEnemy.name,
            move: this.currentEnemy.moveName,
            player: this.currentPlayer.name,
            damage: enemyDamage,
          })
        : t("battle.enemy_counter_log", {
            enemy: this.currentEnemy.name,
            move: this.currentEnemy.moveName,
            player: this.currentPlayer.name,
            damage: enemyDamage,
          }),
    );

    this.animateImpact(this.playerSprite, enemyDamage, THEME.danger, () => {
      this.tweenHpBar(this.playerBar, this.currentPlayer.hp / this.currentPlayer.maxHp);
      this.refreshHud();

      if (this.currentPlayer.hp === 0) {
        this.time.delayedCall(450, () => this.handlePlayerFaint());
        return;
      }

      this.time.delayedCall(260, () => {
        this.setBanner(t("battle.quiz_move", { name: this.currentEnemy.name }), THEME.accentAlt);
        this.setActionButtonsEnabled(true);
      });
    });
  }

  private handleEnemyFaint(): void {
    const faintedName = this.currentEnemy.name;
    this.setBanner(t("battle.fainted", { name: faintedName }), THEME.success);

    this.time.delayedCall(380, () => {
      if (this.enemyIndex < this.enemyParty.length - 1) {
        this.enemyIndex += 1;
        this.refreshEnemySprite();
        this.refreshHud();
        this.playEnemySendOutAnimation();
        this.setBanner(
          this.battleSource === "wild"
            ? t("battle.send_in", { name: this.currentEnemy.name })
            : t("battle.send_in", { name: this.currentEnemy.name }),
          THEME.accent,
        );
        this.infoText.setText(
          this.battleSource === "wild"
            ? t("battle.enemy_next_wild", { fainted: faintedName })
            : t("battle.enemy_next_trainer", { fainted: faintedName, name: this.currentEnemy.name }),
        );
        this.time.delayedCall(700, () => {
          this.attackButton.setVisible(true);
          this.runButton.setVisible(true);
          this.setActionButtonsEnabled(true);
        });
      } else {
        this.infoText.setText(
          this.battleSource === "wild"
            ? t("battle.win_wild", { name: faintedName })
            : t("battle.win_trainer", { name: faintedName }),
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
    this.bannerText.setScale(0.98);
    this.tweens.killTweensOf(this.bannerText);
    this.tweens.add({
      targets: this.bannerText,
      scaleX: 1,
      scaleY: 1,
      alpha: { from: 0.82, to: 1 },
      duration: 140,
      ease: "Quad.easeOut",
    });
  }

  private setInfoText(text: string): void {
    this.infoText.setText(text);
  }

  private calculateDamage(attacker: RuntimeCreature, defender: RuntimeCreature): number {
    return calculateBattleDamage(
      attacker,
      defender,
      worldState.selectedDifficulty,
      attacker === this.currentPlayer ? "player" : "enemy",
    );
  }

  private refreshHud(): void {
    this.enemyHpText.setText(
      t("battle.enemy_status", {
        name: this.currentEnemy.name,
        level: this.currentEnemy.level,
        hp: this.currentEnemy.hp,
        maxHp: this.currentEnemy.maxHp,
        index: this.enemyIndex + 1,
        total: this.enemyParty.length,
      }),
    );
    this.playerHpText.setText(
      t("battle.player_status", {
        name: this.currentPlayer.name,
        level: this.currentPlayer.level,
        hp: this.currentPlayer.hp,
        maxHp: this.currentPlayer.maxHp,
        index: this.playerIndex + 1,
        total: this.playerParty.length,
        move: this.currentPlayer.moveName,
      }),
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
      this.setBanner(t("battle.victory"), THEME.success);
      this.infoText.setText(this.rewardText || t("battle.won_default"));
    } else if (outcome === "lose") {
      this.setBanner(t("battle.defeat"), THEME.danger);
      this.infoText.setText(t("battle.lost_default"));
    } else {
      this.setBanner(t("battle.retreat"), THEME.accent);
      this.infoText.setText(t("battle.retreated_default"));
    }

    this.time.delayedCall(820, () => {
      this.cameras.main.fadeOut(160, 7, 19, 31);
      this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
        finalizeBattleTransition(
          {
            battleId: this.battleId,
            outcome,
            source: this.battleSource,
            encounteredCreatureId: this.encounteredCreatureId,
          } satisfies BattleResult,
          {
            startGameOver: () => {
              this.scene.stop("OverworldScene");
              this.scene.launch("GameOverScene", {
                message: t("gameover.defeat_message"),
              });
            },
            resumeOverworld: () => {
              this.scene.resume("OverworldScene");
            },
            emitBattleComplete: (result) => {
              this.game.events.emit("battle-complete", result);
            },
            stopBattle: () => {
              this.scene.stop();
            },
          },
        );
      });
    });
  }

  private get currentPlayer(): RuntimeCreature {
    return this.playerParty[this.playerIndex];
  }

  private get currentEnemy(): RuntimeCreature {
    return this.enemyParty[this.enemyIndex];
  }

  private startCreatureIdleAnimations(): void {
    this.refreshIdleTween(this.playerSprite, this.playerSpriteBaseScale, -1.8, 560);
    this.refreshIdleTween(this.enemySprite, this.enemySpriteBaseScale, 1.8, 620);
  }

  private refreshPlayerSprite(): void {
    this.applyCreatureVisual(this.playerSprite, this.currentPlayer, "player");
    this.refreshIdleTween(this.playerSprite, this.playerSpriteBaseScale, -1.8, 560);
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

  private playPlayerSendOutAnimation(): void {
    this.playerSprite.setPosition(this.playerSpriteHome.x - 52, this.playerSpriteHome.y);
    this.tweens.add({
      targets: this.playerSprite,
      x: this.playerSpriteHome.x,
      duration: 360,
      ease: "Back.easeOut",
    });
  }

  private handlePlayerFaint(): void {
    const faintedName = this.currentPlayer.name;
    this.quizStreak = 0;
    this.setBanner(t("battle.fainted", { name: faintedName }), THEME.danger);

    this.time.delayedCall(380, () => {
      if (this.playerIndex < this.playerParty.length - 1) {
        this.playerIndex += 1;
        this.refreshPlayerSprite();
        this.refreshHud();
        this.playPlayerSendOutAnimation();
        this.setBanner(t("battle.send_in", { name: this.currentPlayer.name }), THEME.accentAlt);
        this.setInfoText(
          t("battle.player_steps_in", { name: this.currentPlayer.name }),
        );
        this.time.delayedCall(700, () => {
          this.attackButton.setVisible(true);
          this.runButton.setVisible(true);
          this.setActionButtonsEnabled(true);
        });
        return;
      }

      this.finishBattle("lose");
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
