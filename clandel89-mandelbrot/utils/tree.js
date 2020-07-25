"use strict";

// A tree view of data.

{

let $MB = $CLandel89.Mandelbrot, $u = $MB.utils;

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
        this.T = tree.T;
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
    }

    setLabel(label) {
        this.T = this.elemLabel.textContent = label;
    }

    append (tree) {
        return this.insert(this.children.length, tree);
    }

    insert (index, tree) {
        let childrenA = this.children.slice(0, index);
        let childrenC = this.children.slice(index);
        if (! (tree instanceof $u.Tree)) {
            if (tree === undefined) tree = {};
            tree = {...tree};
            tree.depth = this.depth + 1;
            tree = new $u.Tree(tree);
            tree.parent = this;
        }
        let oldlen = this.children.length;
        this.children = childrenA.concat([tree]).concat(childrenC);
        let newlen = this.children.length;
        if (newlen-1 !== oldlen) throw new Error('Assertion failed');
        this.refresh();
        return tree;
    }

    insertSorted (tree) {
        for (let i=0; i<this.children.length; i++) {
            if (tree.T.toUpperCase() < this.children[i].elemLabel.textContent.toUpperCase())
                return this.insert(i, tree);
        }
        return this.append(tree);
    }

    remove (tree) {
        let found = false, index;
        find_index: for (index=0; index<this.children.length; index++) {
            if (this.children[index] === tree) {
                found = true;
                break find_index;
            }
        }
        if (!found) throw new Error('The specified subtree does not directly belong to this tree.');
        let childrenA = this.children.slice(0, index);
        let childrenB = this.children.slice(index+1);
        this.children = childrenA.concat(childrenB);
        if (this.children.length === 0)
            this.elemExpand.textContent = $u.Tree.EXPANSION_DISABLED_LABEL;
        this.elem.removeChild(tree.elem);
        this.refresh();
    }

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
                }
        }
    }

    expand () {
        if (!this.isExpanded) this.toggleExpanded();
    }

    unexpand () {
        if (this.isExpanded) this.toggleExpanded();
    }

    refresh () {
        this.toggleExpanded(); //toggle
        this.toggleExpanded(); //reset to previous state
        this.elemWidgets.textContent = '';
        for (let widget of this.widgets) this.elemWidgets.appendChild(widget);
    }
};

}