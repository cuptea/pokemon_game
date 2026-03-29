import Phaser from "phaser";
import { getStoryProfile } from "../data/stories";
import { saveWorldState, worldState } from "../game/worldState";
import { DIFFICULTY_RULES, GAME_FONT, PLAYER_AVATARS } from "../game/theme";
import { createUiPanel } from "../game/uiSkin";
import type { GameDifficulty, PlayerAvatar } from "../types/world";

const AVATAR_ORDER: PlayerAvatar[] = ["blaze", "mist", "grove"];
const DIFFICULTY_ORDER: GameDifficulty[] = ["casual", "adventure", "heroic"];

export class StartScene extends Phaser.Scene {
  private avatarIndex = 0;
  private difficultyIndex = 1;
  private avatarCards: Phaser.GameObjects.Container[] = [];
  private difficultyButtons: Phaser.GameObjects.Text[] = [];
  private startButton!: Phaser.GameObjects.Text;
  private hintText!: Phaser.GameObjects.Text;

  constructor() {
    super("StartScene");
  }

  create(): void {
    this.avatarIndex = Math.max(0, AVATAR_ORDER.indexOf(worldState.selectedAvatar));
    this.difficultyIndex = Math.max(0, DIFFICULTY_ORDER.indexOf(worldState.selectedDifficulty));

    this.cameras.main.setBackgroundColor("#120f1f");
    this.drawBackdrop();
    this.drawTitle();
    this.drawAvatarSelect();
    this.drawDifficultySelect();
    this.drawStartButton();
    this.bindControls();
    this.refreshSelectionUi();
  }

  private drawBackdrop(): void {
    this.add.image(480, 320, "title_bg");
    const graphics = this.add.graphics();
    graphics.fillStyle(0x0b1320, 0.48);
    graphics.fillRect(60, 60, 840, 520);
    graphics.lineStyle(6, 0xf6bd60, 1);
    graphics.strokeRect(60, 60, 840, 520);

    for (let i = 0; i < 34; i += 1) {
      const sparkle = this.add.rectangle(
        Phaser.Math.Between(40, 920),
        Phaser.Math.Between(40, 600),
        4,
        4,
        i % 2 === 0 ? 0xffd166 : 0x84dcc6,
      );
      this.tweens.add({
        targets: sparkle,
        alpha: { from: 0.25, to: 0.9 },
        duration: Phaser.Math.Between(700, 1300),
        yoyo: true,
        repeat: -1,
        delay: Phaser.Math.Between(0, 600),
      });
    }
  }

  private drawTitle(): void {
    this.add.text(480, 108, "MONSTER QUEST", {
      fontFamily: GAME_FONT,
      fontSize: "58px",
      color: "#ffe8a3",
      fontStyle: "bold",
      stroke: "#3b2f2f",
      strokeThickness: 10,
    }).setOrigin(0.5);

    this.add.text(480, 158, "1980s handheld-inspired adventure mode", {
      fontFamily: GAME_FONT,
      fontSize: "20px",
      color: "#d9f0ff",
      letterSpacing: 2,
    }).setOrigin(0.5);
  }

  private drawAvatarSelect(): void {
    this.add.text(120, 218, "SELECT HERO", {
      fontFamily: GAME_FONT,
      fontSize: "24px",
      color: "#f8f9fa",
      fontStyle: "bold",
    });

    AVATAR_ORDER.forEach((avatar, index) => {
      const info = PLAYER_AVATARS[avatar];
      const story = getStoryProfile(avatar);
      const panel = this.add.container(200 + index * 220, 330);
      const card = createUiPanel({
        scene: this,
        x: 0,
        y: 0,
        width: 180,
        height: 180,
        variant: "cool",
        alpha: 1,
        depth: 0,
      });
      card.setPosition(0, 0);
      const portrait = this.add.image(0, -6, info.textureKey).setScale(2.8);
      const label = this.add.text(0, 64, info.label, {
        fontFamily: GAME_FONT,
        fontSize: "24px",
        color: "#f8f9fa",
        fontStyle: "bold",
      }).setOrigin(0.5);
      const subtitle = this.add.text(0, 92, story.cardSubtitle, {
        fontFamily: GAME_FONT,
        fontSize: "13px",
        color: "#d9f0ff",
        align: "center",
      }).setOrigin(0.5);
      panel.add([card, portrait, label, subtitle]);
      this.avatarCards.push(panel);
    });
  }

  private drawDifficultySelect(): void {
    this.add.text(120, 468, "DIFFICULTY", {
      fontFamily: GAME_FONT,
      fontSize: "24px",
      color: "#f8f9fa",
      fontStyle: "bold",
    });

    DIFFICULTY_ORDER.forEach((difficulty, index) => {
      const config = DIFFICULTY_RULES[difficulty];
      const button = this.add.text(160 + index * 215, 520, config.label, {
        fontFamily: GAME_FONT,
        fontSize: "24px",
        color: "#08131f",
        backgroundColor: `#${config.bannerColor.toString(16).padStart(6, "0")}`,
        padding: { x: 18, y: 12 },
        fontStyle: "bold",
      }).setOrigin(0.5);
      this.difficultyButtons.push(button);
    });
  }

