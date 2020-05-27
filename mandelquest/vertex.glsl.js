$MandelQuest.shaderV = `#version 300 es
precision mediump float;

in vec2 corner; //[-1,-1],[1,-1],[-1,1] oder [1,1]
out vec2 posV, screenV;
uniform vec2 pos, offsetR, offsetH;

void main() {
    screenV = corner;
    vec2 offsetNew = corner.x*offsetR + corner.y*offsetH;
    posV = pos + offsetNew;
    gl_Position = vec4(corner, -1, 1);
}
`;