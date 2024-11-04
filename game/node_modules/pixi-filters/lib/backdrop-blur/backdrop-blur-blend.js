'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var fragment = "precision highp float;\nin vec2 vTextureCoord;\nout vec4 finalColor;\n\nuniform sampler2D uTexture;\nuniform sampler2D uBackground;\n\nvoid main(void){\n    vec4 front = texture(uTexture, vTextureCoord);\n    vec4 back = texture(uBackground, vTextureCoord);\n\n    if (front.a == 0.0) {\n        discard;\n    }\n    \n    vec3 color = mix(back.rgb, front.rgb / front.a, front.a);\n\n    finalColor = vec4(color, 1.0);\n}";

exports["default"] = fragment;
//# sourceMappingURL=backdrop-blur-blend.js.map
