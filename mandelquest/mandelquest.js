"use strict";

{

// Global modularization.
// This could (and usually should) be done using ES2015 modules;
// however Firefox 76 doesn't like that when opening the page from local files.

if (! ('$CLandel89' in window))
    window.$CLandel89 = {};
if ('Mandelbrot' in $CLandel89) throw new Error("window.$CLandel89.Mandelbrot already set.");
$CLandel89.Mandelbrot = {};
let $MB = $CLandel89.Mandelbrot;
$MB.editor = {};
$MB.editor.tree = {};
$MB.editor.fractalPanel = {};
$MB.utils = {};

let $e = $MB.editor, $u = $MB.utils; //shorten these inside file-wide scopes

// Include local "dependecies", i.e. the other JS files in the project.
for (let dep of [
    "fragment.glsl",
    "vertex.glsl",
    "complex",
    "editor/editor",
    "editor/mouse",
    "editor/fractal-panel",
    "editor/tree",
    "fractal",
    "palette",
    "utils/elem",
    "utils/range",
    "utils/tree",
]) {
    //https://www.geeksforgeeks.org/how-to-include-a-javascript-file-in-another-javascript-file/
    let scriptTag = document.createElement('script');
    scriptTag.src = `mandelquest/${dep}.js`;
    document.getElementsByTagName('head').item(0).appendChild(scriptTag);
}

// Now that the "dependencies" were attached to the document body,
// we can instruct the browser to kick off the init method AFTER loading.
window.addEventListener(
    'load',
    () => { $MB.init(); },
);

function updateUniforms (fractal) {
    let lenW, lenH; //length inside the complex pane of the fractal
    if ($MB.canvas.height > $MB.canvas.width) {
        lenW = fractal.l;
        lenH = ($MB.canvas.height/$MB.canvas.width) * fractal.l;
    }
    else {
        lenW = ($MB.canvas.width/$MB.canvas.height) * fractal.l;
        lenH = fractal.l;
    }
    let screenW = $MB.Complex.fromPolar(lenW, fractal.φ);
    let screenH = $MB.Complex.fromPolar(lenH, fractal.φ+Math.PI/2);
    $MB.uniformTypeVal = {
        'bgPhase': ['1f', [$MB.scene.bgPhase]],
        'colors': ['1i', [0]], //TEXTURE0
        'cut': ['1f', [fractal.cut]],
        'julia': ['1f', [fractal.julia]],
        'n_iter': ['1i', [fractal.n_iter]],
        'pert': ['2f', fractal.pert],
        'pos': ['2f', fractal.pos],
        'screenW': ['2f', screenW],
        'screenH': ['2f', screenH],
        'trans1': ['1i', [fractal.trans1]],
        'trans2': ['1i', [fractal.trans2]],
    };
    $MB.uniformTypeVal = $MB.uniformTypeVal;
};

$MB.drawScene = function () {
    updateUniforms($MB.scene.fractals[0]);
    $MB.gl.useProgram($MB.program);
    $MB.gl.activeTexture($MB.gl.TEXTURE0);
    $MB.gl.bindTexture($MB.gl.TEXTURE_2D, $MB.colorsTex);
    for (let uniform in $MB.uniformLoc) {
        let typeVal = $MB.uniformTypeVal[uniform];
        let type = typeVal[0], val = typeVal[1];
        if (val instanceof $MB.Complex)
            val = [val.re, val.im];
        let loc = $MB.uniformLoc[uniform];
        //the following turns out e.g. like this: $MQ.gl.uniform2f(loc, 0.0, 0.0);
        $MB.gl ['uniform'+type] . apply ($MB.gl, [loc].concat(val));
    }
    $MB.gl.drawArrays(
        $MB.gl.TRIANGLES,
        0,
        $MB.cornerVertices.length/2,
    );
};

$MB.init = function ()
{
    // $MQ.scene controls everything you see in the canvas
    if (!$MB.scene) $MB.scene = {};
    // default values
    if (! ('bgPhase' in $MB.scene)) $MB.scene.bgPhase = 1.0;
    if (! ('fractals' in $MB.scene)) $MB.scene.fractals = [new $MB.Fractal()];
    if (! ('n_iter_prev' in $MB.scene)) $MB.scene.n_iter_prev = null;

    // To get WebGL started, I followed WebGL Tutorial 01 by Indigo Code:
    // https://www.youtube.com/watch?v=kB0ZVUrI4Aw
    $MB.canvas = document.getElementById($MB.canvasId);
    $MB.gl = $MB.canvas.getContext('webgl2');
    if (!$MB.gl) {
        alert('WebGL v2 not supported, falling back on experimental-webgl');
        $MB.gl = $MB.canvas.getContext('experimental-webgl');
    }
    if (!$MB.gl) {
        alert('Your browser does not support WebGL');
        return undefined;
    }
    $MB.gl.viewport(0, 0, $MB.canvas.width, $MB.canvas.height);
    {
        //resize event handling https://stackoverflow.com/a/5825523
        let cWidth = $MB.canvas.width, cHeight = $MB.canvas.height;
        setInterval(function () {
            if ($MB.canvas.width !== cWidth || $MB.canvas.height !== cHeight) {
                cWidth = $MB.canvas.width;
                cHeight = $MB.canvas.height;
                $MB.gl.viewport(0, 0, $MB.canvas.width, $MB.canvas.height);
                $MB.drawScene();
            }
        }, 300);
    }
    $MB.gl.clearColor(0.0, 0.0, 0.0, 1.0);
    $MB.gl.clear($MB.gl.COLOR_BUFFER_BIT | $MB.gl.DEPTH_BUFFER_BIT);

    // Shaders
    let vertex = $MB.gl.createShader($MB.gl.VERTEX_SHADER);
    let fragment = $MB.gl.createShader($MB.gl.FRAGMENT_SHADER);
    $MB.gl.shaderSource(vertex, $MB.shaderV);
    $MB.gl.shaderSource(fragment, $MB.shaderF);
    function checkCompileError(shader, type="") {
        if (!$MB.gl.getShaderParameter(shader, $MB.gl.COMPILE_STATUS)) {
            let infoLog = $MB.gl.getShaderInfoLog(shader);
            let msg = `ERROR compiling ${type} shader!\n${infoLog}`;
            throw new Error(msg);
        }
    }
    $MB.gl.compileShader(vertex);
    checkCompileError(vertex, 'vertex'); //throws error
    $MB.gl.compileShader(fragment);
    checkCompileError(fragment, 'fragment'); //throws error
    $MB.program = $MB.gl.createProgram();
    $MB.gl.attachShader($MB.program, vertex);
    $MB.gl.attachShader($MB.program, fragment);
    $MB.gl.linkProgram($MB.program);
    if (!$MB.gl.getProgramParameter($MB.program, $MB.gl.LINK_STATUS)) {
        console.error('ERROR linking shader program!', $MB.gl.getProgramInfoLog($MB.program));
        return;
    }
    $MB.gl.validateProgram($MB.program);
    if (!$MB.gl.getProgramParameter($MB.program, $MB.gl.VALIDATE_STATUS)) {
        console.error('ERROR validating program!', glgetProgramInfoLog($MB.program));
        return;
    }

    // Uniforms
    $MB.uniformLoc = {};
    updateUniforms($MB.scene.fractals[0]);
    for (let uniform in $MB.uniformTypeVal) {
        $MB.uniformLoc[uniform] = $MB.gl.getUniformLocation($MB.program, uniform);
        if (!$MB.uniformLoc[uniform])
            console.error(`Could not locate uniform ${uniform} in the shaders!`);
    }

    // Attributes
    $MB.cornerVertices = [
        // X, Y (×3)
        -1.0,-1.0,  1.0,-1.0,  1.0,1.0,
         1.0,1.0,  -1.0,1.0,  -1.0,-1.0,
    ];
    let cornerVertexBufferObject = $MB.gl.createBuffer();
    $MB.gl.bindBuffer($MB.gl.ARRAY_BUFFER, cornerVertexBufferObject);
    $MB.gl.bufferData($MB.gl.ARRAY_BUFFER, new Float32Array($MB.cornerVertices), $MB.gl.STATIC_DRAW);
    let positionAttribLocation = $MB.gl.getAttribLocation($MB.program, 'corner');
    $MB.gl.vertexAttribPointer(
        positionAttribLocation,
        2, // number of elements per attribute
        $MB.gl.FLOAT, // type of elements
        $MB.gl.FALSE,
        2 * Float32Array.BYTES_PER_ELEMENT, // size of an individual vertex
        0 // offset from the beginning of a single vertex to this attribute
    );
    $MB.gl.enableVertexAttribArray(positionAttribLocation);

    // Textures
    $MB.colorsTex = $MB.gl.createTexture();
    $MB.gl.bindTexture($MB.gl.TEXTURE_2D, $MB.colorsTex);
    let n_iter = $MB.scene.fractals[0].n_iter;
    $MB.gl.texImage2D(
        $MB.gl.TEXTURE_2D,                //target
        0,                                //level
        $MB.gl.RGB32F,                    //internalformat
        n_iter,     //width
        1,                                //height
        0,                                //border
        $MB.gl.RGB,                       //format
        $MB.gl.FLOAT,                     //type
        $MB.paletteArr(n_iter)  //pixels
    );
    $MB.gl.texParameteri($MB.gl.TEXTURE_2D, $MB.gl.TEXTURE_WRAP_S, $MB.gl.CLAMP_TO_EDGE);
    $MB.gl.texParameteri($MB.gl.TEXTURE_2D, $MB.gl.TEXTURE_WRAP_T, $MB.gl.CLAMP_TO_EDGE);
    $MB.gl.texParameteri($MB.gl.TEXTURE_2D, $MB.gl.TEXTURE_MAG_FILTER, $MB.gl.NEAREST);
    $MB.gl.texParameteri($MB.gl.TEXTURE_2D, $MB.gl.TEXTURE_MIN_FILTER, $MB.gl.NEAREST);
    $MB.gl.bindTexture($MB.gl.TEXTURE_2D, null);

    // Main render loop
    // (just returning from the function in this case)
    $MB.drawScene();
    // Are the panel and tree also desired or just the canvas?
    $e.enabled = !! ($MB.panelId && $MB.treeId);
    if ($e.enabled) $e.init();
};

}