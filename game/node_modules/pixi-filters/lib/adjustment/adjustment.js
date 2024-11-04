'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var source = "struct AdjustmentUniforms {\n  uGamma: f32,\n  uContrast: f32,\n  uSaturation: f32,\n  uBrightness: f32,\n  uColor: vec4<f32>,\n};\n\n@group(0) @binding(1) var uTexture: texture_2d<f32>; \n@group(0) @binding(2) var uSampler: sampler;\n@group(1) @binding(0) var<uniform> adjustmentUniforms : AdjustmentUniforms;\n\n@fragment\nfn mainFragment(\n  @location(0) uv: vec2<f32>,\n  @builtin(position) position: vec4<f32>\n) -> @location(0) vec4<f32> {\n  var sample = textureSample(uTexture, uSampler, uv);\n  let color = adjustmentUniforms.uColor;\n\n  if (sample.a > 0.0) \n  {\n    sample = vec4<f32>(sample.rgb / sample.a, sample.a);\n    var rgb: vec3<f32> = pow(sample.rgb, vec3<f32>(1. / adjustmentUniforms.uGamma));\n    rgb = mix(vec3<f32>(.5), mix(vec3<f32>(dot(vec3<f32>(.2125, .7154, .0721), rgb)), rgb, adjustmentUniforms.uSaturation), adjustmentUniforms.uContrast);\n    rgb.r *= color.r;\n    rgb.g *= color.g;\n    rgb.b *= color.b;\n    sample = vec4<f32>(rgb.rgb * adjustmentUniforms.uBrightness, sample.a);\n    sample = vec4<f32>(sample.rgb * sample.a, sample.a);\n  }\n\n  return sample * color.a;\n}";

exports["default"] = source;
//# sourceMappingURL=adjustment.js.map
