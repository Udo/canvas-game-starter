'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var fragment = "in vec2 vTextureCoord;\nout vec4 finalColor;\n\nuniform sampler2D uTexture;\nuniform float uGamma;\nuniform float uContrast;\nuniform float uSaturation;\nuniform float uBrightness;\nuniform vec4 uColor;\n\nvoid main()\n{\n    vec4 c = texture(uTexture, vTextureCoord);\n\n    if (c.a > 0.0) {\n        c.rgb /= c.a;\n\n        vec3 rgb = pow(c.rgb, vec3(1. / uGamma));\n        rgb = mix(vec3(.5), mix(vec3(dot(vec3(.2125, .7154, .0721), rgb)), rgb, uSaturation), uContrast);\n        rgb.r *= uColor.r;\n        rgb.g *= uColor.g;\n        rgb.b *= uColor.b;\n        c.rgb = rgb * uBrightness;\n\n        c.rgb *= c.a;\n    }\n\n    finalColor = c * uColor.a;\n}\n";

exports["default"] = fragment;
//# sourceMappingURL=adjustment2.js.map
