"use strict";

{

let $MQ = $MandelQuest, $e = $MQ.editor, $t = $e.tree, $fp = $e.fractalPanel, $u = $MQ.utils;

$t.init = function () {

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
        $fp.update();
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
                subTree.obj.tree = subTree;
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

    $t.settings = new $u.Tree({T: 'settings'});
    $t.fractals = new $u.Tree({
        T: 'fractals',
        onclick: () => { selectFractal($t.fractals.obj); },
        obj: $MQ.scene.fractals[0],
    });
    $t.fractals.widgets = [createFractalButton($t.fractals)];
    $t.fractals.refresh();
    $t.fractals.obj.tree = $t.fractals;
    selectFractal($MQ.scene.fractals[0]);
    $t.palettes = new $u.Tree({T: 'palettes'});
    $t.animations = new $u.Tree({T: 'animations'});
    let tree = document.getElementById($MQ.treeId);
    tree.appendChild($t.settings.elem);
    tree.appendChild($u.elem({E: 'br'}));
    tree.appendChild($t.fractals.elem);
    tree.appendChild($u.elem({E: 'br'}));
    tree.appendChild($t.palettes.elem);
    tree.appendChild($u.elem({E: 'br'}));
    tree.appendChild($t.animations.elem);
};

}