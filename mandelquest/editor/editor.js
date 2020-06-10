"use strict";

{

let $MQ = $MandelQuest, $e = $MQ.editor, $u = $MQ.utils;

$e.init = function () {
    $e.initTree();
    initElems();
    //⇒editor/mouse.js
    $MQ.canvas.onmousedown = $e.handleMouseDown;
    document.onmouseup = $e.handleMouseUp;
    document.onmousemove = $e.handleMouseMove;
    $MQ.canvas.addEventListener('wheel', $e.handleWheel);
};

function initElems ()
{
    function fractal () {return $MQ.scene.fractals[0];};
    $e.n_iter = $u.elem({
        E: 'input',
        type: 'text',
        size: 3,
        value: fractal().n_iter,
        onkeyup: function () {
            let value = Math.floor(Number(this.value));
            if (! (value <= 10000 && value >= 0))
                return;
            fractal().n_iter = value;
            $MQ.drawScene();
        }
    });
    $e.trans1 = $u.elem({
        E: 'input',
        type: 'text',
        size: 3,
        value: 0,
        onkeyup: function () {
            let value = Math.floor(Number(this.value));
            if (! (value <= fractal().n_iter && value >= 0))
                return;
            fractal().trans1 = value;
            $MQ.drawScene();
        },
    });
    $e.trans2 = $u.elem({
        E: 'input',
        type: 'text',
        size: 3,
        value: 0,
        onkeyup: function () {
            let value = Math.floor(Number(this.value));
            if (! (value <= fractal().n_iter && value >= fractal().trans1))
                return;
            fractal().trans2 = value;
            $MQ.drawScene();
        },
    });
    $e.bg = $u.elem({E: 'input', type: 'checkbox'});
    $e.bgPhase = 0.0;
    setInterval(function () {
        if ($e.bg.checked) {
            $e.bgPhase = ($e.bgPhase + 100/4000*2*Math.PI) % (2*Math.PI);
            $MQ.scene.bgPhase = (Math.cos($e.bgPhase)+1) / 2;
            $MQ.drawScene();
        }
    }, 100);
    $e.φ = new $u.Range({min:-Math.PI, max:Math.PI, step:2*Math.PI/360, value:fractal().φ});
    $e.φ.listeners.push(value => {
        fractal().φ = value;
        $MQ.drawScene();
    })
    $e.posRe = $u.elem({
        E: 'input',
        type: 'text',
        size: 5,
        onkeyup: function () {
            let value = Number(this.value);
            if (! (value <= 2 && value >= -2))
                return;
            fractal().pos.re = value;
            $MQ.drawScene();
        },
    });
    $e.posIm = $u.elem({
        E: 'input',
        type: 'text',
        size: 5,
        onkeyup: function () {
            let value = Number(this.value);
            if (! (value <= 2 && value >= -2))
                return;
            fractal().pos.im = value;
            $MQ.drawScene();
        },
    });
    $e.l = new $u.Range({min:2**-20, max:2, step:1/256, value:fractal().l});
    $e.l.listeners.push(value => {
        fractal().l = value;
        $MQ.drawScene();
    });
    $e.lp = new $u.elem({
        E: 'input',
        type: 'button',
        value: '+',
        onclick: function () {
            fractal().l /= 33/32;
            $MQ.drawScene();
        }
    });
    $e.lm = new $u.elem({
        E: 'input',
        type: 'button',
        value: '-',
        onclick: function () {
            fractal().l *= 33/32;
            $MQ.drawScene();
        }
    });
    $e.sizeWT = $u.elem({
        E: 'input',
        type: 'text',
        value: $MQ.canvas.width,
        size: 3,
        onkeyup: function () {
            let value = Math.floor(Number(this.value));
            if (! (value <= 1024 && value >= 64))
                return;
            $MQ.canvas.width = value;
            fractal().width = value;
        },
    });
    $e.sizeHT = $u.elem({
        E: 'input',
        type: 'text',
        value: $MQ.canvas.height,
        size: 3,
        onkeyup: function () {
            let value = Math.floor(Number(this.value));
            if (! (value <= 1024 && value >= 64))
                return;
            $MQ.canvas.height = value;
            fractal().height = value;
        },
    });
    $e.pertRe = new $u.Range({min:-2, max:2, step:1/256});
    $e.pertRe.listeners.push(value => {
        fractal().pert.re = value;
        $MQ.drawScene();
    });
    $e.pertIm = new $u.Range({min:-2, max:2, step:1/256});
    $e.pertIm.listeners.push(value => {
        fractal().pert.im = value;
        $MQ.drawScene();
    });
    $e.julia = new $u.Range({min:0, max:1, step:1/256});
    $e.julia.listeners.push(value => {
        fractal().julia = value;
        $MQ.drawScene();
    });
    $e.julia1 = $u.elem({
        E: 'input',
        type: 'button',
        value: '1',
        onclick: function () {$e.julia.change(1);},
    });
    $e.cut = new $u.Range({min:0, max:1, step:1/256});
    $e.cut.listeners.push(value => {
        fractal().cut = value;
        $MQ.drawScene();
    });
    $e.panel = $u.elem({
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
                    {E: 'td', T: 'Transp'},
                    {
                        E: 'td',
                        C: [$e.trans1, $e.trans2]
                    }
                ]
            },
            {
                E: 'tr',
                C: [
                    {
                        E: 'td',
                        C: [
                            {
                                E: 'label',
                                T: 'phase BG',
                                'for': $e.bg,
                            },
                        ]
                    },
                    {E: 'td', C: [$e.bg]},
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
    if (!$e.panel) return;
    let fractal = $MQ.scene.fractals[0];
    $e.n_iter.value = fractal.n_iter;
    $e.trans1.value = fractal.trans1;
    $e.trans2.value = fractal.trans2;
    $e.φ.value = fractal.φ;
    $e.l.text.value = fractal.l;
    $e.l.range.value = fractal.l;
    $e.posRe.value = fractal.pos.re;
    $e.posIm.value = fractal.pos.im;
    $e.sizeWT.value = fractal.width;
    $MQ.canvas.width = fractal.width;
    $e.sizeHT.value = fractal.height;
    $MQ.canvas.height = fractal.height;
    $e.pertRe.text.value = fractal.pert.re;
    $e.pertRe.range.value = fractal.pert.re;
    $e.pertIm.text.value = fractal.pert.im;
    $e.pertIm.range.value = fractal.pert.im;
    $e.julia.text.value = fractal.julia;
    $e.julia.range.value = fractal.julia;
    $e.cut.text.value = fractal.cut;
    $e.cut.range.value = fractal.cut;
};

}