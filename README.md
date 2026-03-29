# Pokemon 2D RPG Game

A nostalgic 2D monster-collecting RPG about exploring a vibrant world, building a team of creatures, and growing from a new trainer into a legendary adventurer.

## Overview

This repository is the starting point for a top-down 2D RPG inspired by classic creature-collection adventures. The project is centered around exploration, turn-based battles, progression, and discovery across a handcrafted world of towns, routes, caves, forests, and hidden locations.

## Project Goals

- Build a fun and expandable 2D RPG with exploration, battles, and creature collection
- Create a strong gameplay loop built around discovery, training, and progression
- Keep the project modular so core systems can evolve independently
- Grow the repository from an early prototype into a playable demo

## Planned Features

- Tile-based 2D exploration
- Turn-based battle system
- Creature capture, training, leveling, and evolution
- NPC dialogue, quests, and story events
- Inventory management and usable items
- Interactive environments and map transitions
- Save and load support

## World And Story

The game takes place in a connected region made up of distinct biomes, each with its own creatures, characters, and challenges. Players begin as a new trainer and gradually uncover a larger story involving rival trainers, rare creatures, mysterious locations, and the secrets of the world itself.

## Player Experience

The aim is to create a game that feels adventurous, welcoming, and rewarding. Players should feel steady growth as they explore new areas, strengthen their team, unlock new mechanics, and shape their own journey through the world.

## Suggested Tech Stack

Depending on the direction of the project, this game could be built with:

- `Phaser + TypeScript + Vite` for the current web-playable MVP
- `Godot`
- `Unity`
- `Python + Pygame`

## Suggested Repository Structure

```text
assets/
audio/
docs/
maps/
src/
tests/
```

Suggested usage:

- `src/` for gameplay systems, scenes, and core logic
- `assets/` for sprites, tilesets, animations, and UI graphics
- `maps/` for world layouts and level data
- `audio/` for music and sound effects
- `docs/` for design notes, feature plans, and technical decisions
- `tests/` for automated checks where applicable

## Development Roadmap

1. Set up the project skeleton and choose the engine
2. Implement player movement and collision
3. Build a starter town or route map
4. Add interactions, NPC dialogue, and basic events
5. Implement a simple battle system
6. Add creatures, stats, and progression
7. Create inventory, healing items, and UI
8. Add saving and loading
9. Expand the world with quests, encounters, and story content
10. Polish visuals, audio, balance, and overall game feel

## Getting Started

This repository now includes a first browser-playable prototype built with `Phaser + TypeScript + Vite`.

Requirements:

- `Node.js`
- `npm`

Install and run:

```bash
npm install
npm run dev
```

Create a production build:

```bash
npm run build
```

Current prototype controls:

- `Arrow keys` or `WASD` to move
- `E` to interact with Mentor Liora
- Click the battle buttons to attack or run

## Contributing

Contributions are welcome as the project grows. For larger changes, it is best to open an issue first and keep pull requests focused, readable, and well-documented.

## License

A license can be added once the project direction is finalized.

## Status

This repository now contains an MVP vertical slice with:

- one explorable starter area
- player movement and collision
- one NPC interaction
- one simple turn-based training battle
