var fragment = "precision highp float;\nin vec2 vTextureCoord;\nout vec4 finalColor;\n\nuniform sampler2D uTexture;\nuniform vec4 uInputSize;\nuniform vec2 uRed;\nuniform vec2 uGreen;\nuniform vec2 uBlue;\n\nvoid main(void)\n{\n   float r = texture(uTexture, vTextureCoord + uRed/uInputSize.xy).r;\n   float g = texture(uTexture, vTextureCoord + uGreen/uInputSize.xy).g;\n   float b = texture(uTexture, vTextureCoord + uBlue/uInputSize.xy).b;\n   float a = texture(uTexture, vTextureCoord).a;\n   finalColor = vec4(r, g, b, a);\n}\n";

export { fragment as default };
//# sourceMappingURL=rgb-split2.mjs.map
