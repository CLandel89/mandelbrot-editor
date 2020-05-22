"use strict";

let canvas = document.getElementById("game-surface");
let gl = (function () {
    let gl = canvas.getContext('webgl');
    if (!gl) {
        console.log('WebGL not supported, falling back on experimental-webgl');
        gl = canvas.getContext('experimental-webgl');
    }
    if (!gl) {
        alert('Your browser does not support WebGL');
        return undefined;
    }
    return gl;
}) ();

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, window.innerWidth, window.innerHeight);
}

function initMandelQuest() {
    // To get WebGL started, I followed WebGL Tutorial 01 by Indigo Code:
    // https://www.youtube.com/watch?v=kB0ZVUrI4Aw
    resizeCanvas();
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Create shaders
    let vertex = gl.createShader(gl.VERTEX_SHADER);
    let fragment = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(vertex, shaderV);
    gl.shaderSource(fragment, shaderF);
    function checkCompileError(shader, type="") {
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error(`ERROR compiling ${type} shader!`, gl.getShaderInfoLog(shader));
            return true;
        }
        return false;
    }
    gl.compileShader(vertex);
    if (checkCompileError(vertex, 'vertex')) return;
    gl.compileShader(fragment);
    if (checkCompileError(fragment, 'fragment')) return;
    let program = gl.createProgram();
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

    // Create buffer
    let triangleVertices = [
        // X, Y        // R, G, B
        0.0, 0.5,      1.0, 1.0, 0.0,
        -0.5, -0.5,    0.7, 0.0, 1.0,
        0.5, -0.5,     0.1, 1.0, 0.6,
    ];
    let triangleVertexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexBufferObject);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVertices), gl.STATIC_DRAW);
    let positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
    gl.vertexAttribPointer(
        positionAttribLocation,
        2, // number of elements per attribute
        gl.FLOAT, // type of elements
        gl.FALSE,
        5 * Float32Array.BYTES_PER_ELEMENT, // size of an individual vertex
        0 // offset from the beginning of a single vertex to this attribute
    );
    let colorAttribLocation = gl.getAttribLocation(program, 'vertColor');
    gl.vertexAttribPointer(
        colorAttribLocation,
        3, // number of elements per attribute
        gl.FLOAT, // type of elements
        gl.FALSE,
        5 * Float32Array.BYTES_PER_ELEMENT, // size of an individual vertex
        2 * Float32Array.BYTES_PER_ELEMENT // offset from the beginning of a single vertex to this attribute
    );
    gl.enableVertexAttribArray(positionAttribLocation);
    gl.enableVertexAttribArray(colorAttribLocation);

    // Main render loop
    gl.useProgram(program);
    gl.drawArrays(
        gl.TRIANGLES,
        0,
        3, // ⇒ triangleVertices
    );
}