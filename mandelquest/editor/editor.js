"use strict";

{

let $MQ = $MandelQuest, $e = $MQ.editor, $t = $e.tree, $fp = $e.fractalPanel;

$e.init = function () {
    $t.init();
    $fp.init();
    //⇒editor/mouse.js
    $MQ.canvas.onmousedown = $e.handleMouseDown;
    document.onmouseup = $e.handleMouseUp;
    document.onmousemove = $e.handleMouseMove;
    $MQ.canvas.addEventListener('wheel', $e.handleWheel);
};

}