'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var source = "struct KawaseBlurUniforms {\n  uOffset:vec2<f32>,\n};\n\n@group(0) @binding(1) var uTexture: texture_2d<f32>; \n@group(0) @binding(2) var uSampler: sampler;\n@group(1) @binding(0) var<uniform> kawaseBlurUniforms : KawaseBlurUniforms;\n\n@fragment\nfn mainFragment(\n  @builtin(position) position: vec4<f32>,\n  @location(0) uv : vec2<f32>\n) -> @location(0) vec4<f32> {\n  let uOffset = kawaseBlurUniforms.uOffset;\n  var color: vec4<f32> = vec4<f32>(0.0);\n\n  // Sample top left pixel\n  color += textureSample(uTexture, uSampler, vec2<f32>(uv.x - uOffset.x, uv.y + uOffset.y));\n  // Sample top right pixel\n  color += textureSample(uTexture, uSampler, vec2<f32>(uv.x + uOffset.x, uv.y + uOffset.y));\n  // Sample bottom right pixel\n  color += textureSample(uTexture, uSampler, vec2<f32>(uv.x + uOffset.x, uv.y - uOffset.y));\n  // Sample bottom left pixel\n  color += textureSample(uTexture, uSampler, vec2<f32>(uv.x - uOffset.x, uv.y - uOffset.y));\n  // Average\n  color *= 0.25;\n\n  return color;\n}";

exports["default"] = source;
//# sourceMappingURL=kawase-blur2.js.map
