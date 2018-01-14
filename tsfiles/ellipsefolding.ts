/// <reference path="numeric-1.2.3.d.ts" />
/// <reference path="polynomials.ts" />
/// <reference path="ellipseutils.ts" />

"use strict";

namespace EllipseFolding {

    // fixy?
    function fz(z: numeric.T): numeric.T {
        if (z.y == undefined) {
            return c(z.x, 0);
        } else {
            return z;
        }
    }

    function divideCircle(N) {
        return numeric.linspace(0, 2 * Math.PI * (1 - 1.0 / N), N);
    }

    var cvs: HTMLCanvasElement;
    var ctx: CanvasRenderingContext2D;

    var rngs: ranges;
    function reset(inminX, inmaxX, inminY, inmaxY) {
        rngs = new ranges({ minX: inminX, maxX: inmaxX, minY: inminY, maxY: inmaxY });
        var fudgefactor = 50;
        resetInner(rngs, fudgefactor, ctx, cvs);
        $("#canvasandpoints").css("width", $(cvs).css("width"));
        $("#canvasandpoints").css("height", $(cvs).css("height"));
    }

    var f1: C = c(0, 0);
    var f2: C = c(-.5, 0);
    var numfolds: number;
    var sigma: number;

    function repositionDivs() {
        // Flip y coordinate.
        $("#f1div").css({
            left: cvs.width * (f1.x - rngs.minX) / (rngs.maxX - rngs.minX) - 5 + "px",
            top: cvs.height * (rngs.maxY - f1.y) / (rngs.maxY - rngs.minY) - 5 + "px"
        })

        $("#f2div").css({
            left: cvs.width * (f2.x - rngs.minX) / (rngs.maxX - rngs.minX) - 5 + "px",
            top: cvs.height * (rngs.maxY - f2.y) / (rngs.maxY - rngs.minY) - 5 + "px"
        });
    }

    export function setup() {

        cvs = document.getElementById("canvas") as HTMLCanvasElement;
        ctx = cvs.getContext("2d");

        $(".focusdiv").draggable();

        $(window).on("resize", function () {
            reset(-1, 1, -1, 1);
            repositionDivs();
        });

        window.requestAnimationFrame(drawAndRAF);

        $("#getSVG").click(function () { getSVG($("#cont")); });
        $("#go").click(drawAndRAF);

        function drawAndRAF() {
            draw();
            requestAnimationFrame(drawAndRAF);
        };

        $("#f1x, #f1y, #f2x, #f2y, #numfolds, #sigma").change(function () {
            updateGlobals();
            repositionDivs();
        });

        updateGlobals();
        reset(-1, 1, -1, 1);

        repositionDivs();

        $("#f1div").draggable({
            stop: function (event, ui) { updatef($(this).position(), f1); },
            drag: function (event, ui) { updatef($(this).position(), f1); }
        });

        $("#f2div").draggable({
            stop: function (event, ui) { updatef($(this).position(), f2); },
            drag: function (event, ui) { updatef($(this).position(), f2); }
        });

    }

    function updatef(pos, fn) {
        fn.x = ((pos.left + 5) / cvs.width) * (rngs.maxX - rngs.minX) + rngs.minX;
        fn.y = -(((pos.top + 5) / cvs.height) * (rngs.maxY - rngs.minY) - rngs.maxY);
        $("#f1x").val(f1.x.toFixed(2));
        $("#f1y").val(f1.y.toFixed(2));
        $("#f2x").val(f2.x.toFixed(2));
        $("#f2y").val(f2.y.toFixed(2));
        resetIfGood();
    }

    function updateGlobals() {
        f1.x = parseFloat($("#f1x").val());
        f1.y = parseFloat($("#f1y").val());
        f2.x = parseFloat($("#f2x").val());
        f2.y = parseFloat($("#f2y").val());
        numfolds = parseInt($("#numfolds").val(), 10);
        sigma = parseFloat($("#sigma").val());
        resetIfGood();
    }

