var fragment = "precision highp float;\nin vec2 vTextureCoord;\nout vec4 finalColor;\n\nuniform sampler2D uTexture;\nuniform float uStrength;\n\nuniform vec4 uInputSize;\n\nvoid main(void)\n{\n\tvec2 onePixel = vec2(1.0 / uInputSize);\n\n\tvec4 color;\n\n\tcolor.rgb = vec3(0.5);\n\n\tcolor -= texture(uTexture, vTextureCoord - onePixel) * uStrength;\n\tcolor += texture(uTexture, vTextureCoord + onePixel) * uStrength;\n\n\tcolor.rgb = vec3((color.r + color.g + color.b) / 3.0);\n\n\tfloat alpha = texture(uTexture, vTextureCoord).a;\n\n\tfinalColor = vec4(color.rgb * alpha, alpha);\n}\n";

export { fragment as default };
//# sourceMappingURL=emboss.mjs.map
