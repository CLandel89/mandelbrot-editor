"use strict";

{

let $MB = $CLandel89.Mandelbrot, $u = $MB.utils, $e = $MB.editor, $t = $e.tree, $fp = $e.fractalPanel;

$e.init = function () {
    $e.panel = $u.elem({E: 'a'});
    $e.initExport();
    $t.init();
    $fp.init();
    //⇒editor/mouse.js
    $MB.canvas.addEventListener('mousedown', $e.handleMouseDown);
    document.addEventListener('mouseup', $e.handleMouseUp);
    document.addEventListener('mousemove', $e.handleMouseMove);
    $MB.canvas.addEventListener('wheel', $e.handleWheel);
    $e.initted = true;
};

}