    function resetIfGood() {
        if (goodGlobals()) {
            //reset(f1.x - sigma, f1.x + sigma, f1.y - sigma, f1.y + sigma);
            reset(-1, 1, -1, 1);
            repositionDivs();
        }
    }

    function goodGlobals() {
        var allNumbers = [f1.x, f2.x, f1.y, f2.y, numfolds, sigma].every(function (x) { return !isNaN(x); });
        if (!allNumbers) { return false; }
        return (sigma > 0 && numfolds > 0);
    }

    function drawEllipse(ctx: CanvasRenderingContext2D, r: numeric.T, center: numeric.T, t2: numeric.T) {
        ctx.beginPath();
        r = fz(r);
        ctx.moveTo(r.x, r.y);
        var ts = divideCircle(64);
        var ps = new Array(ts.length);
        for (var i = 0; i < ts.length; i++) {
            var theta = ts[i];
            var p = center.add(t2.sub(center).mul(Math.sin(theta)).add(r.sub(center).mul(Math.cos(theta))));
            p = fz(p);
            ps[i] = p;
            ctx.lineTo(p.x, p.y);
        }
        ctx.closePath();
        ctx.stroke();
    }

    function polygonFolds(f1c: numeric.T, f2c: numeric.T) {
        var foldts = new Array<number>();
        if (f1c.sub(f2c).norm2() < sigma) {
            var N = numfolds;
            for (var i = 1; i < N; i++) {
                // start at a point on the major axis and on the circle.
                // the rotate by fractions of the circle.
                var l = rt2c(sigma, (2 * Math.PI / N) * i);
                var z = f1.add(f2.sub(f1).unit().mul(l));
                for (var j = 0; j < 3; j++) {
                    var tangentpts = ellipsetangent(z, f1c, f2c, sigma);
                    var tangentcircleintersections = lineCircleIntersection(z, tangentpts[0].sub(z), f1, sigma);

                    if (tangentcircleintersections.length == 2) {
                        // Draw fold
                        // ctx.save();
                        // ctx.beginPath();
                        // ctx.strokeStyle = "teal";
                        // ctx.setLineDash([.01, .02]);
                        // ctx.moveTo(tangentcircleintersections[0].x, tangentcircleintersections[0].y);
                        // ctx.lineTo(tangentcircleintersections[1].x, tangentcircleintersections[1].y);
                        // ctx.stroke();
                        // ctx.restore();

                        // translate everything so that the center of the ellipse is at the origin.
                        var z0 = z.sub(f1.add(f2).div(2));
                        var ti0 = tangentcircleintersections[0].sub(f1.add(f2).div(2));
                        var ti1 = tangentcircleintersections[1].sub(f1.add(f2).div(2));;
                        // rotate so that z is on the real line.
                        var ti01 = fixy(ti0.div(z0));
                        var ti11 = fixy(ti1.div(z0));

                        var tangentdirection = tangentcircleintersections[0].sub(tangentcircleintersections[1]).unit();

                        // At this point, one of the tangent points is above the real line,
                        // and the other is below it.  Take the point above for the next point.
                        if (ti01.y > 0) {
                            z = tangentcircleintersections[0];
                        } else {
                            z = tangentcircleintersections[1];
                        }

                        var tangentdirectionperp = tangentdirection.mul(t2c(Math.PI / 2));

                        // Get the intersection between the chord
                        // and a line from f2 perpendicular to the chord.
                        var chordtof2line = lineLineIntersectionZD(
                            f2, tangentdirectionperp,
                            z, tangentdirection);

                        // ctx.beginPath();
                        // ctx.arc(chordtof2line.x, chordtof2line.y, .025, 0, 2*Math.PI, false);
                        // ctx.stroke();

                        // Then, find the points where the line from f2
                        // to the intersection point with the chord 
                        // hits the circle.
                        var lci = lineCircleIntersection(
                            f2, chordtof2line.sub(f2),
                            f1, sigma);

                        // Find which intersection between the line and the 
                        // circle is in the same direction as the vector between f2 and
                        // the chord.
                        if (lci[0].sub(f2).div(chordtof2line.sub(f2)).x > 0) {
                            foldts.push(lci[0].sub(f1).angle());
                        } else {
                            foldts.push(lci[1].sub(f1).angle());
                        }
                        // ctx.beginPath();
                        // ctx.arc(lci[0].x, lci[0].y, .025, 0, 2*Math.PI, false);
                        // ctx.stroke();

                        // ctx.beginPath();
                        // ctx.arc(lci[1].x, lci[1].y, .025, 0, 2*Math.PI, false);
                        // ctx.stroke();

                        // foldts.push(lci[1].sub(f1).angle());

                        // ctx.moveTo(z.x, z.y);
                        // ctx.lineTo(tangentpts[1].x, tangentpts[1].y);
                        // ctx.stroke();      
                    }
                }
            }
        }
        return foldts;
    }

