'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var fragment = "in vec2 vTextureCoord;\nout vec4 finalColor;\n\nuniform sampler2D uTexture;\nuniform vec3 uOriginalColor;\nuniform vec3 uTargetColor;\nuniform float uTolerance;\n\nvoid main(void) {\n    vec4 c = texture(uTexture, vTextureCoord);\n    vec3 colorDiff = uOriginalColor - (c.rgb / max(c.a, 0.0000000001));\n    float colorDistance = length(colorDiff);\n    float doReplace = step(colorDistance, uTolerance);\n    finalColor = vec4(mix(c.rgb, (uTargetColor + colorDiff) * c.a, doReplace), c.a);\n}\n";

exports["default"] = fragment;
//# sourceMappingURL=color-replace.js.map
