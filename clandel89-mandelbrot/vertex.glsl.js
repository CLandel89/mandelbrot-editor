$CLandel89.Mandelbrot.shaderV = `#version 300 es
precision mediump float;

in vec2 corner; //[-1,-1],[1,-1],[-1,1] or [1,1]
out vec2 posV, screenV;
uniform vec2 pert, pos, screenW, screenH;

void main() {
    screenV = corner;
    vec2 posOffset = corner.x*screenW + corner.y*screenH;
    posV = pos + posOffset - pert;
    gl_Position = vec4(corner, -1, 1);
}
`;