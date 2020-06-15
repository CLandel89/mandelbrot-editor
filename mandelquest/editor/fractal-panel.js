"use strict";

{

let $MQ = $MandelQuest, $e = $MQ.editor, $u = $MQ.utils, $fp = $e.fractalPanel, $t = $e.tree;

$fp.init = function () {

    function fractal () {return $MQ.scene.fractals[0];};
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
            $MQ.drawScene();
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
            $MQ.drawScene();
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
            $MQ.drawScene();
        },
    });
    $fp.bg = $u.elem({E: 'input', type: 'checkbox'});
    $fp.bgPhase = 0.0;
    setInterval(function () {
        if ($fp.bg.checked) {
            $fp.bgPhase = ($fp.bgPhase + 100/4000*2*Math.PI) % (2*Math.PI);
            $MQ.scene.bgPhase = (Math.cos($fp.bgPhase)+1) / 2;
            $MQ.drawScene();
        }
    }, 100);
    $fp.φ = new $u.Range({min:-Math.PI, max:Math.PI, step:2*Math.PI/360, value:fractal().φ});
    $fp.φ.listeners.push(value => {
        fractal().φ = value;
        $MQ.drawScene();
    })
    $fp.posRe = $u.elem({
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
    $fp.posIm = $u.elem({
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
    $fp.l = new $u.Range({min:2**-20, max:2, step:1/256, value:fractal().l});
    $fp.l.listeners.push(value => {
        fractal().l = value;
        $MQ.drawScene();
    });
    $fp.lp = new $u.elem({
        E: 'input',
        type: 'button',
        value: '+',
        onclick: function () {
            fractal().l /= 33/32;
            $MQ.drawScene();
        }
    });
    $fp.lm = new $u.elem({
        E: 'input',
        type: 'button',
        value: '-',
        onclick: function () {
            fractal().l *= 33/32;
            $MQ.drawScene();
        }
    });
    $fp.sizeWT = $u.elem({
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
    $fp.sizeHT = $u.elem({
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
    $fp.pertRe = new $u.Range({min:-2, max:2, step:1/256});
    $fp.pertRe.listeners.push(value => {
        fractal().pert.re = value;
        $MQ.drawScene();
    });
    $fp.pertIm = new $u.Range({min:-2, max:2, step:1/256});
    $fp.pertIm.listeners.push(value => {
        fractal().pert.im = value;
        $MQ.drawScene();
    });
    $fp.julia = new $u.Range({min:0, max:1, step:1/256});
    $fp.julia.listeners.push(value => {
        fractal().julia = value;
        $MQ.drawScene();
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
        $MQ.drawScene();
    });
    $fp.panel = $u.elem({
        E: 'table',
        C: [
            {
                E: 'tr',
                C: [
                    {E: 'td', T: 'name'},
                    {E: 'td', C: [$fp.name]}
                ]
            },
            {
                E: 'tr',
                C: [
                    {E: 'td', T: 'N iter'},
                    {E: 'td', C: [$fp.n_iter]}
                ]
            },
            {
                E: 'tr',
                C: [
                    {E: 'td', T: 'Transp'},
                    {
                        E: 'td',
                        C: [$fp.trans1, $fp.trans2]
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
                                'for': $fp.bg,
                            },
                        ]
                    },
                    {E: 'td', C: [$fp.bg]},
                ]
            },
            {
                E: 'tr',
                C: [
                    {E: 'td', T: 'φ'},
                    {
                        E: 'td',
                        C: [
                            $fp.φ.text, $fp.φ.reset,
                            {E: 'br'},
                            $fp.φ.range
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
                            $fp.l.text, $fp.l.reset, $fp.lp, $fp.lm,
                            {E: 'br'},
                            $fp.l.range
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
                        C: [$fp.posRe, $fp.posIm]
                    }
                ]
            },
            {
                E: 'tr',
                C: [
                    {E: 'td', T: 'Size'},
                    {
                        E: 'td',
                        C: [$fp.sizeWT, $fp.sizeHT]
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
                            $fp.pertRe.text, $fp.pertRe.reset,
                            {E: 'br'},
                            $fp.pertRe.range,
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
                            $fp.pertIm.text, $fp.pertIm.reset,
                            {E: 'br'},
                            $fp.pertIm.range,
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
                            $fp.julia.text, $fp.julia.reset, $fp.julia1,
                            {E: 'br'},
                            $fp.julia.range,
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
                            $fp.cut.text, $fp.cut.reset,
                            {E: 'br'},
                            $fp.cut.range,
                        ]
                    }
                ]
            },
        ]
    });
    document.getElementById('mandelquest-panel').appendChild($fp.panel);
    $fp.initted = true;
};

$fp.update = function () {
    if (!$fp.initted) return;
    let fractal = $MQ.scene.fractals[0];
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
    $MQ.canvas.width = fractal.width;
    $fp.sizeHT.value = fractal.height;
    $MQ.canvas.height = fractal.height;
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