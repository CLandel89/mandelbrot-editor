"use strict";

{

let $MQ = $MandelQuest;
$MQ.editor = {};
let $e = $MQ.editor;

$e.init = function () {
    let elem = $MQ.utils.elem;
    let Range = $MQ.utils.Range;
    $e.n_iter = elem({
        E: 'input',
        type: 'text',
        size: 3,
        value: $MQ.scene.n_iter,
        onkeyup: function () {
            let value = Math.floor(Number(this.value));
            if (! (value <= 10000 && value >= 0))
                return;
            $MQ.scene.n_iter = value;
            $MQ.drawScene();
        }
    });
    $e.φ = new Range({min:-Math.PI, max:Math.PI, step:2*Math.PI/360, value:$MQ.scene.φ});
    $e.φ.listeners.push(value => {
        $MQ.scene.φ = value;
        $MQ.drawScene();
    })
    $e.posRe = elem({
        E: 'input',
        type: 'text',
        size: 5,
        onkeyup: function () {
            let value = Number(this.value);
            if (! (value <= 2 && value >= -2))
                return;
            $MQ.scene.pos.re = value;
            $MQ.drawScene();
        },
    });
    $e.posIm = elem({
        E: 'input',
        type: 'text',
        size: 5,
        onkeyup: function () {
            let value = Number(this.value);
            if (! (value <= 2 && value >= -2))
                return;
            $MQ.scene.pos.im = value;
            $MQ.drawScene();
        },
    });
    $e.l = new Range({min:2**-20, max:2, step:1/256, value:$MQ.scene.l});
    $e.l.listeners.push(value => {
        $MQ.scene.l = value;
        $MQ.drawScene();
    });
    $e.lp = new elem({
        E: 'input',
        type: 'button',
        value: '+',
        onclick: function () {
            $MQ.scene.l /= 33/32;
            $MQ.drawScene();
        }
    });
    $e.lm = new elem({
        E: 'input',
        type: 'button',
        value: '-',
        onclick: function () {
            $MQ.scene.l *= 33/32;
            $MQ.drawScene();
        }
    });
    $e.sizeWT = elem({
        E: 'input',
        type: 'text',
        value: $MQ.canvas.width,
        size: 3,
        onkeyup: function () {
            let value = Math.floor(Number(this.value));
            if (! (value <= 1024 && value >= 64))
                return;
            $MQ.canvas.width = value;
        },
    });
    $e.sizeHT = elem({
        E: 'input',
        type: 'text',
        value: $MQ.canvas.height,
        size: 3,
        onkeyup: function () {
            let value = Math.floor(Number(this.value));
            if (! (value <= 1024 && value >= 64))
                return;
            $MQ.canvas.height = value;
        },
    });
    $e.pertRe = new Range({min:-2, max:2, step:1/256});
    $e.pertRe.listeners.push(value => {
        $MQ.scene.pert.re = value;
        $MQ.drawScene();
    });
    $e.pertIm = new Range({min:-2, max:2, step:1/256});
    $e.pertIm.listeners.push(value => {
        $MQ.scene.pert.im = value;
        $MQ.drawScene();
    });
    $e.julia = new Range({min:0, max:1, step:1/256});
    $e.julia.listeners.push(value => {
        $MQ.scene.julia = value;
        $MQ.drawScene();
    });
    $e.julia1 = elem({
        E: 'input',
        type: 'button',
        value: '1',
        onclick: function () {$e.julia.change(1);},
    });
    $e.cut = new Range({min:0, max:1, step:1/256});
    $e.cut.listeners.push(value => {
        $MQ.scene.cut = value;
        $MQ.drawScene();
    });
    $e.panel = elem({
        E: 'table',
        C: [
            {
                E: 'tr',
                C: [
                    {E: 'td', T: 'N iter'},
                    {E: 'td', C: [$e.n_iter]}
                ]
            },
            {
                E: 'tr',
                C: [
                    {E: 'td', T: 'φ'},
                    {
                        E: 'td',
                        C: [
                            $e.φ.text, $e.φ.reset,
                            {E: 'br'},
                            $e.φ.range
                        ]
                    }
                ]
            },
            {
                E: 'tr',
                C: [
                    {E: 'td', T: 'L'},
                    {
                        E: 'td',
                        C: [
                            $e.l.text, $e.l.reset, $e.lp, $e.lm,
                            {E: 'br'},
                            $e.l.range
                        ]
                    }
                ]
            },
            {
                E: 'tr',
                C: [
                    {E: 'td', T: 'Pos'},
                    {
                        E: 'td',
                        C: [$e.posRe, $e.posIm]
                    }
                ]
            },
            {
                E: 'tr',
                C: [
                    {E: 'td', T: 'Size'},
                    {
                        E: 'td',
                        C: [$e.sizeWT, $e.sizeHT]
                    },
                ]
            },
            {
                E: 'tr',
                C: [
                    {E: 'td', T: 'Pert Re'},
                    {
                        E: 'td',
                        C: [
                            $e.pertRe.text, $e.pertRe.reset,
                            {E: 'br'},
                            $e.pertRe.range,
                        ]
                    },
                ]
            },
            {
                E: 'tr',
                C: [
                    {E: 'td', T: 'Pert Im'},
                    {
                        E: 'td',
                        C: [
                            $e.pertIm.text, $e.pertIm.reset,
                            {E: 'br'},
                            $e.pertIm.range,
                        ]
                    }
                ]
            },
            {
                E: 'tr',
                C: [
                    {E: 'td', T: 'Julia'},
                    {
                        E: 'td',
                        C: [
                            $e.julia.text, $e.julia.reset, $e.julia1,
                            {E: 'br'},
                            $e.julia.range,
                        ]
                    }
                ]
            },
            {
                E: 'tr',
                C: [
                    {E: 'td', T: 'Cut'},
                    {
                        E: 'td',
                        C: [
                            $e.cut.text, $e.cut.reset,
                            {E: 'br'},
                            $e.cut.range,
                        ]
                    }
                ]
            },
        ]
    });
    document.getElementById('mandelquest-panel').appendChild($e.panel);
};

$e.update = function () {
    let pos = $MQ.scene.pos, l = $MQ.scene.l;
    if ($e.posRe && $e.posIm && $e.l) {
        $e.posRe.value = pos.re;
        $e.posIm.value = pos.im;
        $e.l.text.value = l;
        $e.l.range.value = l;
    }
};

}