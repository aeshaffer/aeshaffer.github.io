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

var outsideExample = {
    "A": xy2c({ x: 0.1, y: 0.0 }),
    "B": xy2c({ x: 0.0, y: -0.1 }),
    "C": xy2c({ x: -0.2, y: -0.0 }),
    "D": xy2c({ x: -0.4, y: 0.2 }),
    "E": xy2c({ x: -0.1, y: 0.3 }),
    "F": xy2c({ x: 0.1, y: 0.1 })
};

var insideExample: Example = {
    "A": xy2c({ x: -0.7, y: 0.401 }),
    "B": xy2c({ x: 0, y: -0.6 }),
    "C": xy2c({ x: 0.5, y: 0.4 }),
    "D": xy2c({ x: -0.6, y: 0 }),
    "E": xy2c({ x: 0, y: 0.7 }),
    "F": xy2c({ x: 0.5, y: 0 })
};

var ptLabels = ["A", "B", "C", "D", "E", "F"];

class Example {
    A: C; B: C; C: C; D: C; E: C; F: C
}

function loadExample(example: Example) {
    for (var pt of ptLabels) {
        $("#point" + pt).css(cToPosition2(example[pt]));
    }
    displayPoints();
}

enum LeftMiddleRight {
    Left, Middle, Right
}

function leftCenterRight(l: C, r: C, intersection: C): LeftMiddleRight {
    // console.log(l, r, intersection);
    // Move everything so that WLOG l is at zero.
    var l1 = l.sub(l);
    var r1 = r.sub(l);
    var intersection1 = intersection.sub(l);
    // Then rotate everything to be on the real axis.
    var rot = r1.sub(l1);
    var r2 = r1.div(rot); // = r1.abs()
    var intersection2 = intersection1.div(rot);
    // console.log(r2, intersection2);
    if (intersection2.x < 0) {
        return LeftMiddleRight.Left;
    } else if (intersection2.x > r.abs().x) {
        return LeftMiddleRight.Right;
    } else {
        return LeftMiddleRight.Middle;
    }
}

function getLocations(): Example {
    var retval = new Example();
    for (var pt of ptLabels) {
        var X = elementToC($("#point" + pt));
        retval[pt] = X;
    }
    return retval;
}

function getIntersectionObjects() {
    var l = getLocations();
    var obj1 = { name: "ABDE", pair1: [l.A, l.B], pair2: [l.D, l.E], color: "red", intersection: null };
    var obj2 = { name: "AFCD", pair1: [l.A, l.F], pair2: [l.C, l.D], color: "yellow", intersection: null };
    var obj3 = { name: "EFCB", pair1: [l.E, l.F], pair2: [l.C, l.B], color: "blue", intersection: null };
    var objs = [obj1, obj2, obj3];
    var intersections = new Array<C>();
    for (var obj of objs) {
        var intersection = lineLineIntersectionZZ(obj.pair1[0], obj.pair1[1], obj.pair2[0], obj.pair2[1]);
        obj.intersection = intersection;
    }
    return objs;
}

var ei: ellipseInfo;

function displayPoints() {
    var locs = getLocations();
    var objs = getIntersectionObjects();
    var tbody = $("#pointstable tbody");
    console.log("Displaying Points");
    tbody.empty();
    for (var pt of ptLabels) {
        console.log(pt);
        var tr = $("<tr />");
        tbody.append(tr);
        var td0 = $("<td />").text(pt);
        var td1 = $("<td />").text(locs[pt].x.toFixed(2));
        var td2 = $("<td />").text(locs[pt].y.toFixed(2));
        tr.append(td0);
        tr.append(td1);
        tr.append(td2);
    }
    var tbody2 = $("#intersectionstable tbody");
    tbody2.empty();
    for (var obj of objs) {
        var tr = $("<tr />");
        tbody2.append(tr);
        tr.append($("<td />").text(obj.name));
        tr.append($("<td />").text(obj.intersection.x.toFixed(4)));
        tr.append($("<td />").text(obj.intersection.y.toFixed(4)));
    }
    var xys = $(".cpt").not("#pointF").map(function (i, e) {
        return elementToC($(e));
    });
    try {
        ei = fitellipseZS2(xys.get());
        dragF(locs);
    } catch (ex) {
        ei = null;
        console.log(ex);
        $("#fdistance").text("");
    }
}

