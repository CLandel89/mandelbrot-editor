$MandelQuest.shaderF = `#version 300 es
precision mediump float;

in vec2 posV, screenV;
uniform int n_iter;
uniform float cut, julia;
uniform sampler2D colors;
uniform vec2 pert, pos;
out vec4 out_Color;

vec3 color() {
    // Calculate a color for a position in the pane of the complex numbers.
    //(To assert that out_Color is always set, this is put in a function).
    int n;
    vec2 z = (1.0-julia)*posV + julia*screenV;
    vec2 add = (1.0-julia)*posV + pert + julia*pos;
    float cut_quad = cut * cut * (screenV.x*screenV.x + screenV.y*screenV.y);
    cut_quad = cut_quad * cut_quad; //this looks a bit better (visually)
    for (n=0; n<n_iter; n++) {
        //complex z^2 + add
        //(z.x+z.y)^2 = z.x^2 + 2*z.x*(z.y*i) + (z.y*i)^2
        z = z.x*z.x*vec2(1,0) + 2.0*z.x*z.y*vec2(0,1) - z.y*z.y*vec2(1,0);
        z += add;
        //complex ||z||>2
        if (z.x*z.x + z.y*z.y > 4.0 - 4.0*cut_quad) {
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
    out_Color = vec4(color(), 1);
}
`;