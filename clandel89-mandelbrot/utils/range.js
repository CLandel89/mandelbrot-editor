"use strict";

// A set of UI elements that interact and have common listener callbacks:
// text field, reset button and slider.

{

let $MB = $CLandel89.Mandelbrot, $u = $MB.utils;

$u.Range = class
{
    constructor (args)
    {
        this.listeners = [];

        args = {...args}; //so "delete" in the next steps cannot interfere with the caller
        // MIN
        this.min = args.min;
        if (this.min === undefined) this.min = 0.0;
        delete args.min;
        // MAX
        this.max = args.max;
        if (this.max === undefined) this.max = 100.0;
        delete args.max;
        // VALUE
        this.value = args.value;
        if (this.value === undefined) this.value = 0.0;
        delete args.value;
        // STEP
        this.step = args.step;
        if (this.step === undefined) this.step = 0.1;
        delete args.step;

        let unexpectedArgs = [];
        for (let arg in args)
            unexpectedArgs.push(`Unexpected argument "${arg}"!`);
        if (unexpectedArgs.length)
            throw new Error(unexpectedArgs.join('\n'));

        this.valueDefault = this.value;

        //  the UI elements
        // TEXT
        this.text = $u.elem({
            E: 'input',
            type: 'text',
            size: 5,
            onkeyup: () => {
                let value = Number(this.text.value);
                if (! (value <= this.max && value >= this.min))
                    return;
                let text = this.text;
                this.text = {}; //avoid endless recursion
                this.change(value);
                this.text = text;
            },
        });
        // RESET
        this.reset = $u.elem({
            E: 'input',
            value: `${this.valueDefault}`,
            type: 'button',
            onclick: () => {
                this.change(this.valueDefault);
            },
        });
        // RANGE
        this.range = $u.elem({
            E: 'input',
            type: 'range',
            min: this.min,
            max: this.max,
            step: this.step,
            value: 0.0,
            oninput: () => {
                let value = Number(this.range.value);
                let range = this.range;
                this.range = {}; //avoid endless recursion
                this.change(value);
                this.range = range;
            },
        });
    }

    change (value) {
        this.value = value;
        this.text.value = `${value}`;
        this.range.value = value;
        for (let listener of this.listeners)
            listener(value);
    }
};

}