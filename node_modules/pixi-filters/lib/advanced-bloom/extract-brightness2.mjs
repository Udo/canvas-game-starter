var fragment = "\nin vec2 vTextureCoord;\nout vec4 finalColor;\n\nuniform sampler2D uTexture;\nuniform float uThreshold;\n\nvoid main() {\n    vec4 color = texture(uTexture, vTextureCoord);\n\n    // A simple & fast algorithm for getting brightness.\n    // It's inaccuracy , but good enought for this feature.\n    float _max = max(max(color.r, color.g), color.b);\n    float _min = min(min(color.r, color.g), color.b);\n    float brightness = (_max + _min) * 0.5;\n\n    if(brightness > uThreshold) {\n        finalColor = color;\n    } else {\n        finalColor = vec4(0.0, 0.0, 0.0, 0.0);\n    }\n}\n";

export { fragment as default };
//# sourceMappingURL=extract-brightness2.mjs.map
