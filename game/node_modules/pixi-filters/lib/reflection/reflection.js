'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var fragment = "precision highp float;\nin vec2 vTextureCoord;\nout vec4 finalColor;\n\nuniform sampler2D uTexture;\nuniform float uMirror;\nuniform float uBoundary;\nuniform vec2 uAmplitude;\nuniform vec2 uWavelength;\nuniform vec2 uAlpha;\nuniform float uTime;\nuniform vec2 uDimensions;\n\nuniform vec4 uInputSize;\nuniform vec4 uInputClamp;\n\nfloat rand(vec2 co) {\n    return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);\n}\n\nvoid main(void)\n{\n    vec2 pixelCoord = vTextureCoord.xy * uInputSize.xy;\n    vec2 coord = pixelCoord / uDimensions;\n\n    if (coord.y < uBoundary) {\n        finalColor = texture(uTexture, vTextureCoord);\n        return;\n    }\n\n    float k = (coord.y - uBoundary) / (1. - uBoundary + 0.0001);\n    float areaY = uBoundary * uDimensions.y / uInputSize.y;\n    float v = areaY + areaY - vTextureCoord.y;\n    float y = uMirror > 0.5 ? v : vTextureCoord.y;\n\n    float _amplitude = ((uAmplitude.y - uAmplitude.x) * k + uAmplitude.x ) / uInputSize.x;\n    float _waveLength = ((uWavelength.y - uWavelength.x) * k + uWavelength.x) / uInputSize.y;\n    float _alpha = (uAlpha.y - uAlpha.x) * k + uAlpha.x;\n\n    float x = vTextureCoord.x + cos(v * 6.28 / _waveLength - uTime) * _amplitude;\n    x = clamp(x, uInputClamp.x, uInputClamp.z);\n\n    vec4 color = texture(uTexture, vec2(x, y));\n\n    finalColor = color * _alpha;\n}\n";

exports["default"] = fragment;
//# sourceMappingURL=reflection.js.map
