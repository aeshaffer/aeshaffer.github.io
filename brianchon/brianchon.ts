/// <reference path="../tsfiles/numeric-1.2.3.d.ts" />
/// <reference path="../tsfiles/polynomials.ts" />
/// <reference path="../tsfiles/jquery.d.ts" />
/// <reference path="../tsfiles/jqueryui.d.ts" />
/// <reference path="../tsfiles/lmellipse.ts" />
/// <reference path="../tsfiles/ellipseutils.ts" />
/// <reference path="../tsfiles/bpuiutils.ts" />
/// <reference path="common.ts" />

var cvs: HTMLCanvasElement;
var ctx: CanvasRenderingContext2D;

class Example {
    A: C; B: C; C: C; D: C; E: C; F: C;
    F0: C; F1: C; P: C
}

var example0 : Example =
    {
        "A":{"x":-0.2742927429274293,"y":0.43911439114391143},
        "B":{"x":-0.16851168511685116,"y":0.7293972939729397},
    "C":{"x":0.21033210332103322,"y":0.1857318573185732},
    "D":{"x":-0.033210332103321034,"y":0.2177121771217712},
    "E":{"x":0.5399753997539976,"y":0.34809348093480935},
    "F":{"x":0.2964329643296433,"y":0.7293972939729397},
    "F0":{"x":0.16851168511685116,"y":0.5301353013530136},
    "F1":{"x":-0.01845018450184502,"y":0.5375153751537516},
    "P":{"x":0.0897908979089791,"y":0.6014760147601476}
};

var ptLabels = ["A", "B", "C", "D", "E", "F"]
function loadExample(example: Example) {
    for (var pt of ptLabels) {
        $("#point" + pt).css(cToPosition2(example[pt]));
    }
    $("#focus0").css(cToPosition2(example.F0));
    $("#focus1").css(cToPosition2(example.F1));
    $("#ellipsePoint").css(cToPosition2(example.P));    
    displayPoints();
}

function getLocations(): Example {
    var retval = new Example();
    for (var pt of ptLabels) {
        var X = elementToC($("#point" + pt));
        retval[pt] = X;
    }
    retval.F0 = elementToC($("#focus0"));
    retval.F1 = elementToC($("#focus1"));
    retval.P = elementToC($("#ellipsePoint"));
    return retval;
}

var ei: ellipseInfo;

function ellipseFromFociAndPoint(F0:C, F1:C, P:C): ellipseInfo {
    var dist = F0.sub(P).abs().x + F1.sub(P).abs().x;
    var cent = F0.add(F1).div(2);
    var minoraxislength = Math.sqrt(Math.pow(dist/2, 2) - Math.pow(F0.sub(F1).abs().x/2, 2));
    var majoraxislength = dist/2;

    var axes = [majoraxislength, minoraxislength]
    var foci = [F0, F1];
    var angle = F0.sub(cent).angle();
    var majorAxisVector = rt2c(majoraxislength, angle);
    var minorAxisVector = rt2c(minoraxislength, angle + Math.PI / 2);

    return {cent, axes, foci, angle, majorAxisVector, minorAxisVector};    
}

function displayPoints() {
    var locs = getLocations();
    var xys = $(".cpt").not("#pointF").map(function (i, e) {
        return elementToC($(e));
    });
    try {
        ei = ellipseFromFociAndPoint(locs.F0, locs.F1, locs.P);
    } catch (ex) {
        ei = null;
        console.log(ex);        
    }
}

$(function () {
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
    }
});