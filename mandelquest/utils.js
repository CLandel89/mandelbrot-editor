"use strict";

// We could use JSX or vue.js or something, or... reinvent the wheel.

{

let $MQ = $MandelQuest;
$MQ.utils = {};
let $u = $MQ.utils;

$u.elem = function(definition) {
    // Creates a DOM.
    // E: element type
    // T: textContent
    // C: children
    //    (recursion if e contains an attribute "E")
    //    (else appended as is)
    let element = document.createElement(definition.E);
    if (definition.T !== undefined) element.textContent = definition.T;
    if (definition.C)
        for (let c of definition.C) {
            if ('E' in c)
                //recursion
                element.append($u.elem(c));
            else
                element.append(c);
        }
    for (let attr in definition) {
        if (['E','T','C'].includes(attr))
            continue;
        element[attr] = definition[attr];
    }
    return element;
};

$u.Range = class
{
    // A set of UI elements that interact and have common listener callbacks:
    // text field, reset button and slider.

    constructor (args) {
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
        //
        for (let arg in args) console.error(`Unexpected argument "${arg}"!`);
        this.valueDefault = this.value;

        let $this = this; //for access from within the UI elements

        // the UI elements
        this.text = $u.elem({
            E: 'input',
            type: 'text',
            size: 5,
            onkeyup: function () {
                let value = Number(this.value);
                if (! (value <= $this.max && value >= $this.min))
                    return;
                $this.text = {};
                $this.change(value);
                $this.text = this;
            },
        });
        this.reset = $u.elem({
            E: 'input',
            value: `${$this.valueDefault}`,
            type: 'button',
            onclick: function () {
                $this.reset = {};
                $this.change($this.valueDefault);
                $this.rest = this;
            },
        });
        this.range = $u.elem({
            E: 'input',
            type: 'range',
            min: $this.min,
            max: $this.max,
            step: $this.step,
            value: 0.0,
            oninput: function () {
                $this.range = {};
                $this.change(Number(this.value));
                $this.range = this;
            },
        });
    }

    change(value) {
        this.value = value;
        this.text.value = `${value}`;
        this.range.value = value;
        for (let listener of this.listeners)
            listener(value);
    }
};

}