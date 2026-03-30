# Third-Party Runtime Assets

This project vendors runtime assets directly in `lib/` instead of using package manifests.

## PIXI.js
- Version: `8.17.1`
- Files:
  - `lib/pixi.min.js`
- Source:
  - `https://cdn.jsdelivr.net/npm/pixi.js@8.17.1/dist/pixi.min.js`
- License:
  - BSD 3-Clause

## THREE.js
- Version: `r183` (npm package line: `0.183.x`)
- Files:
  - `lib/three/build/three.module.js`
  - `lib/three/build/three.core.js`
  - `lib/three/examples/jsm/**` (minimal transitive subset required by this repo)
  - `lib/three/LICENSE`
- Source:
  - `https://github.com/mrdoob/three.js/archive/refs/tags/r183.tar.gz`
- License:
  - MIT

## Notes
- Keep vendored assets minimal and runtime-only.
- If a new plugin/shader/loader is needed, add only the file and its direct transitive imports.
