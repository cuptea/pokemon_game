import Phaser from "phaser";
import { BattleScene } from "../scenes/BattleScene";
import { BootScene } from "../scenes/BootScene";
import { GameOverScene } from "../scenes/GameOverScene";
import { OverworldScene } from "../scenes/OverworldScene";
import { PartyScene } from "../scenes/PartyScene";
import { StartScene } from "../scenes/StartScene";

export function createGame(parent: HTMLElement): Phaser.Game {
  return new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: 960,
    height: 640,
    pixelArt: true,
    backgroundColor: "#08131f",
    physics: {
      default: "arcade",
      arcade: {
        debug: false,
      },
    },
    scene: [BootScene, StartScene, OverworldScene, BattleScene, PartyScene, GameOverScene],
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
  });
}
