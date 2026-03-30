import Phaser from "phaser";
import type { StoryVisualTheme } from "./storyVisuals";

const TRANSITION_DEPTH = 80;

function colorToRgb(color: number) {
  return {
    red: (color >> 16) & 0xff,
    green: (color >> 8) & 0xff,
    blue: color & 0xff,
  };
}

function createTransitionLayer(scene: Phaser.Scene, theme: StoryVisualTheme) {
  const width = Number(scene.scale.gameSize.width);
  const height = Number(scene.scale.gameSize.height);
  const veil = scene.add
    .rectangle(width / 2, height / 2, width, height, 0x04070c, 0)
    .setScrollFactor(0)
    .setDepth(TRANSITION_DEPTH);
  const core = scene.add
    .ellipse(width / 2, height / 2, width * 0.7, height * 0.24, theme.accentSoft, 0)
    .setScrollFactor(0)
    .setDepth(TRANSITION_DEPTH + 1);
  const upperBand = scene.add
    .rectangle(-width * 0.18, height * 0.34, width * 1.45, 42, theme.accent, 0)
    .setAngle(-11)
    .setScrollFactor(0)
    .setDepth(TRANSITION_DEPTH + 2);
  const lowerBand = scene.add
    .rectangle(width * 1.18, height * 0.69, width * 1.45, 36, theme.haze, 0)
    .setAngle(-11)
    .setScrollFactor(0)
    .setDepth(TRANSITION_DEPTH + 2);
  const pulseLine = scene.add
    .rectangle(width / 2, height / 2, width * 0.8, 3, theme.haze, 0)
    .setScrollFactor(0)
    .setDepth(TRANSITION_DEPTH + 3);

  const destroy = () => {
    veil.destroy();
    core.destroy();
    upperBand.destroy();
    lowerBand.destroy();
    pulseLine.destroy();
  };

  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, destroy);
  scene.events.once(Phaser.Scenes.Events.DESTROY, destroy);

  return {
    width,
    height,
    veil,
    core,
    upperBand,
    lowerBand,
    pulseLine,
    destroy,
  };
}

export function playBattleLaunchShift(
  scene: Phaser.Scene,
  theme: StoryVisualTheme,
): void {
  const layer = createTransitionLayer(scene, theme);
  const flash = colorToRgb(theme.accentSoft);

  scene.cameras.main.flash(110, flash.red, flash.green, flash.blue, false);
  scene.cameras.main.shake(130, 0.0022);
  scene.tweens.add({
    targets: scene.cameras.main,
    zoom: 1.055,
    duration: 170,
    ease: "Sine.easeInOut",
  });
  scene.tweens.add({
    targets: layer.veil,
    alpha: { from: 0, to: 0.28 },
    duration: 140,
    ease: "Quad.easeOut",
  });
  scene.tweens.add({
    targets: layer.upperBand,
    x: layer.width * 0.52,
    alpha: { from: 0, to: 0.44 },
    duration: 160,
    ease: "Cubic.easeOut",
  });
  scene.tweens.add({
    targets: layer.lowerBand,
    x: layer.width * 0.48,
    alpha: { from: 0, to: 0.3 },
    duration: 160,
    ease: "Cubic.easeOut",
  });
  scene.tweens.add({
    targets: layer.core,
    scaleX: { from: 0.45, to: 1.22 },
    scaleY: { from: 0.5, to: 1.4 },
    alpha: { from: 0.34, to: 0 },
    duration: 170,
    ease: "Quad.easeOut",
  });
  scene.tweens.add({
    targets: layer.pulseLine,
    scaleX: { from: 0.35, to: 1.15 },
    alpha: { from: 0.46, to: 0 },
    duration: 170,
    ease: "Quad.easeOut",
    onComplete: layer.destroy,
  });
}

export function playBattleArrivalShift(
  scene: Phaser.Scene,
  theme: StoryVisualTheme,
): void {
  const layer = createTransitionLayer(scene, theme);

  scene.cameras.main.setZoom(1.085);
  scene.tweens.add({
    targets: scene.cameras.main,
    zoom: 1,
    duration: 240,
    ease: "Quad.easeOut",
  });
  scene.tweens.add({
    targets: layer.veil,
    alpha: { from: 0.46, to: 0 },
    duration: 260,
    ease: "Quad.easeOut",
  });
  scene.tweens.add({
    targets: layer.upperBand,
    x: layer.width * 1.2,
    alpha: { from: 0.42, to: 0 },
    duration: 240,
    ease: "Cubic.easeOut",
  });
  scene.tweens.add({
    targets: layer.lowerBand,
    x: -layer.width * 0.2,
    alpha: { from: 0.24, to: 0 },
    duration: 240,
    ease: "Cubic.easeOut",
  });
  scene.tweens.add({
    targets: layer.core,
    scaleX: { from: 0.75, to: 1.32 },
    scaleY: { from: 0.65, to: 1.48 },
    alpha: { from: 0.24, to: 0 },
    duration: 240,
    ease: "Quad.easeOut",
  });
  scene.tweens.add({
    targets: layer.pulseLine,
    scaleX: { from: 0.75, to: 1.2 },
    alpha: { from: 0.28, to: 0 },
    duration: 220,
    ease: "Quad.easeOut",
    onComplete: layer.destroy,
  });
}

export function playBattleReturnShift(
  scene: Phaser.Scene,
  theme: StoryVisualTheme,
): void {
  const layer = createTransitionLayer(scene, theme);

  scene.cameras.main.setZoom(1.035);
  scene.tweens.add({
    targets: scene.cameras.main,
    zoom: 1,
    duration: 280,
    ease: "Quad.easeOut",
  });
  scene.tweens.add({
    targets: layer.veil,
    alpha: { from: 0.26, to: 0 },
    duration: 300,
    ease: "Quad.easeOut",
  });
  scene.tweens.add({
    targets: layer.upperBand,
    x: layer.width * 1.08,
    alpha: { from: 0.24, to: 0 },
    duration: 250,
    ease: "Sine.easeOut",
  });
  scene.tweens.add({
    targets: layer.lowerBand,
    x: -layer.width * 0.08,
    alpha: { from: 0.18, to: 0 },
    duration: 250,
    ease: "Sine.easeOut",
  });
  scene.tweens.add({
    targets: layer.core,
    scaleX: { from: 0.82, to: 1.2 },
    scaleY: { from: 0.8, to: 1.22 },
    alpha: { from: 0.18, to: 0 },
    duration: 250,
    ease: "Quad.easeOut",
  });
  scene.tweens.add({
    targets: layer.pulseLine,
    scaleX: { from: 0.6, to: 1.08 },
    alpha: { from: 0.24, to: 0 },
    duration: 220,
    ease: "Quad.easeOut",
    onComplete: layer.destroy,
  });
}
