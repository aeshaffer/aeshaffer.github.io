/// <reference path="../tsfiles/jquery.d.ts" />
/// <reference path="numeric-1.2.3.d.ts" />
var ranges = (function () {
    function ranges(obj) {
        this.minX = obj.minX;
        this.minY = obj.minY;
        this.maxX = obj.maxX;
        this.maxY = obj.maxY;
    }
    ranges.prototype.width = function () { return this.maxX - this.minX; };
    ranges.prototype.height = function () { return this.maxY - this.minY; };
    return ranges;
}());
function lineCircleIntersection(lp, ld, cc, r) {
    var poly = [lp.sub(cc), ld];
    var polyconj = poly.map(function (f) { return f.conj(); });
    var poly2 = polysub(polymult(poly, polyconj), [rt2c(r * r, 0)]);
    var roots = polyroots(poly2);
    return roots.map(function (r2) { return peval(poly, new numeric.T(r2.x, 0)).add(cc); });
}
function lineLineIntersectionZD(z0, d0, z1, d1) {
    var A = [[d0.x, -d1.x],
        [d0.y, -d1.y]];
    var v = [z1.sub(z0).x, fixy(z1.sub(z0)).y];
    var rt = numeric.solve(A, v);
    return z0.add(d0.mul(rt[0]));
}
function lineLineIntersectionZZ(z00, z01, z10, z11) {
    return lineLineIntersectionZD(z00, z00.sub(z01), z10, z10.sub(z11));
}
function resetInner(r, fudgefactor, ctx2, cvs2) {
    var h = $(window).height() - $(cvs2).offset().top - fudgefactor;
    $(cvs2).height(h).attr("height", h).width(h).attr("width", h);
    ctx2.resetTransform();
    ctx2.transform(cvs2.width / 2, 0, 0, -cvs2.width / 2, cvs2.width / 2, cvs2.width / 2);
    ctx2.scale(2 / (r.maxX - r.minX), 2 / (r.maxY - r.minY));
    ctx2.translate(-(r.maxX + r.minX) / 2, -(r.maxY + r.minY) / 2);
    ctx2.lineWidth = 1.0 / cvs2.width * (r.maxX - r.minX);
    axes(r, ctx2);
}
function axes(r, ctx2) {
    ctx2.clearRect(r.minX, r.minY, r.maxX - r.minX, r.maxY - r.minY);
    ctx2.strokeStyle = "lightgray";
    ctx2.beginPath();
    ctx2.moveTo(r.minX, 0);
    ctx2.lineTo(r.maxX, 0);
    ctx2.stroke();
    ctx2.beginPath();
    ctx2.moveTo(0, r.minY);
    ctx2.lineTo(0, r.maxY);
    ctx2.stroke();
}
function drawDecoratedEllipse(ctx, cent, majorAxisVector, minorAxisVector) {
    if (majorAxisVector.abs().x < minorAxisVector.abs().x) {
        this.drawDecoratedEllipse(ctx, cent, minorAxisVector, majorAxisVector);
        return;
    }
    var min0 = fixy(cent.add(minorAxisVector));
    var min1 = fixy(cent.sub(minorAxisVector));
    var maj0 = fixy(cent.add(majorAxisVector));
    var maj1 = fixy(cent.sub(majorAxisVector));
    drawEllipse(ctx, cent, majorAxisVector, minorAxisVector, "#ff0");
    drawEllipse(ctx, cent, majorAxisVector, minorAxisVector, "#00f", 1);
    var d = Math.sqrt(majorAxisVector.abs().x * majorAxisVector.abs().x - minorAxisVector.abs().x * minorAxisVector.abs().x);
    var focusvector = majorAxisVector.div(majorAxisVector.abs().x).mul(d);
    var f1 = cent.sub(focusvector);
    var f2 = cent.add(focusvector);
    var majorUnitVector = majorAxisVector.div(majorAxisVector.abs());
    var minorUnitVector = minorAxisVector.div(minorAxisVector.abs());
    function drawCircle(p) {
        // Draw Center
        ctx.beginPath();
        ctx.strokeStyle = "#f00";
        ctx.arc(p.x, fixy(p).y, .05, 0, 2.0 * Math.PI);
        ctx.stroke();
        var pPlusMinor = fixy(p.add(minorUnitVector.mul(.05)));
        var pMinusMinor = fixy(p.sub(minorUnitVector.mul(.05)));
        ctx.beginPath();
        ctx.moveTo(pPlusMinor.x, pPlusMinor.y);
        ctx.lineTo(pMinusMinor.x, pMinusMinor.y);
        ctx.stroke();
    }
    function drawAxis(p0, p1) {
        ctx.beginPath();
        ctx.moveTo(p0.x, fixy(p0).y);
        ctx.lineTo(p1.x, fixy(p1).y);
        ctx.stroke();
    }
    // Draw Center, Foci
    drawCircle(cent);
    drawCircle(f1);
    drawCircle(f2);
    ctx.strokeStyle = "#00f";
    // Draw Minor Axis
    drawAxis(min0, min1);
    // Draw Major Axis
    drawAxis(maj0, maj1);
}
//# sourceMappingURL=ellipseutils.js.map