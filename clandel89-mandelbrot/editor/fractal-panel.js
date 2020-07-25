"use strict";

{

let $MB = $CLandel89.Mandelbrot, $e = $MB.editor, $u = $MB.utils, $fp = $e.fractalPanel, $t = $e.tree;

$fp.init = function ()
{
    function fractal () { return $MB.scene.fractals[0]; }
    $fp.name = $u.elem({
        E: 'input',
        type: 'text',
        size: 8,
        value: fractal().name,
        onkeyup: function () {
            if (this.value.replace(/\s/g, '') === '')
                //disallow names like " " which can lock out the user from the root fractal
                return;
            fractal().name = this.value;
            if (fractal() === $t.fractals.obj)
                $t.fractals.elemLabel.textContent = this.value;
            else {
                let parent = fractal().tree.parent;
                parent.remove(fractal().tree);
                fractal().tree.setLabel(this.value);
                parent.insertSorted(fractal().tree);
            }
        },
    });
    $fp.n_iter = $u.elem({
        E: 'input',
        type: 'text',
        size: 3,
        value: fractal().n_iter,
        onkeyup: function () {
            let value = Math.floor(Number(this.value));
            if (! (value <= 10000 && value >= 0))
                return;
            fractal().n_iter = value;
            $MB.drawScene();
        }
    });
    $fp.trans1 = $u.elem({
        E: 'input',
        type: 'text',
        size: 3,
        value: 0,
        onkeyup: function () {
            let value = Math.floor(Number(this.value));
            if (! (value <= fractal().n_iter && value >= 0))
                return;
            fractal().trans1 = value;
            $MB.drawScene();
        },
    });
    $fp.trans2 = $u.elem({
        E: 'input',
        type: 'text',
        size: 3,
        value: 0,
        onkeyup: function () {
            let value = Math.floor(Number(this.value));
            if (! (value <= fractal().n_iter && value >= fractal().trans1))
                return;
            fractal().trans2 = value;
            $MB.drawScene();
        },
    });
    $fp.bg = $u.elem({E: 'input', type: 'checkbox'});
    $fp.bgPhase = 0.0;
    setInterval(function () {
        if ($fp.bg.checked) {
            $fp.bgPhase = ($fp.bgPhase + 100/4000*2*Math.PI) % (2*Math.PI);
            $MB.scene.bgPhase = (Math.cos($fp.bgPhase)+1) / 2;
            $MB.drawScene();
        }
    }, 100);
    $fp.φ = new $u.Range({min:-Math.PI, max:Math.PI, step:2*Math.PI/360, value:fractal().φ});
    $fp.φ.listeners.push(value => {
        fractal().φ = value;
        $MB.drawScene();
    });
    $fp.posRe = $u.elem({
        E: 'input',
        type: 'text',
        size: 5,
        onkeyup: function () {
            let value = Number(this.value);
            if (! (value <= 2 && value >= -2))
                return;
            fractal().pos.re = value;
            $MB.drawScene();
        },
    });
    $fp.posIm = $u.elem({
        E: 'input',
        type: 'text',
        size: 5,
        onkeyup: function () {
            let value = Number(this.value);
            if (! (value <= 2 && value >= -2))
                return;
            fractal().pos.im = value;
            $MB.drawScene();
        },
    });
    $fp.l = new $u.Range({min:2**-20, max:2, step:1/256, value:fractal().l});
    $fp.l.listeners.push(value => {
        fractal().l = value;
        $MB.drawScene();
    });
    $fp.lp = new $u.elem({
        E: 'input',
        type: 'button',
        value: '+',
        onclick: function () {
            fractal().l /= 33/32;
            $MB.drawScene();
            $fp.update();
        },
    });
    $fp.lm = new $u.elem({
        E: 'input',
        type: 'button',
        value: '-',
        onclick: function () {
            fractal().l *= 33/32;
            $MB.drawScene();
            $fp.update();
        },
    });
    $fp.sizeWT = $u.elem({
        E: 'input',
        type: 'text',
        value: $MB.canvas.width,
        size: 3,
        onkeyup: function () {
            let value = Math.floor(Number(this.value));
            if (! (value <= 1024 && value >= 64))
                return;
            $MB.canvas.width = value;
            fractal().width = value;
        },
    });
    $fp.sizeHT = $u.elem({
        E: 'input',
        type: 'text',
        value: $MB.canvas.height,
        size: 3,
        onkeyup: function () {
            let value = Math.floor(Number(this.value));
            if (! (value <= 1024 && value >= 64))
                return;
            $MB.canvas.height = value;
            fractal().height = value;
        },
    });
    $fp.pertRe = new $u.Range({min:-2, max:2, step:1/256});
    $fp.pertRe.listeners.push(value => {
        fractal().pert.re = value;
        $MB.drawScene();
    });
    $fp.pertIm = new $u.Range({min:-2, max:2, step:1/256});
    $fp.pertIm.listeners.push(value => {
        fractal().pert.im = value;
        $MB.drawScene();
    });
    $fp.julia = new $u.Range({min:0, max:1, step:1/256});
    $fp.julia.listeners.push(value => {
        fractal().julia = value;
        $MB.drawScene();
    });
    $fp.julia1 = $u.elem({
        E: 'input',
        type: 'button',
        value: '1',
        onclick: function () {$fp.julia.change(1);},
    });
    $fp.cut = new $u.Range({min:0, max:1, step:1/256});
    $fp.cut.listeners.push(value => {
        fractal().cut = value;
        $MB.drawScene();
    });
    $fp.panel = $u.elem({
        E: 'table',
        C: [
            $u.labelledTR('name', [$fp.name]),
            $u.labelledTR('N iter', [$fp.n_iter]),
            $u.labelledTR('Transp', [$fp.trans1, $fp.trans2]),
            $u.labelledTR('phase BG', [$fp.bg]),
            $u.labelledTR('φ', [
                $fp.φ.text, $fp.φ.reset,
                {E: 'br'},
                $fp.φ.range,
            ]),
            $u.labelledTR('L', [
                $fp.l.text, $fp.l.reset, $fp.lp, $fp.lm,
                {E: 'br'},
                $fp.l.range,
            ]),
            $u.labelledTR('Pos', [$fp.posRe, $fp.posIm]),
            $u.labelledTR('Size', [$fp.sizeWT, $fp.sizeHT]),
            $u.labelledTR('Pert Re', [
                $fp.pertRe.text, $fp.pertRe.reset,
                {E: 'br'},
                $fp.pertRe.range,
            ]),
            $u.labelledTR('Pert Im', [
                $fp.pertIm.text, $fp.pertIm.reset,
                {E: 'br'},
                $fp.pertIm.range,
            ]),
            $u.labelledTR('Julia', [
                $fp.julia.text, $fp.julia.reset, $fp.julia1,
                {E: 'br'},
                $fp.julia.range,
            ]),
            $u.labelledTR('Cut', [
                $fp.cut.text, $fp.cut.reset,
                {E: 'br'},
                $fp.cut.range,
            ]),
        ]
    });
    document.getElementById('clandel89-mandelbrot-panel').appendChild($fp.panel);
    $fp.initted = true;
};

$fp.update = function () {
    if (!$fp.initted) return;
    let fractal = $MB.scene.fractals[0];
    $fp.name.value = fractal.name;
    $fp.n_iter.value = fractal.n_iter;
    $fp.trans1.value = fractal.trans1;
    $fp.trans2.value = fractal.trans2;
    $fp.φ.value = fractal.φ;
    $fp.l.text.value = fractal.l;
    $fp.l.range.value = fractal.l;
    $fp.posRe.value = fractal.pos.re;
    $fp.posIm.value = fractal.pos.im;
    $fp.sizeWT.value = fractal.width;
    $MB.canvas.width = fractal.width;
    $fp.sizeHT.value = fractal.height;
    $MB.canvas.height = fractal.height;
    $fp.pertRe.text.value = fractal.pert.re;
    $fp.pertRe.range.value = fractal.pert.re;
    $fp.pertIm.text.value = fractal.pert.im;
    $fp.pertIm.range.value = fractal.pert.im;
    $fp.julia.text.value = fractal.julia;
    $fp.julia.range.value = fractal.julia;
    $fp.cut.text.value = fractal.cut;
    $fp.cut.range.value = fractal.cut;
};

}