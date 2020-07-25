"use strict";

{

// Global modularization.
// This could (and usually should) be done using ES2015 modules;
// however Firefox 76 doesn't like that when opening the page from local files.

if (window.$MandelQuest) throw new Error("window.$MandelQuest already set.");
window.$MandelQuest = {};
$MandelQuest.editor = {};
$MandelQuest.editor.tree = {};
$MandelQuest.editor.fractalPanel = {};
$MandelQuest.utils = {};

let $MQ = $MandelQuest, $e = $MQ.editor, $u = $MQ.utils; //shorten these inside file-wide scopes

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
    () => { $MQ.init(); },
);

function updateUniforms (fractal) {
    let lenW, lenH; //length inside the complex pane of the fractal
    if ($MQ.canvas.height > $MQ.canvas.width) {
        lenW = fractal.l;
        lenH = ($MQ.canvas.height/$MQ.canvas.width) * fractal.l;
    }
    else {
        lenW = ($MQ.canvas.width/$MQ.canvas.height) * fractal.l;
        lenH = fractal.l;
    }
    let screenW = $MQ.Complex.fromPolar(lenW, fractal.φ);
    let screenH = $MQ.Complex.fromPolar(lenH, fractal.φ+Math.PI/2);
    $MQ.uniformTypeVal = {
        'bgPhase': ['1f', [$MQ.scene.bgPhase]],
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
    $MQ.uniformTypeVal = $MQ.uniformTypeVal;
};

$MQ.drawScene = function () {
    updateUniforms($MQ.scene.fractals[0]);
    $MQ.gl.useProgram($MQ.program);
    $MQ.gl.activeTexture($MQ.gl.TEXTURE0);
    $MQ.gl.bindTexture($MQ.gl.TEXTURE_2D, $MQ.colorsTex);
    for (let uniform in $MQ.uniformLoc) {
        let typeVal = $MQ.uniformTypeVal[uniform];
        let type = typeVal[0], val = typeVal[1];
        if (val instanceof $MQ.Complex)
            val = [val.re, val.im];
        let loc = $MQ.uniformLoc[uniform];
        //the following turns out e.g. like this: $MQ.gl.uniform2f(loc, 0.0, 0.0);
        $MQ.gl ['uniform'+type] . apply ($MQ.gl, [loc].concat(val));
    }
    $MQ.gl.drawArrays(
        $MQ.gl.TRIANGLES,
        0,
        $MQ.cornerVertices.length/2,
    );
};

$MQ.init = function ()
{
    // $MQ.scene controls everything you see in the canvas
    if (!$MQ.scene) $MQ.scene = {};
    // default values
    if (! ('bgPhase' in $MQ.scene)) $MQ.scene.bgPhase = 1.0;
    if (! ('fractals' in $MQ.scene)) $MQ.scene.fractals = [new $MQ.Fractal()];
    if (! ('n_iter_prev' in $MQ.scene)) $MQ.scene.n_iter_prev = null;

    // To get WebGL started, I followed WebGL Tutorial 01 by Indigo Code:
    // https://www.youtube.com/watch?v=kB0ZVUrI4Aw
    $MQ.canvas = document.getElementById($MQ.canvasId);
    $MQ.gl = $MQ.canvas.getContext('webgl2');
    if (!$MQ.gl) {
        alert('WebGL v2 not supported, falling back on experimental-webgl');
        $MQ.gl = $MQ.canvas.getContext('experimental-webgl');
    }
    if (!$MQ.gl) {
        alert('Your browser does not support WebGL');
        return undefined;
    }
    $MQ.gl.viewport(0, 0, $MQ.canvas.width, $MQ.canvas.height);
    {
        //resize event handling https://stackoverflow.com/a/5825523
        let cWidth = $MQ.canvas.width, cHeight = $MQ.canvas.height;
        setInterval(function () {
            if ($MQ.canvas.width !== cWidth || $MQ.canvas.height !== cHeight) {
                cWidth = $MQ.canvas.width;
                cHeight = $MQ.canvas.height;
                $MQ.gl.viewport(0, 0, $MQ.canvas.width, $MQ.canvas.height);
                $MQ.drawScene();
            }
        }, 300);
    }
    $MQ.gl.clearColor(0.0, 0.0, 0.0, 1.0);
    $MQ.gl.clear($MQ.gl.COLOR_BUFFER_BIT | $MQ.gl.DEPTH_BUFFER_BIT);

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
    updateUniforms($MQ.scene.fractals[0]);
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
    let n_iter = $MQ.scene.fractals[0].n_iter;
    $MQ.gl.texImage2D(
        $MQ.gl.TEXTURE_2D,                //target
        0,                                //level
        $MQ.gl.RGB32F,                    //internalformat
        n_iter,     //width
        1,                                //height
        0,                                //border
        $MQ.gl.RGB,                       //format
        $MQ.gl.FLOAT,                     //type
        $MQ.paletteArr(n_iter)  //pixels
    );
    $MQ.gl.texParameteri($MQ.gl.TEXTURE_2D, $MQ.gl.TEXTURE_WRAP_S, $MQ.gl.CLAMP_TO_EDGE);
    $MQ.gl.texParameteri($MQ.gl.TEXTURE_2D, $MQ.gl.TEXTURE_WRAP_T, $MQ.gl.CLAMP_TO_EDGE);
    $MQ.gl.texParameteri($MQ.gl.TEXTURE_2D, $MQ.gl.TEXTURE_MAG_FILTER, $MQ.gl.NEAREST);
    $MQ.gl.texParameteri($MQ.gl.TEXTURE_2D, $MQ.gl.TEXTURE_MIN_FILTER, $MQ.gl.NEAREST);
    $MQ.gl.bindTexture($MQ.gl.TEXTURE_2D, null);

    // Main render loop
    // (just returning from the function in this case)
    $MQ.drawScene();
    // Are the panel and tree also desired or just the canvas?
    $e.enabled = !! ($MQ.panelId && $MQ.treeId);
    if ($e.enabled) $e.init();
};

}