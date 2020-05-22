let shaderF = `#version 300 es
precision mediump float;

in vec2 posV;
flat in vec2 pixelGr;
uniform int n_iter, ANTIALIASING;
uniform float pos_anteil;
uniform sampler2D farben;
uniform vec2 pert;
out vec4 out_Color;

vec3 mandel(vec2 pos) {
    // Berechnung eines Farbwerts an einer Position in der komplexen Zahlenebene
    int n;
    vec2 z = pos;
    vec2 hinzu = pos_anteil*posV + pert;
    for (n=0; n<n_iter; n++) {
        //komplex z^2 + pos_anteil*posV + pert
        //(z.x+z.y)^2 = z.x^2 + 2*z.x*(z.y*i) + (z.y*i)^2
        z = z.x*z.x*vec2(1,0) + 2.0*z.x*z.y*vec2(0,1) - z.y*z.y*vec2(1,0);
        z += hinzu;
        //komplex ||z||>2
        if (z.x*z.x + z.y*z.y > 4.0) {
            //n ist nun richtig
            break;
        }
    }
    if (n == n_iter)
        return vec3(0,0,0);
    else
        return texture(farben, vec2(float(n)/float(n_iter), 0.0)).rgb;
}

void main() {
    // Anti-Aliasing (AA^2, d.h. AA=2 => 4x Anti-Aliasing)
    vec3 farbe = vec3(0, 0, 0);
    int n;
    for (n=0; n<ANTIALIASING*ANTIALIASING; n++) {
        vec2 pos = (
            posV
            + vec2(
                float(n%ANTIALIASING) * float(pixelGr.x)/float(ANTIALIASING),
                float(n/ANTIALIASING) * float(pixelGr.y)/float(ANTIALIASING)
            )
        );
        farbe += mandel(pos);
    }
    farbe /= float(ANTIALIASING*ANTIALIASING);
    out_Color = vec4(farbe, 1);
}
`;