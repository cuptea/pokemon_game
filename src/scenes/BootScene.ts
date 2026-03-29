import Phaser from "phaser";

export class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  create(): void {
    this.makeCharacterTexture("player_blaze", 0xff8f4a);
    this.makeCharacterTexture("player_mist", 0x58a6ff);
    this.makeCharacterTexture("player_grove", 0x6bd66b);
    this.makeCharacterTexture("npc", 0xffd166);
    this.makeCharacterTexture("trainer", 0xa0c4ff);
    this.makeSignTexture("sign");
    this.makeLootTexture("loot");
    this.makeQuestTexture("quest");
    this.makeTreeTexture("tree");
    this.makeFenceTexture("fence");
    this.makeTowerTexture("tower");
    this.makeHouseTexture("house");
    this.makeDockTexture("dock");

    this.scene.start("StartScene");
  }

  private makeCharacterTexture(key: string, fillColor: number): void {
    const graphics = this.add.graphics();
    graphics.fillStyle(0x1f1f1f, 1);
    graphics.fillRoundedRect(4, 10, 22, 28, 7);
    graphics.fillStyle(fillColor, 1);
    graphics.fillRoundedRect(5, 11, 20, 26, 6);
    graphics.fillStyle(0xffffff, 0.24);
    graphics.fillRoundedRect(8, 13, 14, 7, 4);
    graphics.fillStyle(0x2d2d2d, 1);
    graphics.fillRect(9, 28, 12, 3);
    graphics.generateTexture(key, 30, 42);
    graphics.destroy();
  }

  private makeSignTexture(key: string): void {
    const graphics = this.add.graphics();
    graphics.fillStyle(0x6b4f34, 1);
    graphics.fillRect(12, 26, 6, 16);
    graphics.fillStyle(0xe7d3a7, 1);
    graphics.fillRoundedRect(4, 6, 22, 18, 4);
    graphics.lineStyle(2, 0x6b4f34, 1);
    graphics.strokeRoundedRect(4, 6, 22, 18, 4);
    graphics.generateTexture(key, 30, 42);
    graphics.destroy();
  }

  private makeLootTexture(key: string): void {
    const graphics = this.add.graphics();
    graphics.fillStyle(0x7f5539, 1);
    graphics.fillRoundedRect(6, 16, 18, 14, 4);
    graphics.fillStyle(0xf6bd60, 1);
    graphics.fillRect(6, 20, 18, 4);
    graphics.fillStyle(0xfff3b0, 1);
    graphics.fillCircle(15, 23, 2);
    graphics.generateTexture(key, 30, 42);
    graphics.destroy();
  }

  private makeQuestTexture(key: string): void {
    const graphics = this.add.graphics();
    graphics.fillStyle(0x355070, 1);
    graphics.fillRoundedRect(7, 10, 16, 20, 4);
    graphics.fillStyle(0xf8f9fa, 1);
    graphics.fillRect(11, 14, 8, 2);
    graphics.fillRect(11, 18, 8, 2);
    graphics.fillRect(11, 22, 6, 2);
    graphics.fillStyle(0xf6bd60, 1);
    graphics.fillCircle(21, 26, 4);
    graphics.generateTexture(key, 30, 42);
    graphics.destroy();
  }

  private makeTreeTexture(key: string): void {
    const graphics = this.add.graphics();
    graphics.fillStyle(0x5b3a29, 1);
    graphics.fillRect(16, 34, 8, 18);
    graphics.fillStyle(0x386641, 1);
    graphics.fillCircle(20, 24, 18);
    graphics.fillStyle(0x6a994e, 1);
    graphics.fillCircle(14, 20, 14);
    graphics.fillCircle(26, 20, 14);
    graphics.generateTexture(key, 42, 56);
    graphics.destroy();
  }

  private makeFenceTexture(key: string): void {
    const graphics = this.add.graphics();
    graphics.fillStyle(0xa67c52, 1);
    graphics.fillRect(0, 10, 32, 4);
    graphics.fillRect(0, 22, 32, 4);
    graphics.fillRect(4, 4, 4, 28);
    graphics.fillRect(24, 4, 4, 28);
    graphics.generateTexture(key, 32, 32);
    graphics.destroy();
  }

  private makeTowerTexture(key: string): void {
    const graphics = this.add.graphics();
    graphics.fillStyle(0x6c757d, 1);
    graphics.fillRoundedRect(6, 8, 28, 44, 4);
    graphics.fillStyle(0xadb5bd, 1);
    graphics.fillRect(10, 16, 20, 8);
    graphics.fillRect(14, 30, 12, 8);
    graphics.generateTexture(key, 40, 56);
    graphics.destroy();
  }

  private makeHouseTexture(key: string): void {
    const graphics = this.add.graphics();
    graphics.fillStyle(0xb56576, 1);
    graphics.fillTriangle(2, 20, 18, 4, 34, 20);
    graphics.fillStyle(0xede0d4, 1);
    graphics.fillRect(6, 20, 24, 18);
    graphics.fillStyle(0x6d6875, 1);
    graphics.fillRect(15, 26, 6, 12);
    graphics.generateTexture(key, 36, 42);
    graphics.destroy();
  }

  private makeDockTexture(key: string): void {
    const graphics = this.add.graphics();
    graphics.fillStyle(0x8d6e63, 1);
    graphics.fillRect(0, 16, 40, 12);
    graphics.fillRect(6, 12, 6, 24);
    graphics.fillRect(28, 12, 6, 24);
    graphics.generateTexture(key, 40, 40);
    graphics.destroy();
  }
}
