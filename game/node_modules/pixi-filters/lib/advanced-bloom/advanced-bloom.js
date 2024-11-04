'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var fragment = "in vec2 vTextureCoord;\nout vec4 finalColor;\n\nuniform sampler2D uTexture;\nuniform sampler2D uMapTexture;\nuniform float uBloomScale;\nuniform float uBrightness;\n\nvoid main() {\n    vec4 color = texture(uTexture, vTextureCoord);\n    color.rgb *= uBrightness;\n    vec4 bloomColor = vec4(texture(uMapTexture, vTextureCoord).rgb, 0.0);\n    bloomColor.rgb *= uBloomScale;\n    finalColor = color + bloomColor;\n}\n";

exports["default"] = fragment;
//# sourceMappingURL=advanced-bloom.js.map