function dragF2() {
    dragF(getLocations());
}

function dragF(locs: Example) {
    if (ei != null) {
        var ept = ei.cent.add(ei.minorAxisVector);
        function dist(z: C) { return z.sub(ei.foci[0]).abs().x + z.sub(ei.foci[1]).abs().x; }
        var FDist = dist(locs.F);
        var eptDist = dist(ept);
        $("#fdistance").text(FDist.toFixed(4) + " vs. " + eptDist.toFixed(4) + " diff: " + (FDist - eptDist).toFixed(4));
    } else {
        $("#fdistance").text("");
    }
}

$(function () {
    $("#insideexample").on("click", function () { loadExample(insideExample); });
    $("#outsideexample").on("click", function () { loadExample(outsideExample); });
    cvs = <HTMLCanvasElement>document.getElementById("canvas");
    ctx = cvs.getContext("2d");

    $(".cpt").not("#pointF").draggable({
        drag: displayPoints
    });
    $("#pointF").draggable({
        // stop: displayPoints,
        drag: displayPoints
    });
    var r: ranges = { minX: -1, maxX: 1, minY: -1, maxY: 1 };
    resetInner(r, 50, ctx, cvs);
    // Nudge this so that the ellipse fitting works?
    loadExample(outsideExample);

    displayPoints();

    window.requestAnimationFrame(drawAndRAF);

    setInterval(draw, 1000);

    function drawAndRAF() {
        draw();
        requestAnimationFrame(drawAndRAF);
    };

    function draw() {

        axes(r, ctx);
        ctx.strokeStyle = "#ff0000";

        if (ei != null) {
            // ctx.beginPath();
            // ctx.moveTo(a.cent.add(a.minorAxisVector).x, a.cent.add(a.minorAxisVector).y);
            // ctx.lineTo(a.cent.sub(a.minorAxisVector).x, a.cent.sub(a.minorAxisVector).y);
            // ctx.stroke();
            // console.log(numeric.prettyPrint(a.foci));
            // console.log(a.axes);
            drawEllipse(ctx, ei.cent, ei.majorAxisVector, ei.minorAxisVector, "#000", 0);
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
        function l(P1: C, P2: C, strokeStyle: string) {
            ctx.strokeStyle = strokeStyle;
            ctx.beginPath();
            ctx.moveTo(P1.x, P1.y);
            ctx.lineTo(P2.x, P2.y);
            ctx.stroke();
        }



        ctx.save();
        ctx.lineWidth = ctx.lineWidth * 4;
        var objs = getIntersectionObjects();
        for (var obj of objs) {
            l(obj.pair1[0], obj.pair1[1], obj.color);
            l(obj.pair2[0], obj.pair2[1], obj.color);
            extendLine(obj.pair1, obj.intersection, l, obj.color);
            extendLine(obj.pair2, obj.intersection, l, obj.color);
        }
        ctx.lineWidth = ctx.lineWidth / 2;
        for (var i = 0; i < objs.length; i++) {
            l(objs[i].intersection, objs[(i + 1) % objs.length].intersection, "orange");
        }
        ctx.restore();
    }
    function extendLine(pr, intersection, l, color) {
        ctx.save();
        ctx.setLineDash([2 * ctx.lineWidth, 2 * ctx.lineWidth]);

        var lcr = leftCenterRight(pr[0], pr[1], intersection);
        var pt2: C = null;
        switch (lcr) {
            case LeftMiddleRight.Left: pt2 = pr[0]; break;
            case LeftMiddleRight.Right: pt2 = pr[1]; break;
            default: pt2 = null; break;
        }
        if (pt2 != null) {
            l(pt2, intersection, color);
        }
        ctx.restore();
    }
});