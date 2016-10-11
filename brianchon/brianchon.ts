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

var example0x =
    {
        "A":{"x":-0.71,"y":-0.71},"B":{"x":-0.35301353013530135,"y":0.7146371463714637},
        "C":{"x":0.3751537515375154,"y":0.7220172201722017},"D":{"x":0.5842558425584256,"y":0.2939729397293973},
        "E":{"x":0.5571955719557196,"y":-0.16851168511685116},"F":{"x":0.013530135301353014,"y":-0.8769987699876999},
        "F0":{"x":0.5,"y":0.5},"F1":{"x":-0.5,"y":-0.5},
        "P":{"x":0,"y":0.5}
    };

var example0 = 
{
    "A": xy2c(example0x.A), 
"B": xy2c(example0x.B),
"C": xy2c(example0x.C),
"D": xy2c(example0x.D),
"E": xy2c(example0x.E),
"F": xy2c(example0x.F),
"F0": xy2c(example0x.F0),
"F1": xy2c(example0x.F1),
"P": xy2c(example0x.P)
};

function canonicalizeExample(example0: Example) : Example {
    var ei0 = ellipseFromFociAndPoint(example0.F0, example0.F1, example0.P)

    var exampl1 : Example = 
    {"A": canonicalize(ei0, example0.A), 
    "B": canonicalize(ei0, example0.B), 
    "C": canonicalize(ei0, example0.C), 
    "D": canonicalize(ei0, example0.D), 
    "E": canonicalize(ei0, example0.E), 
    "F": canonicalize(ei0, example0.F), 
    "F0": canonicalize(ei0, example0.F0), 
    "F1": canonicalize(ei0, example0.F1), 
    "P": canonicalize(ei0, example0.P)
    };
    return exampl1;
}

var example1 = canonicalizeExample(example0);

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

function canonicalize(ei:ellipseInfo, p:C): C {
    // Move the center to zero.
    // Rotate so that the major axis is on the real line 
    return fixy(p.sub(ei.cent).mul(t2c(-ei.angle)));
}

function deCanonicalize(ei:ellipseInfo, p:C) : C {
    return fixy(p.div(t2c(-ei.angle)).add(ei.cent));
}

function ellipseLineIntersection(ei: ellipseInfo, p: C): C {
    var p2 = canonicalize(ei, p);
    var a = ei.majorAxisVector.abs().x;
    var b = ei.minorAxisVector.abs().x;
    var x = p2.x;
    var y = fixy(p2).y;
    var coeff = a*b/Math.sqrt(a*a*y*y+b*b*x*x);
    var retval = c(coeff*x, coeff*y);
    return deCanonicalize(ei, retval);
}