    function calcFold(f1c: numeric.T, f2c: numeric.T, sigma: number, t: number) {
        var p = fixy(f1c.add(rt2c(sigma, t)));
        var radius = fixy(p.sub(f1c));
        radius = fixy(radius.div(radius.norm2()).mul(.05));
        //ctx.moveTo(p.add(radius).x, p.add(radius).y);

        // Find midpoint between circle point and the other focus.
        var mp = p.add(f2c).div(2);
        // The fold passes through this line, 
        // perpendicular to the line between the circle point and the 
        // other focus.
        var d = p.sub(mp).mul(rt2c(1, Math.PI / 2));
        d = d.div(d.norm2()).mul(sigma);
        var tangentcircleintersections = lineCircleIntersection(mp, d, f1c, sigma);
        var tangentpoint = lineLineIntersectionZZ(tangentcircleintersections[0], tangentcircleintersections[1], p, f1c);
        // Draw right-angle marker at intersection between chord and focus-circle line.
        var chordlineint = lineLineIntersectionZZ(p, f2c, tangentcircleintersections[0], tangentcircleintersections[1]);
        var squarelength = sigma / 50.0;
        var alongYellow = chordlineint.add(p.sub(f2c).unit().mul(squarelength));
        var corner = alongYellow.add(tangentcircleintersections[0].sub(tangentcircleintersections[1]).unit().mul(squarelength));
        var alongBlue = corner.sub(p.sub(f2c).unit().mul(squarelength));
        return { radius, p, tangentcircleintersections, tangentpoint, alongYellow, alongBlue, corner };
    }

    function text(c: numeric.T, r: number, s: string) {
        var g2 = document.createElementNS('http://www.w3.org/2000/svg', "g");
        g2.setAttribute("transform", "scale(1, -1)");
        var fc1 = document.createElementNS('http://www.w3.org/2000/svg', "text");
        fc1.setAttribute("x", c.x.toString());
        var up = new numeric.T(0, r);
        fc1.setAttribute("y", (fixy(c).Cadd(up)).y.toString());
        fc1.setAttribute("font-size", ".1");
        fc1.appendChild(document.createTextNode(s));
        g2.appendChild(fc1);
        return g2;
    }


    function circle(c: numeric.T, r: number) {
        var fc1 = document.createElementNS('http://www.w3.org/2000/svg', "circle");
        fc1.setAttribute("cx", c.x.toString());
        fc1.setAttribute("cy", (fixy(c)).y.toString());
        fc1.setAttribute("r", r.toString());
        fc1.setAttribute("fill", "none");
        return fc1;
    }

    function encode_as_link() {
        // Add some critical information
        $("#cont svg").attr({ version: '1.1', xmlns: "http://www.w3.org/2000/svg" });

        var svg = $("#cont svg").parent().html(),
            b64 = btoa(svg),
            download = $("#download"),
            html = download.html();

        download.attr("href", 'data:image/svg+xml;base64,' + b64);
    }

