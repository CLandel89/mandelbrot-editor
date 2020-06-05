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

$u.Tree = class
{
    static INDENT_T = '⊢-';
    static INDENT_T_LAST = '⊢ ';
    static EXPAND_LABEL = '→ ';
    static EXPANDED_LABEL = '↓ ';
    static EXPANSION_DISABLED_LABEL = '· ';

    constructor (tree)
    {
        //tree.E, tree.T, tree.C similar like in elem(...); tree.W: array of widgets like action buttons
        if (tree === undefined) tree = {};
        //shallow copy so we can add and delete attributes at the top level
        tree = {...tree};
        if (tree.depth === undefined) tree.depth = 0;
        this.depth = tree.depth;
        delete tree.depth;
        this.children = [];
        if (!tree.T) tree.T = '';
        let indentT = '';
        for (let d=0; d<this.depth; d++) {
            if (d === this.depth-1)
                indentT += $u.Tree.INDENT_T_LAST;
            else
                indentT += $u.Tree.INDENT_T;
        };
        this.elemIndent = $u.elem({
            E: 'code',
            T: indentT,
        });
        this.isExpanded = false;
        this.elemExpand = $u.elem({
            E: 'label',
            onclick: () => {
                this.toggleExpanded();
            },
        });
        this.elemExpand.style.fontFamily = 'monospace';
        this.elemLabel = $u.elem({
            E: 'label',
            T: tree.T,
        });
        delete tree.T;
        if (tree.W === undefined) tree.W = [];
        this.widgets = tree.W;
        delete tree.W;
        this.elemWidgets = $u.elem({E: 'span'});
        let elemC = [];
        if (this.depth)
            elemC.push($u.elem({E: 'br'}));
        elemC.push(this.elemIndent);
        elemC.push(this.elemExpand);
        elemC.push(this.elemLabel);
        elemC.push(this.elemWidgets);
        this.elem = $u.elem({
            E: 'span',
            C: elemC,
        });
        if (tree.C) {
            for (let child of tree.C)
                //recursion
                this.append(child);
            delete tree.C;
        };
        if (tree.obj) {
            this.obj = tree.obj;
            delete tree.obj;
        };
        //any remaining attributes in the constructor argument are patched onto elemLabel
        for (let attr in tree)
            this.elemLabel[attr] = tree[attr];
        this.refresh();
    };

    append (tree) {
        return this.insert(this.children.length, tree);
    };

    insert (index, tree) {
        let childrenA = this.children.slice(0, index);
        let childrenC = this.children.slice(index);
        if (! (tree instanceof $u.Tree)) {
            if (tree === undefined) tree = {};
            tree = {...tree};
            tree.depth = this.depth + 1;
            tree = new $u.Tree(tree);
            tree.parent = this;
        };
        let oldlen = this.children.length;
        this.children = childrenA.concat([tree]).concat(childrenC);
        let newlen = this.children.length;
        if (newlen-1 !== oldlen) throw new Error('Assertion failed');
        this.refresh();
        return tree;
    };

    insertSorted (tree) {
        for (let i=0; i<this.children.length; i++) {
            if (tree.T.toUpperCase() < this.children[i].elemLabel.textContent.toUpperCase())
                return this.insert(i, tree);
        };
        return this.append(tree);
    };

    remove (tree) {
        let found = false, index;
        find_index: for (index=0; index<this.children.length; index++) {
            if (this.children[index] === tree) {
                found = true;
                break find_index;
            };
        };
        if (!found) throw new Error('The specified subtree does not directly belong to this tree.');
        let childrenA = this.children.slice(0, index);
        let childrenB = this.children.slice(index+1);
        this.children = childrenA.concat(childrenB);
        if (this.children.length === 0)
            this.elemExpand.textContent = $u.Tree.EXPANSION_DISABLED_LABEL;
        this.elem.removeChild(tree.elem);
        this.refresh();
    };

    toggleExpanded () {
        this.isExpanded = !this.isExpanded;
        if (this.children.length === 0)
            this.elemExpand.textContent = $u.Tree.EXPANSION_DISABLED_LABEL;
        if (this.isExpanded) {
            if (this.children.length !== 0)
                this.elemExpand.textContent = $u.Tree.EXPANDED_LABEL;
            for (let child of this.children)
                this.elem.appendChild(child.elem);
        }
        else {
            if (this.children.length !== 0)
                this.elemExpand.textContent = $u.Tree.EXPAND_LABEL;
            for (let child of this.children)
                try {
                    this.elem.removeChild(child.elem);
                }
                catch (error) {
                    //no-op
                };
        };
    };

    expand () {
        if (!this.isExpanded) this.toggleExpanded();
    };

    unexpand () {
        if (this.isExpanded) this.toggleExpanded();
    };

    refresh () {
        this.toggleExpanded(); //toggle
        this.toggleExpanded(); //reset to previous state
        this.elemWidgets.textContent = '';
        for (let widget of this.widgets) this.elemWidgets.appendChild(widget);
    };
};

}