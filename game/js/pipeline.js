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

export { THREE, EffectComposer, Shaders };
