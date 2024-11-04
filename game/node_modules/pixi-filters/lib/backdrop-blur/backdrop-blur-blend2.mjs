var wgslFragment = "@group(0) @binding(1) var uTexture: texture_2d<f32>; \n@group(0) @binding(2) var uSampler: sampler;\n@group(1) @binding(0) var uBackground: texture_2d<f32>; \n\n@fragment\nfn mainFragment(\n    @builtin(position) position: vec4<f32>,\n    @location(0) uv : vec2<f32>\n) -> @location(0) vec4<f32> {\n    var front: vec4<f32> = textureSample(uTexture, uSampler, uv);\n    var back: vec4<f32> = textureSample(uBackground, uSampler, uv);\n    \n    if (front.a == 0.0) {\n        discard;\n    }\n\n    var color: vec3<f32> = mix(back.rgb, front.rgb / front.a, front.a);\n\n    return vec4<f32>(color, 1.0);\n}";

export { wgslFragment as default };
//# sourceMappingURL=backdrop-blur-blend2.mjs.map
