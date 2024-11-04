'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var source = "struct SimpleLightmapUniforms {\n  uColor: vec3<f32>,\n  uAlpha: f32,\n  uDimensions: vec2<f32>,\n};\n\nstruct GlobalFilterUniforms {\n  uInputSize:vec4<f32>,\n  uInputPixel:vec4<f32>,\n  uInputClamp:vec4<f32>,\n  uOutputFrame:vec4<f32>,\n  uGlobalFrame:vec4<f32>,\n  uOutputTexture:vec4<f32>,\n};\n\n@group(0) @binding(0) var<uniform> gfu: GlobalFilterUniforms;\n\n@group(0) @binding(1) var uTexture: texture_2d<f32>; \n@group(0) @binding(2) var uSampler: sampler;\n@group(1) @binding(0) var<uniform> simpleLightmapUniforms : SimpleLightmapUniforms;\n@group(1) @binding(1) var uMapTexture: texture_2d<f32>;\n@group(1) @binding(2) var uMapSampler: sampler;\n\n@fragment\nfn mainFragment(\n  @builtin(position) position: vec4<f32>,\n  @location(0) uv : vec2<f32>,\n) -> @location(0) vec4<f32> {\n  let uColor = simpleLightmapUniforms.uColor;\n  let uAlpha = simpleLightmapUniforms.uAlpha;\n  let uDimensions = simpleLightmapUniforms.uDimensions;\n\n  let diffuseColor: vec4<f32> = textureSample(uTexture, uSampler, uv);\n  let lightCoord: vec2<f32> = (uv * gfu.uInputSize.xy) / simpleLightmapUniforms.uDimensions;\n  let light: vec4<f32> = textureSample(uMapTexture, uMapSampler, lightCoord);\n  let ambient: vec3<f32> = uColor * uAlpha;\n  let intensity: vec3<f32> = ambient + light.rgb;\n  let finalColor: vec3<f32> = diffuseColor.rgb * intensity;\n  return vec4<f32>(finalColor, diffuseColor.a);\n}";

exports["default"] = source;
//# sourceMappingURL=simple-lightmap2.js.map
