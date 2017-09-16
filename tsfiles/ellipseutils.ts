/// <reference path="../tsfiles/jquery.d.ts" />
/// <reference path="numeric-1.2.3.d.ts" />

class ranges {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
    width(): number { return this.maxX - this.minX; }
    height(): number { return this.maxY - this.minY; }
    constructor(obj: any) {
        this.minX = obj.minX; this.minY = obj.minY;
        this.maxX = obj.maxX; this.maxY = obj.maxY;
    }
}

function backtransformcircletangent(x: number, y: number, z: C, z1: C, 
centertomajlen: number, centertominlen: number, majunit: C, center: C): C {
    var circlen = c(x,y).norm2();    
    var tp0 = fixy(c(x,y).mul(z1.unit()));
    var circlen0 = tp0.norm2();
    var tp1 = c(tp0.x * centertomajlen, tp0.y * centertominlen);
    var tp2 = tp1.mul(majunit);
    var tp3 = tp2.add(center);

    return tp3;
}

function sanitycheck(z: C, tp3: C, f1: C, f2: C ) {
    var angleztpf1 = z.sub(tp3).div(f1.sub(tp3)).angle();
    var angleztpf2 = z.sub(tp3).div(f2.sub(tp3)).angle();

    var shouldbesigma = tp3.sub(f1).norm2() + tp3.sub(f2).norm2();
    var shouldbePi = angleztpf1 + angleztpf2;
    return {shouldbePi, shouldbesigma};
}

function ellipsetangent(z: C, f1: C, f2: C, sigma: number): C[] {
    var center = f1.add(f2).div(2);
    var majunit = f2.sub(f1).unit();
    var f1subf2len = f1.sub(f2).norm2();

    var ftomajlen = (sigma - f1subf2len) / 2;
    var centertomajlen = f1subf2len / 2 + ftomajlen;
    var centertominlen = Math.sqrt((sigma/2)**2 - (f1subf2len/2)**2);

    var f10 = f1.sub(center).div(majunit);
    var f20 = f2.sub(center).div(majunit);

    // rotate so that the ellipse is centered at the origin and
    // the major axis is horizontal.
    var z0 = fixy(z.sub(center).div(majunit));

    // scale so that the ellipse is a unit circle.
    var z1 = c(z0.x / centertomajlen, z0.y / centertominlen);

    var absz1 = z1.norm2();
    var y = Math.sqrt(1.0 - 1.0/(absz1**2));
    var x = Math.sqrt(1.0 - y**2);
   
    var retval1 = backtransformcircletangent(x, y, z, z1, 
        centertomajlen, centertominlen, majunit, center);
    
    var retval2 = backtransformcircletangent(x, -y, z, z1, 
        centertomajlen, centertominlen, majunit, center);

    var check1 = sanitycheck(z, retval1, f1, f2);
    var check2 = sanitycheck(z, retval2, f1, f2);
    
    return [retval1, retval2];
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
    var v = [z1.sub(z0).x, fixy(z1.sub(z0)).y];         
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
    ctx2.strokeStyle="lightgray";
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