$MandelQuest.shaderF = `#version 300 es
precision mediump float;

in vec2 posV;
flat in vec2 pixelSz;
uniform int n_iter, ANTIALIASING;
uniform float pos_part;
uniform sampler2D colors;
uniform vec2 pert;
out vec4 out_Color;

vec3 mandel(vec2 pos) {
    // Calculate a color for a position in the pane of the complex numbers.
    int n;
    vec2 z = pos;
    vec2 add = pos_part*posV + pert;
    for (n=0; n<n_iter; n++) {
        //complex z^2 + pos_part*posV + pert
        //(z.x+z.y)^2 = z.x^2 + 2*z.x*(z.y*i) + (z.y*i)^2
        z = z.x*z.x*vec2(1,0) + 2.0*z.x*z.y*vec2(0,1) - z.y*z.y*vec2(1,0);
        z += add;
        //complex ||z||>2
        if (z.x*z.x + z.y*z.y > 4.0) {
            //n is now corresponding
            break;
        }
    }
    if (n == n_iter)
        //the corresponding n could be bigger - or the calculation could converge
        //(there is no way to know this for every spot in the complex pane)
        return vec3(0,0,0);
    else
        return texture(colors, vec2(float(n)/float(n_iter), 0.0)).rgb;
}

void main() {
    // Antialiasing (calculate AA^2 pixels, so if AA=2 => 4x antialiasing)
    vec3 color = vec3(0, 0, 0);
    int n;
    for (n=0; n<ANTIALIASING*ANTIALIASING; n++) {
        vec2 pos = (
            posV
            + vec2(
                float(n%ANTIALIASING) * float(pixelSz.x)/float(ANTIALIASING),
                float(n/ANTIALIASING) * float(pixelSz.y)/float(ANTIALIASING)
            )
        );
        color += mandel(pos);
    }
    color /= float(ANTIALIASING*ANTIALIASING);
    out_Color = vec4(color, 1);
}
`;