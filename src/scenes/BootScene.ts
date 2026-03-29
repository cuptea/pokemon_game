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
    this.load.image("sign", "/assets/kenney/tiny-town/tiles/sign_post.png");
    this.load.image("loot", "/assets/loot.svg");
    this.load.image("quest", "/assets/quest.svg");
    this.load.image("tree", "/assets/kenney/tiny-town/tiles/tree_tall.png");
    this.load.image("fence", "/assets/kenney/tiny-town/tiles/fence_bar.png");
    this.load.image("tower", "/assets/tower.svg");
    this.load.image("house", "/assets/house.svg");
    this.load.image("dock", "/assets/kenney/tiny-town/tiles/dock_post.png");
    this.load.image("ui_panel_warm", "/assets/ui/ui_panel_warm.png");
    this.load.image("ui_panel_cool", "/assets/ui/ui_panel_cool.png");
    this.load.image("tt_grass_base", "/assets/kenney/tiny-town/tiles/grass_base.png");
    this.load.image("tt_grass_alt", "/assets/kenney/tiny-town/tiles/grass_alt.png");
    this.load.image("tt_grass_blossom", "/assets/kenney/tiny-town/tiles/grass_blossom.png");
    this.load.image("tt_path_fill", "/assets/kenney/tiny-town/tiles/path_fill.png");
    this.load.image("tt_stone_block", "/assets/kenney/tiny-town/tiles/stone_block.png");

    for (const texture of battleCreatureTextureEntries) {
      this.load.image(texture.key, texture.path);
    }
  }

  create(): void {
    this.scene.start("StartScene");
  }
}
