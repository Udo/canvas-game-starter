import assert from 'node:assert/strict';
import { THREE, disposeObject3D, loadGLTF, setupPipeline } from './u-three-pipeline.js';

const disposed = [];
const disposable = (name) => ({ dispose() { disposed.push(name); } });
const texture = { isTexture: true, ...disposable('texture') };
const geometry = disposable('geometry');
const uniformTexture = { isTexture: true, ...disposable('uniformTexture') };
const material = { map: texture, uniforms: { diffuse: { value: uniformTexture } }, ...disposable('material') };
const root = { geometry, material, traverse(fn) { fn(this); fn({ geometry, material }); } };
disposeObject3D(root);
assert.deepEqual(disposed.sort(), ['geometry', 'material', 'texture', 'uniformTexture']);

const size = new THREE.Vector2(320, 180);
const stage = {
	root: new THREE.Scene(),
	camera: new THREE.PerspectiveCamera(),
	renderer: { getPixelRatio: () => 1, getSize: target => target.copy(size) }
};
const composer = setupPipeline(stage);
assert.equal(stage.composer, composer);
assert.equal(stage.pipeline.saoPass.saoMaterial.uniforms.size.value.x, 320);
assert.equal(stage.pipeline.saoPass.saoMaterial.uniforms.size.value.y, 180);

const progress = [];
const result = await loadGLTF('model.gltf', {
	loader: { load(url, resolve, report) { assert.equal(url, 'model.gltf'); report({ loaded: 2, total: 4 }); resolve({ scene: {} }); } },
	onProgress: value => progress.push(value)
});
assert.deepEqual(result, { scene: {} });
assert.deepEqual(progress, [{ loaded: 2, total: 4, ratio: 0.5 }]);
await assert.rejects(
	loadGLTF('bad.gltf', { loader: { load(url, resolve, report, reject) { reject(new Error('network')); } } }),
	error => error.code === 'gltf_load_failed' && error.url === 'bad.gltf'
);
await assert.rejects(
	loadGLTF('throw.gltf', { loader: { load() { throw new Error('network'); } } }),
	error => error.code === 'gltf_load_failed' && error.url === 'throw.gltf'
);
console.log('u-three-pipeline.test.mjs passed');
