/// <reference path="../tsfiles/numeric-1.2.3.d.ts" />
/// <reference path="../tsfiles/polynomials.ts" />
/// <reference path="../tsfiles/jquery.d.ts" />
/// <reference path="../tsfiles/jqueryui.d.ts" />
/// <reference path="../tsfiles/ellipseutils.ts" />
/// <reference path="../tsfiles/bpuiutils.ts" />

var cvs: HTMLCanvasElement;
var ctx: CanvasRenderingContext2D;

function getCanvasWH() { return {height: $(cvs).height(), width: $(cvs).width()}; }
function cToPosition2(r: ranges, xy: C) {
    var h = getCanvasWH();
    var xpixelsperunit = h.width / (r.width());
    var ypixelsperunit = h.height / (r.height());
    var left = (xy.x - r.minX) * xpixelsperunit - 5;
    var top = (fixy(xy).y - r.minY) * ypixelsperunit - 5;
    return { "left": left, "top": top };
}
function cToPosition(r: ranges, x: number, y: number) {
    return cToPosition2(r, new numeric.T(x, y));
}
function positionToC(r: ranges, psn) {
    var h = getCanvasWH();
    var x = (psn.left + 5) / (h.width);
    var y = (psn.top + 5) / (h.height);
    return {
        "x": r.minX + (r.maxX - r.minX) * x,
        "y": -1 * (r.minY + (r.maxY - r.minY) * y)
    };
}
function elementToC(r: ranges, elem: JQuery) {
    var retval = positionToC(r, elem.position());
    return c(retval.x, retval.y);
}

function tickmarks(r: ranges, ctx: CanvasRenderingContext2D) {
    ctx.strokeStyle = "lightgray";
    for (var i = 10 * r.minX; i < 10 * r.maxX; i++) {
        ctx.beginPath();
        ctx.moveTo(i / 10.0, .05);
        ctx.lineTo(i / 10.0, -.05);
        ctx.stroke();
    }
    for (var i = 10 * r.minY; i < 10 * r.maxY; i++) {
        ctx.beginPath();
        ctx.moveTo(.05, i / 10.0);
        ctx.lineTo(-.05, i / 10.0);
        ctx.stroke();
    }
}

let r = new ranges({ minX: -2, maxX: 2, minY: -2, maxY: 2 });

var circleRadius = 1;

function circleThrough(z1: C, z2: C, z3: C) {
    var mpz1z2 = z1.add(z2).div(2);
    var z1z2perpdirection = z1.sub(z2).mul(t2c(Math.PI / 2));
    var mpz2z3 = z2.add(z3).div(2);
    var z2z3perpdirection = z2.sub(z3).mul(t2c(Math.PI / 2));
    var center = lineLineIntersectionZD(mpz1z2, z1z2perpdirection,
        mpz2z3, z2z3perpdirection);
    var radius = center.sub(z1).abs().x;
    return { center, radius };
}

function invert(circleRadius: number, a: C): C {
    return rt2c((circleRadius * circleRadius) / (a.abs().x), a.angle());
}

function lineCircle(color: string, pt: C, dir0: C, ctx: CanvasRenderingContext2D) {
    var dir = dir0.div(dir0.abs()).mul(Math.max(r.width(), r.height()));
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.moveTo(pt.x, fixy(pt).y);
    ctx.lineTo(pt.add(dir).x, pt.add(dir).y);
    ctx.moveTo(pt.x, fixy(pt).y);
    ctx.lineTo(pt.sub(dir).x, pt.sub(dir).y);
    ctx.stroke();

    var inv1 = invert(circleRadius, pt);
    var inv2 = invert(circleRadius, pt.add(dir));
    var inv3 = invert(circleRadius, pt.sub(dir));
    var invCircle = circleThrough(inv1, inv2, inv3);
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.arc(invCircle.center.x, invCircle.center.y,
        invCircle.radius, 0, 2 * Math.PI, false);
    ctx.stroke();
}

