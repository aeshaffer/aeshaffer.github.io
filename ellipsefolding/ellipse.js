/// <reference path="../numeric-1.2.3.js" />
/// <reference path="../tsjs/polynomials.js" />
/// <reference path="../tsjs/ellipseutils.js" />

"use strict";

function fz(z) {
    if (z.y == undefined) {
        return c(z.x, 0);
    } else {
        return z;
    }
}


numeric.T.prototype.unit = function() {
    return this.div(this.norm2());
}

function divideCircle(N) {
    return numeric.linspace(0, 2*Math.PI*(1-1.0/N), N);
}

var cvs;
var ctx;
var minX, maxX, minY, maxY;
function reset(inminX, inmaxX, inminY, inmaxY) {
    minX = inminX; minY = inminY;
    maxX = inmaxX; maxY = inmaxY;
    var fudgefactor = 50;
    resetInner({minX, maxX, minY, maxY}, fudgefactor, ctx, cvs);
}

function axes2() {
    axes({minX, maxX, minY, maxY}, ctx);
}

var f1 = {}, f2 = {}, numfolds, sigma;

$(function () {

    cvs = document.getElementById("canvas");
    ctx = cvs.getContext("2d");

    $(".focusdiv").draggable();

    window.requestAnimationFrame(drawAndRAF);

    $("#go").click(drawAndRAF);

    function drawAndRAF() {        
        draw();
        requestAnimationFrame(drawAndRAF);    
    };

    $("#f1x, #f1y, #f2x, #f2y, #numfolds, #sigma").change(function() {
        updateGlobals();
        repositionDivs();
        });

    updateGlobals();
    reset(-1,1,-1,1);

    function repositionDivs() {
        // Flip y coordinate.
        $("#f1div").css({left: cvs.width * (f1.x - minX)/(maxX - minX) - 5 + "px", 
                          top: cvs.height * (maxY - f1.y)/(maxY - minY) - 5 + "px"})

        $("#f2div").css({left: cvs.width * (f2.x - minX)/(maxX - minX) - 5 + "px",
                          top: cvs.height * (maxY - f2.y)/(maxY - minY) - 5 + "px"});
    }

    repositionDivs();

    function updatef(pos, fn) {    
        fn.x = ((pos.left + 5) / cvs.width)*(maxX - minX) + minX;
        fn.y = -(((pos.top + 5)/ cvs.height)*(maxY - minY) - maxY);
        $("#f1x").val(f1.x.toFixed(2));
        $("#f1y").val(f1.y.toFixed(2));
        $("#f2x").val(f2.x.toFixed(2));
        $("#f2y").val(f2.y.toFixed(2));
        resetIfGood();
    }

    $("#f1div").draggable({stop: function(event, ui) {        updatef($(this).position(), f1);            },
    drag: function(event, ui) {        updatef($(this).position(), f1);            }
    });

    $("#f2div").draggable({stop: function(event, ui) {        updatef($(this).position(), f2);    },
    drag: function(event, ui) {        updatef($(this).position(), f2);    }
    });

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
        if(goodGlobals()) {
            //reset(f1.x - sigma, f1.x + sigma, f1.y - sigma, f1.y + sigma);
reset(-1, 1, -1, 1);
repositionDivs();
        }
    }

    function goodGlobals() {
        var allNumbers = [f1.x, f2.x, f1.y, f2.y, numfolds, sigma].every(function(x) { return !isNaN(x); });
        if(!allNumbers) { return false; }
        return (sigma > 0 && numfolds > 0);
    }

    function draw() {                       
        if(!goodGlobals()) {
            $("#params").addClass("errorParams");
            return;
        } else {
            $("#params").removeClass("errorParams");
        }

        axes2();

        var f1c = c(f1.x, f1.y);
        var f2c = c(f2.x, f2.y);

        ctx.beginPath();
        ctx.arc(f1.x, f1.y, sigma, 0, 2 * Math.PI, false);
        ctx.stroke();
        
        var foldts = divideCircle(numfolds);
        // foldts.pop();
        for (var i = 0; i < foldts.length; i+= 1) {
            var t = foldts[i];
            var p = f1c.add(rt2c(sigma, t));
            ctx.strokeStyle = "#ff0000";
            ctx.beginPath();
            var radius = p.sub(f1c);
            radius = radius.div(radius.norm2()).mul(.05);           
            //ctx.moveTo(p.add(radius).x, p.add(radius).y);
            // Draw tickmark on circle
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.add(radius).x, p.add(radius).y);
            ctx.stroke();
            // Find midpoint between circle point and the other focus.
            var mp = p.add(f2c).div(2);
            // The fold passes through this line, 
            // perpendicular to the line between the circle point and the 
            // other focus.
            var d = p.sub(mp).mul(rt2c(1, Math.PI / 2));
            d = d.div(d.norm2()).mul(sigma);
            var intersections = lineCircleIntersection(mp, d, f1c, sigma);

            // Draw fold
            ctx.beginPath();
            ctx.strokeStyle = "teal";
            ctx.moveTo(intersections[0].x, intersections[0].y);
            ctx.lineTo(intersections[1].x, intersections[1].y);
            ctx.stroke();

            // Draw line from point on circle to other focus.
            ctx.save();
            ctx.lineWidth = ctx.lineWidth / 4 ;
            ctx.beginPath();
            ctx.strokeStyle = "green";
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(f2c.x, f2c.y);
            ctx.stroke();
            ctx.restore();

            // Draw right-angle marker at intersection between chord and focus-circle line.
            var chordlineint = lineLineIntersectionZZ(p, f2c, intersections[0], intersections[1]);

            ctx.strokeStyle = "green";
            ctx.beginPath();
            var squarelength = sigma/50.0;
            var alongYellow = chordlineint.add(p.sub(f2c).unit().mul(squarelength));
            var corner = alongYellow.add(intersections[0].sub(intersections[1]).unit().mul(squarelength));
            var alongBlue = corner.sub(p.sub(f2c).unit().mul(squarelength));
            ctx.moveTo(alongYellow.x, alongYellow.y);
            ctx.lineTo(corner.x, corner.y);
            ctx.lineTo(alongBlue.x, alongBlue.y);
//            ctx.arc(chordline.x, chordline.y, .025, p.sub(f2c).angle(), Math.PI/2 + p.sub(f2c).angle(), false);     
            ctx.stroke();

        }
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

        var t = center.add(minoraxisunitvector.mul(minoraxislen));
        var b = center.sub(minoraxisunitvector.mul(minoraxislen));

        ctx.beginPath();
        r = fz(r);
        ctx.moveTo(r.x, r.y);
        var ts = divideCircle(64);
        var ps = new Array(ts.length);
        for (var i = 0; i < ts.length; i++) {
            var theta = ts[i];
            var p = center.add(t.sub(center).mul(Math.sin(theta)).add(r.sub(center).mul(Math.cos(theta))));
            p = fz(p);
            ps[i] = p;
            ctx.lineTo(p.x, p.y);
        }
        ctx.closePath();
        ctx.stroke();

        for (var i = 0; i < ts.length; i++) {
            var p = ps[i];
            sigma - f1c.sub(p).norm2();
        }

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
})