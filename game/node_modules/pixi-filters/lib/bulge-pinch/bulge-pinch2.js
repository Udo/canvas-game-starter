'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var fragment = "precision highp float;\nin vec2 vTextureCoord;\nout vec4 finalColor;\n\nuniform sampler2D uTexture;\nuniform vec2 uDimensions;\nuniform vec2 uCenter;\nuniform float uRadius;\nuniform float uStrength;\n\nuniform vec4 uInputSize;\nuniform vec4 uInputClamp;\n\nvoid main()\n{\n    vec2 coord = vTextureCoord * uInputSize.xy;\n    coord -= uCenter * uDimensions.xy;\n    float distance = length(coord);\n\n    if (distance < uRadius) {\n        float percent = distance / uRadius;\n        if (uStrength > 0.0) {\n            coord *= mix(1.0, smoothstep(0.0, uRadius / distance, percent), uStrength * 0.75);\n        } else {\n            coord *= mix(1.0, pow(percent, 1.0 + uStrength * 0.75) * uRadius / distance, 1.0 - percent);\n        }\n    }\n\n    coord += uCenter * uDimensions.xy;\n    coord /= uInputSize.xy;\n    vec2 clampedCoord = clamp(coord, uInputClamp.xy, uInputClamp.zw);\n    vec4 color = texture(uTexture, clampedCoord);\n\n    if (coord != clampedCoord) {\n        color *= max(0.0, 1.0 - length(coord - clampedCoord));\n    }\n\n    finalColor = color;\n}\n";

exports["default"] = fragment;
//# sourceMappingURL=bulge-pinch2.js.map
