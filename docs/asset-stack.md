# Asset Stack

The current polish pass locks the project to a CC0-first visual stack:

- `Kenney Tiny Town` for overworld tiles, paths, town props, and route details
- `Kenney Tiny Dungeon` for interiors, caves, castle-like scenes, and enclosed landmarks
- `Kenney UI Pack - Pixel Adventure` for dialogue boxes, HUD frames, buttons, and menus
- `OpenGameArt 50+ Monsters Pack 2D` for creature placeholders and battle portraits
- `Kettoman RPG Essentials 16x16` for inventory items and loot icons

The repo now includes imported CC0 art from that stack:

- battle creature front/back sprites from `OpenGameArt 50+ Monsters Pack 2D` under `public/assets/monsters/`
- Kenney UI panel textures under `public/assets/ui/`
- source credits copied into `public/assets/licenses/`

The current integration uses imported monster art in battles with generated-texture fallback, so combat still works even if a creature has no dedicated PNG assigned yet.
