/// <reference path="jsblaschke/numeric-1.2.3.js" />
/// <reference path="jsblaschke/polynomials.js" />

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

var cvs;
var ctx;

function reset() {
    ctx.resetTransform();
    ctx.transform(cvs.width / 2, 0, 0, -cvs.width / 2, cvs.width / 2, cvs.width / 2);
    ctx.lineWidth = 1.0 / cvs.width;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(-1, -1, 2, 2);

    ctx.beginPath();
    ctx.moveTo(-1, 0);
    ctx.lineTo(1, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, -1);
    ctx.lineTo(0, 1);
    ctx.stroke();
}

function lineCircleIntersection(lp, ld, cc, r) {
    var poly = [lp.sub(cc), ld];
    var polyconj = poly.map(function(f) { return f.conj(); });
    var poly2 = polysub(polymult(poly, polyconj), [rt2c(r*r, 0)]);
    var roots = polyroots(poly2);
    return roots.map(function(r) { return peval(poly, r.x).add(cc); }); 
}

function lineLineIntersectionZD(z0, d0, z1, d1) {
    var A = [[d0.x, -d1.x], 
             [d0.y, -d1.y]];
    var v = [z1.sub(z0).x, z1.sub(z0).y];         
    var rt = numeric.solve(A, v);
    return z0.add(d0.mul(rt[0]));
}

function lineLineIntersectionZZ(z00, z01, z10, z11) {
    return lineLineIntersectionZD(z00, z00.sub(z01), z10, z10.sub(z11));
}

$(function () {

    cvs = document.getElementById("canvas");
    ctx = cvs.getContext("2d");

    $("#go").bind("click", function () {
        reset();
        var f1 = {}, f2 = {};
        f1.x = parseFloat($("#f1x").val());
        f1.y = parseFloat($("#f1y").val());
        f2.x = parseFloat($("#f2x").val());
        f2.y = parseFloat($("#f2y").val());
        var sigma = parseFloat($("#sigma").val());

        var f1c = c(f1.x, f1.y);
        var f2c = c(f2.x, f2.y);

        ctx.beginPath();
        ctx.arc(f1.x, f1.y, sigma, 0, 2 * Math.PI, false);
        ctx.stroke();

        var ts = numeric.linspace(0, 2 * Math.PI, 32+1);
        ts.pop();
        for (var i = 0; i < ts.length; i++) {
            var t = ts[i];
            var p = f1c.add(rt2c(sigma, t));
            ctx.strokeStyle = "#ff0000";
            ctx.beginPath();
            var radius = p.sub(f1c);
            radius = radius.div(radius.norm2()).mul(.05);           
            ctx.moveTo(p.add(radius).x, p.add(radius).y);
            ctx.lineTo(p.sub(radius).x, p.sub(radius).y);
            ctx.stroke();
            var mp = p.add(f2c).div(2);
            var d = p.sub(mp).mul(rt2c(1, Math.PI / 2));
            d = d.div(d.norm2()).mul(sigma);
            var intersections = lineCircleIntersection(mp, d, f1c, sigma);

            ctx.beginPath();
            ctx.strokeStyle = "yellow";
            ctx.moveTo(intersections[0].x, intersections[0].y);
            ctx.lineTo(intersections[1].x, intersections[1].y);
            ctx.stroke();

            ctx.beginPath();
            ctx.strokeStyle = "green";
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(f2c.x, f2c.y);
            ctx.stroke();

            var chordlineint = lineLineIntersectionZZ(p, f2c, intersections[0], intersections[1]);

            ctx.strokeStyle = "green";
            ctx.beginPath();
            var alongYellow = chordlineint.add(p.sub(f2c).unit().mul(.025));
            var corner = alongYellow.add(intersections[0].sub(intersections[1]).unit().mul(.025));
            var alongBlue = corner.sub(p.sub(f2c).unit().mul(.025));
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
    })
})