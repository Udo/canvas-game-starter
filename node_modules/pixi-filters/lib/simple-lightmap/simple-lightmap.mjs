var fragment = "precision highp float;\nin vec2 vTextureCoord;\nout vec4 finalColor;\n\nuniform sampler2D uTexture;\nuniform sampler2D uMapTexture;\nuniform vec3 uColor;\nuniform float uAlpha;\nuniform vec2 uDimensions;\n\nuniform vec4 uInputSize;\n\nvoid main() {\n    vec4 diffuseColor = texture(uTexture, vTextureCoord);\n    vec2 lightCoord = (vTextureCoord * uInputSize.xy) / uDimensions;\n    vec4 light = texture(uMapTexture, lightCoord);\n    vec3 ambient = uColor.rgb * uAlpha;\n    vec3 intensity = ambient + light.rgb;\n    vec3 color = diffuseColor.rgb * intensity;\n    finalColor = vec4(color, diffuseColor.a);\n}\n";

export { fragment as default };
//# sourceMappingURL=simple-lightmap.mjs.map
