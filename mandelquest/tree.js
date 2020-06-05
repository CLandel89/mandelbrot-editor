"use strict";

{

let $MQ = $MandelQuest;

if (!$MQ.editor) $MQ.editor = {};

$MQ.editor.initTree = function ()
{
    let $e = $MQ.editor, $u = $MQ.utils;

    function stylizeButton (button) {
        button.style.padding = '0px 4px';
        button.style.margin = '0px 2px';
        button.style.fontSize = '50%';
        button.style.fontWeight = 900;
        button.style.border = 'none';
    }

    function selectFractal (fractal) {
        let prevFractal = $MQ.scene.fractals[0];
        prevFractal.tree.elemLabel.style.fontWeight = 'normal';
        $MQ.scene.fractals[0] = fractal;
        fractal.tree.elemLabel.style.fontWeight = 900;
        $MQ.drawScene();
        $MQ.editor.update();
    }

    function createFractalButton (parentTree) {
        let result = $u.elem({
            E: 'input',
            type: 'button',
            value: String.fromCodePoint(0xFF0B), //fat plus
            onclick: function () {
                let subTree = parentTree.insertSorted({
                    obj: new $MQ.Fractal(parentTree.obj),
                    T: 'new fractal',
                    onclick: () => { selectFractal(subTree.obj); },
                });
                subTree.tree = subTree.obj.tree = subTree;
                subTree.widgets = [
                    createFractalButton(subTree),
                    removeFractalButton(subTree),
                ];
                subTree.elemLabel.style.fontSize = '85%';
                subTree.refresh();
                parentTree.expand();
            },
        });
        stylizeButton(result);
        return result;
    }

    function removeFractalButton (tree) {
        let result = $u.elem({
            E: 'input',
            type: 'button',
            value: String.fromCodePoint(0xFF0D), //fat minus
            onclick: function () {
                tree.parent.remove(tree);
                tree.parent.refresh();
            },
        });
        stylizeButton(result);
        return result;
    }

    $e.treeSettings = new $u.Tree({T: 'settings'});
    $e.treeFractals = new $u.Tree({
        T: 'fractals',
        onclick: () => { selectFractal($e.treeFractals.obj); },
        obj: $MQ.scene.fractals[0],
    });
    $e.treeFractals.widgets = [createFractalButton($e.treeFractals)];
    $e.treeFractals.refresh();
    $e.treeFractals.obj.tree = $e.treeFractals;
    selectFractal($MQ.scene.fractals[0]);
    $e.treePalettes = new $u.Tree({T: 'palettes'});
    $e.treeAnimations = new $u.Tree({T: 'animations'});
    let tree = document.getElementById($MQ.treeId);
    tree.appendChild($e.treeSettings.elem);
    tree.appendChild($u.elem({E: 'br'}));
    tree.appendChild($e.treeFractals.elem);
    tree.appendChild($u.elem({E: 'br'}));
    tree.appendChild($e.treePalettes.elem);
    tree.appendChild($u.elem({E: 'br'}));
    tree.appendChild($e.treeAnimations.elem);
};

}