"use strict";

// "Export" is a button that lets you save the whole currrent project
// as a JSON file (in-browser "download").

{

let $MB = $CLandel89.Mandelbrot, $u = $MB.utils, $e = $MB.editor, $t = $e.tree;

//In-browser "download": https://shinglyu.com/web/2019/02/09/js_download_as_file.html
$e.initExport = function () {
    $e.export = $u.elem({
        E: 'a',
        T: 'Export',
        download: 'mandelbrot.json',
        href: '#',
        updateJSON: function () {
            if (this.href !== '#')
                URL.revokeObjectURL(this.href);
            let contents = JSON.stringify($t.jso());
            let url = new Blob([contents], {type: 'application/json'});
            this.href = URL.createObjectURL(url);
        },
    });
};

}