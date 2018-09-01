/**
 * @author HypnosNova / https://www.threejs.org.cn/gallery/
 *
 * Afterimage shader
 * I created this effect inspired by a demo on codepen:
 * https://codepen.io/brunoimbrizi/pen/MoRJaN?page=1&
 */

THREE.AfterimageShader = {

	uniforms: {

		"damp": { value: 0.96 },
		"tOld": { value: null },
		"tNew": { value: null }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join( "\n" ),

	fragmentShader: [

		"uniform float damp;",

		"uniform sampler2D tOld;",
		"uniform sampler2D tNew;",

		"varying vec2 vUv;",
		
		"vec4 when_gt( vec4 x, float y ) {",

			"return max( sign( x - y ), 0.0 );",

		"}",

		"void main() {",

			"vec4 texelOld = texture2D( tOld, vUv );",
			"vec4 texelNew = texture2D( tNew, vUv );",
			
			"texelOld *= damp * when_gt( texelOld, 0.1 );",

			"gl_FragColor = max(texelNew, texelOld);",

		"}"

	].join( "\n" )

};
/**
 * @author mrdoob / http://www.mrdoob.com
 *
 * Simple test shader
 */

THREE.BasicShader = {

	uniforms: {},

	vertexShader: [

		"void main() {",

			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join( "\n" ),

	fragmentShader: [

		"void main() {",

			"gl_FragColor = vec4( 1.0, 0.0, 0.0, 0.5 );",

		"}"

	].join( "\n" )

};
/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Bleach bypass shader [http://en.wikipedia.org/wiki/Bleach_bypass]
 * - based on Nvidia example
 * http://developer.download.nvidia.com/shaderlibrary/webpages/shader_library.html#post_bleach_bypass
 */

THREE.BleachBypassShader = {

	uniforms: {

		"tDiffuse": { value: null },
		"opacity":  { value: 1.0 }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join( "\n" ),

	fragmentShader: [

		"uniform float opacity;",

		"uniform sampler2D tDiffuse;",

		"varying vec2 vUv;",

		"void main() {",

			"vec4 base = texture2D( tDiffuse, vUv );",

			"vec3 lumCoeff = vec3( 0.25, 0.65, 0.1 );",
			"float lum = dot( lumCoeff, base.rgb );",
			"vec3 blend = vec3( lum );",

			"float L = min( 1.0, max( 0.0, 10.0 * ( lum - 0.45 ) ) );",

			"vec3 result1 = 2.0 * base.rgb * blend;",
			"vec3 result2 = 1.0 - 2.0 * ( 1.0 - blend ) * ( 1.0 - base.rgb );",

			"vec3 newColor = mix( result1, result2, L );",

			"float A2 = opacity * base.a;",
			"vec3 mixRGB = A2 * newColor.rgb;",
			"mixRGB += ( ( 1.0 - A2 ) * base.rgb );",

			"gl_FragColor = vec4( mixRGB, base.a );",

		"}"

	].join( "\n" )

};
/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Blend two textures
 */

THREE.BlendShader = {

	uniforms: {

		"tDiffuse1": { value: null },
		"tDiffuse2": { value: null },
		"mixRatio":  { value: 0.5 },
		"opacity":   { value: 1.0 }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join( "\n" ),

	fragmentShader: [

		"uniform float opacity;",
		"uniform float mixRatio;",

		"uniform sampler2D tDiffuse1;",
		"uniform sampler2D tDiffuse2;",

		"varying vec2 vUv;",

		"void main() {",

			"vec4 texel1 = texture2D( tDiffuse1, vUv );",
			"vec4 texel2 = texture2D( tDiffuse2, vUv );",
			"gl_FragColor = opacity * mix( texel1, texel2, mixRatio );",

		"}"

	].join( "\n" )

};
/**
 * @author zz85 / https://github.com/zz85 | twitter.com/blurspline
 *
 * Depth-of-field shader with bokeh
 * ported from GLSL shader by Martins Upitis
 * http://blenderartists.org/forum/showthread.php?237488-GLSL-depth-of-field-with-bokeh-v2-4-(update)
 *
 * Requires #define RINGS and SAMPLES integers
 */



THREE.BokehShader = {

	uniforms: {

		"textureWidth":  { value: 1.0 },
		"textureHeight":  { value: 1.0 },

		"focalDepth":   { value: 1.0 },
		"focalLength":   { value: 24.0 },
		"fstop": { value: 0.9 },

		"tColor":   { value: null },
		"tDepth":   { value: null },

		"maxblur":  { value: 1.0 },

		"showFocus":   { value: 0 },
		"manualdof":   { value: 0 },
		"vignetting":   { value: 0 },
		"depthblur":   { value: 0 },

		"threshold":  { value: 0.5 },
		"gain":  { value: 2.0 },
		"bias":  { value: 0.5 },
		"fringe":  { value: 0.7 },

		"znear":  { value: 0.1 },
		"zfar":  { value: 100 },

		"noise":  { value: 1 },
		"dithering":  { value: 0.0001 },
		"pentagon": { value: 0 },

		"shaderFocus":  { value: 1 },
		"focusCoords":  { value: new THREE.Vector2() }


	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join( "\n" ),

	fragmentShader: [

		"#include <common>",

		"varying vec2 vUv;",

		"uniform sampler2D tColor;",
		"uniform sampler2D tDepth;",
		"uniform float textureWidth;",
		"uniform float textureHeight;",

		"uniform float focalDepth;  //focal distance value in meters, but you may use autofocus option below",
		"uniform float focalLength; //focal length in mm",
		"uniform float fstop; //f-stop value",
		"uniform bool showFocus; //show debug focus point and focal range (red = focal point, green = focal range)",

		"/*",
		"make sure that these two values are the same for your camera, otherwise distances will be wrong.",
		"*/",

		"uniform float znear; // camera clipping start",
		"uniform float zfar; // camera clipping end",

		"//------------------------------------------",
		"//user variables",

		"const int samples = SAMPLES; //samples on the first ring",
		"const int rings = RINGS; //ring count",

		"const int maxringsamples = rings * samples;",

		"uniform bool manualdof; // manual dof calculation",
		"float ndofstart = 1.0; // near dof blur start",
		"float ndofdist = 2.0; // near dof blur falloff distance",
		"float fdofstart = 1.0; // far dof blur start",
		"float fdofdist = 3.0; // far dof blur falloff distance",

		"float CoC = 0.03; //circle of confusion size in mm (35mm film = 0.03mm)",

		"uniform bool vignetting; // use optical lens vignetting",

		"float vignout = 1.3; // vignetting outer border",
		"float vignin = 0.0; // vignetting inner border",
		"float vignfade = 22.0; // f-stops till vignete fades",

		"uniform bool shaderFocus;",
		"// disable if you use external focalDepth value",

		"uniform vec2 focusCoords;",
		"// autofocus point on screen (0.0,0.0 - left lower corner, 1.0,1.0 - upper right)",
		"// if center of screen use vec2(0.5, 0.5);",

		"uniform float maxblur;",
		"//clamp value of max blur (0.0 = no blur, 1.0 default)",

		"uniform float threshold; // highlight threshold;",
		"uniform float gain; // highlight gain;",

		"uniform float bias; // bokeh edge bias",
		"uniform float fringe; // bokeh chromatic aberration / fringing",

		"uniform bool noise; //use noise instead of pattern for sample dithering",

		"uniform float dithering;",

		"uniform bool depthblur; // blur the depth buffer",
		"float dbsize = 1.25; // depth blur size",

		"/*",
		"next part is experimental",
		"not looking good with small sample and ring count",
		"looks okay starting from samples = 4, rings = 4",
		"*/",

		"uniform bool pentagon; //use pentagon as bokeh shape?",
		"float feather = 0.4; //pentagon shape feather",

		"//------------------------------------------",

		"float penta(vec2 coords) {",
			"//pentagonal shape",
			"float scale = float(rings) - 1.3;",
			"vec4  HS0 = vec4( 1.0,         0.0,         0.0,  1.0);",
			"vec4  HS1 = vec4( 0.309016994, 0.951056516, 0.0,  1.0);",
			"vec4  HS2 = vec4(-0.809016994, 0.587785252, 0.0,  1.0);",
			"vec4  HS3 = vec4(-0.809016994,-0.587785252, 0.0,  1.0);",
			"vec4  HS4 = vec4( 0.309016994,-0.951056516, 0.0,  1.0);",
			"vec4  HS5 = vec4( 0.0        ,0.0         , 1.0,  1.0);",

			"vec4  one = vec4( 1.0 );",

			"vec4 P = vec4((coords),vec2(scale, scale));",

			"vec4 dist = vec4(0.0);",
			"float inorout = -4.0;",

			"dist.x = dot( P, HS0 );",
			"dist.y = dot( P, HS1 );",
			"dist.z = dot( P, HS2 );",
			"dist.w = dot( P, HS3 );",

			"dist = smoothstep( -feather, feather, dist );",

			"inorout += dot( dist, one );",

			"dist.x = dot( P, HS4 );",
			"dist.y = HS5.w - abs( P.z );",

			"dist = smoothstep( -feather, feather, dist );",
			"inorout += dist.x;",

			"return clamp( inorout, 0.0, 1.0 );",
		"}",

		"float bdepth(vec2 coords) {",
			"// Depth buffer blur",
			"float d = 0.0;",
			"float kernel[9];",
			"vec2 offset[9];",

			"vec2 wh = vec2(1.0/textureWidth,1.0/textureHeight) * dbsize;",

			"offset[0] = vec2(-wh.x,-wh.y);",
			"offset[1] = vec2( 0.0, -wh.y);",
			"offset[2] = vec2( wh.x -wh.y);",

			"offset[3] = vec2(-wh.x,  0.0);",
			"offset[4] = vec2( 0.0,   0.0);",
			"offset[5] = vec2( wh.x,  0.0);",

			"offset[6] = vec2(-wh.x, wh.y);",
			"offset[7] = vec2( 0.0,  wh.y);",
			"offset[8] = vec2( wh.x, wh.y);",

			"kernel[0] = 1.0/16.0;   kernel[1] = 2.0/16.0;   kernel[2] = 1.0/16.0;",
			"kernel[3] = 2.0/16.0;   kernel[4] = 4.0/16.0;   kernel[5] = 2.0/16.0;",
			"kernel[6] = 1.0/16.0;   kernel[7] = 2.0/16.0;   kernel[8] = 1.0/16.0;",


			"for( int i=0; i<9; i++ ) {",
				"float tmp = texture2D(tDepth, coords + offset[i]).r;",
				"d += tmp * kernel[i];",
			"}",

			"return d;",
		"}",


		"vec3 color(vec2 coords,float blur) {",
			"//processing the sample",

			"vec3 col = vec3(0.0);",
			"vec2 texel = vec2(1.0/textureWidth,1.0/textureHeight);",

			"col.r = texture2D(tColor,coords + vec2(0.0,1.0)*texel*fringe*blur).r;",
			"col.g = texture2D(tColor,coords + vec2(-0.866,-0.5)*texel*fringe*blur).g;",
			"col.b = texture2D(tColor,coords + vec2(0.866,-0.5)*texel*fringe*blur).b;",

			"vec3 lumcoeff = vec3(0.299,0.587,0.114);",
			"float lum = dot(col.rgb, lumcoeff);",
			"float thresh = max((lum-threshold)*gain, 0.0);",
			"return col+mix(vec3(0.0),col,thresh*blur);",
		"}",

		"vec3 debugFocus(vec3 col, float blur, float depth) {",
			"float edge = 0.002*depth; //distance based edge smoothing",
			"float m = clamp(smoothstep(0.0,edge,blur),0.0,1.0);",
			"float e = clamp(smoothstep(1.0-edge,1.0,blur),0.0,1.0);",

			"col = mix(col,vec3(1.0,0.5,0.0),(1.0-m)*0.6);",
			"col = mix(col,vec3(0.0,0.5,1.0),((1.0-e)-(1.0-m))*0.2);",

			"return col;",
		"}",

		"float linearize(float depth) {",
			"return -zfar * znear / (depth * (zfar - znear) - zfar);",
		"}",


		"float vignette() {",
			"float dist = distance(vUv.xy, vec2(0.5,0.5));",
			"dist = smoothstep(vignout+(fstop/vignfade), vignin+(fstop/vignfade), dist);",
			"return clamp(dist,0.0,1.0);",
		"}",

		"float gather(float i, float j, int ringsamples, inout vec3 col, float w, float h, float blur) {",
			"float rings2 = float(rings);",
			"float step = PI*2.0 / float(ringsamples);",
			"float pw = cos(j*step)*i;",
			"float ph = sin(j*step)*i;",
			"float p = 1.0;",
			"if (pentagon) {",
				"p = penta(vec2(pw,ph));",
			"}",
			"col += color(vUv.xy + vec2(pw*w,ph*h), blur) * mix(1.0, i/rings2, bias) * p;",
			"return 1.0 * mix(1.0, i /rings2, bias) * p;",
		"}",

		"void main() {",
			"//scene depth calculation",

			"float depth = linearize(texture2D(tDepth,vUv.xy).x);",

			"// Blur depth?",
			"if ( depthblur ) {",
				"depth = linearize(bdepth(vUv.xy));",
			"}",

			"//focal plane calculation",

			"float fDepth = focalDepth;",

			"if (shaderFocus) {",

				"fDepth = linearize(texture2D(tDepth,focusCoords).x);",

			"}",

			"// dof blur factor calculation",

			"float blur = 0.0;",

			"if (manualdof) {",
				"float a = depth-fDepth; // Focal plane",
				"float b = (a-fdofstart)/fdofdist; // Far DoF",
				"float c = (-a-ndofstart)/ndofdist; // Near Dof",
				"blur = (a>0.0) ? b : c;",
			"} else {",
				"float f = focalLength; // focal length in mm",
				"float d = fDepth*1000.0; // focal plane in mm",
				"float o = depth*1000.0; // depth in mm",

				"float a = (o*f)/(o-f);",
				"float b = (d*f)/(d-f);",
				"float c = (d-f)/(d*fstop*CoC);",

				"blur = abs(a-b)*c;",
			"}",

			"blur = clamp(blur,0.0,1.0);",

			"// calculation of pattern for dithering",

			"vec2 noise = vec2(rand(vUv.xy), rand( vUv.xy + vec2( 0.4, 0.6 ) ) )*dithering*blur;",

			"// getting blur x and y step factor",

			"float w = (1.0/textureWidth)*blur*maxblur+noise.x;",
			"float h = (1.0/textureHeight)*blur*maxblur+noise.y;",

			"// calculation of final color",

			"vec3 col = vec3(0.0);",

			"if(blur < 0.05) {",
				"//some optimization thingy",
				"col = texture2D(tColor, vUv.xy).rgb;",
			"} else {",
				"col = texture2D(tColor, vUv.xy).rgb;",
				"float s = 1.0;",
				"int ringsamples;",

				"for (int i = 1; i <= rings; i++) {",
					"/*unboxstart*/",
					"ringsamples = i * samples;",

					"for (int j = 0 ; j < maxringsamples ; j++) {",
						"if (j >= ringsamples) break;",
						"s += gather(float(i), float(j), ringsamples, col, w, h, blur);",
					"}",
					"/*unboxend*/",
				"}",

				"col /= s; //divide by sample count",
			"}",

			"if (showFocus) {",
				"col = debugFocus(col, blur, depth);",
			"}",

			"if (vignetting) {",
				"col *= vignette();",
			"}",

			"gl_FragColor.rgb = col;",
			"gl_FragColor.a = 1.0;",
		"} "

	].join( "\n" )

};

THREE.BokehDepthShader = {

	uniforms: {

		"mNear": { value: 1.0 },
		"mFar": { value: 1000.0 },

	},

	vertexShader: [

		"varying float vViewZDepth;",

		"void main() {",

		"	#include <begin_vertex>",
		"	#include <project_vertex>",

		"	vViewZDepth = - mvPosition.z;",

		"}"

	].join( "\n" ),

	fragmentShader: [

		"uniform float mNear;",
		"uniform float mFar;",

		"varying float vViewZDepth;",

		"void main() {",

		"	float color = 1.0 - smoothstep( mNear, mFar, vViewZDepth );",
		"	gl_FragColor = vec4( vec3( color ), 1.0 );",

		"} "

	].join( "\n" )

};
/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Depth-of-field shader with bokeh
 * ported from GLSL shader by Martins Upitis
 * http://artmartinsh.blogspot.com/2010/02/glsl-lens-blur-filter-with-bokeh.html
 */

THREE.BokehShader = {

	defines: {
		"DEPTH_PACKING": 1,
		"PERSPECTIVE_CAMERA": 1,
	},

	uniforms: {

		"tColor":   { value: null },
		"tDepth":   { value: null },
		"focus":    { value: 1.0 },
		"aspect":   { value: 1.0 },
		"aperture": { value: 0.025 },
		"maxblur":  { value: 1.0 },
		"nearClip":  { value: 1.0 },
		"farClip":  { value: 1000.0 },

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join( "\n" ),

	fragmentShader: [
		"#include <common>",

		"varying vec2 vUv;",

		"uniform sampler2D tColor;",
		"uniform sampler2D tDepth;",

		"uniform float maxblur;",  // max blur amount
		"uniform float aperture;", // aperture - bigger values for shallower depth of field

		"uniform float nearClip;",
		"uniform float farClip;",

		"uniform float focus;",
		"uniform float aspect;",

		"#include <packing>",

		"float getDepth( const in vec2 screenPosition ) {",
		"	#if DEPTH_PACKING == 1",
		"	return unpackRGBAToDepth( texture2D( tDepth, screenPosition ) );",
		"	#else",
		"	return texture2D( tDepth, screenPosition ).x;",
		"	#endif",
		"}",

		"float getViewZ( const in float depth ) {",
		"	#if PERSPECTIVE_CAMERA == 1",
		"	return perspectiveDepthToViewZ( depth, nearClip, farClip );",
		"	#else",
		"	return orthographicDepthToViewZ( depth, nearClip, farClip );",
		"	#endif",
		"}",
		

		"void main() {",

			"vec2 aspectcorrect = vec2( 1.0, aspect );",
	
			"float viewZ = getViewZ( getDepth( vUv ) );",

			"float factor = ( focus + viewZ );",  // viewZ is <= 0, so this is a difference equation

			"vec2 dofblur = vec2 ( clamp( factor * aperture, -maxblur, maxblur ) );",

			"vec2 dofblur9 = dofblur * 0.9;",
			"vec2 dofblur7 = dofblur * 0.7;",
			"vec2 dofblur4 = dofblur * 0.4;",

			"vec4 col = vec4( 0.0 );",

			"col += texture2D( tColor, vUv.xy );",
			"col += texture2D( tColor, vUv.xy + ( vec2(  0.0,   0.4  ) * aspectcorrect ) * dofblur );",
			"col += texture2D( tColor, vUv.xy + ( vec2(  0.15,  0.37 ) * aspectcorrect ) * dofblur );",
			"col += texture2D( tColor, vUv.xy + ( vec2(  0.29,  0.29 ) * aspectcorrect ) * dofblur );",
			"col += texture2D( tColor, vUv.xy + ( vec2( -0.37,  0.15 ) * aspectcorrect ) * dofblur );",
			"col += texture2D( tColor, vUv.xy + ( vec2(  0.40,  0.0  ) * aspectcorrect ) * dofblur );",
			"col += texture2D( tColor, vUv.xy + ( vec2(  0.37, -0.15 ) * aspectcorrect ) * dofblur );",
			"col += texture2D( tColor, vUv.xy + ( vec2(  0.29, -0.29 ) * aspectcorrect ) * dofblur );",
			"col += texture2D( tColor, vUv.xy + ( vec2( -0.15, -0.37 ) * aspectcorrect ) * dofblur );",
			"col += texture2D( tColor, vUv.xy + ( vec2(  0.0,  -0.4  ) * aspectcorrect ) * dofblur );",
			"col += texture2D( tColor, vUv.xy + ( vec2( -0.15,  0.37 ) * aspectcorrect ) * dofblur );",
			"col += texture2D( tColor, vUv.xy + ( vec2( -0.29,  0.29 ) * aspectcorrect ) * dofblur );",
			"col += texture2D( tColor, vUv.xy + ( vec2(  0.37,  0.15 ) * aspectcorrect ) * dofblur );",
			"col += texture2D( tColor, vUv.xy + ( vec2( -0.4,   0.0  ) * aspectcorrect ) * dofblur );",
			"col += texture2D( tColor, vUv.xy + ( vec2( -0.37, -0.15 ) * aspectcorrect ) * dofblur );",
			"col += texture2D( tColor, vUv.xy + ( vec2( -0.29, -0.29 ) * aspectcorrect ) * dofblur );",
			"col += texture2D( tColor, vUv.xy + ( vec2(  0.15, -0.37 ) * aspectcorrect ) * dofblur );",

			"col += texture2D( tColor, vUv.xy + ( vec2(  0.15,  0.37 ) * aspectcorrect ) * dofblur9 );",
			"col += texture2D( tColor, vUv.xy + ( vec2( -0.37,  0.15 ) * aspectcorrect ) * dofblur9 );",
			"col += texture2D( tColor, vUv.xy + ( vec2(  0.37, -0.15 ) * aspectcorrect ) * dofblur9 );",
			"col += texture2D( tColor, vUv.xy + ( vec2( -0.15, -0.37 ) * aspectcorrect ) * dofblur9 );",
			"col += texture2D( tColor, vUv.xy + ( vec2( -0.15,  0.37 ) * aspectcorrect ) * dofblur9 );",
			"col += texture2D( tColor, vUv.xy + ( vec2(  0.37,  0.15 ) * aspectcorrect ) * dofblur9 );",
			"col += texture2D( tColor, vUv.xy + ( vec2( -0.37, -0.15 ) * aspectcorrect ) * dofblur9 );",
			"col += texture2D( tColor, vUv.xy + ( vec2(  0.15, -0.37 ) * aspectcorrect ) * dofblur9 );",

			"col += texture2D( tColor, vUv.xy + ( vec2(  0.29,  0.29 ) * aspectcorrect ) * dofblur7 );",
			"col += texture2D( tColor, vUv.xy + ( vec2(  0.40,  0.0  ) * aspectcorrect ) * dofblur7 );",
			"col += texture2D( tColor, vUv.xy + ( vec2(  0.29, -0.29 ) * aspectcorrect ) * dofblur7 );",
			"col += texture2D( tColor, vUv.xy + ( vec2(  0.0,  -0.4  ) * aspectcorrect ) * dofblur7 );",
			"col += texture2D( tColor, vUv.xy + ( vec2( -0.29,  0.29 ) * aspectcorrect ) * dofblur7 );",
			"col += texture2D( tColor, vUv.xy + ( vec2( -0.4,   0.0  ) * aspectcorrect ) * dofblur7 );",
			"col += texture2D( tColor, vUv.xy + ( vec2( -0.29, -0.29 ) * aspectcorrect ) * dofblur7 );",
			"col += texture2D( tColor, vUv.xy + ( vec2(  0.0,   0.4  ) * aspectcorrect ) * dofblur7 );",

			"col += texture2D( tColor, vUv.xy + ( vec2(  0.29,  0.29 ) * aspectcorrect ) * dofblur4 );",
			"col += texture2D( tColor, vUv.xy + ( vec2(  0.4,   0.0  ) * aspectcorrect ) * dofblur4 );",
			"col += texture2D( tColor, vUv.xy + ( vec2(  0.29, -0.29 ) * aspectcorrect ) * dofblur4 );",
			"col += texture2D( tColor, vUv.xy + ( vec2(  0.0,  -0.4  ) * aspectcorrect ) * dofblur4 );",
			"col += texture2D( tColor, vUv.xy + ( vec2( -0.29,  0.29 ) * aspectcorrect ) * dofblur4 );",
			"col += texture2D( tColor, vUv.xy + ( vec2( -0.4,   0.0  ) * aspectcorrect ) * dofblur4 );",
			"col += texture2D( tColor, vUv.xy + ( vec2( -0.29, -0.29 ) * aspectcorrect ) * dofblur4 );",
			"col += texture2D( tColor, vUv.xy + ( vec2(  0.0,   0.4  ) * aspectcorrect ) * dofblur4 );",

			"gl_FragColor = col / 41.0;",
			"gl_FragColor.a = 1.0;",

		"}"

	].join( "\n" )

};
/**
 * @author tapio / http://tapio.github.com/
 *
 * Brightness and contrast adjustment
 * https://github.com/evanw/glfx.js
 * brightness: -1 to 1 (-1 is solid black, 0 is no change, and 1 is solid white)
 * contrast: -1 to 1 (-1 is solid gray, 0 is no change, and 1 is maximum contrast)
 */

THREE.BrightnessContrastShader = {

	uniforms: {

		"tDiffuse":   { value: null },
		"brightness": { value: 0 },
		"contrast":   { value: 0 }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",

			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join( "\n" ),

	fragmentShader: [

		"uniform sampler2D tDiffuse;",
		"uniform float brightness;",
		"uniform float contrast;",

		"varying vec2 vUv;",

		"void main() {",

			"gl_FragColor = texture2D( tDiffuse, vUv );",

			"gl_FragColor.rgb += brightness;",

			"if (contrast > 0.0) {",
				"gl_FragColor.rgb = (gl_FragColor.rgb - 0.5) / (1.0 - contrast) + 0.5;",
			"} else {",
				"gl_FragColor.rgb = (gl_FragColor.rgb - 0.5) * (1.0 + contrast) + 0.5;",
			"}",

		"}"

	].join( "\n" )

};
/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Color correction
 */

THREE.ColorCorrectionShader = {

	uniforms: {

		"tDiffuse": { value: null },
		"powRGB":   { value: new THREE.Vector3( 2, 2, 2 ) },
		"mulRGB":   { value: new THREE.Vector3( 1, 1, 1 ) },
		"addRGB":   { value: new THREE.Vector3( 0, 0, 0 ) }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",

			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join( "\n" ),

	fragmentShader: [

		"uniform sampler2D tDiffuse;",
		"uniform vec3 powRGB;",
		"uniform vec3 mulRGB;",
		"uniform vec3 addRGB;",

		"varying vec2 vUv;",

		"void main() {",

			"gl_FragColor = texture2D( tDiffuse, vUv );",
			"gl_FragColor.rgb = mulRGB * pow( ( gl_FragColor.rgb + addRGB ), powRGB );",

		"}"

	].join( "\n" )

};
/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Colorify shader
 */

THREE.ColorifyShader = {

	uniforms: {

		"tDiffuse": { value: null },
		"color":    { value: new THREE.Color( 0xffffff ) }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join( "\n" ),

	fragmentShader: [

		"uniform vec3 color;",
		"uniform sampler2D tDiffuse;",

		"varying vec2 vUv;",

		"void main() {",

			"vec4 texel = texture2D( tDiffuse, vUv );",

			"vec3 luma = vec3( 0.299, 0.587, 0.114 );",
			"float v = dot( texel.xyz, luma );",

			"gl_FragColor = vec4( v * color, texel.w );",

		"}"

	].join( "\n" )

};
/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Convolution shader
 * ported from o3d sample to WebGL / GLSL
 * http://o3d.googlecode.com/svn/trunk/samples/convolution.html
 */

THREE.ConvolutionShader = {

	defines: {

		"KERNEL_SIZE_FLOAT": "25.0",
		"KERNEL_SIZE_INT": "25"

	},

	uniforms: {

		"tDiffuse":        { value: null },
		"uImageIncrement": { value: new THREE.Vector2( 0.001953125, 0.0 ) },
		"cKernel":         { value: [] }

	},

	vertexShader: [

		"uniform vec2 uImageIncrement;",

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv - ( ( KERNEL_SIZE_FLOAT - 1.0 ) / 2.0 ) * uImageIncrement;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join( "\n" ),

	fragmentShader: [

		"uniform float cKernel[ KERNEL_SIZE_INT ];",

		"uniform sampler2D tDiffuse;",
		"uniform vec2 uImageIncrement;",

		"varying vec2 vUv;",

		"void main() {",

			"vec2 imageCoord = vUv;",
			"vec4 sum = vec4( 0.0, 0.0, 0.0, 0.0 );",

			"for( int i = 0; i < KERNEL_SIZE_INT; i ++ ) {",

				"sum += texture2D( tDiffuse, imageCoord ) * cKernel[ i ];",
				"imageCoord += uImageIncrement;",

			"}",

			"gl_FragColor = sum;",

		"}"


	].join( "\n" ),

	buildKernel: function ( sigma ) {

		// We lop off the sqrt(2 * pi) * sigma term, since we're going to normalize anyway.

		function gauss( x, sigma ) {

			return Math.exp( - ( x * x ) / ( 2.0 * sigma * sigma ) );

		}

		var i, values, sum, halfWidth, kMaxKernelSize = 25, kernelSize = 2 * Math.ceil( sigma * 3.0 ) + 1;

		if ( kernelSize > kMaxKernelSize ) kernelSize = kMaxKernelSize;
		halfWidth = ( kernelSize - 1 ) * 0.5;

		values = new Array( kernelSize );
		sum = 0.0;
		for ( i = 0; i < kernelSize; ++ i ) {

			values[ i ] = gauss( i - halfWidth, sigma );
			sum += values[ i ];

		}

		// normalize the kernel

		for ( i = 0; i < kernelSize; ++ i ) values[ i ] /= sum;

		return values;

	}

};
/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Full-screen textured quad shader
 */

THREE.CopyShader = {

	uniforms: {

		"tDiffuse": { value: null },
		"opacity":  { value: 1.0 }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join( "\n" ),

	fragmentShader: [

		"uniform float opacity;",

		"uniform sampler2D tDiffuse;",

		"varying vec2 vUv;",

		"void main() {",

			"vec4 texel = texture2D( tDiffuse, vUv );",
			"gl_FragColor = opacity * texel;",

		"}"

	].join( "\n" )

};
THREE.DepthLimitedBlurShader = {
	defines: {
		'KERNEL_RADIUS': 4,
		'DEPTH_PACKING': 1,
		'PERSPECTIVE_CAMERA': 1
	},
	uniforms: {
		'tDiffuse': { type: 't', value: null },
		'size': { type: 'v2', value: new THREE.Vector2( 512, 512 ) },
		'sampleUvOffsets': { type: 'v2v', value: [ new THREE.Vector2( 0, 0 ) ] },
		'sampleWeights': { type: '1fv', value: [ 1.0 ] },
		'tDepth': { type: 't', value: null },
		'cameraNear': { type: 'f', value: 10 },
		'cameraFar': { type: 'f', value: 1000 },
		'depthCutoff': { type: 'f', value: 10 },
	},
	vertexShader: [
		"#include <common>",

		"uniform vec2 size;",

		"varying vec2 vUv;",
		"varying vec2 vInvSize;",

		"void main() {",
		"	vUv = uv;",
		"	vInvSize = 1.0 / size;",

		"	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
		"}"

	].join( "\n" ),
	fragmentShader: [
		"#include <common>",
		"#include <packing>",

		"uniform sampler2D tDiffuse;",
		"uniform sampler2D tDepth;",

		"uniform float cameraNear;",
		"uniform float cameraFar;",
		"uniform float depthCutoff;",

		"uniform vec2 sampleUvOffsets[ KERNEL_RADIUS + 1 ];",
		"uniform float sampleWeights[ KERNEL_RADIUS + 1 ];",

		"varying vec2 vUv;",
		"varying vec2 vInvSize;",

		"float getDepth( const in vec2 screenPosition ) {",
		"	#if DEPTH_PACKING == 1",
		"	return unpackRGBAToDepth( texture2D( tDepth, screenPosition ) );",
		"	#else",
		"	return texture2D( tDepth, screenPosition ).x;",
		"	#endif",
		"}",

		"float getViewZ( const in float depth ) {",
		"	#if PERSPECTIVE_CAMERA == 1",
		"	return perspectiveDepthToViewZ( depth, cameraNear, cameraFar );",
		"	#else",
		"	return orthographicDepthToViewZ( depth, cameraNear, cameraFar );",
		"	#endif",
		"}",

		"void main() {",
		"	float depth = getDepth( vUv );",
		"	if( depth >= ( 1.0 - EPSILON ) ) {",
		"		discard;",
		"	}",

		"	float centerViewZ = -getViewZ( depth );",
		"	bool rBreak = false, lBreak = false;",

		"	float weightSum = sampleWeights[0];",
		"	vec4 diffuseSum = texture2D( tDiffuse, vUv ) * weightSum;",

		"	for( int i = 1; i <= KERNEL_RADIUS; i ++ ) {",

		"		float sampleWeight = sampleWeights[i];",
		"		vec2 sampleUvOffset = sampleUvOffsets[i] * vInvSize;",

		"		vec2 sampleUv = vUv + sampleUvOffset;",
		"		float viewZ = -getViewZ( getDepth( sampleUv ) );",

		"		if( abs( viewZ - centerViewZ ) > depthCutoff ) rBreak = true;",

		"		if( ! rBreak ) {",
		"			diffuseSum += texture2D( tDiffuse, sampleUv ) * sampleWeight;",
		"			weightSum += sampleWeight;",
		"		}",

		"		sampleUv = vUv - sampleUvOffset;",
		"		viewZ = -getViewZ( getDepth( sampleUv ) );",

		"		if( abs( viewZ - centerViewZ ) > depthCutoff ) lBreak = true;",

		"		if( ! lBreak ) {",
		"			diffuseSum += texture2D( tDiffuse, sampleUv ) * sampleWeight;",
		"			weightSum += sampleWeight;",
		"		}",

		"	}",

		"	gl_FragColor = diffuseSum / weightSum;",
		"}"
	].join( "\n" )
};

THREE.BlurShaderUtils = {

	createSampleWeights: function ( kernelRadius, stdDev ) {

		var gaussian = function ( x, stdDev ) {

			return Math.exp( - ( x * x ) / ( 2.0 * ( stdDev * stdDev ) ) ) / ( Math.sqrt( 2.0 * Math.PI ) * stdDev );

		};

		var weights = [];

		for ( var i = 0; i <= kernelRadius; i ++ ) {

			weights.push( gaussian( i, stdDev ) );

		}

		return weights;

	},

	createSampleOffsets: function ( kernelRadius, uvIncrement ) {

		var offsets = [];

		for ( var i = 0; i <= kernelRadius; i ++ ) {

			offsets.push( uvIncrement.clone().multiplyScalar( i ) );

		}

		return offsets;

	},

	configure: function ( material, kernelRadius, stdDev, uvIncrement ) {

		material.defines[ 'KERNEL_RADIUS' ] = kernelRadius;
		material.uniforms[ 'sampleUvOffsets' ].value = THREE.BlurShaderUtils.createSampleOffsets( kernelRadius, uvIncrement );
		material.uniforms[ 'sampleWeights' ].value = THREE.BlurShaderUtils.createSampleWeights( kernelRadius, stdDev );
		material.needsUpdate = true;

	}

};
/**
 * @author felixturner / http://airtight.cc/
 *
 * RGB Shift Shader
 * Shifts red and blue channels from center in opposite directions
 * Ported from http://kriss.cx/tom/2009/05/rgb-shift/
 * by Tom Butterworth / http://kriss.cx/tom/
 *
 * amount: shift distance (1 is width of input)
 * angle: shift angle in radians
 */

THREE.DigitalGlitch = {

	uniforms: {

		"tDiffuse":		{ value: null },//diffuse texture
		"tDisp":		{ value: null },//displacement texture for digital glitch squares
		"byp":			{ value: 0 },//apply the glitch ?
		"amount":		{ value: 0.08 },
		"angle":		{ value: 0.02 },
		"seed":			{ value: 0.02 },
		"seed_x":		{ value: 0.02 },//-1,1
		"seed_y":		{ value: 0.02 },//-1,1
		"distortion_x":	{ value: 0.5 },
		"distortion_y":	{ value: 0.6 },
		"col_s":		{ value: 0.05 }
	},

	vertexShader: [

		"varying vec2 vUv;",
		"void main() {",
			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
		"}"
	].join( "\n" ),

	fragmentShader: [
		"uniform int byp;",//should we apply the glitch ?
		
		"uniform sampler2D tDiffuse;",
		"uniform sampler2D tDisp;",
		
		"uniform float amount;",
		"uniform float angle;",
		"uniform float seed;",
		"uniform float seed_x;",
		"uniform float seed_y;",
		"uniform float distortion_x;",
		"uniform float distortion_y;",
		"uniform float col_s;",
			
		"varying vec2 vUv;",
		
		
		"float rand(vec2 co){",
			"return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);",
		"}",
				
		"void main() {",
			"if(byp<1) {",
				"vec2 p = vUv;",
				"float xs = floor(gl_FragCoord.x / 0.5);",
				"float ys = floor(gl_FragCoord.y / 0.5);",
				//based on staffantans glitch shader for unity https://github.com/staffantan/unityglitch
				"vec4 normal = texture2D (tDisp, p*seed*seed);",
				"if(p.y<distortion_x+col_s && p.y>distortion_x-col_s*seed) {",
					"if(seed_x>0.){",
						"p.y = 1. - (p.y + distortion_y);",
					"}",
					"else {",
						"p.y = distortion_y;",
					"}",
				"}",
				"if(p.x<distortion_y+col_s && p.x>distortion_y-col_s*seed) {",
					"if(seed_y>0.){",
						"p.x=distortion_x;",
					"}",
					"else {",
						"p.x = 1. - (p.x + distortion_x);",
					"}",
				"}",
				"p.x+=normal.x*seed_x*(seed/5.);",
				"p.y+=normal.y*seed_y*(seed/5.);",
				//base from RGB shift shader
				"vec2 offset = amount * vec2( cos(angle), sin(angle));",
				"vec4 cr = texture2D(tDiffuse, p + offset);",
				"vec4 cga = texture2D(tDiffuse, p);",
				"vec4 cb = texture2D(tDiffuse, p - offset);",
				"gl_FragColor = vec4(cr.r, cga.g, cb.b, cga.a);",
				//add noise
				"vec4 snow = 200.*amount*vec4(rand(vec2(xs * seed,ys * seed*50.))*0.2);",
				"gl_FragColor = gl_FragColor+ snow;",
			"}",
			"else {",
				"gl_FragColor=texture2D (tDiffuse, vUv);",
			"}",
		"}"

	].join( "\n" )

};
/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Depth-of-field shader using mipmaps
 * - from Matt Handley @applmak
 * - requires power-of-2 sized render target with enabled mipmaps
 */

THREE.DOFMipMapShader = {

	uniforms: {

		"tColor":   { value: null },
		"tDepth":   { value: null },
		"focus":    { value: 1.0 },
		"maxblur":  { value: 1.0 }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join( "\n" ),

	fragmentShader: [

		"uniform float focus;",
		"uniform float maxblur;",

		"uniform sampler2D tColor;",
		"uniform sampler2D tDepth;",

		"varying vec2 vUv;",

		"void main() {",

			"vec4 depth = texture2D( tDepth, vUv );",

			"float factor = depth.x - focus;",

			"vec4 col = texture2D( tColor, vUv, 2.0 * maxblur * abs( focus - depth.x ) );",

			"gl_FragColor = col;",
			"gl_FragColor.a = 1.0;",

		"}"

	].join( "\n" )

};
/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Dot screen shader
 * based on glfx.js sepia shader
 * https://github.com/evanw/glfx.js
 */

THREE.DotScreenShader = {

	uniforms: {

		"tDiffuse": { value: null },
		"tSize":    { value: new THREE.Vector2( 256, 256 ) },
		"center":   { value: new THREE.Vector2( 0.5, 0.5 ) },
		"angle":    { value: 1.57 },
		"scale":    { value: 1.0 }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join( "\n" ),

	fragmentShader: [

		"uniform vec2 center;",
		"uniform float angle;",
		"uniform float scale;",
		"uniform vec2 tSize;",

		"uniform sampler2D tDiffuse;",

		"varying vec2 vUv;",

		"float pattern() {",

			"float s = sin( angle ), c = cos( angle );",

			"vec2 tex = vUv * tSize - center;",
			"vec2 point = vec2( c * tex.x - s * tex.y, s * tex.x + c * tex.y ) * scale;",

			"return ( sin( point.x ) * sin( point.y ) ) * 4.0;",

		"}",

		"void main() {",

			"vec4 color = texture2D( tDiffuse, vUv );",

			"float average = ( color.r + color.g + color.b ) / 3.0;",

			"gl_FragColor = vec4( vec3( average * 10.0 - 5.0 + pattern() ), color.a );",

		"}"

	].join( "\n" )

};
/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Film grain & scanlines shader
 *
 * - ported from HLSL to WebGL / GLSL
 * http://www.truevision3d.com/forums/showcase/staticnoise_colorblackwhite_scanline_shaders-t18698.0.html
 *
 * Screen Space Static Postprocessor
 *
 * Produces an analogue noise overlay similar to a film grain / TV static
 *
 * Original implementation and noise algorithm
 * Pat 'Hawthorne' Shearon
 *
 * Optimized scanlines + noise version with intensity scaling
 * Georg 'Leviathan' Steinrohder
 *
 * This version is provided under a Creative Commons Attribution 3.0 License
 * http://creativecommons.org/licenses/by/3.0/
 */

THREE.FilmShader = {

	uniforms: {

		"tDiffuse":   { value: null },
		"time":       { value: 0.0 },
		"nIntensity": { value: 0.5 },
		"sIntensity": { value: 0.05 },
		"sCount":     { value: 4096 },
		"grayscale":  { value: 1 }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join( "\n" ),

	fragmentShader: [

		"#include <common>",
		
		// control parameter
		"uniform float time;",

		"uniform bool grayscale;",

		// noise effect intensity value (0 = no effect, 1 = full effect)
		"uniform float nIntensity;",

		// scanlines effect intensity value (0 = no effect, 1 = full effect)
		"uniform float sIntensity;",

		// scanlines effect count value (0 = no effect, 4096 = full effect)
		"uniform float sCount;",

		"uniform sampler2D tDiffuse;",

		"varying vec2 vUv;",

		"void main() {",

			// sample the source
			"vec4 cTextureScreen = texture2D( tDiffuse, vUv );",

			// make some noise
			"float dx = rand( vUv + time );",

			// add noise
			"vec3 cResult = cTextureScreen.rgb + cTextureScreen.rgb * clamp( 0.1 + dx, 0.0, 1.0 );",

			// get us a sine and cosine
			"vec2 sc = vec2( sin( vUv.y * sCount ), cos( vUv.y * sCount ) );",

			// add scanlines
			"cResult += cTextureScreen.rgb * vec3( sc.x, sc.y, sc.x ) * sIntensity;",

			// interpolate between source and result by intensity
			"cResult = cTextureScreen.rgb + clamp( nIntensity, 0.0,1.0 ) * ( cResult - cTextureScreen.rgb );",

			// convert to grayscale if desired
			"if( grayscale ) {",

				"cResult = vec3( cResult.r * 0.3 + cResult.g * 0.59 + cResult.b * 0.11 );",

			"}",

			"gl_FragColor =  vec4( cResult, cTextureScreen.a );",

		"}"

	].join( "\n" )

};
/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Focus shader
 * based on PaintEffect postprocess from ro.me
 * http://code.google.com/p/3-dreams-of-black/source/browse/deploy/js/effects/PaintEffect.js
 */

THREE.FocusShader = {

	uniforms : {

		"tDiffuse":       { value: null },
		"screenWidth":    { value: 1024 },
		"screenHeight":   { value: 1024 },
		"sampleDistance": { value: 0.94 },
		"waveFactor":     { value: 0.00125 }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join( "\n" ),

	fragmentShader: [

		"uniform float screenWidth;",
		"uniform float screenHeight;",
		"uniform float sampleDistance;",
		"uniform float waveFactor;",

		"uniform sampler2D tDiffuse;",

		"varying vec2 vUv;",

		"void main() {",

			"vec4 color, org, tmp, add;",
			"float sample_dist, f;",
			"vec2 vin;",
			"vec2 uv = vUv;",

			"add = color = org = texture2D( tDiffuse, uv );",

			"vin = ( uv - vec2( 0.5 ) ) * vec2( 1.4 );",
			"sample_dist = dot( vin, vin ) * 2.0;",

			"f = ( waveFactor * 100.0 + sample_dist ) * sampleDistance * 4.0;",

			"vec2 sampleSize = vec2(  1.0 / screenWidth, 1.0 / screenHeight ) * vec2( f );",

			"add += tmp = texture2D( tDiffuse, uv + vec2( 0.111964, 0.993712 ) * sampleSize );",
			"if( tmp.b < color.b ) color = tmp;",

			"add += tmp = texture2D( tDiffuse, uv + vec2( 0.846724, 0.532032 ) * sampleSize );",
			"if( tmp.b < color.b ) color = tmp;",

			"add += tmp = texture2D( tDiffuse, uv + vec2( 0.943883, -0.330279 ) * sampleSize );",
			"if( tmp.b < color.b ) color = tmp;",

			"add += tmp = texture2D( tDiffuse, uv + vec2( 0.330279, -0.943883 ) * sampleSize );",
			"if( tmp.b < color.b ) color = tmp;",

			"add += tmp = texture2D( tDiffuse, uv + vec2( -0.532032, -0.846724 ) * sampleSize );",
			"if( tmp.b < color.b ) color = tmp;",

			"add += tmp = texture2D( tDiffuse, uv + vec2( -0.993712, -0.111964 ) * sampleSize );",
			"if( tmp.b < color.b ) color = tmp;",

			"add += tmp = texture2D( tDiffuse, uv + vec2( -0.707107, 0.707107 ) * sampleSize );",
			"if( tmp.b < color.b ) color = tmp;",

			"color = color * vec4( 2.0 ) - ( add / vec4( 8.0 ) );",
			"color = color + ( add / vec4( 8.0 ) - color ) * ( vec4( 1.0 ) - vec4( sample_dist * 0.5 ) );",

			"gl_FragColor = vec4( color.rgb * color.rgb * vec3( 0.95 ) + color.rgb, 1.0 );",

		"}"


	].join( "\n" )
};
/**
 * @author zz85 / https://github.com/zz85 | https://www.lab4games.net/zz85/blog
 *
 * Edge Detection Shader using Frei-Chen filter
 * Based on http://rastergrid.com/blog/2011/01/frei-chen-edge-detector
 *
 * aspect: vec2 of (1/width, 1/height)
 */

THREE.FreiChenShader = {

	uniforms: {

		"tDiffuse": { value: null },
		"aspect":    { value: new THREE.Vector2( 512, 512 ) }
	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join( "\n" ),

	fragmentShader: [

		"uniform sampler2D tDiffuse;",
		"varying vec2 vUv;",

		"uniform vec2 aspect;",

		"vec2 texel = vec2(1.0 / aspect.x, 1.0 / aspect.y);",


		"mat3 G[9];",

		// hard coded matrix values!!!! as suggested in https://github.com/neilmendoza/ofxPostProcessing/blob/master/src/EdgePass.cpp#L45

		"const mat3 g0 = mat3( 0.3535533845424652, 0, -0.3535533845424652, 0.5, 0, -0.5, 0.3535533845424652, 0, -0.3535533845424652 );",
		"const mat3 g1 = mat3( 0.3535533845424652, 0.5, 0.3535533845424652, 0, 0, 0, -0.3535533845424652, -0.5, -0.3535533845424652 );",
		"const mat3 g2 = mat3( 0, 0.3535533845424652, -0.5, -0.3535533845424652, 0, 0.3535533845424652, 0.5, -0.3535533845424652, 0 );",
		"const mat3 g3 = mat3( 0.5, -0.3535533845424652, 0, -0.3535533845424652, 0, 0.3535533845424652, 0, 0.3535533845424652, -0.5 );",
		"const mat3 g4 = mat3( 0, -0.5, 0, 0.5, 0, 0.5, 0, -0.5, 0 );",
		"const mat3 g5 = mat3( -0.5, 0, 0.5, 0, 0, 0, 0.5, 0, -0.5 );",
		"const mat3 g6 = mat3( 0.1666666716337204, -0.3333333432674408, 0.1666666716337204, -0.3333333432674408, 0.6666666865348816, -0.3333333432674408, 0.1666666716337204, -0.3333333432674408, 0.1666666716337204 );",
		"const mat3 g7 = mat3( -0.3333333432674408, 0.1666666716337204, -0.3333333432674408, 0.1666666716337204, 0.6666666865348816, 0.1666666716337204, -0.3333333432674408, 0.1666666716337204, -0.3333333432674408 );",
		"const mat3 g8 = mat3( 0.3333333432674408, 0.3333333432674408, 0.3333333432674408, 0.3333333432674408, 0.3333333432674408, 0.3333333432674408, 0.3333333432674408, 0.3333333432674408, 0.3333333432674408 );",

		"void main(void)",
		"{",

			"G[0] = g0,",
			"G[1] = g1,",
			"G[2] = g2,",
			"G[3] = g3,",
			"G[4] = g4,",
			"G[5] = g5,",
			"G[6] = g6,",
			"G[7] = g7,",
			"G[8] = g8;",

			"mat3 I;",
			"float cnv[9];",
			"vec3 sample;",

			/* fetch the 3x3 neighbourhood and use the RGB vector's length as intensity value */
			"for (float i=0.0; i<3.0; i++) {",
				"for (float j=0.0; j<3.0; j++) {",
					"sample = texture2D(tDiffuse, vUv + texel * vec2(i-1.0,j-1.0) ).rgb;",
					"I[int(i)][int(j)] = length(sample);",
				"}",
			"}",

			/* calculate the convolution values for all the masks */
			"for (int i=0; i<9; i++) {",
				"float dp3 = dot(G[i][0], I[0]) + dot(G[i][1], I[1]) + dot(G[i][2], I[2]);",
				"cnv[i] = dp3 * dp3;",
			"}",

			"float M = (cnv[0] + cnv[1]) + (cnv[2] + cnv[3]);",
			"float S = (cnv[4] + cnv[5]) + (cnv[6] + cnv[7]) + (cnv[8] + M);",

			"gl_FragColor = vec4(vec3(sqrt(M/S)), 1.0);",
		"}"

	].join( "\n" )
};
/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Based on Nvidia Cg tutorial
 */

THREE.FresnelShader = {

	uniforms: {

		"mRefractionRatio": { value: 1.02 },
		"mFresnelBias": { value: 0.1 },
		"mFresnelPower": { value: 2.0 },
		"mFresnelScale": { value: 1.0 },
		"tCube": { value: null }

	},

	vertexShader: [

		"uniform float mRefractionRatio;",
		"uniform float mFresnelBias;",
		"uniform float mFresnelScale;",
		"uniform float mFresnelPower;",

		"varying vec3 vReflect;",
		"varying vec3 vRefract[3];",
		"varying float vReflectionFactor;",

		"void main() {",

			"vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",
			"vec4 worldPosition = modelMatrix * vec4( position, 1.0 );",

			"vec3 worldNormal = normalize( mat3( modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz ) * normal );",

			"vec3 I = worldPosition.xyz - cameraPosition;",

			"vReflect = reflect( I, worldNormal );",
			"vRefract[0] = refract( normalize( I ), worldNormal, mRefractionRatio );",
			"vRefract[1] = refract( normalize( I ), worldNormal, mRefractionRatio * 0.99 );",
			"vRefract[2] = refract( normalize( I ), worldNormal, mRefractionRatio * 0.98 );",
			"vReflectionFactor = mFresnelBias + mFresnelScale * pow( 1.0 + dot( normalize( I ), worldNormal ), mFresnelPower );",

			"gl_Position = projectionMatrix * mvPosition;",

		"}"

	].join( "\n" ),

	fragmentShader: [

		"uniform samplerCube tCube;",

		"varying vec3 vReflect;",
		"varying vec3 vRefract[3];",
		"varying float vReflectionFactor;",

		"void main() {",

			"vec4 reflectedColor = textureCube( tCube, vec3( -vReflect.x, vReflect.yz ) );",
			"vec4 refractedColor = vec4( 1.0 );",

			"refractedColor.r = textureCube( tCube, vec3( -vRefract[0].x, vRefract[0].yz ) ).r;",
			"refractedColor.g = textureCube( tCube, vec3( -vRefract[1].x, vRefract[1].yz ) ).g;",
			"refractedColor.b = textureCube( tCube, vec3( -vRefract[2].x, vRefract[2].yz ) ).b;",

			"gl_FragColor = mix( refractedColor, reflectedColor, clamp( vReflectionFactor, 0.0, 1.0 ) );",

		"}"

	].join( "\n" )

};
/**
 * @author alteredq / http://alteredqualia.com/
 * @author davidedc / http://www.sketchpatch.net/
 *
 * NVIDIA FXAA by Timothy Lottes
 * http://timothylottes.blogspot.com/2011/06/fxaa3-source-released.html
 * - WebGL port by @supereggbert
 * http://www.glge.org/demos/fxaa/
 */

THREE.FXAAShader = {

	uniforms: {

		"tDiffuse":   { value: null },
		"resolution": { value: new THREE.Vector2( 1 / 1024, 1 / 512 ) }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join( "\n" ),

	fragmentShader: [
        "precision highp float;",
        "",
        "uniform sampler2D tDiffuse;",
        "",
        "uniform vec2 resolution;",
        "",
        "varying vec2 vUv;",
        "",
        "// FXAA 3.11 implementation by NVIDIA, ported to WebGL by Agost Biro (biro@archilogic.com)",
        "",
        "//----------------------------------------------------------------------------------",
        "// File:        es3-kepler\FXAA\assets\shaders/FXAA_DefaultES.frag",
        "// SDK Version: v3.00",
        "// Email:       gameworks@nvidia.com",
        "// Site:        http://developer.nvidia.com/",
        "//",
        "// Copyright (c) 2014-2015, NVIDIA CORPORATION. All rights reserved.",
        "//",
        "// Redistribution and use in source and binary forms, with or without",
        "// modification, are permitted provided that the following conditions",
        "// are met:",
        "//  * Redistributions of source code must retain the above copyright",
        "//    notice, this list of conditions and the following disclaimer.",
        "//  * Redistributions in binary form must reproduce the above copyright",
        "//    notice, this list of conditions and the following disclaimer in the",
        "//    documentation and/or other materials provided with the distribution.",
        "//  * Neither the name of NVIDIA CORPORATION nor the names of its",
        "//    contributors may be used to endorse or promote products derived",
        "//    from this software without specific prior written permission.",
        "//",
        "// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS ``AS IS'' AND ANY",
        "// EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE",
        "// IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR",
        "// PURPOSE ARE DISCLAIMED.  IN NO EVENT SHALL THE COPYRIGHT OWNER OR",
        "// CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,",
        "// EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,",
        "// PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR",
        "// PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY",
        "// OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT",
        "// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE",
        "// OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.",
        "//",
        "//----------------------------------------------------------------------------------",
        "",
        "#define FXAA_PC 1",
        "#define FXAA_GLSL_100 1",
        "#define FXAA_QUALITY_PRESET 12",
        "",
        "#define FXAA_GREEN_AS_LUMA 1",
        "",
        "/*--------------------------------------------------------------------------*/",
        "#ifndef FXAA_PC_CONSOLE",
        "    //",
        "    // The console algorithm for PC is included",
        "    // for developers targeting really low spec machines.",
        "    // Likely better to just run FXAA_PC, and use a really low preset.",
        "    //",
        "    #define FXAA_PC_CONSOLE 0",
        "#endif",
        "/*--------------------------------------------------------------------------*/",
        "#ifndef FXAA_GLSL_120",
        "    #define FXAA_GLSL_120 0",
        "#endif",
        "/*--------------------------------------------------------------------------*/",
        "#ifndef FXAA_GLSL_130",
        "    #define FXAA_GLSL_130 0",
        "#endif",
        "/*--------------------------------------------------------------------------*/",
        "#ifndef FXAA_HLSL_3",
        "    #define FXAA_HLSL_3 0",
        "#endif",
        "/*--------------------------------------------------------------------------*/",
        "#ifndef FXAA_HLSL_4",
        "    #define FXAA_HLSL_4 0",
        "#endif",
        "/*--------------------------------------------------------------------------*/",
        "#ifndef FXAA_HLSL_5",
        "    #define FXAA_HLSL_5 0",
        "#endif",
        "/*==========================================================================*/",
        "#ifndef FXAA_GREEN_AS_LUMA",
        "    //",
        "    // For those using non-linear color,",
        "    // and either not able to get luma in alpha, or not wanting to,",
        "    // this enables FXAA to run using green as a proxy for luma.",
        "    // So with this enabled, no need to pack luma in alpha.",
        "    //",
        "    // This will turn off AA on anything which lacks some amount of green.",
        "    // Pure red and blue or combination of only R and B, will get no AA.",
        "    //",
        "    // Might want to lower the settings for both,",
        "    //    fxaaConsoleEdgeThresholdMin",
        "    //    fxaaQualityEdgeThresholdMin",
        "    // In order to insure AA does not get turned off on colors",
        "    // which contain a minor amount of green.",
        "    //",
        "    // 1 = On.",
        "    // 0 = Off.",
        "    //",
        "    #define FXAA_GREEN_AS_LUMA 0",
        "#endif",
        "/*--------------------------------------------------------------------------*/",
        "#ifndef FXAA_EARLY_EXIT",
        "    //",
        "    // Controls algorithm's early exit path.",
        "    // On PS3 turning this ON adds 2 cycles to the shader.",
        "    // On 360 turning this OFF adds 10ths of a millisecond to the shader.",
        "    // Turning this off on console will result in a more blurry image.",
        "    // So this defaults to on.",
        "    //",
        "    // 1 = On.",
        "    // 0 = Off.",
        "    //",
        "    #define FXAA_EARLY_EXIT 1",
        "#endif",
        "/*--------------------------------------------------------------------------*/",
        "#ifndef FXAA_DISCARD",
        "    //",
        "    // Only valid for PC OpenGL currently.",
        "    // Probably will not work when FXAA_GREEN_AS_LUMA = 1.",
        "    //",
        "    // 1 = Use discard on pixels which don't need AA.",
        "    //     For APIs which enable concurrent TEX+ROP from same surface.",
        "    // 0 = Return unchanged color on pixels which don't need AA.",
        "    //",
        "    #define FXAA_DISCARD 0",
        "#endif",
        "/*--------------------------------------------------------------------------*/",
        "#ifndef FXAA_FAST_PIXEL_OFFSET",
        "    //",
        "    // Used for GLSL 120 only.",
        "    //",
        "    // 1 = GL API supports fast pixel offsets",
        "    // 0 = do not use fast pixel offsets",
        "    //",
        "    #ifdef GL_EXT_gpu_shader4",
        "        #define FXAA_FAST_PIXEL_OFFSET 1",
        "    #endif",
        "    #ifdef GL_NV_gpu_shader5",
        "        #define FXAA_FAST_PIXEL_OFFSET 1",
        "    #endif",
        "    #ifdef GL_ARB_gpu_shader5",
        "        #define FXAA_FAST_PIXEL_OFFSET 1",
        "    #endif",
        "    #ifndef FXAA_FAST_PIXEL_OFFSET",
        "        #define FXAA_FAST_PIXEL_OFFSET 0",
        "    #endif",
        "#endif",
        "/*--------------------------------------------------------------------------*/",
        "#ifndef FXAA_GATHER4_ALPHA",
        "    //",
        "    // 1 = API supports gather4 on alpha channel.",
        "    // 0 = API does not support gather4 on alpha channel.",
        "    //",
        "    #if (FXAA_HLSL_5 == 1)",
        "        #define FXAA_GATHER4_ALPHA 1",
        "    #endif",
        "    #ifdef GL_ARB_gpu_shader5",
        "        #define FXAA_GATHER4_ALPHA 1",
        "    #endif",
        "    #ifdef GL_NV_gpu_shader5",
        "        #define FXAA_GATHER4_ALPHA 1",
        "    #endif",
        "    #ifndef FXAA_GATHER4_ALPHA",
        "        #define FXAA_GATHER4_ALPHA 0",
        "    #endif",
        "#endif",
        "",
        "",
        "/*============================================================================",
        "                        FXAA QUALITY - TUNING KNOBS",
        "------------------------------------------------------------------------------",
        "NOTE the other tuning knobs are now in the shader function inputs!",
        "============================================================================*/",
        "#ifndef FXAA_QUALITY_PRESET",
        "    //",
        "    // Choose the quality preset.",
        "    // This needs to be compiled into the shader as it effects code.",
        "    // Best option to include multiple presets is to",
        "    // in each shader define the preset, then include this file.",
        "    //",
        "    // OPTIONS",
        "    // -----------------------------------------------------------------------",
        "    // 10 to 15 - default medium dither (10=fastest, 15=highest quality)",
        "    // 20 to 29 - less dither, more expensive (20=fastest, 29=highest quality)",
        "    // 39       - no dither, very expensive",
        "    //",
        "    // NOTES",
        "    // -----------------------------------------------------------------------",
        "    // 12 = slightly faster then FXAA 3.9 and higher edge quality (default)",
        "    // 13 = about same speed as FXAA 3.9 and better than 12",
        "    // 23 = closest to FXAA 3.9 visually and performance wise",
        "    //  _ = the lowest digit is directly related to performance",
        "    // _  = the highest digit is directly related to style",
        "    //",
        "    #define FXAA_QUALITY_PRESET 12",
        "#endif",
        "",
        "",
        "/*============================================================================",
        "",
        "                           FXAA QUALITY - PRESETS",
        "",
        "============================================================================*/",
        "",
        "/*============================================================================",
        "                     FXAA QUALITY - MEDIUM DITHER PRESETS",
        "============================================================================*/",
        "#if (FXAA_QUALITY_PRESET == 10)",
        "    #define FXAA_QUALITY_PS 3",
        "    #define FXAA_QUALITY_P0 1.5",
        "    #define FXAA_QUALITY_P1 3.0",
        "    #define FXAA_QUALITY_P2 12.0",
        "#endif",
        "/*--------------------------------------------------------------------------*/",
        "#if (FXAA_QUALITY_PRESET == 11)",
        "    #define FXAA_QUALITY_PS 4",
        "    #define FXAA_QUALITY_P0 1.0",
        "    #define FXAA_QUALITY_P1 1.5",
        "    #define FXAA_QUALITY_P2 3.0",
        "    #define FXAA_QUALITY_P3 12.0",
        "#endif",
        "/*--------------------------------------------------------------------------*/",
        "#if (FXAA_QUALITY_PRESET == 12)",
        "    #define FXAA_QUALITY_PS 5",
        "    #define FXAA_QUALITY_P0 1.0",
        "    #define FXAA_QUALITY_P1 1.5",
        "    #define FXAA_QUALITY_P2 2.0",
        "    #define FXAA_QUALITY_P3 4.0",
        "    #define FXAA_QUALITY_P4 12.0",
        "#endif",
        "/*--------------------------------------------------------------------------*/",
        "#if (FXAA_QUALITY_PRESET == 13)",
        "    #define FXAA_QUALITY_PS 6",
        "    #define FXAA_QUALITY_P0 1.0",
        "    #define FXAA_QUALITY_P1 1.5",
        "    #define FXAA_QUALITY_P2 2.0",
        "    #define FXAA_QUALITY_P3 2.0",
        "    #define FXAA_QUALITY_P4 4.0",
        "    #define FXAA_QUALITY_P5 12.0",
        "#endif",
        "/*--------------------------------------------------------------------------*/",
        "#if (FXAA_QUALITY_PRESET == 14)",
        "    #define FXAA_QUALITY_PS 7",
        "    #define FXAA_QUALITY_P0 1.0",
        "    #define FXAA_QUALITY_P1 1.5",
        "    #define FXAA_QUALITY_P2 2.0",
        "    #define FXAA_QUALITY_P3 2.0",
        "    #define FXAA_QUALITY_P4 2.0",
        "    #define FXAA_QUALITY_P5 4.0",
        "    #define FXAA_QUALITY_P6 12.0",
        "#endif",
        "/*--------------------------------------------------------------------------*/",
        "#if (FXAA_QUALITY_PRESET == 15)",
        "    #define FXAA_QUALITY_PS 8",
        "    #define FXAA_QUALITY_P0 1.0",
        "    #define FXAA_QUALITY_P1 1.5",
        "    #define FXAA_QUALITY_P2 2.0",
        "    #define FXAA_QUALITY_P3 2.0",
        "    #define FXAA_QUALITY_P4 2.0",
        "    #define FXAA_QUALITY_P5 2.0",
        "    #define FXAA_QUALITY_P6 4.0",
        "    #define FXAA_QUALITY_P7 12.0",
        "#endif",
        "",
        "/*============================================================================",
        "                     FXAA QUALITY - LOW DITHER PRESETS",
        "============================================================================*/",
        "#if (FXAA_QUALITY_PRESET == 20)",
        "    #define FXAA_QUALITY_PS 3",
        "    #define FXAA_QUALITY_P0 1.5",
        "    #define FXAA_QUALITY_P1 2.0",
        "    #define FXAA_QUALITY_P2 8.0",
        "#endif",
        "/*--------------------------------------------------------------------------*/",
        "#if (FXAA_QUALITY_PRESET == 21)",
        "    #define FXAA_QUALITY_PS 4",
        "    #define FXAA_QUALITY_P0 1.0",
        "    #define FXAA_QUALITY_P1 1.5",
        "    #define FXAA_QUALITY_P2 2.0",
        "    #define FXAA_QUALITY_P3 8.0",
        "#endif",
        "/*--------------------------------------------------------------------------*/",
        "#if (FXAA_QUALITY_PRESET == 22)",
        "    #define FXAA_QUALITY_PS 5",
        "    #define FXAA_QUALITY_P0 1.0",
        "    #define FXAA_QUALITY_P1 1.5",
        "    #define FXAA_QUALITY_P2 2.0",
        "    #define FXAA_QUALITY_P3 2.0",
        "    #define FXAA_QUALITY_P4 8.0",
        "#endif",
        "/*--------------------------------------------------------------------------*/",
        "#if (FXAA_QUALITY_PRESET == 23)",
        "    #define FXAA_QUALITY_PS 6",
        "    #define FXAA_QUALITY_P0 1.0",
        "    #define FXAA_QUALITY_P1 1.5",
        "    #define FXAA_QUALITY_P2 2.0",
        "    #define FXAA_QUALITY_P3 2.0",
        "    #define FXAA_QUALITY_P4 2.0",
        "    #define FXAA_QUALITY_P5 8.0",
        "#endif",
        "/*--------------------------------------------------------------------------*/",
        "#if (FXAA_QUALITY_PRESET == 24)",
        "    #define FXAA_QUALITY_PS 7",
        "    #define FXAA_QUALITY_P0 1.0",
        "    #define FXAA_QUALITY_P1 1.5",
        "    #define FXAA_QUALITY_P2 2.0",
        "    #define FXAA_QUALITY_P3 2.0",
        "    #define FXAA_QUALITY_P4 2.0",
        "    #define FXAA_QUALITY_P5 3.0",
        "    #define FXAA_QUALITY_P6 8.0",
        "#endif",
        "/*--------------------------------------------------------------------------*/",
        "#if (FXAA_QUALITY_PRESET == 25)",
        "    #define FXAA_QUALITY_PS 8",
        "    #define FXAA_QUALITY_P0 1.0",
        "    #define FXAA_QUALITY_P1 1.5",
        "    #define FXAA_QUALITY_P2 2.0",
        "    #define FXAA_QUALITY_P3 2.0",
        "    #define FXAA_QUALITY_P4 2.0",
        "    #define FXAA_QUALITY_P5 2.0",
        "    #define FXAA_QUALITY_P6 4.0",
        "    #define FXAA_QUALITY_P7 8.0",
        "#endif",
        "/*--------------------------------------------------------------------------*/",
        "#if (FXAA_QUALITY_PRESET == 26)",
        "    #define FXAA_QUALITY_PS 9",
        "    #define FXAA_QUALITY_P0 1.0",
        "    #define FXAA_QUALITY_P1 1.5",
        "    #define FXAA_QUALITY_P2 2.0",
        "    #define FXAA_QUALITY_P3 2.0",
        "    #define FXAA_QUALITY_P4 2.0",
        "    #define FXAA_QUALITY_P5 2.0",
        "    #define FXAA_QUALITY_P6 2.0",
        "    #define FXAA_QUALITY_P7 4.0",
        "    #define FXAA_QUALITY_P8 8.0",
        "#endif",
        "/*--------------------------------------------------------------------------*/",
        "#if (FXAA_QUALITY_PRESET == 27)",
        "    #define FXAA_QUALITY_PS 10",
        "    #define FXAA_QUALITY_P0 1.0",
        "    #define FXAA_QUALITY_P1 1.5",
        "    #define FXAA_QUALITY_P2 2.0",
        "    #define FXAA_QUALITY_P3 2.0",
        "    #define FXAA_QUALITY_P4 2.0",
        "    #define FXAA_QUALITY_P5 2.0",
        "    #define FXAA_QUALITY_P6 2.0",
        "    #define FXAA_QUALITY_P7 2.0",
        "    #define FXAA_QUALITY_P8 4.0",
        "    #define FXAA_QUALITY_P9 8.0",
        "#endif",
        "/*--------------------------------------------------------------------------*/",
        "#if (FXAA_QUALITY_PRESET == 28)",
        "    #define FXAA_QUALITY_PS 11",
        "    #define FXAA_QUALITY_P0 1.0",
        "    #define FXAA_QUALITY_P1 1.5",
        "    #define FXAA_QUALITY_P2 2.0",
        "    #define FXAA_QUALITY_P3 2.0",
        "    #define FXAA_QUALITY_P4 2.0",
        "    #define FXAA_QUALITY_P5 2.0",
        "    #define FXAA_QUALITY_P6 2.0",
        "    #define FXAA_QUALITY_P7 2.0",
        "    #define FXAA_QUALITY_P8 2.0",
        "    #define FXAA_QUALITY_P9 4.0",
        "    #define FXAA_QUALITY_P10 8.0",
        "#endif",
        "/*--------------------------------------------------------------------------*/",
        "#if (FXAA_QUALITY_PRESET == 29)",
        "    #define FXAA_QUALITY_PS 12",
        "    #define FXAA_QUALITY_P0 1.0",
        "    #define FXAA_QUALITY_P1 1.5",
        "    #define FXAA_QUALITY_P2 2.0",
        "    #define FXAA_QUALITY_P3 2.0",
        "    #define FXAA_QUALITY_P4 2.0",
        "    #define FXAA_QUALITY_P5 2.0",
        "    #define FXAA_QUALITY_P6 2.0",
        "    #define FXAA_QUALITY_P7 2.0",
        "    #define FXAA_QUALITY_P8 2.0",
        "    #define FXAA_QUALITY_P9 2.0",
        "    #define FXAA_QUALITY_P10 4.0",
        "    #define FXAA_QUALITY_P11 8.0",
        "#endif",
        "",
        "/*============================================================================",
        "                     FXAA QUALITY - EXTREME QUALITY",
        "============================================================================*/",
        "#if (FXAA_QUALITY_PRESET == 39)",
        "    #define FXAA_QUALITY_PS 12",
        "    #define FXAA_QUALITY_P0 1.0",
        "    #define FXAA_QUALITY_P1 1.0",
        "    #define FXAA_QUALITY_P2 1.0",
        "    #define FXAA_QUALITY_P3 1.0",
        "    #define FXAA_QUALITY_P4 1.0",
        "    #define FXAA_QUALITY_P5 1.5",
        "    #define FXAA_QUALITY_P6 2.0",
        "    #define FXAA_QUALITY_P7 2.0",
        "    #define FXAA_QUALITY_P8 2.0",
        "    #define FXAA_QUALITY_P9 2.0",
        "    #define FXAA_QUALITY_P10 4.0",
        "    #define FXAA_QUALITY_P11 8.0",
        "#endif",
        "",
        "",
        "",
        "/*============================================================================",
        "",
        "                                API PORTING",
        "",
        "============================================================================*/",
        "#if (FXAA_GLSL_100 == 1) || (FXAA_GLSL_120 == 1) || (FXAA_GLSL_130 == 1)",
        "    #define FxaaBool bool",
        "    #define FxaaDiscard discard",
        "    #define FxaaFloat float",
        "    #define FxaaFloat2 vec2",
        "    #define FxaaFloat3 vec3",
        "    #define FxaaFloat4 vec4",
        "    #define FxaaHalf float",
        "    #define FxaaHalf2 vec2",
        "    #define FxaaHalf3 vec3",
        "    #define FxaaHalf4 vec4",
        "    #define FxaaInt2 ivec2",
        "    #define FxaaSat(x) clamp(x, 0.0, 1.0)",
        "    #define FxaaTex sampler2D",
        "#else",
        "    #define FxaaBool bool",
        "    #define FxaaDiscard clip(-1)",
        "    #define FxaaFloat float",
        "    #define FxaaFloat2 float2",
        "    #define FxaaFloat3 float3",
        "    #define FxaaFloat4 float4",
        "    #define FxaaHalf half",
        "    #define FxaaHalf2 half2",
        "    #define FxaaHalf3 half3",
        "    #define FxaaHalf4 half4",
        "    #define FxaaSat(x) saturate(x)",
        "#endif",
        "/*--------------------------------------------------------------------------*/",
        "#if (FXAA_GLSL_100 == 1)",
        "  #define FxaaTexTop(t, p) texture2D(t, p, 0.0)",
        "  #define FxaaTexOff(t, p, o, r) texture2D(t, p + (o * r), 0.0)",
        "#endif",
        "/*--------------------------------------------------------------------------*/",
        "#if (FXAA_GLSL_120 == 1)",
        "    // Requires,",
        "    //  #version 120",
        "    // And at least,",
        "    //  #extension GL_EXT_gpu_shader4 : enable",
        "    //  (or set FXAA_FAST_PIXEL_OFFSET 1 to work like DX9)",
        "    #define FxaaTexTop(t, p) texture2DLod(t, p, 0.0)",
        "    #if (FXAA_FAST_PIXEL_OFFSET == 1)",
        "        #define FxaaTexOff(t, p, o, r) texture2DLodOffset(t, p, 0.0, o)",
        "    #else",
        "        #define FxaaTexOff(t, p, o, r) texture2DLod(t, p + (o * r), 0.0)",
        "    #endif",
        "    #if (FXAA_GATHER4_ALPHA == 1)",
        "        // use #extension GL_ARB_gpu_shader5 : enable",
        "        #define FxaaTexAlpha4(t, p) textureGather(t, p, 3)",
        "        #define FxaaTexOffAlpha4(t, p, o) textureGatherOffset(t, p, o, 3)",
        "        #define FxaaTexGreen4(t, p) textureGather(t, p, 1)",
        "        #define FxaaTexOffGreen4(t, p, o) textureGatherOffset(t, p, o, 1)",
        "    #endif",
        "#endif",
        "/*--------------------------------------------------------------------------*/",
        "#if (FXAA_GLSL_130 == 1)",
        "    // Requires \"#version 130\" or better",
        "    #define FxaaTexTop(t, p) textureLod(t, p, 0.0)",
        "    #define FxaaTexOff(t, p, o, r) textureLodOffset(t, p, 0.0, o)",
        "    #if (FXAA_GATHER4_ALPHA == 1)",
        "        // use #extension GL_ARB_gpu_shader5 : enable",
        "        #define FxaaTexAlpha4(t, p) textureGather(t, p, 3)",
        "        #define FxaaTexOffAlpha4(t, p, o) textureGatherOffset(t, p, o, 3)",
        "        #define FxaaTexGreen4(t, p) textureGather(t, p, 1)",
        "        #define FxaaTexOffGreen4(t, p, o) textureGatherOffset(t, p, o, 1)",
        "    #endif",
        "#endif",
        "/*--------------------------------------------------------------------------*/",
        "#if (FXAA_HLSL_3 == 1)",
        "    #define FxaaInt2 float2",
        "    #define FxaaTex sampler2D",
        "    #define FxaaTexTop(t, p) tex2Dlod(t, float4(p, 0.0, 0.0))",
        "    #define FxaaTexOff(t, p, o, r) tex2Dlod(t, float4(p + (o * r), 0, 0))",
        "#endif",
        "/*--------------------------------------------------------------------------*/",
        "#if (FXAA_HLSL_4 == 1)",
        "    #define FxaaInt2 int2",
        "    struct FxaaTex { SamplerState smpl; Texture2D tex; };",
        "    #define FxaaTexTop(t, p) t.tex.SampleLevel(t.smpl, p, 0.0)",
        "    #define FxaaTexOff(t, p, o, r) t.tex.SampleLevel(t.smpl, p, 0.0, o)",
        "#endif",
        "/*--------------------------------------------------------------------------*/",
        "#if (FXAA_HLSL_5 == 1)",
        "    #define FxaaInt2 int2",
        "    struct FxaaTex { SamplerState smpl; Texture2D tex; };",
        "    #define FxaaTexTop(t, p) t.tex.SampleLevel(t.smpl, p, 0.0)",
        "    #define FxaaTexOff(t, p, o, r) t.tex.SampleLevel(t.smpl, p, 0.0, o)",
        "    #define FxaaTexAlpha4(t, p) t.tex.GatherAlpha(t.smpl, p)",
        "    #define FxaaTexOffAlpha4(t, p, o) t.tex.GatherAlpha(t.smpl, p, o)",
        "    #define FxaaTexGreen4(t, p) t.tex.GatherGreen(t.smpl, p)",
        "    #define FxaaTexOffGreen4(t, p, o) t.tex.GatherGreen(t.smpl, p, o)",
        "#endif",
        "",
        "",
        "/*============================================================================",
        "                   GREEN AS LUMA OPTION SUPPORT FUNCTION",
        "============================================================================*/",
        "#if (FXAA_GREEN_AS_LUMA == 0)",
        "    FxaaFloat FxaaLuma(FxaaFloat4 rgba) { return rgba.w; }",
        "#else",
        "    FxaaFloat FxaaLuma(FxaaFloat4 rgba) { return rgba.y; }",
        "#endif",
        "",
        "",
        "",
        "",
        "/*============================================================================",
        "",
        "                             FXAA3 QUALITY - PC",
        "",
        "============================================================================*/",
        "#if (FXAA_PC == 1)",
        "/*--------------------------------------------------------------------------*/",
        "FxaaFloat4 FxaaPixelShader(",
        "    //",
        "    // Use noperspective interpolation here (turn off perspective interpolation).",
        "    // {xy} = center of pixel",
        "    FxaaFloat2 pos,",
        "    //",
        "    // Used only for FXAA Console, and not used on the 360 version.",
        "    // Use noperspective interpolation here (turn off perspective interpolation).",
        "    // {xy_} = upper left of pixel",
        "    // {_zw} = lower right of pixel",
        "    FxaaFloat4 fxaaConsolePosPos,",
        "    //",
        "    // Input color texture.",
        "    // {rgb_} = color in linear or perceptual color space",
        "    // if (FXAA_GREEN_AS_LUMA == 0)",
        "    //     {__a} = luma in perceptual color space (not linear)",
        "    FxaaTex tex,",
        "    //",
        "    // Only used on the optimized 360 version of FXAA Console.",
        "    // For everything but 360, just use the same input here as for \"tex\".",
        "    // For 360, same texture, just alias with a 2nd sampler.",
        "    // This sampler needs to have an exponent bias of -1.",
        "    FxaaTex fxaaConsole360TexExpBiasNegOne,",
        "    //",
        "    // Only used on the optimized 360 version of FXAA Console.",
        "    // For everything but 360, just use the same input here as for \"tex\".",
        "    // For 360, same texture, just alias with a 3nd sampler.",
        "    // This sampler needs to have an exponent bias of -2.",
        "    FxaaTex fxaaConsole360TexExpBiasNegTwo,",
        "    //",
        "    // Only used on FXAA Quality.",
        "    // This must be from a constant/uniform.",
        "    // {x_} = 1.0/screenWidthInPixels",
        "    // {_y} = 1.0/screenHeightInPixels",
        "    FxaaFloat2 fxaaQualityRcpFrame,",
        "    //",
        "    // Only used on FXAA Console.",
        "    // This must be from a constant/uniform.",
        "    // This effects sub-pixel AA quality and inversely sharpness.",
        "    //   Where N ranges between,",
        "    //     N = 0.50 (default)",
        "    //     N = 0.33 (sharper)",
        "    // {x__} = -N/screenWidthInPixels",
        "    // {_y_} = -N/screenHeightInPixels",
        "    // {_z_} =  N/screenWidthInPixels",
        "    // {__w} =  N/screenHeightInPixels",
        "    FxaaFloat4 fxaaConsoleRcpFrameOpt,",
        "    //",
        "    // Only used on FXAA Console.",
        "    // Not used on 360, but used on PS3 and PC.",
        "    // This must be from a constant/uniform.",
        "    // {x__} = -2.0/screenWidthInPixels",
        "    // {_y_} = -2.0/screenHeightInPixels",
        "    // {_z_} =  2.0/screenWidthInPixels",
        "    // {__w} =  2.0/screenHeightInPixels",
        "    FxaaFloat4 fxaaConsoleRcpFrameOpt2,",
        "    //",
        "    // Only used on FXAA Console.",
        "    // Only used on 360 in place of fxaaConsoleRcpFrameOpt2.",
        "    // This must be from a constant/uniform.",
        "    // {x__} =  8.0/screenWidthInPixels",
        "    // {_y_} =  8.0/screenHeightInPixels",
        "    // {_z_} = -4.0/screenWidthInPixels",
        "    // {__w} = -4.0/screenHeightInPixels",
        "    FxaaFloat4 fxaaConsole360RcpFrameOpt2,",
        "    //",
        "    // Only used on FXAA Quality.",
        "    // This used to be the FXAA_QUALITY_SUBPIX define.",
        "    // It is here now to allow easier tuning.",
        "    // Choose the amount of sub-pixel aliasing removal.",
        "    // This can effect sharpness.",
        "    //   1.00 - upper limit (softer)",
        "    //   0.75 - default amount of filtering",
        "    //   0.50 - lower limit (sharper, less sub-pixel aliasing removal)",
        "    //   0.25 - almost off",
        "    //   0.00 - completely off",
        "    FxaaFloat fxaaQualitySubpix,",
        "    //",
        "    // Only used on FXAA Quality.",
        "    // This used to be the FXAA_QUALITY_EDGE_THRESHOLD define.",
        "    // It is here now to allow easier tuning.",
        "    // The minimum amount of local contrast required to apply algorithm.",
        "    //   0.333 - too little (faster)",
        "    //   0.250 - low quality",
        "    //   0.166 - default",
        "    //   0.125 - high quality",
        "    //   0.063 - overkill (slower)",
        "    FxaaFloat fxaaQualityEdgeThreshold,",
        "    //",
        "    // Only used on FXAA Quality.",
        "    // This used to be the FXAA_QUALITY_EDGE_THRESHOLD_MIN define.",
        "    // It is here now to allow easier tuning.",
        "    // Trims the algorithm from processing darks.",
        "    //   0.0833 - upper limit (default, the start of visible unfiltered edges)",
        "    //   0.0625 - high quality (faster)",
        "    //   0.0312 - visible limit (slower)",
        "    // Special notes when using FXAA_GREEN_AS_LUMA,",
        "    //   Likely want to set this to zero.",
        "    //   As colors that are mostly not-green",
        "    //   will appear very dark in the green channel!",
        "    //   Tune by looking at mostly non-green content,",
        "    //   then start at zero and increase until aliasing is a problem.",
        "    FxaaFloat fxaaQualityEdgeThresholdMin,",
        "    //",
        "    // Only used on FXAA Console.",
        "    // This used to be the FXAA_CONSOLE_EDGE_SHARPNESS define.",
        "    // It is here now to allow easier tuning.",
        "    // This does not effect PS3, as this needs to be compiled in.",
        "    //   Use FXAA_CONSOLE_PS3_EDGE_SHARPNESS for PS3.",
        "    //   Due to the PS3 being ALU bound,",
        "    //   there are only three safe values here: 2 and 4 and 8.",
        "    //   These options use the shaders ability to a free *|/ by 2|4|8.",
        "    // For all other platforms can be a non-power of two.",
        "    //   8.0 is sharper (default!!!)",
        "    //   4.0 is softer",
        "    //   2.0 is really soft (good only for vector graphics inputs)",
        "    FxaaFloat fxaaConsoleEdgeSharpness,",
        "    //",
        "    // Only used on FXAA Console.",
        "    // This used to be the FXAA_CONSOLE_EDGE_THRESHOLD define.",
        "    // It is here now to allow easier tuning.",
        "    // This does not effect PS3, as this needs to be compiled in.",
        "    //   Use FXAA_CONSOLE_PS3_EDGE_THRESHOLD for PS3.",
        "    //   Due to the PS3 being ALU bound,",
        "    //   there are only two safe values here: 1/4 and 1/8.",
        "    //   These options use the shaders ability to a free *|/ by 2|4|8.",
        "    // The console setting has a different mapping than the quality setting.",
        "    // Other platforms can use other values.",
        "    //   0.125 leaves less aliasing, but is softer (default!!!)",
        "    //   0.25 leaves more aliasing, and is sharper",
        "    FxaaFloat fxaaConsoleEdgeThreshold,",
        "    //",
        "    // Only used on FXAA Console.",
        "    // This used to be the FXAA_CONSOLE_EDGE_THRESHOLD_MIN define.",
        "    // It is here now to allow easier tuning.",
        "    // Trims the algorithm from processing darks.",
        "    // The console setting has a different mapping than the quality setting.",
        "    // This only applies when FXAA_EARLY_EXIT is 1.",
        "    // This does not apply to PS3,",
        "    // PS3 was simplified to avoid more shader instructions.",
        "    //   0.06 - faster but more aliasing in darks",
        "    //   0.05 - default",
        "    //   0.04 - slower and less aliasing in darks",
        "    // Special notes when using FXAA_GREEN_AS_LUMA,",
        "    //   Likely want to set this to zero.",
        "    //   As colors that are mostly not-green",
        "    //   will appear very dark in the green channel!",
        "    //   Tune by looking at mostly non-green content,",
        "    //   then start at zero and increase until aliasing is a problem.",
        "    FxaaFloat fxaaConsoleEdgeThresholdMin,",
        "    //",
        "    // Extra constants for 360 FXAA Console only.",
        "    // Use zeros or anything else for other platforms.",
        "    // These must be in physical constant registers and NOT immediates.",
        "    // Immediates will result in compiler un-optimizing.",
        "    // {xyzw} = float4(1.0, -1.0, 0.25, -0.25)",
        "    FxaaFloat4 fxaaConsole360ConstDir",
        ") {",
        "/*--------------------------------------------------------------------------*/",
        "    FxaaFloat2 posM;",
        "    posM.x = pos.x;",
        "    posM.y = pos.y;",
        "    #if (FXAA_GATHER4_ALPHA == 1)",
        "        #if (FXAA_DISCARD == 0)",
        "            FxaaFloat4 rgbyM = FxaaTexTop(tex, posM);",
        "            #if (FXAA_GREEN_AS_LUMA == 0)",
        "                #define lumaM rgbyM.w",
        "            #else",
        "                #define lumaM rgbyM.y",
        "            #endif",
        "        #endif",
        "        #if (FXAA_GREEN_AS_LUMA == 0)",
        "            FxaaFloat4 luma4A = FxaaTexAlpha4(tex, posM);",
        "            FxaaFloat4 luma4B = FxaaTexOffAlpha4(tex, posM, FxaaInt2(-1, -1));",
        "        #else",
        "            FxaaFloat4 luma4A = FxaaTexGreen4(tex, posM);",
        "            FxaaFloat4 luma4B = FxaaTexOffGreen4(tex, posM, FxaaInt2(-1, -1));",
        "        #endif",
        "        #if (FXAA_DISCARD == 1)",
        "            #define lumaM luma4A.w",
        "        #endif",
        "        #define lumaE luma4A.z",
        "        #define lumaS luma4A.x",
        "        #define lumaSE luma4A.y",
        "        #define lumaNW luma4B.w",
        "        #define lumaN luma4B.z",
        "        #define lumaW luma4B.x",
        "    #else",
        "        FxaaFloat4 rgbyM = FxaaTexTop(tex, posM);",
        "        #if (FXAA_GREEN_AS_LUMA == 0)",
        "            #define lumaM rgbyM.w",
        "        #else",
        "            #define lumaM rgbyM.y",
        "        #endif",
        "        #if (FXAA_GLSL_100 == 1)",
        "          FxaaFloat lumaS = FxaaLuma(FxaaTexOff(tex, posM, FxaaFloat2( 0.0, 1.0), fxaaQualityRcpFrame.xy));",
        "          FxaaFloat lumaE = FxaaLuma(FxaaTexOff(tex, posM, FxaaFloat2( 1.0, 0.0), fxaaQualityRcpFrame.xy));",
        "          FxaaFloat lumaN = FxaaLuma(FxaaTexOff(tex, posM, FxaaFloat2( 0.0,-1.0), fxaaQualityRcpFrame.xy));",
        "          FxaaFloat lumaW = FxaaLuma(FxaaTexOff(tex, posM, FxaaFloat2(-1.0, 0.0), fxaaQualityRcpFrame.xy));",
        "        #else",
        "          FxaaFloat lumaS = FxaaLuma(FxaaTexOff(tex, posM, FxaaInt2( 0, 1), fxaaQualityRcpFrame.xy));",
        "          FxaaFloat lumaE = FxaaLuma(FxaaTexOff(tex, posM, FxaaInt2( 1, 0), fxaaQualityRcpFrame.xy));",
        "          FxaaFloat lumaN = FxaaLuma(FxaaTexOff(tex, posM, FxaaInt2( 0,-1), fxaaQualityRcpFrame.xy));",
        "          FxaaFloat lumaW = FxaaLuma(FxaaTexOff(tex, posM, FxaaInt2(-1, 0), fxaaQualityRcpFrame.xy));",
        "        #endif",
        "    #endif",
        "/*--------------------------------------------------------------------------*/",
        "    FxaaFloat maxSM = max(lumaS, lumaM);",
        "    FxaaFloat minSM = min(lumaS, lumaM);",
        "    FxaaFloat maxESM = max(lumaE, maxSM);",
        "    FxaaFloat minESM = min(lumaE, minSM);",
        "    FxaaFloat maxWN = max(lumaN, lumaW);",
        "    FxaaFloat minWN = min(lumaN, lumaW);",
        "    FxaaFloat rangeMax = max(maxWN, maxESM);",
        "    FxaaFloat rangeMin = min(minWN, minESM);",
        "    FxaaFloat rangeMaxScaled = rangeMax * fxaaQualityEdgeThreshold;",
        "    FxaaFloat range = rangeMax - rangeMin;",
        "    FxaaFloat rangeMaxClamped = max(fxaaQualityEdgeThresholdMin, rangeMaxScaled);",
        "    FxaaBool earlyExit = range < rangeMaxClamped;",
        "/*--------------------------------------------------------------------------*/",
        "    if(earlyExit)",
        "        #if (FXAA_DISCARD == 1)",
        "            FxaaDiscard;",
        "        #else",
        "            return rgbyM;",
        "        #endif",
        "/*--------------------------------------------------------------------------*/",
        "    #if (FXAA_GATHER4_ALPHA == 0)",
        "        #if (FXAA_GLSL_100 == 1)",
        "          FxaaFloat lumaNW = FxaaLuma(FxaaTexOff(tex, posM, FxaaFloat2(-1.0,-1.0), fxaaQualityRcpFrame.xy));",
        "          FxaaFloat lumaSE = FxaaLuma(FxaaTexOff(tex, posM, FxaaFloat2( 1.0, 1.0), fxaaQualityRcpFrame.xy));",
        "          FxaaFloat lumaNE = FxaaLuma(FxaaTexOff(tex, posM, FxaaFloat2( 1.0,-1.0), fxaaQualityRcpFrame.xy));",
        "          FxaaFloat lumaSW = FxaaLuma(FxaaTexOff(tex, posM, FxaaFloat2(-1.0, 1.0), fxaaQualityRcpFrame.xy));",
        "        #else",
        "          FxaaFloat lumaNW = FxaaLuma(FxaaTexOff(tex, posM, FxaaInt2(-1,-1), fxaaQualityRcpFrame.xy));",
        "          FxaaFloat lumaSE = FxaaLuma(FxaaTexOff(tex, posM, FxaaInt2( 1, 1), fxaaQualityRcpFrame.xy));",
        "          FxaaFloat lumaNE = FxaaLuma(FxaaTexOff(tex, posM, FxaaInt2( 1,-1), fxaaQualityRcpFrame.xy));",
        "          FxaaFloat lumaSW = FxaaLuma(FxaaTexOff(tex, posM, FxaaInt2(-1, 1), fxaaQualityRcpFrame.xy));",
        "        #endif",
        "    #else",
        "        FxaaFloat lumaNE = FxaaLuma(FxaaTexOff(tex, posM, FxaaInt2(1, -1), fxaaQualityRcpFrame.xy));",
        "        FxaaFloat lumaSW = FxaaLuma(FxaaTexOff(tex, posM, FxaaInt2(-1, 1), fxaaQualityRcpFrame.xy));",
        "    #endif",
        "/*--------------------------------------------------------------------------*/",
        "    FxaaFloat lumaNS = lumaN + lumaS;",
        "    FxaaFloat lumaWE = lumaW + lumaE;",
        "    FxaaFloat subpixRcpRange = 1.0/range;",
        "    FxaaFloat subpixNSWE = lumaNS + lumaWE;",
        "    FxaaFloat edgeHorz1 = (-2.0 * lumaM) + lumaNS;",
        "    FxaaFloat edgeVert1 = (-2.0 * lumaM) + lumaWE;",
        "/*--------------------------------------------------------------------------*/",
        "    FxaaFloat lumaNESE = lumaNE + lumaSE;",
        "    FxaaFloat lumaNWNE = lumaNW + lumaNE;",
        "    FxaaFloat edgeHorz2 = (-2.0 * lumaE) + lumaNESE;",
        "    FxaaFloat edgeVert2 = (-2.0 * lumaN) + lumaNWNE;",
        "/*--------------------------------------------------------------------------*/",
        "    FxaaFloat lumaNWSW = lumaNW + lumaSW;",
        "    FxaaFloat lumaSWSE = lumaSW + lumaSE;",
        "    FxaaFloat edgeHorz4 = (abs(edgeHorz1) * 2.0) + abs(edgeHorz2);",
        "    FxaaFloat edgeVert4 = (abs(edgeVert1) * 2.0) + abs(edgeVert2);",
        "    FxaaFloat edgeHorz3 = (-2.0 * lumaW) + lumaNWSW;",
        "    FxaaFloat edgeVert3 = (-2.0 * lumaS) + lumaSWSE;",
        "    FxaaFloat edgeHorz = abs(edgeHorz3) + edgeHorz4;",
        "    FxaaFloat edgeVert = abs(edgeVert3) + edgeVert4;",
        "/*--------------------------------------------------------------------------*/",
        "    FxaaFloat subpixNWSWNESE = lumaNWSW + lumaNESE;",
        "    FxaaFloat lengthSign = fxaaQualityRcpFrame.x;",
        "    FxaaBool horzSpan = edgeHorz >= edgeVert;",
        "    FxaaFloat subpixA = subpixNSWE * 2.0 + subpixNWSWNESE;",
        "/*--------------------------------------------------------------------------*/",
        "    if(!horzSpan) lumaN = lumaW;",
        "    if(!horzSpan) lumaS = lumaE;",
        "    if(horzSpan) lengthSign = fxaaQualityRcpFrame.y;",
        "    FxaaFloat subpixB = (subpixA * (1.0/12.0)) - lumaM;",
        "/*--------------------------------------------------------------------------*/",
        "    FxaaFloat gradientN = lumaN - lumaM;",
        "    FxaaFloat gradientS = lumaS - lumaM;",
        "    FxaaFloat lumaNN = lumaN + lumaM;",
        "    FxaaFloat lumaSS = lumaS + lumaM;",
        "    FxaaBool pairN = abs(gradientN) >= abs(gradientS);",
        "    FxaaFloat gradient = max(abs(gradientN), abs(gradientS));",
        "    if(pairN) lengthSign = -lengthSign;",
        "    FxaaFloat subpixC = FxaaSat(abs(subpixB) * subpixRcpRange);",
        "/*--------------------------------------------------------------------------*/",
        "    FxaaFloat2 posB;",
        "    posB.x = posM.x;",
        "    posB.y = posM.y;",
        "    FxaaFloat2 offNP;",
        "    offNP.x = (!horzSpan) ? 0.0 : fxaaQualityRcpFrame.x;",
        "    offNP.y = ( horzSpan) ? 0.0 : fxaaQualityRcpFrame.y;",
        "    if(!horzSpan) posB.x += lengthSign * 0.5;",
        "    if( horzSpan) posB.y += lengthSign * 0.5;",
        "/*--------------------------------------------------------------------------*/",
        "    FxaaFloat2 posN;",
        "    posN.x = posB.x - offNP.x * FXAA_QUALITY_P0;",
        "    posN.y = posB.y - offNP.y * FXAA_QUALITY_P0;",
        "    FxaaFloat2 posP;",
        "    posP.x = posB.x + offNP.x * FXAA_QUALITY_P0;",
        "    posP.y = posB.y + offNP.y * FXAA_QUALITY_P0;",
        "    FxaaFloat subpixD = ((-2.0)*subpixC) + 3.0;",
        "    FxaaFloat lumaEndN = FxaaLuma(FxaaTexTop(tex, posN));",
        "    FxaaFloat subpixE = subpixC * subpixC;",
        "    FxaaFloat lumaEndP = FxaaLuma(FxaaTexTop(tex, posP));",
        "/*--------------------------------------------------------------------------*/",
        "    if(!pairN) lumaNN = lumaSS;",
        "    FxaaFloat gradientScaled = gradient * 1.0/4.0;",
        "    FxaaFloat lumaMM = lumaM - lumaNN * 0.5;",
        "    FxaaFloat subpixF = subpixD * subpixE;",
        "    FxaaBool lumaMLTZero = lumaMM < 0.0;",
        "/*--------------------------------------------------------------------------*/",
        "    lumaEndN -= lumaNN * 0.5;",
        "    lumaEndP -= lumaNN * 0.5;",
        "    FxaaBool doneN = abs(lumaEndN) >= gradientScaled;",
        "    FxaaBool doneP = abs(lumaEndP) >= gradientScaled;",
        "    if(!doneN) posN.x -= offNP.x * FXAA_QUALITY_P1;",
        "    if(!doneN) posN.y -= offNP.y * FXAA_QUALITY_P1;",
        "    FxaaBool doneNP = (!doneN) || (!doneP);",
        "    if(!doneP) posP.x += offNP.x * FXAA_QUALITY_P1;",
        "    if(!doneP) posP.y += offNP.y * FXAA_QUALITY_P1;",
        "/*--------------------------------------------------------------------------*/",
        "    if(doneNP) {",
        "        if(!doneN) lumaEndN = FxaaLuma(FxaaTexTop(tex, posN.xy));",
        "        if(!doneP) lumaEndP = FxaaLuma(FxaaTexTop(tex, posP.xy));",
        "        if(!doneN) lumaEndN = lumaEndN - lumaNN * 0.5;",
        "        if(!doneP) lumaEndP = lumaEndP - lumaNN * 0.5;",
        "        doneN = abs(lumaEndN) >= gradientScaled;",
        "        doneP = abs(lumaEndP) >= gradientScaled;",
        "        if(!doneN) posN.x -= offNP.x * FXAA_QUALITY_P2;",
        "        if(!doneN) posN.y -= offNP.y * FXAA_QUALITY_P2;",
        "        doneNP = (!doneN) || (!doneP);",
        "        if(!doneP) posP.x += offNP.x * FXAA_QUALITY_P2;",
        "        if(!doneP) posP.y += offNP.y * FXAA_QUALITY_P2;",
        "/*--------------------------------------------------------------------------*/",
        "        #if (FXAA_QUALITY_PS > 3)",
        "        if(doneNP) {",
        "            if(!doneN) lumaEndN = FxaaLuma(FxaaTexTop(tex, posN.xy));",
        "            if(!doneP) lumaEndP = FxaaLuma(FxaaTexTop(tex, posP.xy));",
        "            if(!doneN) lumaEndN = lumaEndN - lumaNN * 0.5;",
        "            if(!doneP) lumaEndP = lumaEndP - lumaNN * 0.5;",
        "            doneN = abs(lumaEndN) >= gradientScaled;",
        "            doneP = abs(lumaEndP) >= gradientScaled;",
        "            if(!doneN) posN.x -= offNP.x * FXAA_QUALITY_P3;",
        "            if(!doneN) posN.y -= offNP.y * FXAA_QUALITY_P3;",
        "            doneNP = (!doneN) || (!doneP);",
        "            if(!doneP) posP.x += offNP.x * FXAA_QUALITY_P3;",
        "            if(!doneP) posP.y += offNP.y * FXAA_QUALITY_P3;",
        "/*--------------------------------------------------------------------------*/",
        "            #if (FXAA_QUALITY_PS > 4)",
        "            if(doneNP) {",
        "                if(!doneN) lumaEndN = FxaaLuma(FxaaTexTop(tex, posN.xy));",
        "                if(!doneP) lumaEndP = FxaaLuma(FxaaTexTop(tex, posP.xy));",
        "                if(!doneN) lumaEndN = lumaEndN - lumaNN * 0.5;",
        "                if(!doneP) lumaEndP = lumaEndP - lumaNN * 0.5;",
        "                doneN = abs(lumaEndN) >= gradientScaled;",
        "                doneP = abs(lumaEndP) >= gradientScaled;",
        "                if(!doneN) posN.x -= offNP.x * FXAA_QUALITY_P4;",
        "                if(!doneN) posN.y -= offNP.y * FXAA_QUALITY_P4;",
        "                doneNP = (!doneN) || (!doneP);",
        "                if(!doneP) posP.x += offNP.x * FXAA_QUALITY_P4;",
        "                if(!doneP) posP.y += offNP.y * FXAA_QUALITY_P4;",
        "/*--------------------------------------------------------------------------*/",
        "                #if (FXAA_QUALITY_PS > 5)",
        "                if(doneNP) {",
        "                    if(!doneN) lumaEndN = FxaaLuma(FxaaTexTop(tex, posN.xy));",
        "                    if(!doneP) lumaEndP = FxaaLuma(FxaaTexTop(tex, posP.xy));",
        "                    if(!doneN) lumaEndN = lumaEndN - lumaNN * 0.5;",
        "                    if(!doneP) lumaEndP = lumaEndP - lumaNN * 0.5;",
        "                    doneN = abs(lumaEndN) >= gradientScaled;",
        "                    doneP = abs(lumaEndP) >= gradientScaled;",
        "                    if(!doneN) posN.x -= offNP.x * FXAA_QUALITY_P5;",
        "                    if(!doneN) posN.y -= offNP.y * FXAA_QUALITY_P5;",
        "                    doneNP = (!doneN) || (!doneP);",
        "                    if(!doneP) posP.x += offNP.x * FXAA_QUALITY_P5;",
        "                    if(!doneP) posP.y += offNP.y * FXAA_QUALITY_P5;",
        "/*--------------------------------------------------------------------------*/",
        "                    #if (FXAA_QUALITY_PS > 6)",
        "                    if(doneNP) {",
        "                        if(!doneN) lumaEndN = FxaaLuma(FxaaTexTop(tex, posN.xy));",
        "                        if(!doneP) lumaEndP = FxaaLuma(FxaaTexTop(tex, posP.xy));",
        "                        if(!doneN) lumaEndN = lumaEndN - lumaNN * 0.5;",
        "                        if(!doneP) lumaEndP = lumaEndP - lumaNN * 0.5;",
        "                        doneN = abs(lumaEndN) >= gradientScaled;",
        "                        doneP = abs(lumaEndP) >= gradientScaled;",
        "                        if(!doneN) posN.x -= offNP.x * FXAA_QUALITY_P6;",
        "                        if(!doneN) posN.y -= offNP.y * FXAA_QUALITY_P6;",
        "                        doneNP = (!doneN) || (!doneP);",
        "                        if(!doneP) posP.x += offNP.x * FXAA_QUALITY_P6;",
        "                        if(!doneP) posP.y += offNP.y * FXAA_QUALITY_P6;",
        "/*--------------------------------------------------------------------------*/",
        "                        #if (FXAA_QUALITY_PS > 7)",
        "                        if(doneNP) {",
        "                            if(!doneN) lumaEndN = FxaaLuma(FxaaTexTop(tex, posN.xy));",
        "                            if(!doneP) lumaEndP = FxaaLuma(FxaaTexTop(tex, posP.xy));",
        "                            if(!doneN) lumaEndN = lumaEndN - lumaNN * 0.5;",
        "                            if(!doneP) lumaEndP = lumaEndP - lumaNN * 0.5;",
        "                            doneN = abs(lumaEndN) >= gradientScaled;",
        "                            doneP = abs(lumaEndP) >= gradientScaled;",
        "                            if(!doneN) posN.x -= offNP.x * FXAA_QUALITY_P7;",
        "                            if(!doneN) posN.y -= offNP.y * FXAA_QUALITY_P7;",
        "                            doneNP = (!doneN) || (!doneP);",
        "                            if(!doneP) posP.x += offNP.x * FXAA_QUALITY_P7;",
        "                            if(!doneP) posP.y += offNP.y * FXAA_QUALITY_P7;",
        "/*--------------------------------------------------------------------------*/",
        "    #if (FXAA_QUALITY_PS > 8)",
        "    if(doneNP) {",
        "        if(!doneN) lumaEndN = FxaaLuma(FxaaTexTop(tex, posN.xy));",
        "        if(!doneP) lumaEndP = FxaaLuma(FxaaTexTop(tex, posP.xy));",
        "        if(!doneN) lumaEndN = lumaEndN - lumaNN * 0.5;",
        "        if(!doneP) lumaEndP = lumaEndP - lumaNN * 0.5;",
        "        doneN = abs(lumaEndN) >= gradientScaled;",
        "        doneP = abs(lumaEndP) >= gradientScaled;",
        "        if(!doneN) posN.x -= offNP.x * FXAA_QUALITY_P8;",
        "        if(!doneN) posN.y -= offNP.y * FXAA_QUALITY_P8;",
        "        doneNP = (!doneN) || (!doneP);",
        "        if(!doneP) posP.x += offNP.x * FXAA_QUALITY_P8;",
        "        if(!doneP) posP.y += offNP.y * FXAA_QUALITY_P8;",
        "/*--------------------------------------------------------------------------*/",
        "        #if (FXAA_QUALITY_PS > 9)",
        "        if(doneNP) {",
        "            if(!doneN) lumaEndN = FxaaLuma(FxaaTexTop(tex, posN.xy));",
        "            if(!doneP) lumaEndP = FxaaLuma(FxaaTexTop(tex, posP.xy));",
        "            if(!doneN) lumaEndN = lumaEndN - lumaNN * 0.5;",
        "            if(!doneP) lumaEndP = lumaEndP - lumaNN * 0.5;",
        "            doneN = abs(lumaEndN) >= gradientScaled;",
        "            doneP = abs(lumaEndP) >= gradientScaled;",
        "            if(!doneN) posN.x -= offNP.x * FXAA_QUALITY_P9;",
        "            if(!doneN) posN.y -= offNP.y * FXAA_QUALITY_P9;",
        "            doneNP = (!doneN) || (!doneP);",
        "            if(!doneP) posP.x += offNP.x * FXAA_QUALITY_P9;",
        "            if(!doneP) posP.y += offNP.y * FXAA_QUALITY_P9;",
        "/*--------------------------------------------------------------------------*/",
        "            #if (FXAA_QUALITY_PS > 10)",
        "            if(doneNP) {",
        "                if(!doneN) lumaEndN = FxaaLuma(FxaaTexTop(tex, posN.xy));",
        "                if(!doneP) lumaEndP = FxaaLuma(FxaaTexTop(tex, posP.xy));",
        "                if(!doneN) lumaEndN = lumaEndN - lumaNN * 0.5;",
        "                if(!doneP) lumaEndP = lumaEndP - lumaNN * 0.5;",
        "                doneN = abs(lumaEndN) >= gradientScaled;",
        "                doneP = abs(lumaEndP) >= gradientScaled;",
        "                if(!doneN) posN.x -= offNP.x * FXAA_QUALITY_P10;",
        "                if(!doneN) posN.y -= offNP.y * FXAA_QUALITY_P10;",
        "                doneNP = (!doneN) || (!doneP);",
        "                if(!doneP) posP.x += offNP.x * FXAA_QUALITY_P10;",
        "                if(!doneP) posP.y += offNP.y * FXAA_QUALITY_P10;",
        "/*--------------------------------------------------------------------------*/",
        "                #if (FXAA_QUALITY_PS > 11)",
        "                if(doneNP) {",
        "                    if(!doneN) lumaEndN = FxaaLuma(FxaaTexTop(tex, posN.xy));",
        "                    if(!doneP) lumaEndP = FxaaLuma(FxaaTexTop(tex, posP.xy));",
        "                    if(!doneN) lumaEndN = lumaEndN - lumaNN * 0.5;",
        "                    if(!doneP) lumaEndP = lumaEndP - lumaNN * 0.5;",
        "                    doneN = abs(lumaEndN) >= gradientScaled;",
        "                    doneP = abs(lumaEndP) >= gradientScaled;",
        "                    if(!doneN) posN.x -= offNP.x * FXAA_QUALITY_P11;",
        "                    if(!doneN) posN.y -= offNP.y * FXAA_QUALITY_P11;",
        "                    doneNP = (!doneN) || (!doneP);",
        "                    if(!doneP) posP.x += offNP.x * FXAA_QUALITY_P11;",
        "                    if(!doneP) posP.y += offNP.y * FXAA_QUALITY_P11;",
        "/*--------------------------------------------------------------------------*/",
        "                    #if (FXAA_QUALITY_PS > 12)",
        "                    if(doneNP) {",
        "                        if(!doneN) lumaEndN = FxaaLuma(FxaaTexTop(tex, posN.xy));",
        "                        if(!doneP) lumaEndP = FxaaLuma(FxaaTexTop(tex, posP.xy));",
        "                        if(!doneN) lumaEndN = lumaEndN - lumaNN * 0.5;",
        "                        if(!doneP) lumaEndP = lumaEndP - lumaNN * 0.5;",
        "                        doneN = abs(lumaEndN) >= gradientScaled;",
        "                        doneP = abs(lumaEndP) >= gradientScaled;",
        "                        if(!doneN) posN.x -= offNP.x * FXAA_QUALITY_P12;",
        "                        if(!doneN) posN.y -= offNP.y * FXAA_QUALITY_P12;",
        "                        doneNP = (!doneN) || (!doneP);",
        "                        if(!doneP) posP.x += offNP.x * FXAA_QUALITY_P12;",
        "                        if(!doneP) posP.y += offNP.y * FXAA_QUALITY_P12;",
        "/*--------------------------------------------------------------------------*/",
        "                    }",
        "                    #endif",
        "/*--------------------------------------------------------------------------*/",
        "                }",
        "                #endif",
        "/*--------------------------------------------------------------------------*/",
        "            }",
        "            #endif",
        "/*--------------------------------------------------------------------------*/",
        "        }",
        "        #endif",
        "/*--------------------------------------------------------------------------*/",
        "    }",
        "    #endif",
        "/*--------------------------------------------------------------------------*/",
        "                        }",
        "                        #endif",
        "/*--------------------------------------------------------------------------*/",
        "                    }",
        "                    #endif",
        "/*--------------------------------------------------------------------------*/",
        "                }",
        "                #endif",
        "/*--------------------------------------------------------------------------*/",
        "            }",
        "            #endif",
        "/*--------------------------------------------------------------------------*/",
        "        }",
        "        #endif",
        "/*--------------------------------------------------------------------------*/",
        "    }",
        "/*--------------------------------------------------------------------------*/",
        "    FxaaFloat dstN = posM.x - posN.x;",
        "    FxaaFloat dstP = posP.x - posM.x;",
        "    if(!horzSpan) dstN = posM.y - posN.y;",
        "    if(!horzSpan) dstP = posP.y - posM.y;",
        "/*--------------------------------------------------------------------------*/",
        "    FxaaBool goodSpanN = (lumaEndN < 0.0) != lumaMLTZero;",
        "    FxaaFloat spanLength = (dstP + dstN);",
        "    FxaaBool goodSpanP = (lumaEndP < 0.0) != lumaMLTZero;",
        "    FxaaFloat spanLengthRcp = 1.0/spanLength;",
        "/*--------------------------------------------------------------------------*/",
        "    FxaaBool directionN = dstN < dstP;",
        "    FxaaFloat dst = min(dstN, dstP);",
        "    FxaaBool goodSpan = directionN ? goodSpanN : goodSpanP;",
        "    FxaaFloat subpixG = subpixF * subpixF;",
        "    FxaaFloat pixelOffset = (dst * (-spanLengthRcp)) + 0.5;",
        "    FxaaFloat subpixH = subpixG * fxaaQualitySubpix;",
        "/*--------------------------------------------------------------------------*/",
        "    FxaaFloat pixelOffsetGood = goodSpan ? pixelOffset : 0.0;",
        "    FxaaFloat pixelOffsetSubpix = max(pixelOffsetGood, subpixH);",
        "    if(!horzSpan) posM.x += pixelOffsetSubpix * lengthSign;",
        "    if( horzSpan) posM.y += pixelOffsetSubpix * lengthSign;",
        "    #if (FXAA_DISCARD == 1)",
        "        return FxaaTexTop(tex, posM);",
        "    #else",
        "        return FxaaFloat4(FxaaTexTop(tex, posM).xyz, lumaM);",
        "    #endif",
        "}",
        "/*==========================================================================*/",
        "#endif",
        "",
        "void main() {",
        "  gl_FragColor = FxaaPixelShader(",
        "    vUv,",
        "    vec4(0.0),",
        "    tDiffuse,",
        "    tDiffuse,",
        "    tDiffuse,",
        "    resolution,",
        "    vec4(0.0),",
        "    vec4(0.0),",
        "    vec4(0.0),",
        "    0.75,",
        "    0.166,",
        "    0.0833,",
        "    0.0,",
        "    0.0,",
        "    0.0,",
        "    vec4(0.0)",
        "  );",
        "",
        "  // TODO avoid querying texture twice for same texel",
        "  gl_FragColor.a = texture2D(tDiffuse, vUv).a;",
        "}"
	].join("\n")

};
/**
 * @author WestLangley / http://github.com/WestLangley
 *
 * Gamma Correction Shader
 * http://en.wikipedia.org/wiki/gamma_correction
 */

THREE.GammaCorrectionShader = {

	uniforms: {

		"tDiffuse": { value: null }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join( "\n" ),

	fragmentShader: [

		"uniform sampler2D tDiffuse;",

		"varying vec2 vUv;",

		"void main() {",

			"vec4 tex = texture2D( tDiffuse, vec2( vUv.x, vUv.y ) );",

			"gl_FragColor = LinearToGamma( tex, float( GAMMA_FACTOR ) );",

		"}"

	].join( "\n" )

};
/**
 * @author meatbags / xavierburrow.com, github/meatbags
 *
 * RGB Halftone shader for three.js.
 *	NOTE:
 * 		Shape (1 = Dot, 2 = Ellipse, 3 = Line, 4 = Square)
 *		Blending Mode (1 = Linear, 2 = Multiply, 3 = Add, 4 = Lighter, 5 = Darker)
 */

THREE.HalftoneShader = {

	uniforms: {
		"tDiffuse": { value: null },
		"shape": { value: 1 },
		"radius": { value: 4 },
		"rotateR": { value: Math.PI / 12 * 1 },
		"rotateG": { value: Math.PI / 12 * 2 },
		"rotateB": { value: Math.PI / 12 * 3 },
		"scatter": { value: 0 },
		"width": { value: 1 },
		"height": { value: 1 },
		"blending": { value: 1 },
		"blendingMode": { value: 1 },
		"greyscale": { value: false },
		"disable": { value: false }
	},

	vertexShader: [

    "varying vec2 vUV;",

    "void main() {",

      "vUV = uv;",
      "gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);",

    "}"

	].join( "\n" ),

	fragmentShader: [

		"#define SQRT2_MINUS_ONE 0.41421356",
		"#define SQRT2_HALF_MINUS_ONE 0.20710678",
		"#define PI2 6.28318531",
		"#define SHAPE_DOT 1",
		"#define SHAPE_ELLIPSE 2",
		"#define SHAPE_LINE 3",
		"#define SHAPE_SQUARE 4",
		"#define BLENDING_LINEAR 1",
		"#define BLENDING_MULTIPLY 2",
		"#define BLENDING_ADD 3",
		"#define BLENDING_LIGHTER 4",
		"#define BLENDING_DARKER 5",
		"uniform sampler2D tDiffuse;",
		"uniform float radius;",
		"uniform float rotateR;",
		"uniform float rotateG;",
		"uniform float rotateB;",
		"uniform float scatter;",
		"uniform float width;",
		"uniform float height;",
		"uniform int shape;",
		"uniform bool disable;",
		"uniform float blending;",
		"uniform int blendingMode;",
		"varying vec2 vUV;",
		"uniform bool greyscale;",
		"const int samples = 8;",

		"float blend( float a, float b, float t ) {",

			// linear blend
			"return a * ( 1.0 - t ) + b * t;",

		"}",

		"float hypot( float x, float y ) {",

			// vector magnitude
			"return sqrt( x * x + y * y );",

		"}",

		"float rand( vec2 seed ){",

			// get pseudo-random number
	    "return fract( sin( dot( seed.xy, vec2( 12.9898, 78.233 ) ) ) * 43758.5453 );",

		"}",

		"float distanceToDotRadius( float channel, vec2 coord, vec2 normal, vec2 p, float angle, float rad_max ) {",

			// apply shape-specific transforms
			"float dist = hypot( coord.x - p.x, coord.y - p.y );",
			"float rad = channel;",

			"if ( shape == SHAPE_DOT ) {",

				"rad = pow( abs( rad ), 1.125 ) * rad_max;",

			"} else if ( shape == SHAPE_ELLIPSE ) {",

				"rad = pow( abs( rad ), 1.125 ) * rad_max;",

				"if ( dist != 0.0 ) {",
					"float dot_p = abs( ( p.x - coord.x ) / dist * normal.x + ( p.y - coord.y ) / dist * normal.y );",
					"dist = ( dist * ( 1.0 - SQRT2_HALF_MINUS_ONE ) ) + dot_p * dist * SQRT2_MINUS_ONE;",
				"}",

			"} else if ( shape == SHAPE_LINE ) {",

				"rad = pow( abs( rad ), 1.5) * rad_max;",
				"float dot_p = ( p.x - coord.x ) * normal.x + ( p.y - coord.y ) * normal.y;",
				"dist = hypot( normal.x * dot_p, normal.y * dot_p );",

			"} else if ( shape == SHAPE_SQUARE ) {",

				"float theta = atan( p.y - coord.y, p.x - coord.x ) - angle;",
				"float sin_t = abs( sin( theta ) );",
				"float cos_t = abs( cos( theta ) );",
				"rad = pow( abs( rad ), 1.4 );",
				"rad = rad_max * ( rad + ( ( sin_t > cos_t ) ? rad - sin_t * rad : rad - cos_t * rad ) );",

			"}",

			"return rad - dist;",

		"}",

		"struct Cell {",

			// grid sample positions
			"vec2 normal;",
			"vec2 p1;",
			"vec2 p2;",
			"vec2 p3;",
			"vec2 p4;",
			"float samp2;",
			"float samp1;",
			"float samp3;",
			"float samp4;",

		"};",

		"vec4 getSample( vec2 point ) {",

			// multi-sampled point
			"vec4 tex = texture2D( tDiffuse, vec2( point.x / width, point.y / height ) );",
			"float base = rand( vec2( floor( point.x ), floor( point.y ) ) ) * PI2;",
			"float step = PI2 / float( samples );",
			"float dist = radius * 0.66;",

			"for ( int i = 0; i < samples; ++i ) {",

				"float r = base + step * float( i );",
				"vec2 coord = point + vec2( cos( r ) * dist, sin( r ) * dist );",
				"tex += texture2D( tDiffuse, vec2( coord.x / width, coord.y / height ) );",

			"}",

			"tex /= float( samples ) + 1.0;",
			"return tex;",

		"}",

		"float getDotColour( Cell c, vec2 p, int channel, float angle, float aa ) {",

			// get colour for given point
			"float dist_c_1, dist_c_2, dist_c_3, dist_c_4, res;",

			"if ( channel == 0 ) {",

				"c.samp1 = getSample( c.p1 ).r;",
				"c.samp2 = getSample( c.p2 ).r;",
				"c.samp3 = getSample( c.p3 ).r;",
				"c.samp4 = getSample( c.p4 ).r;",

			"} else if (channel == 1) {",

				"c.samp1 = getSample( c.p1 ).g;",
				"c.samp2 = getSample( c.p2 ).g;",
				"c.samp3 = getSample( c.p3 ).g;",
				"c.samp4 = getSample( c.p4 ).g;",

			"} else {",

				"c.samp1 = getSample( c.p1 ).b;",
				"c.samp3 = getSample( c.p3 ).b;",
				"c.samp2 = getSample( c.p2 ).b;",
				"c.samp4 = getSample( c.p4 ).b;",

			"}",

			"dist_c_1 = distanceToDotRadius( c.samp1, c.p1, c.normal, p, angle, radius );",
			"dist_c_2 = distanceToDotRadius( c.samp2, c.p2, c.normal, p, angle, radius );",
			"dist_c_3 = distanceToDotRadius( c.samp3, c.p3, c.normal, p, angle, radius );",
			"dist_c_4 = distanceToDotRadius( c.samp4, c.p4, c.normal, p, angle, radius );",
			"res = ( dist_c_1 > 0.0 ) ? clamp( dist_c_1 / aa, 0.0, 1.0 ) : 0.0;",
			"res += ( dist_c_2 > 0.0 ) ? clamp( dist_c_2 / aa, 0.0, 1.0 ) : 0.0;",
			"res += ( dist_c_3 > 0.0 ) ? clamp( dist_c_3 / aa, 0.0, 1.0 ) : 0.0;",
			"res += ( dist_c_4 > 0.0 ) ? clamp( dist_c_4 / aa, 0.0, 1.0 ) : 0.0;",
			"res = clamp( res, 0.0, 1.0 );",

			"return res;",

		"}",

		"Cell getReferenceCell( vec2 p, vec2 origin, float grid_angle, float step ) {",

			// get containing cell
			"Cell c;",

			// calc grid
			"vec2 n = vec2( cos( grid_angle ), sin( grid_angle ) );",
			"float threshold = step * 0.5;",
			"float dot_normal = n.x * ( p.x - origin.x ) + n.y * ( p.y - origin.y );",
			"float dot_line = -n.y * ( p.x - origin.x ) + n.x * ( p.y - origin.y );",
			"vec2 offset = vec2( n.x * dot_normal, n.y * dot_normal );",
			"float offset_normal = mod( hypot( offset.x, offset.y ), step );",
			"float normal_dir = ( dot_normal < 0.0 ) ? 1.0 : -1.0;",
			"float normal_scale = ( ( offset_normal < threshold ) ? -offset_normal : step - offset_normal ) * normal_dir;",
			"float offset_line = mod( hypot( ( p.x - offset.x ) - origin.x, ( p.y - offset.y ) - origin.y ), step );",
			"float line_dir = ( dot_line < 0.0 ) ? 1.0 : -1.0;",
			"float line_scale = ( ( offset_line < threshold ) ? -offset_line : step - offset_line ) * line_dir;",

			// get closest corner
			"c.normal = n;",
			"c.p1.x = p.x - n.x * normal_scale + n.y * line_scale;",
			"c.p1.y = p.y - n.y * normal_scale - n.x * line_scale;",

			// scatter
			"if ( scatter != 0.0 ) {",

				"float off_mag = scatter * threshold * 0.5;",
				"float off_angle = rand( vec2( floor( c.p1.x ), floor( c.p1.y ) ) ) * PI2;",
				"c.p1.x += cos( off_angle ) * off_mag;",
				"c.p1.y += sin( off_angle ) * off_mag;",

			"}",

			// find corners
			"float normal_step = normal_dir * ( ( offset_normal < threshold ) ? step : -step );",
			"float line_step = line_dir * ( ( offset_line < threshold ) ? step : -step );",
			"c.p2.x = c.p1.x - n.x * normal_step;",
			"c.p2.y = c.p1.y - n.y * normal_step;",
			"c.p3.x = c.p1.x + n.y * line_step;",
			"c.p3.y = c.p1.y - n.x * line_step;",
			"c.p4.x = c.p1.x - n.x * normal_step + n.y * line_step;",
			"c.p4.y = c.p1.y - n.y * normal_step - n.x * line_step;",

			"return c;",

		"}",

		"float blendColour( float a, float b, float t ) {",

			// blend colours
			"if ( blendingMode == BLENDING_LINEAR ) {",
				"return blend( a, b, 1.0 - t );",
			"} else if ( blendingMode == BLENDING_ADD ) {",
				"return blend( a, min( 1.0, a + b ), t );",
			"} else if ( blendingMode == BLENDING_MULTIPLY ) {",
				"return blend( a, max( 0.0, a * b ), t );",
			"} else if ( blendingMode == BLENDING_LIGHTER ) {",
				"return blend( a, max( a, b ), t );",
			"} else if ( blendingMode == BLENDING_DARKER ) {",
				"return blend( a, min( a, b ), t );",
			"} else {",
				"return blend( a, b, 1.0 - t );",
			"}",

		"}",

		"void main() {",

			"if ( ! disable ) {",

				// setup
				"vec2 p = vec2( vUV.x * width, vUV.y * height );",
				"vec2 origin = vec2( 0, 0 );",
				"float aa = ( radius < 2.5 ) ? radius * 0.5 : 1.25;",

				// get channel samples
				"Cell cell_r = getReferenceCell( p, origin, rotateR, radius );",
				"Cell cell_g = getReferenceCell( p, origin, rotateG, radius );",
				"Cell cell_b = getReferenceCell( p, origin, rotateB, radius );",
				"float r = getDotColour( cell_r, p, 0, rotateR, aa );",
				"float g = getDotColour( cell_g, p, 1, rotateG, aa );",
				"float b = getDotColour( cell_b, p, 2, rotateB, aa );",

				// blend with original
				"vec4 colour = texture2D( tDiffuse, vUV );",
				"r = blendColour( r, colour.r, blending );",
				"g = blendColour( g, colour.g, blending );",
				"b = blendColour( b, colour.b, blending );",

				"if ( greyscale ) {",
					"r = g = b = (r + b + g) / 3.0;",
				"}",

				"gl_FragColor = vec4( r, g, b, 1.0 );",

			"} else {",

				"gl_FragColor = texture2D( tDiffuse, vUV );",

			"}",

		"}"

	].join( "\n" )

};
/**
 * @author zz85 / http://www.lab4games.net/zz85/blog
 *
 * Two pass Gaussian blur filter (horizontal and vertical blur shaders)
 * - described in http://www.gamerendering.com/2008/10/11/gaussian-blur-filter-shader/
 *   and used in http://www.cake23.de/traveling-wavefronts-lit-up.html
 *
 * - 9 samples per pass
 * - standard deviation 2.7
 * - "h" and "v" parameters should be set to "1 / width" and "1 / height"
 */

THREE.HorizontalBlurShader = {

	uniforms: {

		"tDiffuse": { value: null },
		"h":        { value: 1.0 / 512.0 }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join( "\n" ),

	fragmentShader: [

		"uniform sampler2D tDiffuse;",
		"uniform float h;",

		"varying vec2 vUv;",

		"void main() {",

			"vec4 sum = vec4( 0.0 );",

			"sum += texture2D( tDiffuse, vec2( vUv.x - 4.0 * h, vUv.y ) ) * 0.051;",
			"sum += texture2D( tDiffuse, vec2( vUv.x - 3.0 * h, vUv.y ) ) * 0.0918;",
			"sum += texture2D( tDiffuse, vec2( vUv.x - 2.0 * h, vUv.y ) ) * 0.12245;",
			"sum += texture2D( tDiffuse, vec2( vUv.x - 1.0 * h, vUv.y ) ) * 0.1531;",
			"sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y ) ) * 0.1633;",
			"sum += texture2D( tDiffuse, vec2( vUv.x + 1.0 * h, vUv.y ) ) * 0.1531;",
			"sum += texture2D( tDiffuse, vec2( vUv.x + 2.0 * h, vUv.y ) ) * 0.12245;",
			"sum += texture2D( tDiffuse, vec2( vUv.x + 3.0 * h, vUv.y ) ) * 0.0918;",
			"sum += texture2D( tDiffuse, vec2( vUv.x + 4.0 * h, vUv.y ) ) * 0.051;",

			"gl_FragColor = sum;",

		"}"

	].join( "\n" )

};
/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Simple fake tilt-shift effect, modulating two pass Gaussian blur (see above) by vertical position
 *
 * - 9 samples per pass
 * - standard deviation 2.7
 * - "h" and "v" parameters should be set to "1 / width" and "1 / height"
 * - "r" parameter control where "focused" horizontal line lies
 */

THREE.HorizontalTiltShiftShader = {

	uniforms: {

		"tDiffuse": { value: null },
		"h":        { value: 1.0 / 512.0 },
		"r":        { value: 0.35 }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join( "\n" ),

	fragmentShader: [

		"uniform sampler2D tDiffuse;",
		"uniform float h;",
		"uniform float r;",

		"varying vec2 vUv;",

		"void main() {",

			"vec4 sum = vec4( 0.0 );",

			"float hh = h * abs( r - vUv.y );",

			"sum += texture2D( tDiffuse, vec2( vUv.x - 4.0 * hh, vUv.y ) ) * 0.051;",
			"sum += texture2D( tDiffuse, vec2( vUv.x - 3.0 * hh, vUv.y ) ) * 0.0918;",
			"sum += texture2D( tDiffuse, vec2( vUv.x - 2.0 * hh, vUv.y ) ) * 0.12245;",
			"sum += texture2D( tDiffuse, vec2( vUv.x - 1.0 * hh, vUv.y ) ) * 0.1531;",
			"sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y ) ) * 0.1633;",
			"sum += texture2D( tDiffuse, vec2( vUv.x + 1.0 * hh, vUv.y ) ) * 0.1531;",
			"sum += texture2D( tDiffuse, vec2( vUv.x + 2.0 * hh, vUv.y ) ) * 0.12245;",
			"sum += texture2D( tDiffuse, vec2( vUv.x + 3.0 * hh, vUv.y ) ) * 0.0918;",
			"sum += texture2D( tDiffuse, vec2( vUv.x + 4.0 * hh, vUv.y ) ) * 0.051;",

			"gl_FragColor = sum;",

		"}"

	].join( "\n" )

};
/**
 * @author tapio / http://tapio.github.com/
 *
 * Hue and saturation adjustment
 * https://github.com/evanw/glfx.js
 * hue: -1 to 1 (-1 is 180 degrees in the negative direction, 0 is no change, etc.
 * saturation: -1 to 1 (-1 is solid gray, 0 is no change, and 1 is maximum contrast)
 */

THREE.HueSaturationShader = {

	uniforms: {

		"tDiffuse":   { value: null },
		"hue":        { value: 0 },
		"saturation": { value: 0 }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",

			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join( "\n" ),

	fragmentShader: [

		"uniform sampler2D tDiffuse;",
		"uniform float hue;",
		"uniform float saturation;",

		"varying vec2 vUv;",

		"void main() {",

			"gl_FragColor = texture2D( tDiffuse, vUv );",

			// hue
			"float angle = hue * 3.14159265;",
			"float s = sin(angle), c = cos(angle);",
			"vec3 weights = (vec3(2.0 * c, -sqrt(3.0) * s - c, sqrt(3.0) * s - c) + 1.0) / 3.0;",
			"float len = length(gl_FragColor.rgb);",
			"gl_FragColor.rgb = vec3(",
				"dot(gl_FragColor.rgb, weights.xyz),",
				"dot(gl_FragColor.rgb, weights.zxy),",
				"dot(gl_FragColor.rgb, weights.yzx)",
			");",

			// saturation
			"float average = (gl_FragColor.r + gl_FragColor.g + gl_FragColor.b) / 3.0;",
			"if (saturation > 0.0) {",
				"gl_FragColor.rgb += (average - gl_FragColor.rgb) * (1.0 - 1.0 / (1.001 - saturation));",
			"} else {",
				"gl_FragColor.rgb += (average - gl_FragColor.rgb) * (-saturation);",
			"}",

		"}"

	].join( "\n" )

};
/**
 * @author felixturner / http://airtight.cc/
 *
 * Kaleidoscope Shader
 * Radial reflection around center point
 * Ported from: http://pixelshaders.com/editor/
 * by Toby Schachman / http://tobyschachman.com/
 *
 * sides: number of reflections
 * angle: initial angle in radians
 */

THREE.KaleidoShader = {

	uniforms: {

		"tDiffuse": { value: null },
		"sides":    { value: 6.0 },
		"angle":    { value: 0.0 }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join( "\n" ),

	fragmentShader: [

		"uniform sampler2D tDiffuse;",
		"uniform float sides;",
		"uniform float angle;",
		
		"varying vec2 vUv;",

		"void main() {",

			"vec2 p = vUv - 0.5;",
			"float r = length(p);",
			"float a = atan(p.y, p.x) + angle;",
			"float tau = 2. * 3.1416 ;",
			"a = mod(a, tau/sides);",
			"a = abs(a - tau/sides/2.) ;",
			"p = r * vec2(cos(a), sin(a));",
			"vec4 color = texture2D(tDiffuse, p + 0.5);",
			"gl_FragColor = color;",

		"}"

	].join( "\n" )

};
/**
 * @author bhouston / http://clara.io/
 *
 * Luminosity
 * http://en.wikipedia.org/wiki/Luminosity
 */

THREE.LuminosityHighPassShader = {

  shaderID: "luminosityHighPass",

	uniforms: {

		"tDiffuse": { type: "t", value: null },
		"luminosityThreshold": { type: "f", value: 1.0 },
		"smoothWidth": { type: "f", value: 1.0 },
		"defaultColor": { type: "c", value: new THREE.Color( 0x000000 ) },
		"defaultOpacity":  { type: "f", value: 0.0 }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",

			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join("\n"),

	fragmentShader: [

		"uniform sampler2D tDiffuse;",
		"uniform vec3 defaultColor;",
		"uniform float defaultOpacity;",
		"uniform float luminosityThreshold;",
		"uniform float smoothWidth;",

		"varying vec2 vUv;",

		"void main() {",

			"vec4 texel = texture2D( tDiffuse, vUv );",

			"vec3 luma = vec3( 0.299, 0.587, 0.114 );",

			"float v = dot( texel.xyz, luma );",

			"vec4 outputColor = vec4( defaultColor.rgb, defaultOpacity );",

			"float alpha = smoothstep( luminosityThreshold, luminosityThreshold + smoothWidth, v );",

			"gl_FragColor = mix( outputColor, texel, alpha );",

		"}"

	].join("\n")

};
/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Luminosity
 * http://en.wikipedia.org/wiki/Luminosity
 */

THREE.LuminosityShader = {

	uniforms: {

		"tDiffuse": { value: null }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",

			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join( "\n" ),

	fragmentShader: [

		"#include <common>",

		"uniform sampler2D tDiffuse;",

		"varying vec2 vUv;",

		"void main() {",

			"vec4 texel = texture2D( tDiffuse, vUv );",

			"float l = linearToRelativeLuminance( texel.rgb );",

			"gl_FragColor = vec4( l, l, l, texel.w );",

		"}"

	].join( "\n" )

};
/**
 * @author felixturner / http://airtight.cc/
 *
 * Mirror Shader
 * Copies half the input to the other half
 *
 * side: side of input to mirror (0 = left, 1 = right, 2 = top, 3 = bottom)
 */

THREE.MirrorShader = {

	uniforms: {

		"tDiffuse": { value: null },
		"side":     { value: 1 }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join( "\n" ),

	fragmentShader: [

		"uniform sampler2D tDiffuse;",
		"uniform int side;",
		
		"varying vec2 vUv;",

		"void main() {",

			"vec2 p = vUv;",
			"if (side == 0){",
				"if (p.x > 0.5) p.x = 1.0 - p.x;",
			"}else if (side == 1){",
				"if (p.x < 0.5) p.x = 1.0 - p.x;",
			"}else if (side == 2){",
				"if (p.y < 0.5) p.y = 1.0 - p.y;",
			"}else if (side == 3){",
				"if (p.y > 0.5) p.y = 1.0 - p.y;",
			"} ",
			"vec4 color = texture2D(tDiffuse, p);",
			"gl_FragColor = color;",

		"}"

	].join( "\n" )

};
/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Normal map shader
 * - compute normals from heightmap
 */

THREE.NormalMapShader = {

	uniforms: {

		"heightMap":  { value: null },
		"resolution": { value: new THREE.Vector2( 512, 512 ) },
		"scale":      { value: new THREE.Vector2( 1, 1 ) },
		"height":     { value: 0.05 }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join( "\n" ),

	fragmentShader: [

		"uniform float height;",
		"uniform vec2 resolution;",
		"uniform sampler2D heightMap;",

		"varying vec2 vUv;",

		"void main() {",

			"float val = texture2D( heightMap, vUv ).x;",

			"float valU = texture2D( heightMap, vUv + vec2( 1.0 / resolution.x, 0.0 ) ).x;",
			"float valV = texture2D( heightMap, vUv + vec2( 0.0, 1.0 / resolution.y ) ).x;",

			"gl_FragColor = vec4( ( 0.5 * normalize( vec3( val - valU, val - valV, height  ) ) + 0.5 ), 1.0 );",

		"}"

	].join( "\n" )

};
// Author: Aleksandr Albert
// Website: www.routter.co.tt

// Description: A deep water ocean shader set
// based on an implementation of a Tessendorf Waves
// originally presented by David Li ( www.david.li/waves )

// The general method is to apply shaders to simulation Framebuffers
// and then sample these framebuffers when rendering the ocean mesh

// The set uses 7 shaders:

// -- Simulation shaders
// [1] ocean_sim_vertex         -> Vertex shader used to set up a 2x2 simulation plane centered at (0,0)
// [2] ocean_subtransform       -> Fragment shader used to subtransform the mesh (generates the displacement map)
// [3] ocean_initial_spectrum   -> Fragment shader used to set intitial wave frequency at a texel coordinate
// [4] ocean_phase              -> Fragment shader used to set wave phase at a texel coordinate
// [5] ocean_spectrum           -> Fragment shader used to set current wave frequency at a texel coordinate
// [6] ocean_normal             -> Fragment shader used to set face normals at a texel coordinate

// -- Rendering Shader
// [7] ocean_main               -> Vertex and Fragment shader used to create the final render


THREE.ShaderLib[ 'ocean_sim_vertex' ] = {
	vertexShader: [
		'varying vec2 vUV;',

		'void main (void) {',
			'vUV = position.xy * 0.5 + 0.5;',
			'gl_Position = vec4(position, 1.0 );',
		'}'
	].join( '\n' )
};
THREE.ShaderLib[ 'ocean_subtransform' ] = {
	uniforms: {
		"u_input": { value: null },
		"u_transformSize": { value: 512.0 },
		"u_subtransformSize": { value: 250.0 }
	},
	fragmentShader: [
		//GPU FFT using a Stockham formulation

		'precision highp float;',
		'#include <common>',

		'uniform sampler2D u_input;',
		'uniform float u_transformSize;',
		'uniform float u_subtransformSize;',

		'varying vec2 vUV;',

		'vec2 multiplyComplex (vec2 a, vec2 b) {',
			'return vec2(a[0] * b[0] - a[1] * b[1], a[1] * b[0] + a[0] * b[1]);',
		'}',

		'void main (void) {',
			'#ifdef HORIZONTAL',
			'float index = vUV.x * u_transformSize - 0.5;',
			'#else',
			'float index = vUV.y * u_transformSize - 0.5;',
			'#endif',

			'float evenIndex = floor(index / u_subtransformSize) * (u_subtransformSize * 0.5) + mod(index, u_subtransformSize * 0.5);',

			//transform two complex sequences simultaneously
			'#ifdef HORIZONTAL',
			'vec4 even = texture2D(u_input, vec2(evenIndex + 0.5, gl_FragCoord.y) / u_transformSize).rgba;',
			'vec4 odd = texture2D(u_input, vec2(evenIndex + u_transformSize * 0.5 + 0.5, gl_FragCoord.y) / u_transformSize).rgba;',
			'#else',
			'vec4 even = texture2D(u_input, vec2(gl_FragCoord.x, evenIndex + 0.5) / u_transformSize).rgba;',
			'vec4 odd = texture2D(u_input, vec2(gl_FragCoord.x, evenIndex + u_transformSize * 0.5 + 0.5) / u_transformSize).rgba;',
			'#endif',

			'float twiddleArgument = -2.0 * PI * (index / u_subtransformSize);',
			'vec2 twiddle = vec2(cos(twiddleArgument), sin(twiddleArgument));',

			'vec2 outputA = even.xy + multiplyComplex(twiddle, odd.xy);',
			'vec2 outputB = even.zw + multiplyComplex(twiddle, odd.zw);',

			'gl_FragColor = vec4(outputA, outputB);',
		'}'
	].join( '\n' )
};
THREE.ShaderLib[ 'ocean_initial_spectrum' ] = {
	uniforms: {
		"u_wind": { value: new THREE.Vector2( 10.0, 10.0 ) },
		"u_resolution": { value: 512.0 },
		"u_size": { value: 250.0 }
	},
	fragmentShader: [
		'precision highp float;',
		'#include <common>',

		'const float G = 9.81;',
		'const float KM = 370.0;',
		'const float CM = 0.23;',

		'uniform vec2 u_wind;',
		'uniform float u_resolution;',
		'uniform float u_size;',

		'float omega (float k) {',
			'return sqrt(G * k * (1.0 + pow2(k / KM)));',
		'}',

		'float tanh (float x) {',
			'return (1.0 - exp(-2.0 * x)) / (1.0 + exp(-2.0 * x));',
		'}',

		'void main (void) {',
			'vec2 coordinates = gl_FragCoord.xy - 0.5;',

			'float n = (coordinates.x < u_resolution * 0.5) ? coordinates.x : coordinates.x - u_resolution;',
			'float m = (coordinates.y < u_resolution * 0.5) ? coordinates.y : coordinates.y - u_resolution;',

			'vec2 K = (2.0 * PI * vec2(n, m)) / u_size;',
			'float k = length(K);',

			'float l_wind = length(u_wind);',

			'float Omega = 0.84;',
			'float kp = G * pow2(Omega / l_wind);',

			'float c = omega(k) / k;',
			'float cp = omega(kp) / kp;',

			'float Lpm = exp(-1.25 * pow2(kp / k));',
			'float gamma = 1.7;',
			'float sigma = 0.08 * (1.0 + 4.0 * pow(Omega, -3.0));',
			'float Gamma = exp(-pow2(sqrt(k / kp) - 1.0) / 2.0 * pow2(sigma));',
			'float Jp = pow(gamma, Gamma);',
			'float Fp = Lpm * Jp * exp(-Omega / sqrt(10.0) * (sqrt(k / kp) - 1.0));',
			'float alphap = 0.006 * sqrt(Omega);',
			'float Bl = 0.5 * alphap * cp / c * Fp;',

			'float z0 = 0.000037 * pow2(l_wind) / G * pow(l_wind / cp, 0.9);',
			'float uStar = 0.41 * l_wind / log(10.0 / z0);',
			'float alpham = 0.01 * ((uStar < CM) ? (1.0 + log(uStar / CM)) : (1.0 + 3.0 * log(uStar / CM)));',
			'float Fm = exp(-0.25 * pow2(k / KM - 1.0));',
			'float Bh = 0.5 * alpham * CM / c * Fm * Lpm;',

			'float a0 = log(2.0) / 4.0;',
			'float am = 0.13 * uStar / CM;',
			'float Delta = tanh(a0 + 4.0 * pow(c / cp, 2.5) + am * pow(CM / c, 2.5));',

			'float cosPhi = dot(normalize(u_wind), normalize(K));',

			'float S = (1.0 / (2.0 * PI)) * pow(k, -4.0) * (Bl + Bh) * (1.0 + Delta * (2.0 * cosPhi * cosPhi - 1.0));',

			'float dk = 2.0 * PI / u_size;',
			'float h = sqrt(S / 2.0) * dk;',

			'if (K.x == 0.0 && K.y == 0.0) {',
				'h = 0.0;', //no DC term
			'}',
			'gl_FragColor = vec4(h, 0.0, 0.0, 0.0);',
		'}'
	].join( '\n' )
};
THREE.ShaderLib[ 'ocean_phase' ] = {
	uniforms: {
		"u_phases": { value: null },
		"u_deltaTime": { value: null },
		"u_resolution": { value: null },
		"u_size": { value: null }
	},
	fragmentShader: [
		'precision highp float;',
		'#include <common>',

		'const float G = 9.81;',
		'const float KM = 370.0;',

		'varying vec2 vUV;',

		'uniform sampler2D u_phases;',
		'uniform float u_deltaTime;',
		'uniform float u_resolution;',
		'uniform float u_size;',

		'float omega (float k) {',
			'return sqrt(G * k * (1.0 + k * k / KM * KM));',
		'}',

		'void main (void) {',
			'float deltaTime = 1.0 / 60.0;',
			'vec2 coordinates = gl_FragCoord.xy - 0.5;',
			'float n = (coordinates.x < u_resolution * 0.5) ? coordinates.x : coordinates.x - u_resolution;',
			'float m = (coordinates.y < u_resolution * 0.5) ? coordinates.y : coordinates.y - u_resolution;',
			'vec2 waveVector = (2.0 * PI * vec2(n, m)) / u_size;',

			'float phase = texture2D(u_phases, vUV).r;',
			'float deltaPhase = omega(length(waveVector)) * u_deltaTime;',
			'phase = mod(phase + deltaPhase, 2.0 * PI);',

			'gl_FragColor = vec4(phase, 0.0, 0.0, 0.0);',
		'}'
	].join( '\n' )
};
THREE.ShaderLib[ 'ocean_spectrum' ] = {
	uniforms: {
		"u_size": { value: null },
		"u_resolution": { value: null },
		"u_choppiness": { value: null },
		"u_phases": { value: null },
		"u_initialSpectrum": { value: null }
	},
	fragmentShader: [
		'precision highp float;',
		'#include <common>',

		'const float G = 9.81;',
		'const float KM = 370.0;',

		'varying vec2 vUV;',

		'uniform float u_size;',
		'uniform float u_resolution;',
		'uniform float u_choppiness;',
		'uniform sampler2D u_phases;',
		'uniform sampler2D u_initialSpectrum;',

		'vec2 multiplyComplex (vec2 a, vec2 b) {',
			'return vec2(a[0] * b[0] - a[1] * b[1], a[1] * b[0] + a[0] * b[1]);',
		'}',

		'vec2 multiplyByI (vec2 z) {',
			'return vec2(-z[1], z[0]);',
		'}',

		'float omega (float k) {',
			'return sqrt(G * k * (1.0 + k * k / KM * KM));',
		'}',

		'void main (void) {',
			'vec2 coordinates = gl_FragCoord.xy - 0.5;',
			'float n = (coordinates.x < u_resolution * 0.5) ? coordinates.x : coordinates.x - u_resolution;',
			'float m = (coordinates.y < u_resolution * 0.5) ? coordinates.y : coordinates.y - u_resolution;',
			'vec2 waveVector = (2.0 * PI * vec2(n, m)) / u_size;',

			'float phase = texture2D(u_phases, vUV).r;',
			'vec2 phaseVector = vec2(cos(phase), sin(phase));',

			'vec2 h0 = texture2D(u_initialSpectrum, vUV).rg;',
			'vec2 h0Star = texture2D(u_initialSpectrum, vec2(1.0 - vUV + 1.0 / u_resolution)).rg;',
			'h0Star.y *= -1.0;',

			'vec2 h = multiplyComplex(h0, phaseVector) + multiplyComplex(h0Star, vec2(phaseVector.x, -phaseVector.y));',

			'vec2 hX = -multiplyByI(h * (waveVector.x / length(waveVector))) * u_choppiness;',
			'vec2 hZ = -multiplyByI(h * (waveVector.y / length(waveVector))) * u_choppiness;',

			//no DC term
			'if (waveVector.x == 0.0 && waveVector.y == 0.0) {',
				'h = vec2(0.0);',
				'hX = vec2(0.0);',
				'hZ = vec2(0.0);',
			'}',

			'gl_FragColor = vec4(hX + multiplyByI(h), hZ);',
		'}'
	].join( '\n' )
};
THREE.ShaderLib[ 'ocean_normals' ] = {
	uniforms: {
		"u_displacementMap": { value: null },
		"u_resolution": { value: null },
		"u_size": { value: null }
	},
	fragmentShader: [
		'precision highp float;',

		'varying vec2 vUV;',

		'uniform sampler2D u_displacementMap;',
		'uniform float u_resolution;',
		'uniform float u_size;',

		'void main (void) {',
			'float texel = 1.0 / u_resolution;',
			'float texelSize = u_size / u_resolution;',

			'vec3 center = texture2D(u_displacementMap, vUV).rgb;',
			'vec3 right = vec3(texelSize, 0.0, 0.0) + texture2D(u_displacementMap, vUV + vec2(texel, 0.0)).rgb - center;',
			'vec3 left = vec3(-texelSize, 0.0, 0.0) + texture2D(u_displacementMap, vUV + vec2(-texel, 0.0)).rgb - center;',
			'vec3 top = vec3(0.0, 0.0, -texelSize) + texture2D(u_displacementMap, vUV + vec2(0.0, -texel)).rgb - center;',
			'vec3 bottom = vec3(0.0, 0.0, texelSize) + texture2D(u_displacementMap, vUV + vec2(0.0, texel)).rgb - center;',

			'vec3 topRight = cross(right, top);',
			'vec3 topLeft = cross(top, left);',
			'vec3 bottomLeft = cross(left, bottom);',
			'vec3 bottomRight = cross(bottom, right);',

			'gl_FragColor = vec4(normalize(topRight + topLeft + bottomLeft + bottomRight), 1.0);',
		'}'
	].join( '\n' )
};
THREE.ShaderLib[ 'ocean_main' ] = {
	uniforms: {
		"u_displacementMap": { value: null },
		"u_normalMap": { value: null },
		"u_geometrySize": { value: null },
		"u_size": { value: null },
		"u_projectionMatrix": { value: null },
		"u_viewMatrix": { value: null },
		"u_cameraPosition": { value: null },
		"u_skyColor": { value: null },
		"u_oceanColor": { value: null },
		"u_sunDirection": { value: null },
		"u_exposure": { value: null }
	},
	vertexShader: [
		'precision highp float;',

		'varying vec3 vPos;',
		'varying vec2 vUV;',

		'uniform mat4 u_projectionMatrix;',
		'uniform mat4 u_viewMatrix;',
		'uniform float u_size;',
		'uniform float u_geometrySize;',
		'uniform sampler2D u_displacementMap;',

		'void main (void) {',
			'vec3 newPos = position + texture2D(u_displacementMap, uv).rgb * (u_geometrySize / u_size);',
			'vPos = newPos;',
			'vUV = uv;',
			'gl_Position = u_projectionMatrix * u_viewMatrix * vec4(newPos, 1.0);',
		'}'
	].join( '\n' ),
	fragmentShader: [
		'precision highp float;',

		'varying vec3 vPos;',
		'varying vec2 vUV;',

		'uniform sampler2D u_displacementMap;',
		'uniform sampler2D u_normalMap;',
		'uniform vec3 u_cameraPosition;',
		'uniform vec3 u_oceanColor;',
		'uniform vec3 u_skyColor;',
		'uniform vec3 u_sunDirection;',
		'uniform float u_exposure;',

		'vec3 hdr (vec3 color, float exposure) {',
			'return 1.0 - exp(-color * exposure);',
		'}',

		'void main (void) {',
			'vec3 normal = texture2D(u_normalMap, vUV).rgb;',

			'vec3 view = normalize(u_cameraPosition - vPos);',
			'float fresnel = 0.02 + 0.98 * pow(1.0 - dot(normal, view), 5.0);',
			'vec3 sky = fresnel * u_skyColor;',

			'float diffuse = clamp(dot(normal, normalize(u_sunDirection)), 0.0, 1.0);',
			'vec3 water = (1.0 - fresnel) * u_oceanColor * u_skyColor * diffuse;',

			'vec3 color = sky + water;',

			'gl_FragColor = vec4(hdr(color, u_exposure), 1.0);',
		'}'
	].join( '\n' )
};
// Parallax Occlusion shaders from
//    http://sunandblackcat.com/tipFullView.php?topicid=28
// No tangent-space transforms logic based on
//   http://mmikkelsen3d.blogspot.sk/2012/02/parallaxpoc-mapping-and-no-tangent.html

THREE.ParallaxShader = {
	// Ordered from fastest to best quality.
	modes: {
		none:  'NO_PARALLAX',
		basic: 'USE_BASIC_PARALLAX',
		steep: 'USE_STEEP_PARALLAX',
		occlusion: 'USE_OCLUSION_PARALLAX', // a.k.a. POM
		relief: 'USE_RELIEF_PARALLAX'
	},

	uniforms: {
		"bumpMap": { value: null },
		"map": { value: null },
		"parallaxScale": { value: null },
		"parallaxMinLayers": { value: null },
		"parallaxMaxLayers": { value: null }
	},

	vertexShader: [
		"varying vec2 vUv;",
		"varying vec3 vViewPosition;",
		"varying vec3 vNormal;",

		"void main() {",

			"vUv = uv;",
			"vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",
			"vViewPosition = -mvPosition.xyz;",
			"vNormal = normalize( normalMatrix * normal );",
			"gl_Position = projectionMatrix * mvPosition;",

		"}"

  ].join( "\n" ),

	fragmentShader: [
		"uniform sampler2D bumpMap;",
		"uniform sampler2D map;",

		"uniform float parallaxScale;",
		"uniform float parallaxMinLayers;",
		"uniform float parallaxMaxLayers;",

		"varying vec2 vUv;",
		"varying vec3 vViewPosition;",
		"varying vec3 vNormal;",

		"#ifdef USE_BASIC_PARALLAX",

			"vec2 parallaxMap( in vec3 V ) {",

				"float initialHeight = texture2D( bumpMap, vUv ).r;",

				// No Offset Limitting: messy, floating output at grazing angles.
				//"vec2 texCoordOffset = parallaxScale * V.xy / V.z * initialHeight;",

				// Offset Limiting
				"vec2 texCoordOffset = parallaxScale * V.xy * initialHeight;",
				"return vUv - texCoordOffset;",

			"}",

		"#else",

			"vec2 parallaxMap( in vec3 V ) {",

				// Determine number of layers from angle between V and N
				"float numLayers = mix( parallaxMaxLayers, parallaxMinLayers, abs( dot( vec3( 0.0, 0.0, 1.0 ), V ) ) );",

				"float layerHeight = 1.0 / numLayers;",
				"float currentLayerHeight = 0.0;",
				// Shift of texture coordinates for each iteration
				"vec2 dtex = parallaxScale * V.xy / V.z / numLayers;",

				"vec2 currentTextureCoords = vUv;",

				"float heightFromTexture = texture2D( bumpMap, currentTextureCoords ).r;",

				// while ( heightFromTexture > currentLayerHeight )
				// Infinite loops are not well supported. Do a "large" finite
				// loop, but not too large, as it slows down some compilers.
				"for ( int i = 0; i < 30; i += 1 ) {",
					"if ( heightFromTexture <= currentLayerHeight ) {",
						"break;",
					"}",
					"currentLayerHeight += layerHeight;",
					// Shift texture coordinates along vector V
					"currentTextureCoords -= dtex;",
					"heightFromTexture = texture2D( bumpMap, currentTextureCoords ).r;",
				"}",

				"#ifdef USE_STEEP_PARALLAX",

					"return currentTextureCoords;",

				"#elif defined( USE_RELIEF_PARALLAX )",

					"vec2 deltaTexCoord = dtex / 2.0;",
					"float deltaHeight = layerHeight / 2.0;",

					// Return to the mid point of previous layer
					"currentTextureCoords += deltaTexCoord;",
					"currentLayerHeight -= deltaHeight;",

					// Binary search to increase precision of Steep Parallax Mapping
					"const int numSearches = 5;",
					"for ( int i = 0; i < numSearches; i += 1 ) {",

						"deltaTexCoord /= 2.0;",
						"deltaHeight /= 2.0;",
						"heightFromTexture = texture2D( bumpMap, currentTextureCoords ).r;",
						// Shift along or against vector V
						"if( heightFromTexture > currentLayerHeight ) {", // Below the surface

							"currentTextureCoords -= deltaTexCoord;",
							"currentLayerHeight += deltaHeight;",

						"} else {", // above the surface

							"currentTextureCoords += deltaTexCoord;",
							"currentLayerHeight -= deltaHeight;",

						"}",

					"}",
					"return currentTextureCoords;",

				"#elif defined( USE_OCLUSION_PARALLAX )",

					"vec2 prevTCoords = currentTextureCoords + dtex;",

					// Heights for linear interpolation
					"float nextH = heightFromTexture - currentLayerHeight;",
					"float prevH = texture2D( bumpMap, prevTCoords ).r - currentLayerHeight + layerHeight;",

					// Proportions for linear interpolation
					"float weight = nextH / ( nextH - prevH );",

					// Interpolation of texture coordinates
					"return prevTCoords * weight + currentTextureCoords * ( 1.0 - weight );",

				"#else", // NO_PARALLAX

					"return vUv;",

				"#endif",

			"}",
		"#endif",

		"vec2 perturbUv( vec3 surfPosition, vec3 surfNormal, vec3 viewPosition ) {",

 			"vec2 texDx = dFdx( vUv );",
			"vec2 texDy = dFdy( vUv );",

			"vec3 vSigmaX = dFdx( surfPosition );",
			"vec3 vSigmaY = dFdy( surfPosition );",
			"vec3 vR1 = cross( vSigmaY, surfNormal );",
			"vec3 vR2 = cross( surfNormal, vSigmaX );",
			"float fDet = dot( vSigmaX, vR1 );",

			"vec2 vProjVscr = ( 1.0 / fDet ) * vec2( dot( vR1, viewPosition ), dot( vR2, viewPosition ) );",
			"vec3 vProjVtex;",
			"vProjVtex.xy = texDx * vProjVscr.x + texDy * vProjVscr.y;",
			"vProjVtex.z = dot( surfNormal, viewPosition );",

			"return parallaxMap( vProjVtex );",
		"}",

		"void main() {",

			"vec2 mapUv = perturbUv( -vViewPosition, normalize( vNormal ), normalize( vViewPosition ) );",
			"gl_FragColor = texture2D( map, mapUv );",

		"}"

  ].join( "\n" )

};
/**
 * @author wongbryan / http://wongbryan.github.io
 *
 * Pixelation shader
 */

THREE.PixelShader = {

	uniforms: {

		"tDiffuse": { value: null },
		"resolution": { value: null },
		"pixelSize": { value: 1. },

	},

	vertexShader: [

		"varying highp vec2 vUv;",

		"void main() {",

		"vUv = uv;",
		"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join( "\n" ),

	fragmentShader: [

		"uniform sampler2D tDiffuse;",
		"uniform float pixelSize;",
		"uniform vec2 resolution;",

		"varying highp vec2 vUv;",

		"void main(){",

		"vec2 dxy = pixelSize / resolution;",
		"vec2 coord = dxy * floor( vUv / dxy );",
		"gl_FragColor = texture2D(tDiffuse, coord);",

		"}"

	].join( "\n" )
};
/**
 * @author felixturner / http://airtight.cc/
 *
 * RGB Shift Shader
 * Shifts red and blue channels from center in opposite directions
 * Ported from http://kriss.cx/tom/2009/05/rgb-shift/
 * by Tom Butterworth / http://kriss.cx/tom/
 *
 * amount: shift distance (1 is width of input)
 * angle: shift angle in radians
 */

THREE.RGBShiftShader = {

	uniforms: {

		"tDiffuse": { value: null },
		"amount":   { value: 0.005 },
		"angle":    { value: 0.0 }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join( "\n" ),

	fragmentShader: [

		"uniform sampler2D tDiffuse;",
		"uniform float amount;",
		"uniform float angle;",

		"varying vec2 vUv;",

		"void main() {",

			"vec2 offset = amount * vec2( cos(angle), sin(angle));",
			"vec4 cr = texture2D(tDiffuse, vUv + offset);",
			"vec4 cga = texture2D(tDiffuse, vUv);",
			"vec4 cb = texture2D(tDiffuse, vUv - offset);",
			"gl_FragColor = vec4(cr.r, cga.g, cb.b, cga.a);",

		"}"

	].join( "\n" )

};
THREE.SAOShader = {
	defines: {
		'NUM_SAMPLES': 7,
		'NUM_RINGS': 4,
		'NORMAL_TEXTURE': 0,
		'DIFFUSE_TEXTURE': 0,
		'DEPTH_PACKING': 1,
		'PERSPECTIVE_CAMERA': 1
	},
	uniforms: {

		'tDepth': { type: 't', value: null },
		'tDiffuse': { type: 't', value: null },
		'tNormal': { type: 't', value: null },
		'size': { type: 'v2', value: new THREE.Vector2( 512, 512 ) },

		'cameraNear': { type: 'f', value: 1 },
		'cameraFar': { type: 'f', value: 100 },
		'cameraProjectionMatrix': { type: 'm4', value: new THREE.Matrix4() },
		'cameraInverseProjectionMatrix': { type: 'm4', value: new THREE.Matrix4() },

		'scale': { type: 'f', value: 1.0 },
		'intensity': { type: 'f', value: 0.1 },
		'bias': { type: 'f', value: 0.5 },

		'minResolution': { type: 'f', value: 0.0 },
		'kernelRadius': { type: 'f', value: 100.0 },
		'randomSeed': { type: 'f', value: 0.0 }
	},
	vertexShader: [
		"varying vec2 vUv;",

		"void main() {",
		"	vUv = uv;",
		"	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
		"}"

	].join( "\n" ),
	fragmentShader: [
		"#include <common>",

		"varying vec2 vUv;",

		"#if DIFFUSE_TEXTURE == 1",
		"uniform sampler2D tDiffuse;",
		"#endif",

		"uniform sampler2D tDepth;",

		"#if NORMAL_TEXTURE == 1",
		"uniform sampler2D tNormal;",
		"#endif",

		"uniform float cameraNear;",
		"uniform float cameraFar;",
		"uniform mat4 cameraProjectionMatrix;",
		"uniform mat4 cameraInverseProjectionMatrix;",

		"uniform float scale;",
		"uniform float intensity;",
		"uniform float bias;",
		"uniform float kernelRadius;",
		"uniform float minResolution;",
		"uniform vec2 size;",
		"uniform float randomSeed;",

		"// RGBA depth",

		"#include <packing>",

		"vec4 getDefaultColor( const in vec2 screenPosition ) {",
		"	#if DIFFUSE_TEXTURE == 1",
		"	return texture2D( tDiffuse, vUv );",
		"	#else",
		"	return vec4( 1.0 );",
		"	#endif",
		"}",

		"float getDepth( const in vec2 screenPosition ) {",
		"	#if DEPTH_PACKING == 1",
		"	return unpackRGBAToDepth( texture2D( tDepth, screenPosition ) );",
		"	#else",
		"	return texture2D( tDepth, screenPosition ).x;",
		"	#endif",
		"}",

		"float getViewZ( const in float depth ) {",
		"	#if PERSPECTIVE_CAMERA == 1",
		"	return perspectiveDepthToViewZ( depth, cameraNear, cameraFar );",
		"	#else",
		"	return orthographicDepthToViewZ( depth, cameraNear, cameraFar );",
		"	#endif",
		"}",

		"vec3 getViewPosition( const in vec2 screenPosition, const in float depth, const in float viewZ ) {",
		"	float clipW = cameraProjectionMatrix[2][3] * viewZ + cameraProjectionMatrix[3][3];",
		"	vec4 clipPosition = vec4( ( vec3( screenPosition, depth ) - 0.5 ) * 2.0, 1.0 );",
		"	clipPosition *= clipW; // unprojection.",

		"	return ( cameraInverseProjectionMatrix * clipPosition ).xyz;",
		"}",

		"vec3 getViewNormal( const in vec3 viewPosition, const in vec2 screenPosition ) {",
		"	#if NORMAL_TEXTURE == 1",
		"	return unpackRGBToNormal( texture2D( tNormal, screenPosition ).xyz );",
		"	#else",
		"	return normalize( cross( dFdx( viewPosition ), dFdy( viewPosition ) ) );",
		"	#endif",
		"}",

		"float scaleDividedByCameraFar;",
		"float minResolutionMultipliedByCameraFar;",

		"float getOcclusion( const in vec3 centerViewPosition, const in vec3 centerViewNormal, const in vec3 sampleViewPosition ) {",
		"	vec3 viewDelta = sampleViewPosition - centerViewPosition;",
		"	float viewDistance = length( viewDelta );",
		"	float scaledScreenDistance = scaleDividedByCameraFar * viewDistance;",

		"	return max(0.0, (dot(centerViewNormal, viewDelta) - minResolutionMultipliedByCameraFar) / scaledScreenDistance - bias) / (1.0 + pow2( scaledScreenDistance ) );",
		"}",

		"// moving costly divides into consts",
		"const float ANGLE_STEP = PI2 * float( NUM_RINGS ) / float( NUM_SAMPLES );",
		"const float INV_NUM_SAMPLES = 1.0 / float( NUM_SAMPLES );",

		"float getAmbientOcclusion( const in vec3 centerViewPosition ) {",
		"	// precompute some variables require in getOcclusion.",
		"	scaleDividedByCameraFar = scale / cameraFar;",
		"	minResolutionMultipliedByCameraFar = minResolution * cameraFar;",
		"	vec3 centerViewNormal = getViewNormal( centerViewPosition, vUv );",

		"	// jsfiddle that shows sample pattern: https://jsfiddle.net/a16ff1p7/",
		"	float angle = rand( vUv + randomSeed ) * PI2;",
		"	vec2 radius = vec2( kernelRadius * INV_NUM_SAMPLES ) / size;",
		"	vec2 radiusStep = radius;",

		"	float occlusionSum = 0.0;",
		"	float weightSum = 0.0;",

		"	for( int i = 0; i < NUM_SAMPLES; i ++ ) {",
		"		vec2 sampleUv = vUv + vec2( cos( angle ), sin( angle ) ) * radius;",
		"		radius += radiusStep;",
		"		angle += ANGLE_STEP;",

		"		float sampleDepth = getDepth( sampleUv );",
		"		if( sampleDepth >= ( 1.0 - EPSILON ) ) {",
		"			continue;",
		"		}",

		"		float sampleViewZ = getViewZ( sampleDepth );",
		"		vec3 sampleViewPosition = getViewPosition( sampleUv, sampleDepth, sampleViewZ );",
		"		occlusionSum += getOcclusion( centerViewPosition, centerViewNormal, sampleViewPosition );",
		"		weightSum += 1.0;",
		"	}",

		"	if( weightSum == 0.0 ) discard;",

		"	return occlusionSum * ( intensity / weightSum );",
		"}",


		"void main() {",
		"	float centerDepth = getDepth( vUv );",
		"	if( centerDepth >= ( 1.0 - EPSILON ) ) {",
		"		discard;",
		"	}",

		"	float centerViewZ = getViewZ( centerDepth );",
		"	vec3 viewPosition = getViewPosition( vUv, centerDepth, centerViewZ );",

		"	float ambientOcclusion = getAmbientOcclusion( viewPosition );",

		"	gl_FragColor = getDefaultColor( vUv );",
		"	gl_FragColor.xyz *=  1.0 - ambientOcclusion;",
		"}"
	].join( "\n" )
};
/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Sepia tone shader
 * based on glfx.js sepia shader
 * https://github.com/evanw/glfx.js
 */

THREE.SepiaShader = {

	uniforms: {

		"tDiffuse": { value: null },
		"amount":   { value: 1.0 }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join( "\n" ),

	fragmentShader: [

		"uniform float amount;",

		"uniform sampler2D tDiffuse;",

		"varying vec2 vUv;",

		"void main() {",

			"vec4 color = texture2D( tDiffuse, vUv );",
			"vec3 c = color.rgb;",

			"color.r = dot( c, vec3( 1.0 - 0.607 * amount, 0.769 * amount, 0.189 * amount ) );",
			"color.g = dot( c, vec3( 0.349 * amount, 1.0 - 0.314 * amount, 0.168 * amount ) );",
			"color.b = dot( c, vec3( 0.272 * amount, 0.534 * amount, 1.0 - 0.869 * amount ) );",

			"gl_FragColor = vec4( min( vec3( 1.0 ), color.rgb ), color.a );",

		"}"

	].join( "\n" )

};
/**
 * @author mpk / http://polko.me/
 *
 * WebGL port of Subpixel Morphological Antialiasing (SMAA) v2.8
 * Preset: SMAA 1x Medium (with color edge detection)
 * https://github.com/iryoku/smaa/releases/tag/v2.8
 */

THREE.SMAAShader = [ {

	defines: {

		"SMAA_THRESHOLD": "0.1"

	},

	uniforms: {

		"tDiffuse":		{ value: null },
		"resolution":	{ value: new THREE.Vector2( 1 / 1024, 1 / 512 ) }

	},

	vertexShader: [

		"uniform vec2 resolution;",

		"varying vec2 vUv;",
		"varying vec4 vOffset[ 3 ];",

		"void SMAAEdgeDetectionVS( vec2 texcoord ) {",
			"vOffset[ 0 ] = texcoord.xyxy + resolution.xyxy * vec4( -1.0, 0.0, 0.0,  1.0 );", // WebGL port note: Changed sign in W component
			"vOffset[ 1 ] = texcoord.xyxy + resolution.xyxy * vec4(  1.0, 0.0, 0.0, -1.0 );", // WebGL port note: Changed sign in W component
			"vOffset[ 2 ] = texcoord.xyxy + resolution.xyxy * vec4( -2.0, 0.0, 0.0,  2.0 );", // WebGL port note: Changed sign in W component
		"}",

		"void main() {",

			"vUv = uv;",

			"SMAAEdgeDetectionVS( vUv );",

			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join("\n"),

	fragmentShader: [

		"uniform sampler2D tDiffuse;",

		"varying vec2 vUv;",
		"varying vec4 vOffset[ 3 ];",

		"vec4 SMAAColorEdgeDetectionPS( vec2 texcoord, vec4 offset[3], sampler2D colorTex ) {",
			"vec2 threshold = vec2( SMAA_THRESHOLD, SMAA_THRESHOLD );",

			// Calculate color deltas:
			"vec4 delta;",
			"vec3 C = texture2D( colorTex, texcoord ).rgb;",

			"vec3 Cleft = texture2D( colorTex, offset[0].xy ).rgb;",
			"vec3 t = abs( C - Cleft );",
			"delta.x = max( max( t.r, t.g ), t.b );",

			"vec3 Ctop = texture2D( colorTex, offset[0].zw ).rgb;",
			"t = abs( C - Ctop );",
			"delta.y = max( max( t.r, t.g ), t.b );",

			// We do the usual threshold:
			"vec2 edges = step( threshold, delta.xy );",

			// Then discard if there is no edge:
			"if ( dot( edges, vec2( 1.0, 1.0 ) ) == 0.0 )",
				"discard;",

			// Calculate right and bottom deltas:
			"vec3 Cright = texture2D( colorTex, offset[1].xy ).rgb;",
			"t = abs( C - Cright );",
			"delta.z = max( max( t.r, t.g ), t.b );",

			"vec3 Cbottom  = texture2D( colorTex, offset[1].zw ).rgb;",
			"t = abs( C - Cbottom );",
			"delta.w = max( max( t.r, t.g ), t.b );",

			// Calculate the maximum delta in the direct neighborhood:
			"float maxDelta = max( max( max( delta.x, delta.y ), delta.z ), delta.w );",

			// Calculate left-left and top-top deltas:
			"vec3 Cleftleft  = texture2D( colorTex, offset[2].xy ).rgb;",
			"t = abs( C - Cleftleft );",
			"delta.z = max( max( t.r, t.g ), t.b );",

			"vec3 Ctoptop = texture2D( colorTex, offset[2].zw ).rgb;",
			"t = abs( C - Ctoptop );",
			"delta.w = max( max( t.r, t.g ), t.b );",

			// Calculate the final maximum delta:
			"maxDelta = max( max( maxDelta, delta.z ), delta.w );",

			// Local contrast adaptation in action:
			"edges.xy *= step( 0.5 * maxDelta, delta.xy );",

			"return vec4( edges, 0.0, 0.0 );",
		"}",

		"void main() {",

			"gl_FragColor = SMAAColorEdgeDetectionPS( vUv, vOffset, tDiffuse );",

		"}"

	].join("\n")

}, {

	defines: {

		"SMAA_MAX_SEARCH_STEPS":		"8",
		"SMAA_AREATEX_MAX_DISTANCE":	"16",
		"SMAA_AREATEX_PIXEL_SIZE":		"( 1.0 / vec2( 160.0, 560.0 ) )",
		"SMAA_AREATEX_SUBTEX_SIZE":		"( 1.0 / 7.0 )"

	},

	uniforms: {

		"tDiffuse":		{ value: null },
		"tArea":		{ value: null },
		"tSearch":		{ value: null },
		"resolution":	{ value: new THREE.Vector2( 1 / 1024, 1 / 512 ) }

	},

	vertexShader: [

		"uniform vec2 resolution;",

		"varying vec2 vUv;",
		"varying vec4 vOffset[ 3 ];",
		"varying vec2 vPixcoord;",

		"void SMAABlendingWeightCalculationVS( vec2 texcoord ) {",
			"vPixcoord = texcoord / resolution;",

			// We will use these offsets for the searches later on (see @PSEUDO_GATHER4):
			"vOffset[ 0 ] = texcoord.xyxy + resolution.xyxy * vec4( -0.25, 0.125, 1.25, 0.125 );", // WebGL port note: Changed sign in Y and W components
			"vOffset[ 1 ] = texcoord.xyxy + resolution.xyxy * vec4( -0.125, 0.25, -0.125, -1.25 );", // WebGL port note: Changed sign in Y and W components

			// And these for the searches, they indicate the ends of the loops:
			"vOffset[ 2 ] = vec4( vOffset[ 0 ].xz, vOffset[ 1 ].yw ) + vec4( -2.0, 2.0, -2.0, 2.0 ) * resolution.xxyy * float( SMAA_MAX_SEARCH_STEPS );",

		"}",

		"void main() {",

			"vUv = uv;",

			"SMAABlendingWeightCalculationVS( vUv );",

			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join("\n"),

	fragmentShader: [

		"#define SMAASampleLevelZeroOffset( tex, coord, offset ) texture2D( tex, coord + float( offset ) * resolution, 0.0 )",

		"uniform sampler2D tDiffuse;",
		"uniform sampler2D tArea;",
		"uniform sampler2D tSearch;",
		"uniform vec2 resolution;",

		"varying vec2 vUv;",
		"varying vec4 vOffset[3];",
		"varying vec2 vPixcoord;",

		"vec2 round( vec2 x ) {",
			"return sign( x ) * floor( abs( x ) + 0.5 );",
		"}",

		"float SMAASearchLength( sampler2D searchTex, vec2 e, float bias, float scale ) {",
			// Not required if searchTex accesses are set to point:
			// float2 SEARCH_TEX_PIXEL_SIZE = 1.0 / float2(66.0, 33.0);
			// e = float2(bias, 0.0) + 0.5 * SEARCH_TEX_PIXEL_SIZE +
			//     e * float2(scale, 1.0) * float2(64.0, 32.0) * SEARCH_TEX_PIXEL_SIZE;
			"e.r = bias + e.r * scale;",
			"return 255.0 * texture2D( searchTex, e, 0.0 ).r;",
		"}",

		"float SMAASearchXLeft( sampler2D edgesTex, sampler2D searchTex, vec2 texcoord, float end ) {",
			/**
			* @PSEUDO_GATHER4
			* This texcoord has been offset by (-0.25, -0.125) in the vertex shader to
			* sample between edge, thus fetching four edges in a row.
			* Sampling with different offsets in each direction allows to disambiguate
			* which edges are active from the four fetched ones.
			*/
			"vec2 e = vec2( 0.0, 1.0 );",

			"for ( int i = 0; i < SMAA_MAX_SEARCH_STEPS; i ++ ) {", // WebGL port note: Changed while to for
				"e = texture2D( edgesTex, texcoord, 0.0 ).rg;",
				"texcoord -= vec2( 2.0, 0.0 ) * resolution;",
				"if ( ! ( texcoord.x > end && e.g > 0.8281 && e.r == 0.0 ) ) break;",
			"}",

			// We correct the previous (-0.25, -0.125) offset we applied:
			"texcoord.x += 0.25 * resolution.x;",

			// The searches are bias by 1, so adjust the coords accordingly:
			"texcoord.x += resolution.x;",

			// Disambiguate the length added by the last step:
			"texcoord.x += 2.0 * resolution.x;", // Undo last step
			"texcoord.x -= resolution.x * SMAASearchLength(searchTex, e, 0.0, 0.5);",

			"return texcoord.x;",
		"}",

		"float SMAASearchXRight( sampler2D edgesTex, sampler2D searchTex, vec2 texcoord, float end ) {",
			"vec2 e = vec2( 0.0, 1.0 );",

			"for ( int i = 0; i < SMAA_MAX_SEARCH_STEPS; i ++ ) {", // WebGL port note: Changed while to for
				"e = texture2D( edgesTex, texcoord, 0.0 ).rg;",
				"texcoord += vec2( 2.0, 0.0 ) * resolution;",
				"if ( ! ( texcoord.x < end && e.g > 0.8281 && e.r == 0.0 ) ) break;",
			"}",

			"texcoord.x -= 0.25 * resolution.x;",
			"texcoord.x -= resolution.x;",
			"texcoord.x -= 2.0 * resolution.x;",
			"texcoord.x += resolution.x * SMAASearchLength( searchTex, e, 0.5, 0.5 );",

			"return texcoord.x;",
		"}",

		"float SMAASearchYUp( sampler2D edgesTex, sampler2D searchTex, vec2 texcoord, float end ) {",
			"vec2 e = vec2( 1.0, 0.0 );",

			"for ( int i = 0; i < SMAA_MAX_SEARCH_STEPS; i ++ ) {", // WebGL port note: Changed while to for
				"e = texture2D( edgesTex, texcoord, 0.0 ).rg;",
				"texcoord += vec2( 0.0, 2.0 ) * resolution;", // WebGL port note: Changed sign
				"if ( ! ( texcoord.y > end && e.r > 0.8281 && e.g == 0.0 ) ) break;",
			"}",

			"texcoord.y -= 0.25 * resolution.y;", // WebGL port note: Changed sign
			"texcoord.y -= resolution.y;", // WebGL port note: Changed sign
			"texcoord.y -= 2.0 * resolution.y;", // WebGL port note: Changed sign
			"texcoord.y += resolution.y * SMAASearchLength( searchTex, e.gr, 0.0, 0.5 );", // WebGL port note: Changed sign

			"return texcoord.y;",
		"}",

		"float SMAASearchYDown( sampler2D edgesTex, sampler2D searchTex, vec2 texcoord, float end ) {",
			"vec2 e = vec2( 1.0, 0.0 );",

			"for ( int i = 0; i < SMAA_MAX_SEARCH_STEPS; i ++ ) {", // WebGL port note: Changed while to for
				"e = texture2D( edgesTex, texcoord, 0.0 ).rg;",
				"texcoord -= vec2( 0.0, 2.0 ) * resolution;", // WebGL port note: Changed sign
				"if ( ! ( texcoord.y < end && e.r > 0.8281 && e.g == 0.0 ) ) break;",
			"}",

			"texcoord.y += 0.25 * resolution.y;", // WebGL port note: Changed sign
			"texcoord.y += resolution.y;", // WebGL port note: Changed sign
			"texcoord.y += 2.0 * resolution.y;", // WebGL port note: Changed sign
			"texcoord.y -= resolution.y * SMAASearchLength( searchTex, e.gr, 0.5, 0.5 );", // WebGL port note: Changed sign

			"return texcoord.y;",
		"}",

		"vec2 SMAAArea( sampler2D areaTex, vec2 dist, float e1, float e2, float offset ) {",
			// Rounding prevents precision errors of bilinear filtering:
			"vec2 texcoord = float( SMAA_AREATEX_MAX_DISTANCE ) * round( 4.0 * vec2( e1, e2 ) ) + dist;",

			// We do a scale and bias for mapping to texel space:
			"texcoord = SMAA_AREATEX_PIXEL_SIZE * texcoord + ( 0.5 * SMAA_AREATEX_PIXEL_SIZE );",

			// Move to proper place, according to the subpixel offset:
			"texcoord.y += SMAA_AREATEX_SUBTEX_SIZE * offset;",

			"return texture2D( areaTex, texcoord, 0.0 ).rg;",
		"}",

		"vec4 SMAABlendingWeightCalculationPS( vec2 texcoord, vec2 pixcoord, vec4 offset[ 3 ], sampler2D edgesTex, sampler2D areaTex, sampler2D searchTex, ivec4 subsampleIndices ) {",
			"vec4 weights = vec4( 0.0, 0.0, 0.0, 0.0 );",

			"vec2 e = texture2D( edgesTex, texcoord ).rg;",

			"if ( e.g > 0.0 ) {", // Edge at north
				"vec2 d;",

				// Find the distance to the left:
				"vec2 coords;",
				"coords.x = SMAASearchXLeft( edgesTex, searchTex, offset[ 0 ].xy, offset[ 2 ].x );",
				"coords.y = offset[ 1 ].y;", // offset[1].y = texcoord.y - 0.25 * resolution.y (@CROSSING_OFFSET)
				"d.x = coords.x;",

				// Now fetch the left crossing edges, two at a time using bilinear
				// filtering. Sampling at -0.25 (see @CROSSING_OFFSET) enables to
				// discern what value each edge has:
				"float e1 = texture2D( edgesTex, coords, 0.0 ).r;",

				// Find the distance to the right:
				"coords.x = SMAASearchXRight( edgesTex, searchTex, offset[ 0 ].zw, offset[ 2 ].y );",
				"d.y = coords.x;",

				// We want the distances to be in pixel units (doing this here allow to
				// better interleave arithmetic and memory accesses):
				"d = d / resolution.x - pixcoord.x;",

				// SMAAArea below needs a sqrt, as the areas texture is compressed
				// quadratically:
				"vec2 sqrt_d = sqrt( abs( d ) );",

				// Fetch the right crossing edges:
				"coords.y -= 1.0 * resolution.y;", // WebGL port note: Added
				"float e2 = SMAASampleLevelZeroOffset( edgesTex, coords, ivec2( 1, 0 ) ).r;",

				// Ok, we know how this pattern looks like, now it is time for getting
				// the actual area:
				"weights.rg = SMAAArea( areaTex, sqrt_d, e1, e2, float( subsampleIndices.y ) );",
			"}",

			"if ( e.r > 0.0 ) {", // Edge at west
				"vec2 d;",

				// Find the distance to the top:
				"vec2 coords;",

				"coords.y = SMAASearchYUp( edgesTex, searchTex, offset[ 1 ].xy, offset[ 2 ].z );",
				"coords.x = offset[ 0 ].x;", // offset[1].x = texcoord.x - 0.25 * resolution.x;
				"d.x = coords.y;",

				// Fetch the top crossing edges:
				"float e1 = texture2D( edgesTex, coords, 0.0 ).g;",

				// Find the distance to the bottom:
				"coords.y = SMAASearchYDown( edgesTex, searchTex, offset[ 1 ].zw, offset[ 2 ].w );",
				"d.y = coords.y;",

				// We want the distances to be in pixel units:
				"d = d / resolution.y - pixcoord.y;",

				// SMAAArea below needs a sqrt, as the areas texture is compressed
				// quadratically:
				"vec2 sqrt_d = sqrt( abs( d ) );",

				// Fetch the bottom crossing edges:
				"coords.y -= 1.0 * resolution.y;", // WebGL port note: Added
				"float e2 = SMAASampleLevelZeroOffset( edgesTex, coords, ivec2( 0, 1 ) ).g;",

				// Get the area for this direction:
				"weights.ba = SMAAArea( areaTex, sqrt_d, e1, e2, float( subsampleIndices.x ) );",
			"}",

			"return weights;",
		"}",

		"void main() {",

			"gl_FragColor = SMAABlendingWeightCalculationPS( vUv, vPixcoord, vOffset, tDiffuse, tArea, tSearch, ivec4( 0.0 ) );",

		"}"

	].join("\n")

}, {

	uniforms: {

		"tDiffuse":		{ value: null },
		"tColor":		{ value: null },
		"resolution":	{ value: new THREE.Vector2( 1 / 1024, 1 / 512 ) }

	},

	vertexShader: [

		"uniform vec2 resolution;",

		"varying vec2 vUv;",
		"varying vec4 vOffset[ 2 ];",

		"void SMAANeighborhoodBlendingVS( vec2 texcoord ) {",
			"vOffset[ 0 ] = texcoord.xyxy + resolution.xyxy * vec4( -1.0, 0.0, 0.0, 1.0 );", // WebGL port note: Changed sign in W component
			"vOffset[ 1 ] = texcoord.xyxy + resolution.xyxy * vec4( 1.0, 0.0, 0.0, -1.0 );", // WebGL port note: Changed sign in W component
		"}",

		"void main() {",

			"vUv = uv;",

			"SMAANeighborhoodBlendingVS( vUv );",

			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join("\n"),

	fragmentShader: [

		"uniform sampler2D tDiffuse;",
		"uniform sampler2D tColor;",
		"uniform vec2 resolution;",

		"varying vec2 vUv;",
		"varying vec4 vOffset[ 2 ];",

		"vec4 SMAANeighborhoodBlendingPS( vec2 texcoord, vec4 offset[ 2 ], sampler2D colorTex, sampler2D blendTex ) {",
			// Fetch the blending weights for current pixel:
			"vec4 a;",
			"a.xz = texture2D( blendTex, texcoord ).xz;",
			"a.y = texture2D( blendTex, offset[ 1 ].zw ).g;",
			"a.w = texture2D( blendTex, offset[ 1 ].xy ).a;",

			// Is there any blending weight with a value greater than 0.0?
			"if ( dot(a, vec4( 1.0, 1.0, 1.0, 1.0 )) < 1e-5 ) {",
				"return texture2D( colorTex, texcoord, 0.0 );",
			"} else {",
				// Up to 4 lines can be crossing a pixel (one through each edge). We
				// favor blending by choosing the line with the maximum weight for each
				// direction:
				"vec2 offset;",
				"offset.x = a.a > a.b ? a.a : -a.b;", // left vs. right
				"offset.y = a.g > a.r ? -a.g : a.r;", // top vs. bottom // WebGL port note: Changed signs

				// Then we go in the direction that has the maximum weight:
				"if ( abs( offset.x ) > abs( offset.y )) {", // horizontal vs. vertical
					"offset.y = 0.0;",
				"} else {",
					"offset.x = 0.0;",
				"}",

				// Fetch the opposite color and lerp by hand:
				"vec4 C = texture2D( colorTex, texcoord, 0.0 );",
				"texcoord += sign( offset ) * resolution;",
				"vec4 Cop = texture2D( colorTex, texcoord, 0.0 );",
				"float s = abs( offset.x ) > abs( offset.y ) ? abs( offset.x ) : abs( offset.y );",

				// WebGL port note: Added gamma correction
				"C.xyz = pow(C.xyz, vec3(2.2));",
				"Cop.xyz = pow(Cop.xyz, vec3(2.2));",
				"vec4 mixed = mix(C, Cop, s);",
				"mixed.xyz = pow(mixed.xyz, vec3(1.0 / 2.2));",

				"return mixed;",
			"}",
		"}",

		"void main() {",

			"gl_FragColor = SMAANeighborhoodBlendingPS( vUv, vOffset, tColor, tDiffuse );",

		"}"

	].join("\n")

} ];
/**
 * @author Mugen87 / https://github.com/Mugen87
 *
 * Sobel Edge Detection (see https://youtu.be/uihBwtPIBxM)
 *
 * As mentioned in the video the Sobel operator expects a grayscale image as input.
 *
 */

THREE.SobelOperatorShader = {

	uniforms: {

		"tDiffuse": { value: null },
		"resolution": { value: new THREE.Vector2() }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",

			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join( "\n" ),

	fragmentShader: [

		"uniform sampler2D tDiffuse;",
		"uniform vec2 resolution;",
		"varying vec2 vUv;",

		"void main() {",

			"vec2 texel = vec2( 1.0 / resolution.x, 1.0 / resolution.y );",

			// kernel definition (in glsl matrices are filled in column-major order)

			"const mat3 Gx = mat3( -1, -2, -1, 0, 0, 0, 1, 2, 1 );", // x direction kernel
			"const mat3 Gy = mat3( -1, 0, 1, -2, 0, 2, -1, 0, 1 );", // y direction kernel

			// fetch the 3x3 neighbourhood of a fragment

			// first column

			"float tx0y0 = texture2D( tDiffuse, vUv + texel * vec2( -1, -1 ) ).r;",
			"float tx0y1 = texture2D( tDiffuse, vUv + texel * vec2( -1,  0 ) ).r;",
			"float tx0y2 = texture2D( tDiffuse, vUv + texel * vec2( -1,  1 ) ).r;",

			// second column

			"float tx1y0 = texture2D( tDiffuse, vUv + texel * vec2(  0, -1 ) ).r;",
			"float tx1y1 = texture2D( tDiffuse, vUv + texel * vec2(  0,  0 ) ).r;",
			"float tx1y2 = texture2D( tDiffuse, vUv + texel * vec2(  0,  1 ) ).r;",

			// third column

			"float tx2y0 = texture2D( tDiffuse, vUv + texel * vec2(  1, -1 ) ).r;",
			"float tx2y1 = texture2D( tDiffuse, vUv + texel * vec2(  1,  0 ) ).r;",
			"float tx2y2 = texture2D( tDiffuse, vUv + texel * vec2(  1,  1 ) ).r;",

			// gradient value in x direction

			"float valueGx = Gx[0][0] * tx0y0 + Gx[1][0] * tx1y0 + Gx[2][0] * tx2y0 + ",
				"Gx[0][1] * tx0y1 + Gx[1][1] * tx1y1 + Gx[2][1] * tx2y1 + ",
				"Gx[0][2] * tx0y2 + Gx[1][2] * tx1y2 + Gx[2][2] * tx2y2; ",

			// gradient value in y direction

			"float valueGy = Gy[0][0] * tx0y0 + Gy[1][0] * tx1y0 + Gy[2][0] * tx2y0 + ",
				"Gy[0][1] * tx0y1 + Gy[1][1] * tx1y1 + Gy[2][1] * tx2y1 + ",
				"Gy[0][2] * tx0y2 + Gy[1][2] * tx1y2 + Gy[2][2] * tx2y2; ",

			// magnitute of the total gradient

			"float G = sqrt( ( valueGx * valueGx ) + ( valueGy * valueGy ) );",

			"gl_FragColor = vec4( vec3( G ), 1 );",

		"}"

	].join( "\n" )

};
/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Screen-space ambient occlusion shader
 * - ported from
 *   SSAO GLSL shader v1.2
 *   assembled by Martins Upitis (martinsh) (http://devlog-martinsh.blogspot.com)
 *   original technique is made by ArKano22 (http://www.gamedev.net/topic/550699-ssao-no-halo-artifacts/)
 * - modifications
 * - modified to use RGBA packed depth texture (use clear color 1,1,1,1 for depth pass)
 * - refactoring and optimizations
 */

THREE.SSAOShader = {

	uniforms: {

		"tDiffuse":     { value: null },
		"tDepth":       { value: null },
		"size":         { value: new THREE.Vector2( 512, 512 ) },
		"cameraNear":   { value: 1 },
		"cameraFar":    { value: 100 },
		"radius":       { value: 32 },
		"onlyAO":       { value: 0 },
		"aoClamp":      { value: 0.25 },
		"lumInfluence": { value: 0.7 }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",

			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join( "\n" ),

	fragmentShader: [

		"uniform float cameraNear;",
		"uniform float cameraFar;",
		"#ifdef USE_LOGDEPTHBUF",
			"uniform float logDepthBufFC;",
		"#endif",

		"uniform float radius;",     // ao radius
		"uniform bool onlyAO;",      // use only ambient occlusion pass?

		"uniform vec2 size;",        // texture width, height
		"uniform float aoClamp;",    // depth clamp - reduces haloing at screen edges

		"uniform float lumInfluence;",  // how much luminance affects occlusion

		"uniform sampler2D tDiffuse;",
		"uniform sampler2D tDepth;",

		"varying vec2 vUv;",

		// "#define PI 3.14159265",
		"#define DL 2.399963229728653",  // PI * ( 3.0 - sqrt( 5.0 ) )
		"#define EULER 2.718281828459045",

		// user variables

		"const int samples = 64;",     // ao sample count

		"const bool useNoise = true;",      // use noise instead of pattern for sample dithering
		"const float noiseAmount = 0.0004;", // dithering amount

		"const float diffArea = 0.4;",   // self-shadowing reduction
		"const float gDisplace = 0.4;",  // gauss bell center


		// RGBA depth

		"#include <packing>",

		// generating noise / pattern texture for dithering

		"vec2 rand( const vec2 coord ) {",

			"vec2 noise;",

			"if ( useNoise ) {",

				"float nx = dot ( coord, vec2( 12.9898, 78.233 ) );",
				"float ny = dot ( coord, vec2( 12.9898, 78.233 ) * 2.0 );",

				"noise = clamp( fract ( 43758.5453 * sin( vec2( nx, ny ) ) ), 0.0, 1.0 );",

			"} else {",

				"float ff = fract( 1.0 - coord.s * ( size.x / 2.0 ) );",
				"float gg = fract( coord.t * ( size.y / 2.0 ) );",

				"noise = vec2( 0.25, 0.75 ) * vec2( ff ) + vec2( 0.75, 0.25 ) * gg;",

			"}",

			"return ( noise * 2.0  - 1.0 ) * noiseAmount;",

		"}",

		"float readDepth( const in vec2 coord ) {",

			"float cameraFarPlusNear = cameraFar + cameraNear;",
			"float cameraFarMinusNear = cameraFar - cameraNear;",
			"float cameraCoef = 2.0 * cameraNear;",

			"#ifdef USE_LOGDEPTHBUF",

				"float logz = unpackRGBAToDepth( texture2D( tDepth, coord ) );",
				"float w = pow(2.0, (logz / logDepthBufFC)) - 1.0;",
				"float z = (logz / w) + 1.0;",

			"#else",

				"float z = unpackRGBAToDepth( texture2D( tDepth, coord ) );",

			"#endif",

			"return cameraCoef / ( cameraFarPlusNear - z * cameraFarMinusNear );",


		"}",

		"float compareDepths( const in float depth1, const in float depth2, inout int far ) {",

			"float garea = 8.0;",                         // gauss bell width
			"float diff = ( depth1 - depth2 ) * 100.0;",  // depth difference (0-100)

			// reduce left bell width to avoid self-shadowing

			"if ( diff < gDisplace ) {",

				"garea = diffArea;",

			"} else {",

				"far = 1;",

			"}",

			"float dd = diff - gDisplace;",
			"float gauss = pow( EULER, -2.0 * ( dd * dd ) / ( garea * garea ) );",
			"return gauss;",

		"}",

		"float calcAO( float depth, float dw, float dh ) {",

			"vec2 vv = vec2( dw, dh );",

			"vec2 coord1 = vUv + radius * vv;",
			"vec2 coord2 = vUv - radius * vv;",

			"float temp1 = 0.0;",
			"float temp2 = 0.0;",

			"int far = 0;",
			"temp1 = compareDepths( depth, readDepth( coord1 ), far );",

			// DEPTH EXTRAPOLATION

			"if ( far > 0 ) {",

				"temp2 = compareDepths( readDepth( coord2 ), depth, far );",
				"temp1 += ( 1.0 - temp1 ) * temp2;",

			"}",

			"return temp1;",

		"}",

		"void main() {",

			"vec2 noise = rand( vUv );",
			"float depth = readDepth( vUv );",

			"float tt = clamp( depth, aoClamp, 1.0 );",

			"float w = ( 1.0 / size.x ) / tt + ( noise.x * ( 1.0 - noise.x ) );",
			"float h = ( 1.0 / size.y ) / tt + ( noise.y * ( 1.0 - noise.y ) );",

			"float ao = 0.0;",

			"float dz = 1.0 / float( samples );",
			"float l = 0.0;",
			"float z = 1.0 - dz / 2.0;",

			"for ( int i = 0; i <= samples; i ++ ) {",

				"float r = sqrt( 1.0 - z );",

				"float pw = cos( l ) * r;",
				"float ph = sin( l ) * r;",
				"ao += calcAO( depth, pw * w, ph * h );",
				"z = z - dz;",
				"l = l + DL;",

			"}",

			"ao /= float( samples );",
			"ao = 1.0 - ao;",

			"vec3 color = texture2D( tDiffuse, vUv ).rgb;",

			"vec3 lumcoeff = vec3( 0.299, 0.587, 0.114 );",
			"float lum = dot( color.rgb, lumcoeff );",
			"vec3 luminance = vec3( lum );",

			"vec3 final = vec3( color * mix( vec3( ao ), vec3( 1.0 ), luminance * lumInfluence ) );",  // mix( color * ao, white, luminance )

			"if ( onlyAO ) {",

				"final = vec3( mix( vec3( ao ), vec3( 1.0 ), luminance * lumInfluence ) );",  // ambient occlusion only

			"}",

			"gl_FragColor = vec4( final, 1.0 );",

		"}"

	].join( "\n" )

};
/**
 * @author flimshaw / http://charliehoey.com
 *
 * Technicolor Shader
 * Simulates the look of the two-strip technicolor process popular in early 20th century films.
 * More historical info here: http://www.widescreenmuseum.com/oldcolor/technicolor1.htm
 * Demo here: http://charliehoey.com/technicolor_shader/shader_test.html
 */

THREE.TechnicolorShader = {

	uniforms: {

		"tDiffuse": { value: null }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join( "\n" ),

	fragmentShader: [

		"uniform sampler2D tDiffuse;",
		"varying vec2 vUv;",

		"void main() {",

			"vec4 tex = texture2D( tDiffuse, vec2( vUv.x, vUv.y ) );",
			"vec4 newTex = vec4(tex.r, (tex.g + tex.b) * .5, (tex.g + tex.b) * .5, 1.0);",

			"gl_FragColor = newTex;",

		"}"

	].join( "\n" )

};
/**
 * @author miibond
 *
 * Full-screen tone-mapping shader based on http://www.cis.rit.edu/people/faculty/ferwerda/publications/sig02_paper.pdf
 */

THREE.ToneMapShader = {

	uniforms: {

		"tDiffuse": { value: null },
		"averageLuminance":  { value: 1.0 },
		"luminanceMap":  { value: null },
		"maxLuminance":  { value: 16.0 },
		"minLuminance":  { value: 0.01 },
		"middleGrey":  { value: 0.6 }
	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join( "\n" ),

	fragmentShader: [

		"#include <common>",

		"uniform sampler2D tDiffuse;",

		"varying vec2 vUv;",

		"uniform float middleGrey;",
		"uniform float minLuminance;",
		"uniform float maxLuminance;",
		"#ifdef ADAPTED_LUMINANCE",
			"uniform sampler2D luminanceMap;",
		"#else",
			"uniform float averageLuminance;",
		"#endif",

		"vec3 ToneMap( vec3 vColor ) {",
			"#ifdef ADAPTED_LUMINANCE",
				// Get the calculated average luminance
				"float fLumAvg = texture2D(luminanceMap, vec2(0.5, 0.5)).r;",
			"#else",
				"float fLumAvg = averageLuminance;",
			"#endif",

			// Calculate the luminance of the current pixel
			"float fLumPixel = linearToRelativeLuminance( vColor );",

			// Apply the modified operator (Eq. 4)
			"float fLumScaled = (fLumPixel * middleGrey) / max( minLuminance, fLumAvg );",

			"float fLumCompressed = (fLumScaled * (1.0 + (fLumScaled / (maxLuminance * maxLuminance)))) / (1.0 + fLumScaled);",
			"return fLumCompressed * vColor;",
		"}",

		"void main() {",

			"vec4 texel = texture2D( tDiffuse, vUv );",

			"gl_FragColor = vec4( ToneMap( texel.xyz ), texel.w );",

		"}"

	].join( "\n" )

};
/**
 * @author zz85 / http://www.lab4games.net/zz85/blog
 *
 * Triangle blur shader
 * based on glfx.js triangle blur shader
 * https://github.com/evanw/glfx.js
 *
 * A basic blur filter, which convolves the image with a
 * pyramid filter. The pyramid filter is separable and is applied as two
 * perpendicular triangle filters.
 */

THREE.TriangleBlurShader = {

	uniforms : {

		"texture": { value: null },
		"delta":   { value: new THREE.Vector2( 1, 1 ) }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join( "\n" ),

	fragmentShader: [

		"#include <common>",

		"#define ITERATIONS 10.0",

		"uniform sampler2D texture;",
		"uniform vec2 delta;",

		"varying vec2 vUv;",

		"void main() {",

			"vec4 color = vec4( 0.0 );",

			"float total = 0.0;",

			// randomize the lookup values to hide the fixed number of samples

			"float offset = rand( vUv );",

			"for ( float t = -ITERATIONS; t <= ITERATIONS; t ++ ) {",

				"float percent = ( t + offset - 0.5 ) / ITERATIONS;",
				"float weight = 1.0 - abs( percent );",

				"color += texture2D( texture, vUv + delta * percent ) * weight;",
				"total += weight;",

			"}",

			"gl_FragColor = color / total;",

		"}"

	].join( "\n" )

};
/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Unpack RGBA depth shader
 * - show RGBA encoded depth as monochrome color
 */

THREE.UnpackDepthRGBAShader = {

	uniforms: {

		"tDiffuse": { value: null },
		"opacity":  { value: 1.0 }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join( "\n" ),

	fragmentShader: [

		"uniform float opacity;",

		"uniform sampler2D tDiffuse;",

		"varying vec2 vUv;",

		"#include <packing>",

		"void main() {",

			"float depth = 1.0 - unpackRGBAToDepth( texture2D( tDiffuse, vUv ) );",
			"gl_FragColor = vec4( vec3( depth ), opacity );",

		"}"

	].join( "\n" )

};
/**
 * @author zz85 / http://www.lab4games.net/zz85/blog
 *
 * Two pass Gaussian blur filter (horizontal and vertical blur shaders)
 * - described in http://www.gamerendering.com/2008/10/11/gaussian-blur-filter-shader/
 *   and used in http://www.cake23.de/traveling-wavefronts-lit-up.html
 *
 * - 9 samples per pass
 * - standard deviation 2.7
 * - "h" and "v" parameters should be set to "1 / width" and "1 / height"
 */

THREE.VerticalBlurShader = {

	uniforms: {

		"tDiffuse": { value: null },
		"v":        { value: 1.0 / 512.0 }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join( "\n" ),

	fragmentShader: [

		"uniform sampler2D tDiffuse;",
		"uniform float v;",

		"varying vec2 vUv;",

		"void main() {",

			"vec4 sum = vec4( 0.0 );",

			"sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 4.0 * v ) ) * 0.051;",
			"sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 3.0 * v ) ) * 0.0918;",
			"sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 2.0 * v ) ) * 0.12245;",
			"sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 1.0 * v ) ) * 0.1531;",
			"sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y ) ) * 0.1633;",
			"sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 1.0 * v ) ) * 0.1531;",
			"sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 2.0 * v ) ) * 0.12245;",
			"sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 3.0 * v ) ) * 0.0918;",
			"sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 4.0 * v ) ) * 0.051;",

			"gl_FragColor = sum;",

		"}"

	].join( "\n" )

};
/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Simple fake tilt-shift effect, modulating two pass Gaussian blur (see above) by vertical position
 *
 * - 9 samples per pass
 * - standard deviation 2.7
 * - "h" and "v" parameters should be set to "1 / width" and "1 / height"
 * - "r" parameter control where "focused" horizontal line lies
 */

THREE.VerticalTiltShiftShader = {

	uniforms: {

		"tDiffuse": { value: null },
		"v":        { value: 1.0 / 512.0 },
		"r":        { value: 0.35 }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join( "\n" ),

	fragmentShader: [

		"uniform sampler2D tDiffuse;",
		"uniform float v;",
		"uniform float r;",

		"varying vec2 vUv;",

		"void main() {",

			"vec4 sum = vec4( 0.0 );",

			"float vv = v * abs( r - vUv.y );",

			"sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 4.0 * vv ) ) * 0.051;",
			"sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 3.0 * vv ) ) * 0.0918;",
			"sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 2.0 * vv ) ) * 0.12245;",
			"sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 1.0 * vv ) ) * 0.1531;",
			"sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y ) ) * 0.1633;",
			"sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 1.0 * vv ) ) * 0.1531;",
			"sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 2.0 * vv ) ) * 0.12245;",
			"sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 3.0 * vv ) ) * 0.0918;",
			"sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 4.0 * vv ) ) * 0.051;",

			"gl_FragColor = sum;",

		"}"

	].join( "\n" )

};
/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Vignette shader
 * based on PaintEffect postprocess from ro.me
 * http://code.google.com/p/3-dreams-of-black/source/browse/deploy/js/effects/PaintEffect.js
 */

THREE.VignetteShader = {

	uniforms: {

		"tDiffuse": { value: null },
		"offset":   { value: 1.0 },
		"darkness": { value: 1.0 }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join( "\n" ),

	fragmentShader: [

		"uniform float offset;",
		"uniform float darkness;",

		"uniform sampler2D tDiffuse;",

		"varying vec2 vUv;",

		"void main() {",

			// Eskil's vignette

			"vec4 texel = texture2D( tDiffuse, vUv );",
			"vec2 uv = ( vUv - vec2( 0.5 ) ) * vec2( offset );",
			"gl_FragColor = vec4( mix( texel.rgb, vec3( 1.0 - darkness ), dot( uv, uv ) ), texel.a );",

			/*
			// alternative version from glfx.js
			// this one makes more "dusty" look (as opposed to "burned")

			"vec4 color = texture2D( tDiffuse, vUv );",
			"float dist = distance( vUv, vec2( 0.5 ) );",
			"color.rgb *= smoothstep( 0.8, offset * 0.799, dist *( darkness + offset ) );",
			"gl_FragColor = color;",
			*/

		"}"

	].join( "\n" )

};
/**
 * @author Mugen87 / https://github.com/Mugen87
 *
 */

THREE.WaterRefractionShader = {

	uniforms: {

		'color': {
			type: 'c',
			value: null
		},

		'time': {
			type: 'f',
			value: 0
		},

		'tDiffuse': {
			type: 't',
			value: null
		},

		'tDudv': {
			type: 't',
			value: null
		},

		'textureMatrix': {
			type: 'm4',
			value: null
		}

	},

	vertexShader: [

		'uniform mat4 textureMatrix;',

		'varying vec2 vUv;',
		'varying vec4 vUvRefraction;',

		'void main() {',

		'	vUv = uv;',

		'	vUvRefraction = textureMatrix * vec4( position, 1.0 );',

		'	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',

		'}'

	].join( '\n' ),

	fragmentShader: [

		'uniform vec3 color;',
		'uniform float time;',
		'uniform sampler2D tDiffuse;',
		'uniform sampler2D tDudv;',

		'varying vec2 vUv;',
		'varying vec4 vUvRefraction;',

		'float blendOverlay( float base, float blend ) {',

		'	return( base < 0.5 ? ( 2.0 * base * blend ) : ( 1.0 - 2.0 * ( 1.0 - base ) * ( 1.0 - blend ) ) );',

		'}',

		'vec3 blendOverlay( vec3 base, vec3 blend ) {',

		'	return vec3( blendOverlay( base.r, blend.r ), blendOverlay( base.g, blend.g ),blendOverlay( base.b, blend.b ) );',

		'}',

		'void main() {',

		' float waveStrength = 0.1;',
		' float waveSpeed = 0.03;',

		// simple distortion (ripple) via dudv map (see https://www.youtube.com/watch?v=6B7IF6GOu7s)

		'	vec2 distortedUv = texture2D( tDudv, vec2( vUv.x + time * waveSpeed, vUv.y ) ).rg * waveStrength;',
		'	distortedUv = vUv.xy + vec2( distortedUv.x, distortedUv.y + time * waveSpeed );',
		'	vec2 distortion = ( texture2D( tDudv, distortedUv ).rg * 2.0 - 1.0 ) * waveStrength;',

		// new uv coords

		' vec4 uv = vec4( vUvRefraction );',
		' uv.xy += distortion;',

		'	vec4 base = texture2DProj( tDiffuse, uv );',

		'	gl_FragColor = vec4( blendOverlay( base.rgb, color ), 1.0 );',

		'}'

	].join( '\n' )
};
