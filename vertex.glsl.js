let shaderV = `#version 300 es
precision mediump float;

in vec2 corner; //[-1,-1],[1,-1],[-1,1] oder [1,1]
out vec2 posV;
flat out vec2 pixelSz;
uniform vec2 pos, offsetR, offsetH, windowSz;

void main() {
    vec2 offsetNew = corner.x*offsetR + corner.y*offsetH;
    posV = pos + offsetNew;
    pixelSz = vec2(
        length(offsetR) / (windowSz.x / 2.0),
        length(offsetH) / (windowSz.y / 2.0)
    );
    gl_Position = vec4(corner, -1, 1);
}
`;