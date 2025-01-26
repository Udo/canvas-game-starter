'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var source = "struct MotionBlurUniforms {\n  uVelocity: vec2<f32>,\n  uKernelSize: f32,\n  uOffset: f32,\n};\n\nstruct GlobalFilterUniforms {\n  uInputSize:vec4<f32>,\n  uInputPixel:vec4<f32>,\n  uInputClamp:vec4<f32>,\n  uOutputFrame:vec4<f32>,\n  uGlobalFrame:vec4<f32>,\n  uOutputTexture:vec4<f32>,\n};\n\n@group(0) @binding(0) var<uniform> gfu: GlobalFilterUniforms;\n\n@group(0) @binding(1) var uTexture: texture_2d<f32>; \n@group(0) @binding(2) var uSampler: sampler;\n@group(1) @binding(0) var<uniform> motionBlurUniforms : MotionBlurUniforms;\n\n@fragment\nfn mainFragment(\n  @builtin(position) position: vec4<f32>,\n  @location(0) uv : vec2<f32>\n) -> @location(0) vec4<f32> {\n  let uVelocity = motionBlurUniforms.uVelocity;\n  let uKernelSize = motionBlurUniforms.uKernelSize;\n  let uOffset = motionBlurUniforms.uOffset;\n\n  let velocity: vec2<f32> = uVelocity / gfu.uInputSize.xy;\n  let offset: f32 = -uOffset / length(uVelocity) - 0.5;\n  let k: i32 = i32(min(uKernelSize - 1, MAX_KERNEL_SIZE - 1));\n\n  var color: vec4<f32> = textureSample(uTexture, uSampler, uv);\n\n  for(var i: i32 = 0; i < k; i += 1) {\n    let bias: vec2<f32> = velocity * (f32(i) / f32(k) + offset);\n    color += textureSample(uTexture, uSampler, uv + bias);\n  }\n  \n  return select(color / f32(uKernelSize), textureSample(uTexture, uSampler, uv), uKernelSize == 0);\n}\n\nconst MAX_KERNEL_SIZE: f32 = 2048;";

exports["default"] = source;
//# sourceMappingURL=motion-blur2.js.map
