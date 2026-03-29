import Phaser from "phaser";
import { battleCreatureTextureEntries } from "../data/battleCreatureArt";

export class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  preload(): void {
    this.load.image("title_bg", "/assets/title_bg.svg");
    this.load.image("battle_bg", "/assets/battle_bg.svg");
    this.load.image("player_blaze", "/assets/player_blaze.svg");
    this.load.image("player_mist", "/assets/player_mist.svg");
    this.load.image("player_grove", "/assets/player_grove.svg");
    this.load.image("npc", "/assets/npc.svg");
    this.load.image("trainer", "/assets/trainer.svg");
    this.load.image("sign", "/assets/sign.svg");
    this.load.image("loot", "/assets/loot.svg");
    this.load.image("quest", "/assets/quest.svg");
    this.load.image("tree", "/assets/tree.svg");
    this.load.image("fence", "/assets/fence.svg");
    this.load.image("tower", "/assets/tower.svg");
    this.load.image("house", "/assets/house.svg");
    this.load.image("dock", "/assets/dock.svg");
    this.load.image("ui_panel_warm", "/assets/ui/ui_panel_warm.png");
    this.load.image("ui_panel_cool", "/assets/ui/ui_panel_cool.png");

    for (const texture of battleCreatureTextureEntries) {
      this.load.image(texture.key, texture.path);
    }
  }

  create(): void {
    this.scene.start("StartScene");
  }
}
