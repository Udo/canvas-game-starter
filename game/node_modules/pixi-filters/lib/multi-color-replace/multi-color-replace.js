'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var source = "struct MultiColorReplaceUniforms {\n  uOriginalColors: array<vec3<f32>, MAX_COLORS>,\n  uTargetColors: array<vec3<f32>, MAX_COLORS>,\n  uTolerance:f32,\n};\n\n@group(0) @binding(1) var uTexture: texture_2d<f32>; \n@group(0) @binding(2) var uSampler: sampler;\n@group(1) @binding(0) var<uniform> multiColorReplaceUniforms : MultiColorReplaceUniforms;\n\n@fragment\nfn mainFragment(\n  @builtin(position) position: vec4<f32>,\n  @location(0) uv : vec2<f32>\n) -> @location(0) vec4<f32> {\n  let uOriginalColors = multiColorReplaceUniforms.uOriginalColors;\n  let uTargetColors = multiColorReplaceUniforms.uTargetColors;\n  let uTolerance = multiColorReplaceUniforms.uTolerance;\n\n  var color: vec4<f32> = textureSample(uTexture, uSampler, uv);\n\n  let alpha: f32 = color.a;\n\n  if (alpha > 0.0001)\n  {\n    var modColor: vec3<f32> = vec3<f32>(color.rgb) / alpha;\n\n    for(var i: i32 = 0; i < MAX_COLORS; i += 1)\n    {\n      let origColor: vec3<f32> = uOriginalColors[i];\n      if (origColor.r < 0.0)\n      {\n        break;\n      }\n      let colorDiff: vec3<f32> = origColor - modColor;\n      \n      if (length(colorDiff) < uTolerance)\n      {\n        let targetColor: vec3<f32> = uTargetColors[i];\n        color = vec4((targetColor + colorDiff) * alpha, alpha);\n        return color;\n      }\n    }\n  }\n\n  return color;\n}\n\nconst MAX_COLORS: i32 = ${MAX_COLORS};";

exports["default"] = source;
//# sourceMappingURL=multi-color-replace.js.map
