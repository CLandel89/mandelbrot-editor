"use strict";

{

let $MB = $CLandel89.Mandelbrot, $e = $MB.editor, $t = $e.tree, $fp = $e.fractalPanel;

$e.init = function () {
    $t.init();
    $fp.init();
    //⇒editor/mouse.js
    $MB.canvas.addEventListener('mousedown', $e.handleMouseDown);
    document.addEventListener('mouseup', $e.handleMouseUp);
    document.addEventListener('mousemove', $e.handleMouseMove);
    $MB.canvas.addEventListener('wheel', $e.handleWheel);
};

}