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

## Server Safety Limits

The optional WebSocket broker in `server/wsbroker.js` applies default size caps before buffering and parsing untrusted traffic:

- `clientMessageBytes`: 64 KiB WebSocket client frame limit
- `backendResponseBytes`: 1 MiB HTTP backend response limit
- `commandRequestBytes`: 1 MiB backend command POST body limit

Override them with `config.limits` when constructing a broker. The focused broker limit regression test is self-contained and can run without installing npm dependencies:

```bash
node server/wsbroker-limits.test.js
```

## Dependency Policy

This repository is intentionally vendored and does not rely on `package.json` / `package-lock.json`.

When adding dependencies:
1. Add only compiled runtime files that are required by this repo.
2. Avoid vendoring full source trees when a minimal runtime subset is enough.
3. Record the source/version in `THIRD_PARTY.md`.

## Gameplay Helpers

### Action input

`lib/u-action-input.js` is UMD/browser-global (`ActionInput`) and CommonJS compatible. Create bindings with keyboard (`{ key: 'ArrowLeft' }`), mouse (`{ mouse: 0 }`), gamepad buttons (`{ gamepadButton: 0 }`), or axes (`{ gamepadAxis: 0, direction: -1, threshold: 0.5 }`). Call `update()` once per frame, read `held(action)`, `pressed(action)`, `released(action)`, or `value(action)`, then call `endFrame()` to explicitly clear edges. It clears held state on window blur, gamepad disconnect, and gamepad polling failure. Input, lifecycle, and gamepad-poll boundaries are injectable through `target`, `lifecycleTarget`, and `pollGamepads` for tests. The platformer is the runnable example.

### Snapshots

`lib/u-snapshot.js` is UMD/browser-global (`SnapshotStore`) and CommonJS compatible. `SnapshotStore.create({ namespace, version, storage, maxCharacters })` returns `save(slot, payload)`, `load(slot)`, and `remove(slot)`. Stored input and output are capped at 1,048,576 JSON characters by default; callers may choose a smaller limit or raise it up to the hard 16 Mi-character ceiling. Results are `{ ok: true }` / `{ ok: true, payload }` or a structured `{ ok: false, code }` (`missing`, `corrupt`, `too_large`, `version_mismatch`, `storage_error`, and validation failures); failures never include raw stored data. The Nonogram demonstrates Save, Load, and Clear Save.

### THREE pipeline

3D examples import the single ES module `lib/u-three-pipeline.js`. It exports `setupPipeline(stage)`, Promise-based `loadGLTF(url, { loader, onProgress })`, and `disposeObject3D(root)`, plus the maintained THREE exports. `loadGLTF` progress is `{ loaded, total, ratio }`; rejection is `{ code: 'gltf_load_failed', url }`. `disposeObject3D` assumes exclusive ownership: it disposes deduplicated geometry, materials, top-level material textures, and shader-uniform texture values, but does not detach objects from parents.

## Local checks

No install is required for the focused checks:

```bash
node lib/u-action-input.test.js
node lib/u-snapshot.test.js
node examples/2d-nonogram/js/nonogram-logic.test.js
node lib/u-three-pipeline.test.mjs
node static-html-references.test.js
find . -path './lib/three' -prune -o -type f -name '*.js' -print0 | xargs -0 -n1 node --check
```

These are Node/static checks only; no browser runtime acceptance is claimed.

Built on **HTML5 Boilerplate** (5.3.0) MIT License | https://html5boilerplate.com/

