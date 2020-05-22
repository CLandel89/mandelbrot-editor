let shaderV = [
    "precision mediump float;",
    "",
    "attribute vec3 vertColor;",
    "attribute vec2 vertPosition;",
    "varying vec3 fragColor;",
    "",
    "void main() {",
    "    fragColor = vertColor;",
    "    gl_Position = vec4(vertPosition, 0.0, 1.0);",
    "}",
].join('\n');