function findTangent(ei:ellipseInfo, p:C): any {
    var eli = ellipseLineIntersection(ei, p);
    var eli2 = canonicalize(ei, eli);
    // var f0 = canonicalize(ei, ei.foci[0]);
    // var f1 = canonicalize(ei, ei.foci[1]);
    // var theta0 = (Math.PI - f0.sub(eli2).div(f1.sub(eli2)).angle())/2;
    // var theta1 = eli2.sub(f0).angle();
    // return t2c(Math.PI - (theta0 - theta1)).mul(t2c(ei.angle));
    var majoraxislength = ei.majorAxisVector.abs().x;
    var minoraxislength = ei.minorAxisVector.abs().x;
    //var circley = Math.sqrt(majoraxislength*majoraxislength - eli2.x*eli2.x);
    var circley = eli2.y *majoraxislength / minoraxislength;
    var circleeli = c(eli2.x, circley);
    var circleeli2 = circleeli.mul(t2c(Math.PI/2));
    var ellipsec = circleeli.add(circleeli2);
    ellipsec.y = ellipsec.y / majoraxislength * minoraxislength;
    return {circleeli: deCanonicalize(ei, circleeli),
        circleeli2: deCanonicalize(ei, circleeli2),
        endpoint1: deCanonicalize(ei, circleeli.add(circleeli2)),
        endpoint2: deCanonicalize(ei, circleeli.sub(circleeli2)),
        ellipsec: deCanonicalize(ei, ellipsec)
    };
    // var verticalscale = majoraxislength/minoraxislength;
    // eli2.y = eli2.y * verticalscale;
    // var retval = eli2.mul(t2c(Math.PI/2));
    // // var retval = eli2;
    // retval.y = retval.y / verticalscale;
    // return deCanonicalize(ei, retval);
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
            //drawEllipse(ctx, ei.cent, ei.majorAxisVector, ei.majorAxisVector.mul(t2c(Math.PI/2)), "#000", 0);
            var locs = getLocations();

            var data = ptLabels
                .map(function(pt) { return locs[pt];})           
                // .sort(function(p0:C, p1:C) {
                //     return p0.sub(ei.cent).angle() - p1.sub(ei.cent).angle();
                // })
                .map(function(lp) {                     
                    var eli = ellipseLineIntersection(ei, lp);
                    var tan = findTangent(ei, lp);
                    return {lp, eli, tan};
                });

            var ints = new Array<C>();

            for(var i = 0; i < 1; i++) {
                var d0 = data[i];
                var d1 = data[(i+1) % data.length];
                ctx.beginPath();
                ctx.strokeStyle = "lightgray";
                //ctx.moveTo(ei.cent.x, ei.cent.y);
                ctx.moveTo(d0.eli.x, d0.eli.y);
                ctx.lineTo(d0.lp.x, d0.lp.y);
                ctx.stroke();
                var eli = d0.eli;
                // var tan = d0.tan.circleeli;
                // ctx.beginPath();
                // ctx.strokeStyle = "black";
                // ctx.arc(tan.x, tan.y, .1, 0, 2* Math.PI);
                // ctx.stroke();
                // var tan = d0.tan.circleeli2;
                // ctx.beginPath();
                // ctx.strokeStyle = "black";
                // ctx.arc(tan.x, tan.y, .1, 0, 2* Math.PI);
                // ctx.stroke();
                // ctx.beginPath();
                // ctx.moveTo(d0.tan.endpoint1.x, d0.tan.endpoint1.y);
                // ctx.lineTo(d0.tan.endpoint2.x, d0.tan.endpoint2.y);
                // ctx.stroke();
                var tan = d0.tan.ellipsec;
                ctx.beginPath();
                var vect = eli.sub(tan);
                var left = eli.add(vect);
                var right = eli.sub(vect);
                ctx.moveTo(left.x, left.y);
                ctx.lineTo(right.x, right.y);
                ctx.stroke();
                ctx.beginPath();
                ctx.strokeStyle = "black";
                ctx.arc(tan.x, tan.y, .05, 0, 2* Math.PI);
                ctx.stroke();

                ctx.beginPath();
                ctx.strokeStyle = "black";
                ctx.arc(eli.x, eli.y, .05, 0, 2* Math.PI);
                ctx.stroke();


                // ctx.moveTo(eli.x, eli.y);
                // ctx.lineTo(tan.x, tan.y);
                // ctx.lineTo(tan.x - 2*eli.x, tan.y - 2*eli.y);
                // ctx.stroke();
                // ctx.beginPath();
                // ctx.strokeStyle = "black";
                // ctx.arc(tan.x, tan.y, .05, 0, 2* Math.PI);
                // ctx.stroke();
                // ctx.beginPath();
                // ctx.moveTo(eli.x, eli.y);
                // ctx.lineTo(eli.x+tan.x, eli.y+tan.y);
                // ctx.lineTo(eli.x-tan.x, eli.y-tan.y);
                // ctx.stroke();
                // var int = lineLineIntersectionZD(d0.eli, d0.tan, d1.eli, d1.tan);
                // ints[i] = int;
                // ctx.beginPath();
                // ctx.moveTo(d0.eli.x, d0.eli.y);
                // ctx.lineTo(int.x, int.y);
                // ctx.lineTo(d1.eli.x, d1.eli.y);
                // ctx.stroke();
            }

            for(var i = 0; i < ints.length / 2; i++) {
                var int0 = ints[i];
                var int1 = ints[(i+3) % ints.length];
                ctx.beginPath();
                ctx.moveTo(int0.x, int0.y);
                ctx.lineTo(int1.x, int1.y);
                ctx.stroke();
            }

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