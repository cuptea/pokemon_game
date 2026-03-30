import Phaser from "phaser";
import { getAvatarLabel, getLocalizedStorySurface, t } from "../game/i18n";
import {
  GAME_OVER_LEADERBOARD_LIMIT,
  formatGameOverLeaderboard,
} from "../game/gameOverLeaderboard";
import { resetAdventurePreservingProfile, worldState } from "../game/worldState";
import { GAME_FONT } from "../game/theme";
import { createUiPanel } from "../game/uiSkin";
import {
  fetchLeaderboardEntries,
  submitLeaderboardFromCurrentWorldState,
} from "../services/leaderboard";

type GameOverSceneData = {
  message?: string;
};

export class GameOverScene extends Phaser.Scene {
  private restartButton!: Phaser.GameObjects.Text;
  private leaderboardText!: Phaser.GameObjects.Text;
  private message = t("gameover.defeat_message");
  private restarting = false;

  constructor() {
    super("GameOverScene");
  }

  init(data: GameOverSceneData): void {
    this.message = data.message ?? this.message;
  }

  create(): void {
    const story = getLocalizedStorySurface(worldState.selectedAvatar);
    const avatarLabel = getAvatarLabel(worldState.selectedAvatar);

    this.scene.stop("OverworldScene");
    this.cameras.main.resetFX();
    this.cameras.main.setBackgroundColor("#0c0612");
    this.cameras.main.fadeIn(220, 12, 8, 18);

    this.add.rectangle(480, 320, 960, 640, 0x120819, 1);
    this.add.rectangle(480, 150, 760, 180, 0x2a1122, 0.58).setAngle(-4);
    this.add.rectangle(480, 500, 820, 220, 0x1c0d18, 0.5).setAngle(3);

    for (let index = 0; index < 24; index += 1) {
      const ember = this.add.circle(
        Phaser.Math.Between(50, 910),
        Phaser.Math.Between(40, 600),
        Phaser.Math.Between(2, 5),
        index % 3 === 0 ? 0xffd166 : 0xff7b54,
        0.3,
      );
      this.tweens.add({
        targets: ember,
        y: ember.y - Phaser.Math.Between(18, 46),
        alpha: { from: 0.1, to: 0.45 },
        duration: Phaser.Math.Between(1800, 3600),
        yoyo: true,
        repeat: -1,
        delay: index * 70,
        ease: "Sine.easeInOut",
      });
    }

    createUiPanel({
      scene: this,
      x: 150,
      y: 90,
      width: 660,
      height: 430,
      variant: "warm",
      alpha: 1,
      depth: 2,
    });

    this.add
      .text(480, 132, t("gameover.title"), {
        fontFamily: GAME_FONT,
        fontSize: "58px",
        color: "#ffe8a3",
        fontStyle: "bold",
        stroke: "#3b1221",
        strokeThickness: 10,
      })
      .setOrigin(0.5)
      .setDepth(3);

    this.add
      .text(480, 198, t("gameover.journey", { avatar: avatarLabel, route: story.routeLabel }), {
        fontFamily: GAME_FONT,
        fontSize: "20px",
        color: "#ffd6e0",
        align: "center",
      })
      .setOrigin(0.5)
      .setDepth(3);

    this.add
      .text(480, 272, this.message, {
        fontFamily: GAME_FONT,
        fontSize: "24px",
        color: "#f8f9fa",
        align: "center",
        wordWrap: { width: 560 },
        lineSpacing: 10,
      })
      .setOrigin(0.5)
      .setDepth(3);

    this.add
      .text(480, 356, t("gameover.keep_profile"), {
        fontFamily: GAME_FONT,
        fontSize: "18px",
        color: "#d9f0ff",
        align: "center",
        wordWrap: { width: 580 },
        lineSpacing: 8,
      })
      .setOrigin(0.5)
      .setDepth(3);

    this.add
      .text(480, 408, t("gameover.leaderboard_title"), {
        fontFamily: GAME_FONT,
        fontSize: "22px",
        color: "#ffe8a3",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setDepth(3);

    this.leaderboardText = this.add
      .text(480, 436, t("gameover.leaderboard_loading"), {
        fontFamily: GAME_FONT,
        fontSize: "16px",
        color: "#d9f0ff",
        align: "center",
        wordWrap: { width: 560 },
        lineSpacing: 6,
      })
      .setOrigin(0.5, 0)
      .setDepth(3);

    this.restartButton = this.add
      .text(480, 544, t("gameover.press_enter"), {
        fontFamily: GAME_FONT,
        fontSize: "26px",
        color: "#08131f",
        backgroundColor: "#ffe066",
        padding: { x: 26, y: 14 },
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setDepth(3)
      .setInteractive({ useHandCursor: true });

    this.add
      .text(480, 590, t("gameover.space_hint"), {
        fontFamily: GAME_FONT,
        fontSize: "16px",
        color: "#d9f0ff",
      })
      .setOrigin(0.5)
      .setDepth(3);

    this.tweens.add({
      targets: this.restartButton,
      alpha: { from: 0.58, to: 1 },
      duration: 700,
      yoyo: true,
      repeat: -1,
    });
    this.restartButton.on("pointerdown", () => this.restartAdventure());

    const enter = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    const space = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    enter.on("down", () => this.restartAdventure());
    space.on("down", () => this.restartAdventure());

    void this.loadLeaderboard();
  }

  private async loadLeaderboard(): Promise<void> {
    try {
      await submitLeaderboardFromCurrentWorldState();
      const entries = await fetchLeaderboardEntries(GAME_OVER_LEADERBOARD_LIMIT);

      if (!this.sys.isActive()) {
        return;
      }

      this.leaderboardText.setText(formatGameOverLeaderboard(entries));
    } catch {
      if (!this.sys.isActive()) {
        return;
      }

      this.leaderboardText.setText(t("gameover.leaderboard_empty"));
    }
  }

  private restartAdventure(): void {
    if (this.restarting) {
      return;
    }

    this.restarting = true;
    resetAdventurePreservingProfile();
    this.cameras.main.fadeOut(220, 7, 19, 31);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.start("OverworldScene");
    });
  }
}
