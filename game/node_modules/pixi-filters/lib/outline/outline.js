'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var fragment = "precision highp float;\nin vec2 vTextureCoord;\nout vec4 finalColor;\n\nuniform sampler2D uTexture;\nuniform vec2 uThickness;\nuniform vec3 uColor;\nuniform float uAlpha;\nuniform float uKnockout;\n\nuniform vec4 uInputClamp;\n\nconst float DOUBLE_PI = 2. * 3.14159265358979323846264;\nconst float ANGLE_STEP = ${ANGLE_STEP};\n\nfloat outlineMaxAlphaAtPos(vec2 pos) {\n    if (uThickness.x == 0. || uThickness.y == 0.) {\n        return 0.;\n    }\n\n    vec4 displacedColor;\n    vec2 displacedPos;\n    float maxAlpha = 0.;\n\n    for (float angle = 0.; angle <= DOUBLE_PI; angle += ANGLE_STEP) {\n        displacedPos.x = vTextureCoord.x + uThickness.x * cos(angle);\n        displacedPos.y = vTextureCoord.y + uThickness.y * sin(angle);\n        displacedColor = texture(uTexture, clamp(displacedPos, uInputClamp.xy, uInputClamp.zw));\n        maxAlpha = max(maxAlpha, displacedColor.a);\n    }\n\n    return maxAlpha;\n}\n\nvoid main(void) {\n    vec4 sourceColor = texture(uTexture, vTextureCoord);\n    vec4 contentColor = sourceColor * float(uKnockout < 0.5);\n    float outlineAlpha = uAlpha * outlineMaxAlphaAtPos(vTextureCoord.xy) * (1.-sourceColor.a);\n    vec4 outlineColor = vec4(vec3(uColor) * outlineAlpha, outlineAlpha);\n    finalColor = contentColor + outlineColor;\n}\n";

exports["default"] = fragment;
//# sourceMappingURL=outline.js.map