    function getSVG(cont) {
        var f1prime = nzero;
        var f2prime = f2.Csub(f1);
        var foldts: number[];
        if ($("#polygonfolds").is(":checked")) {
            foldts = polygonFolds(f1prime, f2prime);
        } else {
            foldts = divideCircle(numfolds);
        }

        var svg = document.createElementNS('http://www.w3.org/2000/svg', "svg");

        svg.setAttribute("width", "1000");
        svg.setAttribute("height", "1000");
        svg.setAttribute("viewBox", "0 0 1 1");
        svg.setAttribute("stroke-width", ".004px");
        svg.setAttribute("style", "stroke:rgb(0,0,0)");

        cont.empty().append(svg);

        var g = document.createElementNS('http://www.w3.org/2000/svg', "g");
        g.setAttribute("transform", "translate(.5,.5) scale(.49,-.49)");
        svg.appendChild(g);
        var uc = circle(nzero, sigma);
        g.appendChild(uc);

        function ls(ss: string, z1: numeric.T, z2: numeric.T, dasharray: string) {
            var line = document.createElementNS('http://www.w3.org/2000/svg', "line");
            line.setAttribute("x1", z1.x.toString());
            line.setAttribute("y1", fixy(z1).y.toString());
            line.setAttribute("x2", z2.x.toString());
            line.setAttribute("y2", fixy(z2).y.toString());
            line.setAttribute("stroke", ss);
            if(dasharray != "") { line.setAttribute("stroke-dasharray", dasharray); }
            g.appendChild(line);
            return line;
        }

        for (var i = 0; i < foldts.length; i += 1) {
            var t = foldts[i];
            var x = calcFold(f1prime, f2prime, sigma, t);

            // Draw tickmark on circle
            ls("#ff0000", x.p, x.p.add(x.radius), "");

            // Draw fold.
            ls("blue", x.tangentcircleintersections[0], x.tangentcircleintersections[1], ".01,.01");

            // Draw perpendicular to fold through other focus.
            var line1 = ls("green", x.p, f2prime, "");
            // Draw rightangle marker
            var square1 = ls("green", x.alongYellow, x.corner, "");
            var square2 = ls("green", x.corner, x.alongBlue, "");
            line1.setAttribute("stroke-width", ".002px");
            square1.setAttribute("stroke-width", ".002px");
            square2.setAttribute("stroke-width", ".002px");
        }


        var fc1 = circle(f1prime, .025);
        var fc2 = circle(f2prime, .025);
        g.appendChild(fc1);
        g.appendChild(fc2);
        fc1.setAttribute("fill", "white");
        fc2.setAttribute("fill", "white");
        g.appendChild(text(f1prime, -.05, "c"));
        g.appendChild(text(f2prime, -.05, "d"));

        encode_as_link();

    }

    function calcEllipse(f1c: numeric.T, f2c: numeric.T, sigma: number) {
        var majoraxisvector = f1c.sub(f2c);
        var majoraxisunitvector = majoraxisvector.div(majoraxisvector.norm2());

        var sigmac = c(sigma, 0);

        var ftomaj = majoraxisunitvector.mul((sigma - f1c.sub(f2c).norm2()) / 2);

        var l = f1c.add(ftomaj);
        l = fz(l);

        var r = f2c.sub(ftomaj);
        r = fz(r);

        var center = f1c.add(f2c).div(2);

        var f2mf1 = f1c.sub(f2c).norm2();

        var minoraxislen = Math.sqrt(sigma * sigma - f2mf1 * f2mf1) / 2.0;
        var minoraxisunitvector = majoraxisunitvector.mul(c(0, 1));

        var t2 = center.add(minoraxisunitvector.mul(minoraxislen));
        return { r, center, t2 };
    }

