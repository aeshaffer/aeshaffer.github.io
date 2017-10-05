/// <reference path="../tsfiles/numeric-1.2.3.d.ts" />
/// <reference path="../tsfiles/polynomials.ts" />
/// <reference path="../tsfiles/jquery.d.ts" />
/// <reference path="../tsfiles/jqueryui.d.ts" />
/// <reference path="../tsfiles/lmellipse.ts" />
/// <reference path="../tsfiles/ellipseutils.ts" />
/// <reference path="../tsfiles/bpuiutils.ts" />


var cvs: HTMLCanvasElement;
var ctx: CanvasRenderingContext2D;

function getH() { return $(cvs).height() / 2; }
function cToPosition2(xy: C) {
    var h = getH();
    var left = h + xy.x * h - 5;
    var top = h - xy.y * h - 5;
    return { "left": left, "top": top };
}
function cToPosition(x: number, y: number) {
    return cToPosition2(new numeric.T(x, y));
}
function positionToC(psn) {
    var h = getH();
    var x = (psn.left + 5 - h) / h;
    var y = -((psn.top + 5 - h) / h);
    return { "x": x, "y": y };
}
function elementToC(elem: JQuery) {
    var retval = positionToC(elem.position());
    return c(retval.x, retval.y);
}
