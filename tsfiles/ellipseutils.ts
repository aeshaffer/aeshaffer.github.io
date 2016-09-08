/// <reference path="../tsfiles/jquery.d.ts" />
/// <reference path="numeric-1.2.3.d.ts" />

class ranges {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
}

function lineCircleIntersection(lp: C, ld: C, cc: C, r: number) {
    var poly = [lp.sub(cc), ld];
    var polyconj = poly.map(function(f) { return f.conj(); });
    var poly2 = polysub(polymult(poly, polyconj), [rt2c(r*r, 0)]);
    var roots = polyroots(poly2);
    return roots.map(function(r2) { return peval(poly, new numeric.T(r2.x,0)).add(cc); }); 
}

function lineLineIntersectionZD(z0:C, d0: C, z1: C, d1: C) {
    var A = [[d0.x, -d1.x], 
             [d0.y, -d1.y]];
    var v = [z1.sub(z0).x, z1.sub(z0).y];         
    var rt = numeric.solve(A, v);
    return z0.add(d0.mul(rt[0]));
}

function lineLineIntersectionZZ(z00: C, z01: C, z10: C, z11: C) {
    return lineLineIntersectionZD(z00, z00.sub(z01), z10, z10.sub(z11));
}

function resetInner(r: ranges, fudgefactor, ctx2, cvs2) {
    var h = $(window).height() - $(cvs2).offset().top - fudgefactor;
    $(cvs2).height(h).attr("height", h).width(h).attr("width", h);

    ctx2.resetTransform();
    ctx2.transform(cvs2.width / 2, 0, 0, -cvs2.width / 2, cvs2.width / 2, cvs2.width / 2);
    ctx2.scale(2/(r.maxX - r.minX), 2/(r.maxY - r.minY));
    ctx2.translate(-(r.maxX + r.minX)/2, -(r.maxY + r.minY)/2);
    ctx2.lineWidth = 1.0 / cvs2.width * (r.maxX - r.minX);
    axes(r, ctx2);
}

function axes(r: ranges, ctx2) {
    ctx2.clearRect(r.minX, r.minY, r.maxX -r.minX, r.maxY - r.minY);
    ctx2.fillStyle = "#ff0000";

    ctx2.beginPath();
    ctx2.moveTo(r.minX, 0);
    ctx2.lineTo(r.maxX, 0);
    ctx2.stroke();
    ctx2.beginPath();
    ctx2.moveTo(0, r.minY);
    ctx2.lineTo(0, r.maxY);
    ctx2.stroke();
}
