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
$MQ.gl = (function () {
    let gl = $MQ.canvas.getContext('webgl2');
    if (!gl) {
        alert('WebGL v2 not supported, falling back on experimental-webgl');
        gl = $MQ.canvas.getContext('experimental-webgl');
    }
    if (!gl) {
        alert('Your browser does not support WebGL');
        return undefined;
    }
    return gl;
}) ();

function resizeCanvas() {
    let nw = Math.floor(window.innerWidth*15/16);
    let nh = Math.floor(window.innerHeight*15/16);
    if (nw !== $MQ.canvas.width || nh !== $MQ.canvas.height) {
        $MQ.canvas.width = nw;
        $MQ.canvas.height = nh;
        $MQ.gl.viewport(0, 0, $MQ.canvas.width, $MQ.canvas.height);
    }
}

function updateUniforms() {
    let lenW, lenH; //length inside the complex pane of the fractal
    if ($MQ.canvas.height > $MQ.canvas.width) {
        lenW = $MQ.scene.l;
        lenH = ($MQ.canvas.height/$MQ.canvas.width) * $MQ.scene.l;
    }
    else {
        lenW = ($MQ.canvas.width/$MQ.canvas.height) * $MQ.scene.l;
        lenH = $MQ.scene.l;
    }
    let offsetR = $MQ.fromPolar(lenW, $MQ.scene.φ);
    let offsetH = $MQ.fromPolar(lenH, $MQ.scene.φ+Math.PI/2);
    $MQ.uniformTypeVal = {
        'colors': ['1i', [0]], //TEXTURE0
        'n_iter': ['1i', [$MQ.scene.n_iter]],
        'pert': ['2f', [$MQ.scene.pert.re, $MQ.scene.pert.im]],
        'pos_part': ['1f', [$MQ.scene.pos_part]],
        'pos': ['2f', $MQ.scene.pos],
        'offsetR': ['2f', offsetR],
        'offsetH': ['2f', offsetH],
        'windowSz': ['2f', [$MQ.canvas.width, $MQ.canvas.height]],
        'ANTIALIASING': ['1i', [1]], //1 means no antialiasing
    };
    $MQ.uniformTypeVal = $MQ.uniformTypeVal;
}

