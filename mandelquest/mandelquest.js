"use strict";

{

// Global modularization.
// This could (and usually should) be done using ES2015 modules;
// however Firefox 76 doesn't like that when opening the page from local files.

if (window.$MandelQuest) throw new Error("window.$MandelQuest already set.");
window.$MandelQuest = {}; //that's all, folks.

let $MQ = $MandelQuest; //shorten this inside file-wide scopes

// Include local "dependecies", i.e. the other JS files in the project.
for (let dep of [
    "fragment.glsl",
    "vertex.glsl",
    "complex",
    "mouse",                                                            
    "palette",
]) {
    //https://www.geeksforgeeks.org/how-to-include-a-javascript-file-in-another-javascript-file/
    let scriptTag = document.createElement('script');
    scriptTag.src = `mandelquest/${dep}.js`;
    document.getElementsByTagName('head').item(0).appendChild(scriptTag);
}

// Now that the "dependencies" were attached to the document body,
// we can instruct the browser to kick off the init method AFTER loading.
document.body.onload = function () { $MQ.init(); };

$MQ.canvas = document.getElementById("mandelquest-canvas");
let canvas = $MQ.canvas;
let gl = (function () {
    let gl = canvas.getContext('webgl2');
    if (!gl) {
        alert('WebGL v2 not supported, falling back on experimental-webgl');
        gl = canvas.getContext('experimental-webgl');
    }
    if (!gl) {
        alert('Your browser does not support WebGL');
        return undefined;
    }
    return gl;
}) ();
let program; // an OpenGL program; ⇒ $MQ.init
let scene; // this controls everything you see in the canvas
let uniformLoc, uniformTypeVal; // a mapping of OpenGL uniforms ⇒ $MQ.init
let colorsTex; // a texture that holds the coloring in a single row
let cornerVertices; // a set of vertices that span the whole canvas

function resizeCanvas() {
    let nw = Math.floor(window.innerWidth*15/16);
    let nh = Math.floor(window.innerHeight*15/16);
    if (nw !== canvas.width || nh !== canvas.height) {
        canvas.width = nw;
        canvas.height = nh;
        gl.viewport(0, 0, canvas.width, canvas.height);
    }
}

function updateUniforms() {
    let lenW, lenH; //length inside the complex pane of the fractal
    if (canvas.height > canvas.width) {
        lenW = scene.l;
        lenH = (canvas.height/canvas.width) * scene.l;
    }
    else {
        lenW = (canvas.width/canvas.height) * scene.l;
        lenH = scene.l;
    }
    let offsetR = $MQ.fromPolar(lenW, scene.φ);
    let offsetH = $MQ.fromPolar(lenH, scene.φ+Math.PI/2);
    $MQ.uniformTypeVal = {
        'colors': ['1i', [0]], //TEXTURE0
        'n_iter': ['1i', [scene.n_iter]],
        'pert': ['2f', [scene.pert.re, scene.pert.im]],
        'pos_part': ['1f', [scene.pos_part]],
        'pos': ['2f', scene.pos],
        'offsetR': ['2f', offsetR],
        'offsetH': ['2f', offsetH],
        'windowSz': ['2f', [canvas.width, canvas.height]],
        'ANTIALIASING': ['1i', [1]], //1 means no antialiasing
    };
    uniformTypeVal = $MQ.uniformTypeVal;
}

$MQ.drawScene = function () {
    resizeCanvas();
    updateUniforms();
    gl.useProgram(program);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, colorsTex);
    for (let uniform in uniformLoc) {
        let typeVal = uniformTypeVal[uniform];
        let type = typeVal[0], val = typeVal[1];
        if (val instanceof $MQ.Complex)
            val = [val.re, val.im];
        let loc = uniformLoc[uniform];
        //the following turns out e.g. like this: gl.uniform2f(loc, 0.0, 0.0);
        gl ['uniform'+type] . apply (gl, [loc].concat(val));
    }
    gl.drawArrays(
        gl.TRIANGLES,
        0,
        cornerVertices.length/2,
    );
}
let drawScene = $MQ.drawScene;

$MQ.init = function ()
{
    if (!$MQ.scene)
        // this controls everything you see in the canvas
        $MQ.scene = {
            n_iter: 170,
            n_iter_prev: null,
            pos: new $MQ.Complex(0,0),
            pos_part: 1.0,
            pert: new $MQ.Complex(0,0), // add perturbation
            φ: 0.0, // turn the scene around
            l: 2.0, // the length (in the fractal pane) from pos to the nearest edge of the canvas
        };
    scene = $MQ.scene;

    // To get WebGL started, I followed WebGL Tutorial 01 by Indigo Code:
    // https://www.youtube.com/watch?v=kB0ZVUrI4Aw
    resizeCanvas();
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    //⇒mouse.js
    canvas.onmousedown = $MQ.handleMouseDown;
    document.onmouseup = $MQ.handleMouseUp;
    document.onmousemove = $MQ.handleMouseMove;

    // Shaders
    let vertex = gl.createShader(gl.VERTEX_SHADER);
    let fragment = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(vertex, $MQ.shaderV);
    gl.shaderSource(fragment, $MQ.shaderF);
    function checkCompileError(shader, type="") {
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            let infoLog = gl.getShaderInfoLog(shader);
            let msg = `ERROR compiling ${type} shader!\n${infoLog}`;
            throw new Error(msg);
        }
    }
    gl.compileShader(vertex);
    checkCompileError(vertex, 'vertex'); //throws error
    gl.compileShader(fragment);
    checkCompileError(fragment, 'fragment'); //throws error
    program = gl.createProgram();
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('ERROR linking shader program!', gl.getProgramInfoLog(program));
        return;
    }
    gl.validateProgram(program);
    if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
        console.error('ERROR validating program!', glgetProgramInfoLog(program));
        return;
    }

    // Uniforms
    uniformLoc = {};
    updateUniforms();
    for (let uniform in uniformTypeVal) {
        uniformLoc[uniform] = gl.getUniformLocation(program, uniform);
        if (!uniformLoc[uniform])
            console.error(`Could not locate uniform ${uniform} in the shaders!`);
    }

    // Attributes
    cornerVertices = [
        // X, Y (×3)
        -1.0,-1.0,  1.0,-1.0,  1.0,1.0,
         1.0,1.0,  -1.0,1.0,  -1.0,-1.0,
    ];
    let cornerVertexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cornerVertexBufferObject);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cornerVertices), gl.STATIC_DRAW);
    let positionAttribLocation = gl.getAttribLocation(program, 'corner');
    gl.vertexAttribPointer(
        positionAttribLocation,
        2, // number of elements per attribute
        gl.FLOAT, // type of elements
        gl.FALSE,
        2 * Float32Array.BYTES_PER_ELEMENT, // size of an individual vertex
        0 // offset from the beginning of a single vertex to this attribute
    );
    gl.enableVertexAttribArray(positionAttribLocation);

    // Textures
    colorsTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, colorsTex);
    gl.texImage2D(
        gl.TEXTURE_2D, //target
        0,             //level
        gl.RGB32F,     //internalformat
        scene.n_iter,  //width
        1,             //height
        0,             //border
        gl.RGB,        //format
        gl.FLOAT,      //type
        $MQ.paletteArr(scene.n_iter) //pixels
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.bindTexture(gl.TEXTURE_2D, null);

    // Main render loop
    drawScene();
}

}