function invertCircle(color: string, center: C, radius: number, ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.arc(center.x, center.y, radius, 0, 2 * Math.PI, false);
    ctx.stroke();

    var cinv1 = invert(circleRadius, center.add(rt2c(radius, 0)));
    var cinv2 = invert(circleRadius, center.add(rt2c(radius, 2 * Math.PI / 3)));
    var cinv3 = invert(circleRadius, center.add(rt2c(radius, -2 * Math.PI / 3)));

    var cinvCircle = circleThrough(cinv1, cinv2, cinv3);
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.arc(cinvCircle.center.x, cinvCircle.center.y,
        cinvCircle.radius, 0, 2 * Math.PI, false);
    ctx.stroke();
}

function resetInner2(r: ranges, fudgefactor, ctx2, cvs2) {
    var h = $(window).height() - $(cvs2).offset().top - fudgefactor;
    var w = $(window).width() - $(cvs2).offset().left - 200;
    $(cvs2).height(h).attr("height", h).width(w).attr("width", w);

    if(h > w) {
        // Preserve the width, add extra to the height.
        r.minY *= 1.0*h/w; r.maxY *= 1.0*h/w;
    } else {
        r.minX *= 1.0*w/h; r.maxX *= 1.0*w/h;
    }

    ctx2.resetTransform();
    ctx2.transform(cvs2.width / 2, 0, 0, -cvs2.height / 2, cvs2.width / 2, cvs2.height / 2);
    ctx2.scale(2/(r.maxX - r.minX), 2/(r.maxY - r.minY));
    ctx2.translate(-(r.maxX + r.minX)/2, -(r.maxY + r.minY)/2);
    ctx2.lineWidth = 1.0 / cvs2.width * (r.maxX - r.minX);
    axes(r, ctx2);
}

$(function () {
    cvs = <HTMLCanvasElement>document.getElementById("canvas");
    ctx = cvs.getContext("2d");

    $("#pointA").draggable({});
    resetInner2(r, 50, ctx, cvs);

    $("#pointA").css(cToPosition(r, 1.25, 0));

    window.requestAnimationFrame(drawAndRAF);

    setInterval(draw, 1000);

    function drawAndRAF() {
        draw();
        requestAnimationFrame(drawAndRAF);
    };

    function draw() {

        axes(r, ctx);

        tickmarks(r, ctx);

        var a = xy2c(positionToC(r, $("#pointA").position()));
        var aprime = invert(circleRadius, a);
        var insidept = a.abs().x < circleRadius ? a : aprime;
        var outsidept = a.abs().x < circleRadius ? aprime : a;
        var circleptY = Math.sqrt(circleRadius * circleRadius - insidept.abs().x * insidept.abs().x);

        console.log(a);
        var showExamples = $("#showExamples").is(":checked");
        var showOtherExamples = $("#showMoreExamples").is(":checked");
        if (showExamples) {
            lineCircle("blue", c(0, 1.6), c(1, 0), ctx);
            invertCircle("green", c(-1.4, -1.4), .5, ctx);
            invertCircle("orange", c(0, 0), .8, ctx);
        }

        if (showOtherExamples) {
            lineCircle("orange", c(0, -1.1), c(1, 0), ctx);
            lineCircle("orange", c(1.5, 0), c(0, 1), ctx);
            lineCircle("blue", c(0,1), c(1,0), ctx);
        }

        ctx.beginPath();
        ctx.strokeStyle = "black";
        ctx.arc(aprime.x, fixy(aprime).y, .05, 0, 2 * Math.PI, false);
        ctx.stroke();

        ctx.save();

        ctx.rotate(a.angle() + 2 * Math.PI);

        ctx.setLineDash([.05, .05]);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(insidept.abs().x, circleptY);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.strokeStyle = "green";
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(outsidept.abs().x, 0);
        ctx.stroke();

        ctx.moveTo(insidept.abs().x, 0);
        ctx.lineTo(insidept.abs().x, circleptY);
        ctx.lineTo(outsidept.abs().x, 0);
        ctx.stroke();

        ctx.restore();

        ctx.save();
        ctx.strokeStyle = "black";
        if (showExamples || showOtherExamples) {
            ctx.lineWidth = getCanvasWH().width / 38000;
        }
        ctx.beginPath();
        ctx.arc(0, 0, circleRadius, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.restore();

        function l(P1: C, P2: C, strokeStyle: string) {
            ctx.strokeStyle = strokeStyle;
            ctx.beginPath();
            ctx.moveTo(P1.x, P1.y);
            ctx.lineTo(P2.x, P2.y);
            ctx.stroke();
        }
    }

});