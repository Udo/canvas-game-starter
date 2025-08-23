'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var source = "@group(0) @binding(1) var uTexture: texture_2d<f32>; \n@group(0) @binding(2) var uSampler: sampler;\n\n@fragment\nfn mainFragment(\n    @location(0) uv: vec2<f32>,\n    @builtin(position) position: vec4<f32>\n) -> @location(0) vec4<f32> {\n    let lum: f32 = length(textureSample(uTexture, uSampler, uv).rgb);\n\n    if (lum < 1.00)\n    {\n        if (modulo(position.x + position.y, 10.0) == 0.0)\n        {\n            return vec4<f32>(0.0, 0.0, 0.0, 1.0);\n        }\n    }\n\n    if (lum < 0.75)\n    {\n        if (modulo(position.x - position.y, 10.0) == 0.0)\n        {\n            return vec4<f32>(0.0, 0.0, 0.0, 1.0);\n        }\n    }\n\n    if (lum < 0.50)\n    {\n        if (modulo(position.x + position.y - 5.0, 10.0) == 0.0)\n        {\n            return vec4<f32>(0.0, 0.0, 0.0, 1.0);\n        }\n    }\n\n    if (lum < 0.3)\n    {\n        if (modulo(position.x - position.y - 5.0, 10.0) == 0.0)\n        {\n            return vec4<f32>(0.0, 0.0, 0.0, 1.0);\n        }\n    }\n\n    return vec4<f32>(1.0);\n}\n\nfn modulo(x: f32, y: f32) -> f32\n{\n  return x - y * floor(x/y);\n}";

exports["default"] = source;
//# sourceMappingURL=crosshatch2.js.map
