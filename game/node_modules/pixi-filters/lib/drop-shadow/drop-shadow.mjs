var fragment = "precision highp float;\nin vec2 vTextureCoord;\nout vec4 finalColor;\n\nuniform sampler2D uTexture;\nuniform float uAlpha;\nuniform vec3 uColor;\nuniform vec2 uOffset;\n\nuniform vec4 uInputSize;\n\nvoid main(void){\n    vec4 sample = texture(uTexture, vTextureCoord - uOffset * uInputSize.zw);\n\n    // Premultiply alpha\n    sample.rgb = uColor.rgb * sample.a;\n\n    // alpha user alpha\n    sample *= uAlpha;\n\n    finalColor = sample;\n}";

export { fragment as default };
//# sourceMappingURL=drop-shadow.mjs.map
