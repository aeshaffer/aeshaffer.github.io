/// <reference path="../tsfiles/numeric-1.2.3.d.ts" />
/// <reference path="../tsfiles/polynomials.ts" />
/// <reference path="../tsfiles/jquery.d.ts" />
/// <reference path="../tsfiles/jqueryui.d.ts" />
/// <reference path="../tsfiles/ellipseutils.ts" />
/// <reference path="../tsfiles/bpuiutils.ts" />

namespace CircleInversion {

    var cvs: HTMLCanvasElement;
    var ctx: CanvasRenderingContext2D;

    let r = new ranges({ minX: -2, maxX: 2, minY: -2, maxY: 2 });

    var circleRadius = 1;

    var a: numeric.T;

    function getCanvasWH() { return { height: $(cvs).height(), width: $(cvs).width() }; }
    function cToPosition2(r: ranges, xy: C) {
        var h = getCanvasWH();
        var xpixelsperunit = h.width / (r.width());
        var ypixelsperunit = h.height / (r.height());
        var left = (xy.x - r.minX) * xpixelsperunit - 5;
        // Invert y
        var top = (r.maxY - fixy(xy).y) * ypixelsperunit - 5;
        return { "left": left, "top": top };
    }

    function positionToC2(r: ranges, psn) {
        var h = getCanvasWH();
        var x = (psn.left) / (h.width);
        var y = (psn.top) / (h.height);
        return {
            "x": r.minX + (r.maxX - r.minX) * x,
            "y": -1 * (r.minY + (r.maxY - r.minY) * y)
        };
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
        function vtick(i) {
            ctx.beginPath();
            ctx.moveTo(i / 10.0, .05);
            ctx.lineTo(i / 10.0, -.05);
            ctx.stroke();
        }
        function htick(i) {
            ctx.beginPath();
            ctx.moveTo(.05, i / 10.0);
            ctx.lineTo(-.05, i / 10.0);
            ctx.stroke();
        }
        for (var i = 1; i < 10 * r.maxX; i++) { vtick(i); }
        for (var i = 1; i < -10 * r.minX; i++) { vtick(-i); }
        for (var i = 1; i < 10 * r.maxY; i++) { htick(i); }
        for (var i = 1; i < -10 * r.minY; i++) { htick(-i); }
    }

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

    function lineSegmentsCircles(color: string, linePts: C[], ctx: CanvasRenderingContext2D) {
        for (var i = 0; i < linePts.length; i++) {
            lineSegmentCircle(color, linePts[i], linePts[(i + 1) % linePts.length], ctx);
        }
    }

    function lineSegmentCircle(color: string, a: C, b: C, ctx: CanvasRenderingContext2D) {

        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();

        var circleA = invert(circleRadius, a);
        var circleB = invert(circleRadius, b);
        var circleMidPoint = invert(circleRadius, a.add(b).div(2));

        drawArc(color, circleA, circleMidPoint, circleB, ctx);
    }

    function radiusSegment(color: string, r0: number, r1: number, theta: number, ctx: CanvasRenderingContext2D) {
        var c0 = rt2c(r0, theta);
        var c1 = rt2c(r1, theta);
        var c0inv = invert(circleRadius, c0);
        var c1inv = invert(circleRadius, c1);
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.moveTo(c0.x, c0.y); ctx.lineTo(c1.x, c1.y);
        ctx.stroke();

        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.moveTo(c0inv.x, c0inv.y); ctx.lineTo(c1inv.x, c1inv.y);
        ctx.stroke();
    }

    function circleArc(color: string, r: number, t0: number, t1: number, ctx: CanvasRenderingContext2D) {
        var c0 = rt2c(r, t0);
        var cmp = rt2c(r, (t1 / 2 + t0 / 2));
        var c1 = rt2c(r, t1);
        drawArc(color, c0, cmp, c1, ctx);

        var c0inv = invert(circleRadius, c0);
        var cmpinv = invert(circleRadius, cmp);
        var c1inv = invert(circleRadius, c1);
        drawArc(color, c0inv, cmpinv, c1inv, ctx);
    }

