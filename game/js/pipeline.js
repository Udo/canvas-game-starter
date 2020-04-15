
import * as THREE from '../lib/three/build/three.module.js';

import { EffectComposer } from '../lib/three/examples/jsm/postprocessing/EffectComposer.js';

import { RenderPass } from '../lib/three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from '../lib/three/examples/jsm/postprocessing/ShaderPass.js';
import { SSAOPass } from '../lib/three/examples/jsm/postprocessing/SSAOPass.js';
import { SAOPass } from '../lib/three/examples/jsm/postprocessing/SAOPass.js';
import { AdaptiveToneMappingPass } from '../lib/three/examples/jsm/postprocessing/AdaptiveToneMappingPass.js';
import { TAARenderPass } from '../lib/three/examples/jsm/postprocessing/TAARenderPass.js';
import { SMAAPass } from '../lib/three/examples/jsm/postprocessing/SMAAPass.js';
import { UnrealBloomPass } from '../lib/three/examples/jsm/postprocessing/UnrealBloomPass.js';

import { RGBShiftShader } from '../lib/three/examples/jsm/shaders/RGBShiftShader.js';
import { FXAAShader } from '../lib/three/examples/jsm/shaders/FXAAShader.js';
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
			if(typeof target_or_function == 'function')
			{
				target_or_function(o, res);
			}
			else
			{
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
			
var Shaders = {
	RenderPass,
	ShaderPass,
	SSAOPass,
	SAOPass,
	AdaptiveToneMappingPass,
	TAARenderPass,
	SMAAPass,
	UnrealBloomPass,
	RGBShiftShader,
	FXAAShader,
	CopyShader,
};

export { THREE, EffectComposer, Shaders, GLTFLoader, RGBELoader, RoughnessMipmapper, load_gltf };
