"use strict";

// We could use JSX or vue.js or something, or... reinvent the wheel.
// (The project is intended to stay free of external dependencies other than a web browser).

{

let $MB = $CLandel89.Mandelbrot, $u = $MB.utils;

$u.elem = function (definition) {
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
    for (let [defKey, defVal] of Object.entries(definition)) {
        if (['E','T','C'].includes(defKey))
            continue;
        element[defKey] = defVal;
    }
    return element;
};

$u.labelledTR = function (label, contents) {
    if (contents === undefined) contents = [];
    return $u.elem({
        E: 'tr',
        C: [
            {E: 'td', T: label},
            {E: 'td', C: contents}
        ]
    });
};

}