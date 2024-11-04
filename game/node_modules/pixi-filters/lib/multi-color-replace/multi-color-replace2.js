'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var fragment = "in vec2 vTextureCoord;\nout vec4 finalColor;\n\nconst int MAX_COLORS = ${MAX_COLORS};\n\nuniform sampler2D uTexture;\nuniform vec3 uOriginalColors[MAX_COLORS];\nuniform vec3 uTargetColors[MAX_COLORS];\nuniform float uTolerance;\n\nvoid main(void)\n{\n    finalColor = texture(uTexture, vTextureCoord);\n\n    float alpha = finalColor.a;\n    if (alpha < 0.0001)\n    {\n      return;\n    }\n\n    vec3 color = finalColor.rgb / alpha;\n\n    for(int i = 0; i < MAX_COLORS; i++)\n    {\n      vec3 origColor = uOriginalColors[i];\n      if (origColor.r < 0.0)\n      {\n        break;\n      }\n      vec3 colorDiff = origColor - color;\n      if (length(colorDiff) < uTolerance)\n      {\n        vec3 targetColor = uTargetColors[i];\n        finalColor = vec4((targetColor + colorDiff) * alpha, alpha);\n        return;\n      }\n    }\n}\n";

exports["default"] = fragment;
//# sourceMappingURL=multi-color-replace2.js.map
