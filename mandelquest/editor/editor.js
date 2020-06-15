"use strict";

{

let $MQ = $MandelQuest, $e = $MQ.editor, $t = $e.tree, $fp = $e.fractalPanel;

$e.init = function () {
    $t.init();
    $fp.init();
    //⇒editor/mouse.js
    $MQ.canvas.addEventListener('mousedown', $e.handleMouseDown);
    document.addEventListener('mouseup', $e.handleMouseUp);
    document.addEventListener('mousemove', $e.handleMouseMove);
    $MQ.canvas.addEventListener('wheel', $e.handleWheel);
};

}