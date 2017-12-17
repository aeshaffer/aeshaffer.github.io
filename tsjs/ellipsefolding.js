/// <reference path="numeric-1.2.3.d.ts" />
/// <reference path="polynomials.ts" />
/// <reference path="ellipseutils.ts" />
"use strict";
var EllipseFolding;
(function (EllipseFolding) {
    // fixy?
    function fz(z) {
        if (z.y == undefined) {
            return c(z.x, 0);
        }
        else {
            return z;
        }
    }
    function divideCircle(N) {
        return numeric.linspace(0, 2 * Math.PI * (1 - 1.0 / N), N);
    }
    var cvs;
    var ctx;
    var rngs;
    function reset(inminX, inmaxX, inminY, inmaxY) {
        rngs = new ranges({ minX: inminX, maxX: inmaxX, minY: inminY, maxY: inmaxY });
        var fudgefactor = 50;
        resetInner(rngs, fudgefactor, ctx, cvs);
        $("#canvasandpoints").css("width", $(cvs).css("width"));
        $("#canvasandpoints").css("height", $(cvs).css("height"));
    }
    var f1 = c(0, 0);
    var f2 = c(-.5, 0);
    var numfolds;
    var sigma;
    function repositionDivs() {
        // Flip y coordinate.
        $("#f1div").css({
            left: cvs.width * (f1.x - rngs.minX) / (rngs.maxX - rngs.minX) - 5 + "px",
            top: cvs.height * (rngs.maxY - f1.y) / (rngs.maxY - rngs.minY) - 5 + "px"
        });
        $("#f2div").css({
            left: cvs.width * (f2.x - rngs.minX) / (rngs.maxX - rngs.minX) - 5 + "px",
            top: cvs.height * (rngs.maxY - f2.y) / (rngs.maxY - rngs.minY) - 5 + "px"
        });
    }
    function setup() {
        cvs = document.getElementById("canvas");
        ctx = cvs.getContext("2d");
        $(".focusdiv").draggable();
        $(window).on("resize", function () {
            reset(-1, 1, -1, 1);
            repositionDivs();
        });
        window.requestAnimationFrame(drawAndRAF);
        $("#go").click(drawAndRAF);
        function drawAndRAF() {
            draw();
            requestAnimationFrame(drawAndRAF);
        }
        ;
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
    EllipseFolding.setup = setup;
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
        if (!allNumbers) {
            return false;
        }
        return (sigma > 0 && numfolds > 0);
    }
    function drawEllipse(ctx, r, center, t2) {
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
    function draw() {
        if (!goodGlobals()) {
            $("#params").addClass("errorParams");
            return;
        }
        else {
            $("#params").removeClass("errorParams");
        }
        axes(rngs, ctx);
        var f1c = c(f1.x, f1.y);
        var f2c = c(f2.x, f2.y);
        // Draw circle centered at F1 of radius Sigma.
        ctx.beginPath();
        ctx.arc(f1.x, f1.y, sigma, 0, 2 * Math.PI, false);
        ctx.stroke();
        var foldts;
        if ($("#polygonfolds").is(":checked")) {
            var foldts = new Array();
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
                            var ti1 = tangentcircleintersections[1].sub(f1.add(f2).div(2));
                            ;
                            // rotate so that z is on the real line.
                            var ti01 = fixy(ti0.div(z0));
                            var ti11 = fixy(ti1.div(z0));
                            var tangentdirection = tangentcircleintersections[0].sub(tangentcircleintersections[1]).unit();
                            // At this point, one of the tangent points is above the real line,
                            // and the other is below it.  Take the point above for the next point.
                            if (ti01.y > 0) {
                                z = tangentcircleintersections[0];
                            }
                            else {
                                z = tangentcircleintersections[1];
                            }
                            var tangentdirectionperp = tangentdirection.mul(t2c(Math.PI / 2));
                            // Get the intersection between the chord
                            // and a line from f2 perpendicular to the chord.
                            var chordtof2line = lineLineIntersectionZD(f2, tangentdirectionperp, z, tangentdirection);
                            // ctx.beginPath();
                            // ctx.arc(chordtof2line.x, chordtof2line.y, .025, 0, 2*Math.PI, false);
                            // ctx.stroke();
                            // Then, find the points where the line from f2
                            // to the intersection point with the chord 
                            // hits the circle.
                            var lci = lineCircleIntersection(f2, chordtof2line.sub(f2), f1, sigma);
                            // Find which intersection between the line and the 
                            // circle is in the same direction as the vector between f2 and
                            // the chord.
                            if (lci[0].sub(f2).div(chordtof2line.sub(f2)).x > 0) {
                                foldts.push(lci[0].sub(f1).angle());
                            }
                            else {
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
        }
        else {
            var foldts = divideCircle(numfolds);
        }
        function ls(ss, z1, z2) {
            ctx.beginPath();
            ctx.strokeStyle = ss;
            ctx.moveTo(z1.x, z1.y);
            ctx.lineTo(z2.x, z2.y);
            ctx.stroke();
        }
        // foldts.pop();
        for (var i = 0; i < foldts.length; i += 1) {
            var t = foldts[i];
            var p = f1c.add(rt2c(sigma, t));
            var radius = p.sub(f1c);
            radius = radius.div(radius.norm2()).mul(.05);
            //ctx.moveTo(p.add(radius).x, p.add(radius).y);
            // Draw tickmark on circle
            ls("#ff0000", p, p.add(radius));
            // Find midpoint between circle point and the other focus.
            var mp = p.add(f2c).div(2);
            // The fold passes through this line, 
            // perpendicular to the line between the circle point and the 
            // other focus.
            var d = p.sub(mp).mul(rt2c(1, Math.PI / 2));
            d = d.div(d.norm2()).mul(sigma);
            var tangentcircleintersections = lineCircleIntersection(mp, d, f1c, sigma);
            // Draw fold
            ls("teal", tangentcircleintersections[0], tangentcircleintersections[1]);
            // Draw line from point on circle to other focus.
            ctx.save();
            ctx.lineWidth = ctx.lineWidth / 2;
            ls("green", p, f2c);
            ctx.restore();
            ctx.save();
            ctx.lineWidth = ctx.lineWidth / 2;
            ls("green", p, f1c);
            ctx.restore();
            var tangentpoint = lineLineIntersectionZZ(tangentcircleintersections[0], tangentcircleintersections[1], p, f1c);
            // Draw line from point on circle to other focus.
            ctx.save();
            ctx.lineWidth = ctx.lineWidth / 2;
            ls("green", tangentpoint, f2c);
            ctx.restore();
            // Draw right-angle marker at intersection between chord and focus-circle line.
            var chordlineint = lineLineIntersectionZZ(p, f2c, tangentcircleintersections[0], tangentcircleintersections[1]);
            ctx.strokeStyle = "green";
            ctx.beginPath();
            var squarelength = sigma / 50.0;
            var alongYellow = chordlineint.add(p.sub(f2c).unit().mul(squarelength));
            var corner = alongYellow.add(tangentcircleintersections[0].sub(tangentcircleintersections[1]).unit().mul(squarelength));
            var alongBlue = corner.sub(p.sub(f2c).unit().mul(squarelength));
            ctx.moveTo(alongYellow.x, alongYellow.y);
            ctx.lineTo(corner.x, corner.y);
            ctx.lineTo(alongBlue.x, alongBlue.y);
            //            ctx.arc(chordline.x, chordline.y, .025, p.sub(f2c).angle(), Math.PI/2 + p.sub(f2c).angle(), false);     
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
            drawEllipse(ctx, r, center, t2);
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
})(EllipseFolding || (EllipseFolding = {}));
$(EllipseFolding.setup);
//# sourceMappingURL=ellipsefolding.js.map