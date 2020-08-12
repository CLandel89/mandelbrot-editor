"use strict";

{

let $MB = $CLandel89.Mandelbrot, $e = $MB.editor, $t = $e.tree, $fp = $e.fractalPanel, $u = $MB.utils;

$t.init = function ()
{
    function stylizeButton (button) {
        button.style.padding = '0px 4px';
        button.style.margin = '0px 2px';
        button.style.fontSize = '50%';
        button.style.fontWeight = 900;
        button.style.border = 'none';
    }

    function selectFractal (fractal) {
        let prevFractal = $MB.scene.fractals[0];
        prevFractal.tree.elemLabel.style.fontWeight = 'normal';
        $MB.scene.fractals[0] = fractal;
        fractal.tree.elemLabel.style.fontWeight = 900;
        $MB.drawScene();
        $fp.update();
    }

    function createFractalButton (parentTree) {
        let result = $u.elem({
            E: 'input',
            type: 'button',
            value: String.fromCodePoint(0xFF0B), //fat plus
            onclick: function () {
                let name = 'new fractal';
                function isUnique() {
                    //is the new name unique among the neighboring fractals?
                    for (let sibling of parentTree.children) {
                        if (sibling.obj.name === name)
                            return false;
                    }
                    //no conflicts found, that means this name was not assigned under this parent before
                    return true;
                }
                let nameN = 0;
                while (!isUnique()) {
                    nameN++;
                    name = `new fractal ${nameN}`;
                }
                let subTree = parentTree.insertSorted({
                    obj: new $MB.Fractal(parentTree.obj),
                    T: name,
                    onclick: () => { selectFractal(subTree.obj); },
                });
                subTree.obj.tree = subTree;
                subTree.obj.name = name;
                subTree.widgets = [
                    createFractalButton(subTree),
                    removeFractalButton(subTree),
                ];
                subTree.elemLabel.style.fontSize = '85%';
                subTree.refresh();
                parentTree.expand();
                $e.export.updateJSON();
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
        obj: $MB.scene.fractals[0],
    });
    $t.fractals.widgets = [createFractalButton($t.fractals)];
    $t.fractals.refresh();
    $t.fractals.obj.tree = $t.fractals;
    $t.fractals.obj.name = 'fractals';
    selectFractal($MB.scene.fractals[0]);
    $t.palettes = new $u.Tree({T: 'palettes'});
    $t.animations = new $u.Tree({T: 'animations'});
    $e.tree = $u.elem({
        E: 'table',
        C: [
            $t.settings.elem,
            {E: 'br'},
            $t.fractals.elem,
            {E: 'br'},
            $t.palettes.elem,
            {E: 'br'},
            $t.animations.elem,
        ]
    })
};

$t.jso = function () {
    let result = {};
    result.settings = {}; //WIP
    function fractalTree(ftree) {
        if (ftree === undefined)
            ftree = $t.fractals;
        let fractal = {...ftree.obj.definition()};
        fractal.children = {};
        for (let child of ftree.children)
            //recursion: add subtrees of any depth down to the leaves
            fractal.children[child.obj.name] = fractalTree(child);
        return fractal;
    }
    result.fractals = fractalTree();
    result.palettes = {}; //WIP
    result.animations = {}; //WIP
    return result;
};

}