import * as THREE from './three/build/three.module.js';
import { EffectComposer } from './three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from './three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from './three/examples/jsm/postprocessing/ShaderPass.js';
import { SAOPass } from './three/examples/jsm/postprocessing/SAOPass.js';
import { CopyShader } from './three/examples/jsm/shaders/CopyShader.js';
import { GLTFLoader } from './three/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from './three/examples/jsm/loaders/RGBELoader.js';

function loadGLTF(url, options = {}) {
	const loader = options.loader || new GLTFLoader();
	return new Promise((resolve, reject) => {
		try {
			loader.load(url, resolve, (event) => {
				if (!options.onProgress) return;
				const loaded = Number.isFinite(event.loaded) ? event.loaded : 0;
				const total = Number.isFinite(event.total) && event.total > 0 ? event.total : null;
				options.onProgress({ loaded, total, ratio: total === null ? null : loaded / total });
			}, () => reject({ code: 'gltf_load_failed', url }));
		} catch (_) { reject({ code: 'gltf_load_failed', url }); }
	});
}

function disposeObject3D(root) {
	const disposed = new Set();
	const dispose = (value) => {
		if (value && typeof value.dispose === 'function' && !disposed.has(value)) {
			disposed.add(value);
			value.dispose();
		}
	};
	const disposeTextureValue = (value) => {
		if (value && value.isTexture) dispose(value);
		else if (Array.isArray(value)) value.forEach(disposeTextureValue);
	};
	const disposeMaterial = (material) => {
		if (!material) return;
		Object.keys(material).forEach((key) => disposeTextureValue(material[key]));
		Object.values(material.uniforms || {}).forEach((uniform) => disposeTextureValue(uniform && uniform.value));
		dispose(material);
	};
	root.traverse((object) => {
		dispose(object.geometry);
		if (Array.isArray(object.material)) object.material.forEach(disposeMaterial);
		else disposeMaterial(object.material);
	});
}

function setupPipeline(stage) {
	stage.pipeline = stage.pipeline || {};
	stage.composer = new EffectComposer(stage.renderer);
	stage.composer.addPass(new RenderPass(stage.root, stage.camera));
	const saoPass = stage.pipeline.saoPass = new SAOPass(stage.root, stage.camera);
	saoPass.params.saoScale = 100.0;
	saoPass.params.saoBias = 0.5;
	saoPass.params.saoIntensity = 0.10;
	saoPass.params.saoKernelRadius = 10.0;
	stage.composer.addPass(saoPass);
	return stage.composer;
}

const Shaders = { RenderPass, ShaderPass, CopyShader };
export { THREE, EffectComposer, Shaders, GLTFLoader, RGBELoader, loadGLTF, disposeObject3D, setupPipeline };
