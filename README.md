# canvas-game-starter

## HTML5/Canvas Game Starter Pack

License: Public Domain (libraries have their own licenses)

Author: udo@openfu.com

## Featured Examples

### 2D Game Templates
- **Basic 2D**: PIXI.js foundation with sprites and basic game loop
- **Hex Grid**: Hexagonal grid system for strategy games
- **Square Grid**: Traditional grid-based game template

### 3D Game Templates  
- **Blank Project**: Clean THREE.js starting point
- **Hex Grid 3D**: 3D hexagonal grid system
- **Square Grid 3D**: 3D grid-based game template
- **Asset Import**: 3D model loading and display
- **Toon Shading**: Cartoon-style 3D rendering

## Libraries Included

* **u-howler** (local Howler-compatible implementation) Public Domain
* **macrobars** (latest) Public Domain | https://github.com/udo/macrobars
* **PIXI.js** BSD 3-clause License | https://pixijs.com
* **udolib** (latest) Public Domain | https://github.com/udo/udolib
* **THREE.js** MIT License | https://threejs.org/docs/

## Dependency Policy

This repository is intentionally vendored and does not rely on `package.json` / `package-lock.json`.

When adding dependencies:
1. Add only compiled runtime files that are required by this repo.
2. Avoid vendoring full source trees when a minimal runtime subset is enough.
3. Record the source/version in `THIRD_PARTY.md`.

Built on **HTML5 Boilerplate** (5.3.0) MIT License | https://html5boilerplate.com/

