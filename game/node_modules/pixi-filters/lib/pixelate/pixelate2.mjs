var fragment = "precision highp float;\nin vec2 vTextureCoord;\nout vec4 finalColor;\n\nuniform vec2 uSize;\nuniform sampler2D uTexture;\nuniform vec4 uInputSize;\n\nvec2 mapCoord( vec2 coord )\n{\n    coord *= uInputSize.xy;\n    coord += uInputSize.zw;\n\n    return coord;\n}\n\nvec2 unmapCoord( vec2 coord )\n{\n    coord -= uInputSize.zw;\n    coord /= uInputSize.xy;\n\n    return coord;\n}\n\nvec2 pixelate(vec2 coord, vec2 uSize)\n{\n\treturn floor( coord / uSize ) * uSize;\n}\n\nvoid main(void)\n{\n    vec2 coord = mapCoord(vTextureCoord);\n    coord = pixelate(coord, uSize);\n    coord = unmapCoord(coord);\n    finalColor = texture(uTexture, coord);\n}\n";

export { fragment as default };
//# sourceMappingURL=pixelate2.mjs.map