    function drawArc(color: string, circleA: C, circleMidPoint: C, circleB: C, ctx: CanvasRenderingContext2D) {
        var circle = circleThrough(circleA, circleMidPoint, circleB);
        var numberA = normalizeangle(circleA.sub(circle.center).angle());
        var numberB = normalizeangle(circleB.sub(circle.center).angle());
        var numberMP = normalizeangle(circleMidPoint.sub(circle.center).angle());
        if (numberB < numberA) {
            var x = numberB;
            numberB = numberA;
            numberA = x;
        }
        var anticlockwise: boolean;
        if (numberMP < numberA) {
            anticlockwise = true;
        } else if (numberMP >= numberA && numberMP < numberB) {
            anticlockwise = false;
        } else if (numberMP >= numberB) {
            anticlockwise = true;
        } else {
            throw "Shouldn't happen."
        }

        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.arc(circle.center.x, circle.center.y, circle.radius,
            numberA, numberB, anticlockwise);
        ctx.stroke();
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

    function resetInner2(fudgefactor, ctx2, cvs2) {
        var wh = window.innerHeight;
        var ww = window.innerWidth;
        var h = wh - $(cvs2).offset().top - fudgefactor;
        var w = ww - $(cvs2).offset().left - 200;
        $(cvs2).height(h).attr("height", h).width(w).attr("width", w);

        if (h > w) {
            // Preserve the width, add extra to the height.
            r.minY = -2.0 * h / w; r.maxY = 2.0 * h / w;
        } else {
            r.minX = -2.0 * w / h; r.maxX = 2.0 * w / h;
        }

        //console.log(h, w, r.minX, r.maxX, r.minY, r.maxY);

        ctx2.setTransform(1, 0, 0, 1, 0, 0);
        ctx2.transform(cvs2.width / 2, 0, 0, -cvs2.height / 2, cvs2.width / 2, cvs2.height / 2);
        ctx2.scale(2 / (r.maxX - r.minX), 2 / (r.maxY - r.minY));
        ctx2.translate(-(r.maxX + r.minX) / 2, -(r.maxY + r.minY) / 2);
        ctx2.lineWidth = 1.0 / cvs2.width * (r.maxX - r.minX);
        axes(r, ctx2);
    }

    function rescale() {
        resetInner2(20, ctx, cvs);
        if (a.x > r.maxX) { a.x = r.maxX; }
        if (a.y > r.maxY) { a.y = r.maxY; }
        if (a.x < r.minX) { a.x = r.minX; }
        if (a.y < r.minY) { a.y = r.minY; }
        var pos = cToPosition(r, a.x, a.y);
        //console.log(a, r, pos);
        $("#pointA").css(pos);
    }

    export function setup() {
        cvs = <HTMLCanvasElement>document.getElementById("canvas");
        ctx = cvs.getContext("2d");

        $("#pointA").draggable({});
        $("#pointA").draggable({
            stop: function (event, ui) { updateA(); },
            drag: function (event, ui) { updateA(); }
        });

        $(window).on("resize", rescale);

        a = xy2c({ x: 1.25, y: 0 });
        rescale();

        $("#canvas").click(function (e) {
            var posX = $(this).offset().left,
                posY = $(this).offset().top;
            var z = positionToC2(r, { left: e.pageX - posX, top: e.pageY - posY })
            $("#pointA").css(cToPosition2(r, c(z.x, z.y)));
            updateA();            
        });

        window.requestAnimationFrame(drawAndRAF);

        setInterval(draw, 1000);
    }

    function drawAndRAF() {
        draw();
        requestAnimationFrame(drawAndRAF);
    };

    function updateA() {
        a = xy2c(positionToC(r, $("#pointA").position()));
        console.log("Setting A to ", a);
    }

    function draw() {

        axes(r, ctx);

        tickmarks(r, ctx);

        var aprime = invert(circleRadius, a);
        var insidept = a.abs().x < circleRadius ? a : aprime;
        var outsidept = a.abs().x < circleRadius ? aprime : a;
        var circleptY = Math.sqrt(circleRadius * circleRadius - insidept.abs().x * insidept.abs().x);

        var showExamples = $("#showExamples").is(":checked");
        var showOtherExamples = $("#showMoreExamples").is(":checked");
        var showBoxesExamples = $("#showBoxesExamples").is(":checked");
        if (showExamples) {
            lineCircle("blue", c(0, 1.6), c(1, 0), ctx);
            invertCircle("green", c(-1.4, -1.4), .5, ctx);
            invertCircle("orange", c(0, 0), .8, ctx);
        } else if (showOtherExamples) {
            lineCircle("orange", c(0, -1.1), c(1, 0), ctx);
            lineCircle("orange", c(1.5, 0), c(0, 1), ctx);
            lineCircle("blue", c(-1, 0), c(0, 1), ctx);
            lineCircle("red", c(0, .9), c(.1, 0), ctx);

        } else if (showBoxesExamples) {
            var squareAt = (ctr: C, es: number) => [
                ctr.add(c(-es / 2, -es / 2)),
                ctr.add(c(es / 2, -es / 2)),
                ctr.add(c(es / 2, es / 2)),
                ctr.add(c(-es / 2, es / 2))
            ];

            var diamondAt = (ctr: C, es: number) => [
                ctr.add(c(-es / 2, 0)),
                ctr.add(c(0, -es / 2)),
                ctr.add(c(es / 2, 0)),
                ctr.add(c(0, es / 2))
            ];

            for (var i = 0; i <= 20; i += 1) {
                for (var j = 0; j < 20; j++) {
                    var c1 = c(0, 0).add(c(.25 * i, .25 * j));
                    var pts = squareAt(c1, .2);
                    var norms = pts.map(z => z.abs().x);
                    var minabs = Math.min.apply(null, norms);
                    var maxabs = Math.max.apply(null, norms);
                    if (c1.x > -.01 && maxabs < 3 && minabs > 1) {
                        lineSegmentsCircles("blue", pts, ctx);
                    }
                }
            }

            lineSegmentsCircles("red",
                [
                    c(0, -1.5),
                    c(0, -1.5).add(c(.25, .25)),
                    c(0, -1.5).add(c(-.25, .25))
                ], ctx);

            lineSegmentsCircles("green", diamondAt(c(-1, -1), .9), ctx);

            lineSegmentsCircles("red", squareAt(c(.5, -.5), .25), ctx);

            var tfudge = .2;
            var tmax = Math.PI - tfudge;
            var tmin = Math.PI / 2 + tfudge;
            circleArc("blue", .9, tmin, tmax, ctx);
            circleArc("blue", (.9 + .75) / 2, tmin, tmax, ctx);
            circleArc("blue", .75, tmin, tmax, ctx);
            circleArc("blue", (.6 + .75) / 2, tmin, tmax, ctx);
            circleArc("blue", .6, tmin, tmax, ctx);
            radiusSegment("blue", .9, .6, tmin, ctx);
            radiusSegment("blue", .9, .6, tmax, ctx);
            radiusSegment("blue", .9, .6, (tmin + tmax) / 2, ctx);
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
}

$(CircleInversion.setup)