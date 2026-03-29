import Phaser from "phaser";

import { THEME } from "./theme";

export type UiPanelVariant = "warm" | "cool";

type UiPanelConfig = {
  scene: Phaser.Scene;
  x: number;
  y: number;
  width: number;
  height: number;
  variant?: UiPanelVariant;
  alpha?: number;
  depth?: number;
  scrollFactor?: number;
  strokeColor?: number;
};

const PANEL_VARIANTS: Record<
  UiPanelVariant,
  { textureKey: string; overlayColor: number; overlayAlpha: number }
> = {
  warm: {
    textureKey: "ui_panel_warm",
    overlayColor: 0x10243b,
    overlayAlpha: 0.8,
  },
  cool: {
    textureKey: "ui_panel_cool",
    overlayColor: 0x17304b,
    overlayAlpha: 0.72,
  },
};

export function createUiPanel({
  scene,
  x,
  y,
  width,
  height,
  variant = "warm",
  alpha = 1,
  depth,
  scrollFactor = 1,
  strokeColor = THEME.panelStroke,
}: UiPanelConfig): Phaser.GameObjects.Container {
  const style = PANEL_VARIANTS[variant];
  const panel = scene.add.container(x + width / 2, y + height / 2);
  const tile = scene.add
    .tileSprite(0, 0, width, height, style.textureKey)
    .setOrigin(0.5)
    .setAlpha(0.92 * alpha);
  const overlay = scene.add
    .rectangle(0, 0, width, height, style.overlayColor, style.overlayAlpha * alpha)
    .setOrigin(0.5);
  const gloss = scene.add
    .rectangle(0, -height / 2 + 12, Math.max(24, width - 20), 4, 0xffffff, 0.08 * alpha)
    .setOrigin(0.5);
  const border = scene.add
    .rectangle(0, 0, width, height)
    .setOrigin(0.5)
    .setStrokeStyle(2, strokeColor, 0.96 * alpha);

  panel.add([tile, overlay, gloss, border]);
  panel.setScrollFactor(scrollFactor);
  if (depth !== undefined) {
    panel.setDepth(depth);
  }

  return panel;
}
