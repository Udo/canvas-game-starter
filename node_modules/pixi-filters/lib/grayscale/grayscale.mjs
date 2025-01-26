var fragment = "in vec2 vTextureCoord;\n\nout vec4 finalColor;\n\nuniform sampler2D uTexture;\n\n// https://en.wikipedia.org/wiki/Luma_(video)\nconst vec3 weight = vec3(0.299, 0.587, 0.114);\n\nvoid main()\n{\n    vec4 c = texture(uTexture, vTextureCoord);\n    finalColor = vec4(\n        vec3(c.r * weight.r + c.g * weight.g  + c.b * weight.b),\n        c.a\n    );\n}\n";

export { fragment as default };
//# sourceMappingURL=grayscale.mjs.map