  private drawStartButton(): void {
    this.startButton = this.add.text(480, 584, "PRESS ENTER TO START", {
      fontFamily: GAME_FONT,
      fontSize: "26px",
      color: "#08131f",
      backgroundColor: "#ffe066",
      padding: { x: 26, y: 14 },
      fontStyle: "bold",
    }).setOrigin(0.5);

    this.hintText = this.add.text(
      480,
      616,
      "",
      {
        fontFamily: GAME_FONT,
        fontSize: "15px",
        color: "#d9f0ff",
        align: "center",
        wordWrap: { width: 800 },
        lineSpacing: 6,
      },
    ).setOrigin(0.5);

    this.tweens.add({
      targets: this.startButton,
      alpha: { from: 0.6, to: 1 },
      duration: 650,
      yoyo: true,
      repeat: -1,
    });
  }

  private bindControls(): void {
    const cursors = this.input.keyboard!.createCursorKeys();
    const enter = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    const space = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    const a = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    const d = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    const w = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    const s = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S);

    this.input.keyboard!.on("keydown", (event: KeyboardEvent) => {
      if (["ArrowLeft", "a", "A"].includes(event.key)) {
        this.avatarIndex = (this.avatarIndex + AVATAR_ORDER.length - 1) % AVATAR_ORDER.length;
        this.refreshSelectionUi();
      } else if (["ArrowRight", "d", "D"].includes(event.key)) {
        this.avatarIndex = (this.avatarIndex + 1) % AVATAR_ORDER.length;
        this.refreshSelectionUi();
      } else if (["ArrowUp", "w", "W"].includes(event.key)) {
        this.difficultyIndex =
          (this.difficultyIndex + DIFFICULTY_ORDER.length - 1) % DIFFICULTY_ORDER.length;
        this.refreshSelectionUi();
      } else if (["ArrowDown", "s", "S"].includes(event.key)) {
        this.difficultyIndex = (this.difficultyIndex + 1) % DIFFICULTY_ORDER.length;
        this.refreshSelectionUi();
      }
    });

    const startGame = () => this.beginGame();
    enter.on("down", startGame);
    space.on("down", startGame);
    cursors.left.on("down", () => {
      this.avatarIndex = (this.avatarIndex + AVATAR_ORDER.length - 1) % AVATAR_ORDER.length;
      this.refreshSelectionUi();
    });
    cursors.right.on("down", () => {
      this.avatarIndex = (this.avatarIndex + 1) % AVATAR_ORDER.length;
      this.refreshSelectionUi();
    });
    cursors.up.on("down", () => {
      this.difficultyIndex =
        (this.difficultyIndex + DIFFICULTY_ORDER.length - 1) % DIFFICULTY_ORDER.length;
      this.refreshSelectionUi();
    });
    cursors.down.on("down", () => {
      this.difficultyIndex = (this.difficultyIndex + 1) % DIFFICULTY_ORDER.length;
      this.refreshSelectionUi();
    });
    a.on("down", () => {
      this.avatarIndex = (this.avatarIndex + AVATAR_ORDER.length - 1) % AVATAR_ORDER.length;
      this.refreshSelectionUi();
    });
    d.on("down", () => {
      this.avatarIndex = (this.avatarIndex + 1) % AVATAR_ORDER.length;
      this.refreshSelectionUi();
    });
    w.on("down", () => {
      this.difficultyIndex =
        (this.difficultyIndex + DIFFICULTY_ORDER.length - 1) % DIFFICULTY_ORDER.length;
      this.refreshSelectionUi();
    });
    s.on("down", () => {
      this.difficultyIndex = (this.difficultyIndex + 1) % DIFFICULTY_ORDER.length;
      this.refreshSelectionUi();
    });
  }

  private refreshSelectionUi(): void {
    this.avatarCards.forEach((card, index) => {
      card.setScale(index === this.avatarIndex ? 1.06 : 1);
      card.setAlpha(index === this.avatarIndex ? 1 : 0.9);
    });

    this.difficultyButtons.forEach((button, index) => {
      button.setScale(index === this.difficultyIndex ? 1.08 : 1);
      button.setStyle({
        color: index === this.difficultyIndex ? "#08131f" : "#1f1f1f",
      });
    });

    const avatar = PLAYER_AVATARS[AVATAR_ORDER[this.avatarIndex]];
    const story = getStoryProfile(AVATAR_ORDER[this.avatarIndex]);
    this.hintText.setText(
      `${avatar.label} selected. ${story.storyTitle}.\nGoal: ${story.objectiveShort}`,
    );
  }

  private beginGame(): void {
    worldState.selectedAvatar = AVATAR_ORDER[this.avatarIndex];
    worldState.selectedDifficulty = DIFFICULTY_ORDER[this.difficultyIndex];
    worldState.introCompleted = true;
    saveWorldState();

    this.cameras.main.fadeOut(220, 8, 19, 31);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.start("OverworldScene");
    });
  }
}