$MQ.drawScene = function () {
    resizeCanvas();
    updateUniforms();
    $MQ.gl.useProgram($MQ.program);
    $MQ.gl.activeTexture($MQ.gl.TEXTURE0);
    $MQ.gl.bindTexture($MQ.gl.TEXTURE_2D, $MQ.colorsTex);
    for (let uniform in $MQ.uniformLoc) {
        let typeVal = $MQ.uniformTypeVal[uniform];
        let type = typeVal[0], val = typeVal[1];
        if (val instanceof $MQ.Complex)
            val = [val.re, val.im];
        let loc = $MQ.uniformLoc[uniform];
        //the following turns out e.g. like this: gl.uniform2f(loc, 0.0, 0.0);
        $MQ.gl ['uniform'+type] . apply ($MQ.gl, [loc].concat(val));
    }
    $MQ.gl.drawArrays(
        $MQ.gl.TRIANGLES,
        0,
        $MQ.cornerVertices.length/2,
    );
}

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
    $MQ.scene = $MQ.scene;

    // To get WebGL started, I followed WebGL Tutorial 01 by Indigo Code:
    // https://www.youtube.com/watch?v=kB0ZVUrI4Aw
    resizeCanvas();
    $MQ.gl.clearColor(0.0, 0.0, 0.0, 1.0);
    $MQ.gl.clear($MQ.gl.COLOR_BUFFER_BIT | $MQ.gl.DEPTH_BUFFER_BIT);
    //⇒mouse.js
    $MQ.canvas.onmousedown = $MQ.handleMouseDown;
    document.onmouseup = $MQ.handleMouseUp;
    document.onmousemove = $MQ.handleMouseMove;
    $MQ.canvas.addEventListener('wheel', $MQ.handleWheel);

    // Shaders
    let vertex = $MQ.gl.createShader($MQ.gl.VERTEX_SHADER);
    let fragment = $MQ.gl.createShader($MQ.gl.FRAGMENT_SHADER);
    $MQ.gl.shaderSource(vertex, $MQ.shaderV);
    $MQ.gl.shaderSource(fragment, $MQ.shaderF);
    function checkCompileError(shader, type="") {
        if (!$MQ.gl.getShaderParameter(shader, $MQ.gl.COMPILE_STATUS)) {
            let infoLog = $MQ.gl.getShaderInfoLog(shader);
            let msg = `ERROR compiling ${type} shader!\n${infoLog}`;
            throw new Error(msg);
        }
    }
    $MQ.gl.compileShader(vertex);
    checkCompileError(vertex, 'vertex'); //throws error
    $MQ.gl.compileShader(fragment);
    checkCompileError(fragment, 'fragment'); //throws error
    $MQ.program = $MQ.gl.createProgram();
    $MQ.gl.attachShader($MQ.program, vertex);
    $MQ.gl.attachShader($MQ.program, fragment);
    $MQ.gl.linkProgram($MQ.program);
    if (!$MQ.gl.getProgramParameter($MQ.program, $MQ.gl.LINK_STATUS)) {
        console.error('ERROR linking shader program!', $MQ.gl.getProgramInfoLog($MQ.program));
        return;
    }
    $MQ.gl.validateProgram($MQ.program);
    if (!$MQ.gl.getProgramParameter($MQ.program, $MQ.gl.VALIDATE_STATUS)) {
        console.error('ERROR validating program!', glgetProgramInfoLog($MQ.program));
        return;
    }

    // Uniforms
    $MQ.uniformLoc = {};
    updateUniforms();
    for (let uniform in $MQ.uniformTypeVal) {
        $MQ.uniformLoc[uniform] = $MQ.gl.getUniformLocation($MQ.program, uniform);
        if (!$MQ.uniformLoc[uniform])
            console.error(`Could not locate uniform ${uniform} in the shaders!`);
    }

    // Attributes
    $MQ.cornerVertices = [
        // X, Y (×3)
        -1.0,-1.0,  1.0,-1.0,  1.0,1.0,
         1.0,1.0,  -1.0,1.0,  -1.0,-1.0,
    ];
    let cornerVertexBufferObject = $MQ.gl.createBuffer();
    $MQ.gl.bindBuffer($MQ.gl.ARRAY_BUFFER, cornerVertexBufferObject);
    $MQ.gl.bufferData($MQ.gl.ARRAY_BUFFER, new Float32Array($MQ.cornerVertices), $MQ.gl.STATIC_DRAW);
    let positionAttribLocation = $MQ.gl.getAttribLocation($MQ.program, 'corner');
    $MQ.gl.vertexAttribPointer(
        positionAttribLocation,
        2, // number of elements per attribute
        $MQ.gl.FLOAT, // type of elements
        $MQ.gl.FALSE,
        2 * Float32Array.BYTES_PER_ELEMENT, // size of an individual vertex
        0 // offset from the beginning of a single vertex to this attribute
    );
    $MQ.gl.enableVertexAttribArray(positionAttribLocation);

    // Textures
    $MQ.colorsTex = $MQ.gl.createTexture();
    $MQ.gl.bindTexture($MQ.gl.TEXTURE_2D, $MQ.colorsTex);
    $MQ.gl.texImage2D(
        $MQ.gl.TEXTURE_2D, //target
        0,             //level
        $MQ.gl.RGB32F,     //internalformat
        $MQ.scene.n_iter,  //width
        1,             //height
        0,             //border
        $MQ.gl.RGB,        //format
        $MQ.gl.FLOAT,      //type
        $MQ.paletteArr($MQ.scene.n_iter) //pixels
    );
    $MQ.gl.texParameteri($MQ.gl.TEXTURE_2D, $MQ.gl.TEXTURE_WRAP_S, $MQ.gl.CLAMP_TO_EDGE);
    $MQ.gl.texParameteri($MQ.gl.TEXTURE_2D, $MQ.gl.TEXTURE_WRAP_T, $MQ.gl.CLAMP_TO_EDGE);
    $MQ.gl.texParameteri($MQ.gl.TEXTURE_2D, $MQ.gl.TEXTURE_MAG_FILTER, $MQ.gl.NEAREST);
    $MQ.gl.texParameteri($MQ.gl.TEXTURE_2D, $MQ.gl.TEXTURE_MIN_FILTER, $MQ.gl.NEAREST);
    $MQ.gl.bindTexture($MQ.gl.TEXTURE_2D, null);

    // Main render loop
    $MQ.drawScene();
}

}