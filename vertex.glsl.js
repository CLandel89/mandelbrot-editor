let shaderV = `#version 300 es
precision mediump float;

in vec2 ecke; //[-1,-1],[1,-1],[-1,1] oder [1,1]
out vec2 posV;
flat out vec2 pixelGr;
uniform vec2 pos, versatzR, versatzO, fensterGr;

void main() {
    vec2 versatzNeu = ecke.x*versatzR + ecke.y*versatzO;
    posV = pos + versatzNeu;
    pixelGr = vec2(
        length(versatzR) / (fensterGr.x / 2.0),
        length(versatzO) / (fensterGr.y / 2.0)
    );
    gl_Position = vec4(ecke, -1, 1);
}
`;