    function draw() {
        if (!goodGlobals()) {
            $("#params").addClass("errorParams");
            return;
        } else {
            $("#params").removeClass("errorParams");
        }

        axes(rngs, ctx);

        var f1c = c(f1.x, f1.y);
        var f2c = c(f2.x, f2.y);

        // Draw circle centered at F1 of radius Sigma.
        ctx.beginPath();
        ctx.arc(f1.x, f1.y, sigma, 0, 2 * Math.PI, false);
        ctx.stroke();

        var foldts: number[];
        if ($("#polygonfolds").is(":checked")) {
            foldts = polygonFolds(f1c, f2c);
        } else {
            foldts = divideCircle(numfolds);
        }

        function ls(ss: string, z1: numeric.T, z2: numeric.T) {
            ctx.beginPath();
            ctx.strokeStyle = ss;
            ctx.moveTo(z1.x, z1.y);
            ctx.lineTo(z2.x, z2.y);
            ctx.stroke();
        }
        // foldts.pop();
        for (var i = 0; i < foldts.length; i += 1) {
            var t = foldts[i];

            var x = calcFold(f1c, f2c, sigma, t);
            // Draw tickmark on circle
            ls("#ff0000", x.p, x.p.add(x.radius));
            // Draw fold
            ls("teal", x.tangentcircleintersections[0], x.tangentcircleintersections[1]);
            // Draw line from point on circle to other focus.
            ctx.save();
            ctx.lineWidth = ctx.lineWidth / 2;
            ls("green", x.p, f1c);
            ls("green", x.p, f2c);
            // Draw line from point on circle to other focus.
            ls("green", x.tangentpoint, f2c);
            ctx.restore();

            ctx.strokeStyle = "green";
            ctx.beginPath();
            ctx.moveTo(x.alongYellow.x, x.alongYellow.y);
            ctx.lineTo(x.corner.x, x.corner.y);
            ctx.lineTo(x.alongBlue.x, x.alongBlue.y);
            ctx.stroke();
        }

        // Draw circles around the foci.
        ctx.strokeStyle = "#000000";
        ctx.beginPath();
        ctx.arc(f1.x, f1.y, .025, 0, 2 * Math.PI, false);
        ctx.closePath();
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(f2.x, f2.y, .025, 0, 2 * Math.PI, false);
        ctx.closePath();
        ctx.stroke();

        ctx.beginPath();

        // Draw ellipse.

        if (!$("#hideellipse").is(":checked")) {
            var el = calcEllipse(f1c, f2c, sigma);
            drawEllipse(ctx, el.r, el.center, el.t2);
        }
        // for (var i = 0; i < ts.length; i++) {
        //     var p2 = ps[i];
        //     sigma - f1c.sub(p2).norm2();
        // }

        /*
        
                ctx.beginPath();
                ctx.arc(t.x, t.y, .01, 0, 2 * Math.PI, false);
                ctx.closePath();
                ctx.stroke();
        
                ctx.beginPath();
                ctx.arc(b.x, b.y, .01, 0, 2 * Math.PI, false);
                ctx.closePath();
                ctx.stroke();
        
                ctx.beginPath();
                ctx.arc(l.x, l.y, .01, 0, 2 * Math.PI, false);
                ctx.closePath();
                ctx.stroke();
        
                ctx.beginPath();
                ctx.arc(r.x, r.y, .01, 0, 2 * Math.PI, false);
                ctx.closePath();
                ctx.stroke();
        
                ctx.beginPath();
                ctx.moveTo(l.x, l.y);
                ctx.lineTo(r.x, r.y);
                ctx.stroke();
        
                ctx.beginPath();
                ctx.moveTo(t.x, t.y);
                ctx.lineTo(b.x, b.y);
                ctx.stroke();
        
                ctx.beginPath();
                var tl = t.add(l.sub(center));
                var tr = t.add(r.sub(center));
                var br = b.add(r.sub(center));
                var bl = b.add(l.sub(center));
                ctx.moveTo(tl.x, tl.y);
                ctx.lineTo(tr.x, tr.y);
                ctx.lineTo(br.x, br.y);
                ctx.lineTo(bl.x, bl.y);
                ctx.lineTo(tl.x, tl.y);
                ctx.stroke();
        */
    }
}

$(EllipseFolding.setup);