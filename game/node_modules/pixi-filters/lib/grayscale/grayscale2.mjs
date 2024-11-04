var source = "@group(0) @binding(1) var uTexture: texture_2d<f32>; \n@group(0) @binding(2) var uSampler: sampler;\n\n@fragment\nfn mainFragment(\n  @location(0) uv: vec2<f32>,\n  @builtin(position) position: vec4<f32>\n) -> @location(0) vec4<f32> {\n  let color: vec4<f32> = textureSample(uTexture, uSampler, uv);\n\n  let g: f32 = dot(color.rgb, vec3<f32>(0.299, 0.587, 0.114));\n  return vec4<f32>(vec3<f32>(g), 1.);\n}";

export { source as default };
//# sourceMappingURL=grayscale2.mjs.map
