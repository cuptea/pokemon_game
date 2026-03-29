# Engine Choice For The Web RPG

## Recommendation

Keep `Phaser + TypeScript + Vite` as the engine stack for this project.

## Why

- Phaser is built for browser-first 2D games and fits the current playable prototype well.
- The game already uses Phaser scenes, Arcade Physics, and a data-driven map setup, so staying on Phaser preserves momentum.
- Godot's official web export docs note browser requirements such as WebAssembly and WebGL 2.0, and the stable docs also call out that Godot 4 C# projects cannot be exported to the web.
- Defold has solid HTML5 support, but switching now would trade away the current TypeScript + web iteration loop without solving the project's biggest needs, which are content depth and RPG systems scale.

## Adaptation Path

- Keep Phaser for the current web MVP and near-term production path.
- Continue leaning into data-driven content: maps, trainers, NPCs, encounter tables, and world-state flags.
- Expand the vertical slice before reconsidering a migration.
- Re-evaluate only if the project later becomes editor-heavy enough that a different engine clearly outweighs migration cost.

## Official Sources Reviewed

- Phaser: https://phaser.io/
- Phaser docs: https://docs.phaser.io/
- Godot web export docs: https://docs.godotengine.org/en/stable/tutorials/export/exporting_for_web.html
- Defold HTML5 docs/home: https://defold.com/
