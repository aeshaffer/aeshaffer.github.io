/// <reference path="../tsfiles/numeric-1.2.3.d.ts" />
/// <reference path="../tsfiles/polynomials.ts" />
/// <reference path="../tsfiles/jquery.d.ts" />
/// <reference path="../tsfiles/jqueryui.d.ts" />
/// <reference path="../tsfiles/lmellipse.ts" />
/// <reference path="../tsfiles/ellipseutils.ts" />
/// <reference path="../tsfiles/bpuiutils.ts" />
var cvs;
var ctx;
function getH() { return $(cvs).height() / 2; }
function cToPosition2(xy) {
    var h = getH();
    var left = h + xy.x * h - 5;
    var top = h - xy.y * h - 5;
    return { "left": left, "top": top };
}
function cToPosition(x, y) {
    return cToPosition2(new numeric.T(x, y));
}
function positionToC(psn) {
    var h = getH();
    var x = (psn.left + 5 - h) / h;
    var y = -((psn.top + 5 - h) / h);
    return { "x": x, "y": y };
}
function elementToC(elem) {
    var retval = positionToC(elem.position());
    return c(retval.x, retval.y);
}
$(function () {
    cvs = document.getElementById("canvas");
    ctx = cvs.getContext("2d");
    $(".cpt").draggable();
    var r = { minX: -1, maxX: 1, minY: -1, maxY: 1 };
    resetInner(r, 50, ctx, cvs);
    // Nudge this so that the ellipse fitting works?
    $("#pointA").css(cToPosition(-0.7, 0.401));
    $("#pointD").css(cToPosition(-0.6, 0.0));
    $("#pointB").css(cToPosition(0, -0.6));
    $("#pointE").css(cToPosition(0, 0.7));
    $("#pointC").css(cToPosition(0.5, 0.4));
    $("#pointF").css(cToPosition(0.5, 0));
    window.requestAnimationFrame(drawAndRAF);
    function drawAndRAF() {
        draw();
        requestAnimationFrame(drawAndRAF);
    }
    ;
    function draw() {
        var xys = $(".cpt").not("#pointF").map(function (i, e) {
            return elementToC($(e));
        });
        axes(r, ctx);
        ctx.strokeStyle = "#ff0000";
        try {
            var a = fitellipseZS2(xys.get());
            // ctx.beginPath();
            // ctx.moveTo(a.cent.add(a.minorAxisVector).x, a.cent.add(a.minorAxisVector).y);
            // ctx.lineTo(a.cent.sub(a.minorAxisVector).x, a.cent.sub(a.minorAxisVector).y);
            // ctx.stroke();
            // console.log(numeric.prettyPrint(a.foci));
            // console.log(a.axes);
            drawEllipse(ctx, a.cent, a.majorAxisVector, a.minorAxisVector, "#000", 0);
        }
        catch (ex) {
            console.log(ex);
        }
        ctx.strokeStyle = "lightgray";
        for (var i = -10; i < 10; i++) {
            ctx.beginPath();
            ctx.moveTo(i / 10.0, .05);
            ctx.lineTo(i / 10.0, -.05);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(.05, i / 10.0);
            ctx.lineTo(-.05, i / 10.0);
            ctx.stroke();
        }
        function l(P1, P2, strokeStyle) {
            ctx.strokeStyle = strokeStyle;
            ctx.beginPath();
            ctx.moveTo(P1.x, P1.y);
            ctx.lineTo(P2.x, P2.y);
            ctx.stroke();
        }
        var A = elementToC($("#pointA"));
        var B = elementToC($("#pointB"));
        var C = elementToC($("#pointC"));
        var D = elementToC($("#pointD"));
        var E = elementToC($("#pointE"));
        var F = elementToC($("#pointF"));
        ctx.save();
        ctx.lineWidth = ctx.lineWidth * 4;
        l(A, B, "red");
        l(A, F, "yellow");
        l(E, D, "red");
        l(E, F, "blue");
        l(C, D, "yellow");
        l(C, B, "blue");
        var ABDE = lineLineIntersectionZZ(A, B, D, E);
        var AFCD = lineLineIntersectionZZ(A, F, C, D);
        var EFCB = lineLineIntersectionZZ(E, F, C, B);
        ctx.lineWidth = ctx.lineWidth / 2;
        l(ABDE, AFCD, "orange");
        l(ABDE, EFCB, "orange");
        l(AFCD, EFCB, "orange");
        ctx.restore();
    }
});
