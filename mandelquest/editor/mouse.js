// Functions for mouse event handling.
// "down" events are picked up in the canvas, "up" and "move" in the document.
// This assures that mouse dragging is handled as the user would
// expect, even if the pointer leaves the canvas in the process.
// To achieve this, I followed parts of the following (German) tutorial:
// https://viscircle.de/webgl-grundlagen-11-kugeln-rotationsmatrizen-und-mouse-events/

"use strict";

{

let $MQ = $MandelQuest, $e = $MQ.editor, $fp = $e.fractalPanel;

let mouseDown=false, lastMouseX=null, lastMouseY=null;

$e.handleMouseDown = function (ev) {
    mouseDown = true;
    lastMouseX = ev.clientX;
    lastMouseY = ev.clientY;
}

$e.handleMouseUp = function (ev) {
    mouseDown = false;
}

$e.handleMouseMove = function (ev) {
    if (mouseDown) {
        handleMouseDrag(ev);
        return;
    }
}

function handleMouseDrag(ev) {
    const newX = ev.clientX, newY = ev.clientY;
    const deltaX = newX-lastMouseX, deltaY = newY-lastMouseY;

    //Recycle some values calculated for the shaders.
    let uniformTypeVal = $MQ.uniformTypeVal;
    const offsetR = uniformTypeVal['offsetR'][1];
    const offsetH = uniformTypeVal['offsetH'][1];
    //Put it together such that you can drag around the fractals.
    //Note the differences between canvas and OpenGL:
    //(0,0): upper left corner vs. middle
    //Y axis: points downwards vs. upwards
    let fractal = $MQ.scene.fractals[0], canvas = $MQ.canvas;
    fractal.pos = fractal.pos.sub(offsetR.smul(2*deltaX/canvas.width));
    fractal.pos = fractal.pos.add(offsetH.smul(2*deltaY/canvas.height));
    $MQ.drawScene();
    $fp.update();

    lastMouseX = newX;
    lastMouseY = newY;
}

$e.handleWheel = function (ev) {
    //https://stackoverflow.com/a/10313183

    const factor = ev.deltaY>0 ? 1.5 : 1/1.5;
    $MQ.scene.fractals[0].l *= factor;
    const pos = $MQ.scene.fractals[0].pos;
    //calculate the position of the mouse cursor in the complex pane
    //for the canvas coords, c.f. https://riptutorial.com/html5-canvas/example/19534/mouse-coordinates-after-resizing--or-scrolling-
    const oR = $MQ.uniformTypeVal['offsetR'][1];
    const oH = $MQ.uniformTypeVal['offsetH'][1];
    const canvasX = $MQ.canvas.getBoundingClientRect().left;
    const canvasY = $MQ.canvas.getBoundingClientRect().top;
    let mX = (ev.clientX - canvasX - $MQ.canvas.width/2) / ($MQ.canvas.width/2);
    let mY = - (ev.clientY - canvasY - $MQ.canvas.height/2) / ($MQ.canvas.height/2);
    let posM = pos;
    posM = posM.add(oR.smul(mX));
    posM = posM.add(oH.smul(mY));
    //calculate the new center position (the position under the mouse cursor be constant)
    //be                    posM = pos + mX*oR + mY*oH
    //and at the same time  posM = posN + factor*(mX*oR + mY*oH)
    // pos + mX*oR + mY*oH = posN + factor*(mX*oR + mY*oH)
    // posN = pos + (1-factor) * (mX*oR + mY*oH)
    $MQ.scene.fractals[0].pos = pos.add($MQ.add(oR.smul(mX), oH.smul(mY)).smul(1-factor));
    $MQ.drawScene();
    $fp.update();
};

}