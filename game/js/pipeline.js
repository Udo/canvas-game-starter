
import * as THREE from '../lib/three/build/three.module.js';

import { EffectComposer } from '../lib/three/examples/jsm/postprocessing/EffectComposer.js';

import { RenderPass } from '../lib/three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from '../lib/three/examples/jsm/postprocessing/ShaderPass.js';
//import { SSAOPass } from '../lib/three/examples/jsm/postprocessing/SSAOPass.js';
import { SAOPass } from '../lib/three/examples/jsm/postprocessing/SAOPass.js';
//import { AdaptiveToneMappingPass } from '../lib/three/examples/jsm/postprocessing/AdaptiveToneMappingPass.js';
//import { TAARenderPass } from '../lib/three/examples/jsm/postprocessing/TAARenderPass.js';
//import { SMAAPass } from '../lib/three/examples/jsm/postprocessing/SMAAPass.js';
import { UnrealBloomPass } from '../lib/three/examples/jsm/postprocessing/UnrealBloomPass.js';
//import { BokehPass } from '../lib/three/examples/jsm/postprocessing/BokehPass.js';

//import { RGBShiftShader } from '../lib/three/examples/jsm/shaders/RGBShiftShader.js';
//import { FXAAShader } from '../lib/three/examples/jsm/shaders/FXAAShader.js';
import { CopyShader } from '../lib/three/examples/jsm/shaders/CopyShader.js';

import { GLTFLoader } from '../lib/three/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from '../lib/three/examples/jsm/loaders/RGBELoader.js';
import { RoughnessMipmapper } from '../lib/three/examples/jsm/utils/RoughnessMipmapper.js';

function load_gltf(url, target_or_function) {
	new GLTFLoader().load(
		url,
		function (res) {
			var o = res.scene.children[0];
			console.log('gltf object loaded', o);
			if(typeof target_or_function == 'function') {
				target_or_function(o, res);
			}
			else {
				target_or_function.add(o);
			}
		},
		function (progress) {
			console.log('gltf progress', progress);
		},
		function (error) {
			console.log('gltf error', error);
		},
	);
}

var enable_fxaa = function(Stage, EffectComposer) {
	var fxaaPass = Stage.pipeline.fxaaPass = new ShaderPass( Shaders.FXAAShader );
	fxaaPass.material.uniforms[ 'resolution' ].value.x = 1 / ( window.innerWidth * pixelRatio );
	fxaaPass.material.uniforms[ 'resolution' ].value.y = 1 / ( window.innerHeight * pixelRatio );
	Stage.composer.addPass(fxaaPass);
}

var enable_sao = function(Stage, EffectComposer) {
	var saoPass = Stage.pipeline.saoPass = new SAOPass( Stage.root, Stage.camera, false, true );
	saoPass.params.saoScale = 100.0;
	saoPass.params.saoBias = 0.5;
	saoPass.params.saoIntensity = 0.10;
	saoPass.params.saoKernelRadius = 10.0;
	Stage.composer.addPass(saoPass);
}

var enable_ssao = function(Stage, EffectComposer) {
	var ssaoPass = Stage.pipeline.ssaoPass = new SSAOPass( Stage.root, Stage.camera, window.innerWidth, window.innerHeight );
	ssaoPass.kernelRadius = 10;
	ssaoPass.minDistance = 0.01;
	ssaoPass.maxDistance = 2;
	Stage.composer.addPass(ssaoPass);
}


const CustomShader = {
	uniforms: {
		tDiffuse: { value: null },
		color:		{ value: new THREE.Color(0x00aa00) },
	},
	vertexShader: `
		varying vec2 vUv;
		void main() {
			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1);
		}
	`,
	fragmentShader: `
		float scan_lines = 100.0;
		uniform vec3 color;
		uniform sampler2D tDiffuse;
		varying vec2 vUv;
		void main() {
			vec4 previousPassColor = texture2D(tDiffuse, vUv);
			float lum = 0.5 + 0.5*round(mod(vUv.y*scan_lines, 1.0));
			gl_FragColor = vec4(
					previousPassColor.rgb * color * lum,
					previousPassColor.a);
		}
	`,
};

var setup_pipeline = (Stage, EffectComposer) => {
	var pixelRatio = Stage.renderer.getPixelRatio();
	Stage.composer = new EffectComposer(Stage.renderer);
	Stage.composer.addPass( new RenderPass( Stage.root, Stage.camera ) );
	enable_sao(Stage, EffectComposer);
	//Stage.composer.addPass(
	//	new Shaders.UnrealBloomPass(new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.0, 0.70 ));
	//Stage.composer.addPass( new BokehPass( Stage.root, Stage.camera, { focus : 20.0, aperture : 0.001, maxblur : 2 } ) );
	//Stage.composer.addPass( new ShaderPass(CustomShader) );
}

var Shaders = {
	RenderPass,
	ShaderPass,
	CopyShader,
};

export { THREE, EffectComposer, Shaders, GLTFLoader, RGBELoader, RoughnessMipmapper, load_gltf, setup_pipeline };
