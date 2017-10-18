/// <reference path="numeric-1.2.3.d.ts" />
// Normalize to between 0 and 2Pi.
function normalizeangle(theta) {
    while (true) {
        if (theta > 2 * Math.PI) {
            theta = theta - 2 * Math.PI;
        }
        else if (theta < 0) {
            theta = theta + 2 * Math.PI;
        }
        else {
            return theta;
        }
    }
}
// Normalize to between -Pi and Pi.
function anglediff(theta) {
    while (true) {
        if (theta > Math.PI) {
            theta = theta - 2 * Math.PI;
        }
        else if (theta < -Math.PI) {
            theta = theta + 2 * Math.PI;
        }
        else {
            return theta;
        }
    }
}
var Canglediff = /** @class */ (function () {
    function Canglediff() {
    }
    return Canglediff;
}());
function biggestanglediff(ints) {
    var maxdiff = 0;
    var maxind = 0;
    var ts = ints.sort(function (i, j) { return normalizeangle(i) - normalizeangle(j); });
    for (var i = 0; i < ts.length; i++) {
        var t0 = ts[i];
        var t1 = ts[(i + 1) % ts.length];
        var diff = normalizeangle(t1 - t0);
        //print("" + t0 + " " + t1 + " " + " "+diff);
        if (diff > maxdiff) {
            maxdiff = diff;
            maxind = i;
        }
    }
    var midpt;
    if (t1 > t0) {
        // t1-t0 is greater than zero.
        midpt = t0 + (t1 - t0) / 2;
    }
    else {
        midpt = t0 + (t1 - t0) / 2;
    }
    var retval = { t0: ts[maxind], t1: ts[(maxind + 1) % ts.length], midpt: midpt };
    return retval;
}
function fixy(z) { return c(z.x, z.y == undefined ? 0 : z.y); }
function gcd_rec(a, b) {
    return b ? gcd_rec(b, a % b) : Math.abs(a);
}
numeric.T.prototype.angle = function () {
    if (this.y == undefined) {
        return numeric.atan2(0, this.x);
    }
    else {
        return numeric.atan2(this.y, this.x);
    }
};
numeric.T.prototype.pow = function (n) {
    if (this.x == 0 && this.y == 0) {
        return nzero;
    }
    else {
        var retval = none;
        for (var i = 0; i < n; i++) {
            retval = retval.mul(this);
        }
        return retval;
    }
};
Array.prototype.sum = function () {
    for (var i = 0, sum = 0; i < this.length; sum += this[i++])
        ;
    return sum;
};
Array.prototype.csum = function () {
    for (var i = 0, sum = c(0, 0); i < this.length; sum = sum.add(this[i++]))
        ;
    return sum;
};
function cgrid(N) {
    var xs = numeric.linspace(-1, 1, N);
    var ys = numeric.linspace(-1, 1, N);
    var retval = new Array(N);
    for (var i in xs) {
        retval[i] = Array(N);
        for (var j in ys) {
            retval[i][j] = c(xs[i], ys[j]);
        }
    }
    return retval;
}
function xy2c(xy) {
    return new numeric.T(xy.x, fixy(xy).y);
}
function rt2c(r, t) {
    return ni.mul(t).exp().mul(r);
}
function c(x, y) {
    return new numeric.T(x, y);
}
function c2xyArray(z) {
    return [z.x, z.y];
}
// Theta to exp[i*t]
function t2c(t) { return fixy(rt2c(1, t)); }
function ttcp(t) {
    return c(numeric.cos(t), numeric.sin(t));
}
function cifyrow(as) {
    return as.map(function (a) { return c(a.x, a.y); });
}
function cifygrid(zs) {
    return zs.map(function (r) { return cifyrow(r); });
}
var zsAndBPValues = /** @class */ (function () {
    function zsAndBPValues() {
    }
    return zsAndBPValues;
}());
var RPIP = /** @class */ (function () {
    function RPIP() {
    }
    return RPIP;
}());
function cifyrpip(rpip) {
    var rp = rpip.realparts;
    var ip = rpip.imagparts;
    var N = Math.sqrt(rp.length);
    var retval = Array(N);
    for (var i = 0; i < N; i++) {
        retval[i] = Array(N);
        for (var j = 0; j < N; j++) {
            var addr = N * j + i;
            retval[i][j] = c(rp[addr], ip[addr]);
        }
    }
    return retval;
}
function round2(n) {
    return Math.round(n * 100) / 100;
}
function round5(n) {
    return Math.round(n * 100000) / 100000;
}
function dc(z) {
    var y = z.y == undefined ? 0 : z.y;
    return round5(z.x) + " " + (y >= 0 ? "+" : "") + round5(y) + "i";
}
function dcp(z) {
    var y = z.y == undefined ? 0 : z.y;
    return round5(z.x) + " " + (y >= 0 ? "+" : "") + round5(y) + "j";
}
function ccmd(z) {
    var y = z.y == undefined ? 0 : z.y;
    return "c(" + round5(z.x) + ", " + round5(y) + ")";
}
function dcomplex(z) {
    var theta = "\u03B8";
    return dc(z) + " (" + theta + "=" + round2(normalizeangle(z.angle())) + ")";
}
var pi = 3.1415;
var nzero = new numeric.T(0, 0);
var none = new numeric.T(1, 0);
var nnone = new numeric.T(-1, 0);
var ni = new numeric.T(0.0, 1.0);
var nni = new numeric.T(0.0, -1.0);
function iszero(z) {
    return z.abs().x < 0.00005;
}
// Multiply polynomial coefficients.
// coeffs1[0] is the constant term,
// .. etc.
function polymult(coeffs1, coeffs2) {
    var deg1 = coeffs1.length - 1;
    var deg2 = coeffs2.length - 1;
    var coeffs3 = Array();
    for (var i = 0; i < coeffs1.length; i++) {
        for (var j = 0; j < coeffs2.length; j++) {
            if (coeffs3[i + j] == undefined)
                coeffs3[i + j] = nzero;
            coeffs3[i + j] = coeffs3[i + j].add(coeffs1[i].mul(coeffs2[j]));
        }
    }
    return coeffs3;
}
function dcoeffs(cs) {
    var retval = new Array();
    for (var i = 0; i < cs.length - 1; i++) {
        retval[i] = c(i + 1, 0).mul(cs[i + 1]);
    }
    return retval;
}
// Get coefficients for a polynomial with zeroes "zs"
function coeffs(zs) {
    var xcoeffs = [none];
    for (var i = 0; i < zs.length; i++) {
        var t = [c(-1, 0).mul(zs[i]), none];
        xcoeffs = polymult(xcoeffs, t);
    }
    return xcoeffs;
}
function cps(zs) {
    var dcs = dcoeffs(coeffs(zs));
    return polyroots(dcs);
}
function zpowers(z, n) {
    var zpowers = new Array();
    var zn = none;
    zpowers.push(zn);
    for (var i = 0; i < n; i++) {
        zn = zn.mul(z);
        zpowers.push(zn);
    }
    return zpowers;
}
function peval(coeffs, z) {
    var retval = nzero;
    var zs = zpowers(z, coeffs.length);
    for (var i = 0; i < coeffs.length; i++) {
        var zn = zs[i];
        var term = zn.mul(coeffs[i]);
        retval = retval.add(term);
    }
    return retval;
}
function polysub(cs1, cs2) {
    return polyadd(cs1, cs2.map(function (z) { return z.mul(-1); }));
}
function polyadd(cs1, cs2) {
    var retval = Array();
    for (var i = 0; i < Math.max(cs1.length, cs2.length); i++) {
        var c1 = nzero;
        var c2 = nzero;
        if (cs1[i] != undefined) {
            c1 = cs1[i];
        }
        if (cs2[i] != undefined) {
            c2 = cs2[i];
        }
        retval[i] = c1.add(c2);
    }
    return retval;
}
// see /sympy/mpmath/calculus/polynomials.py
function pypoly(cs) {
    var cs2 = cs.slice();
    cs2.reverse();
    return "[" + cs2.map(dcp).join(",") + "]";
}
function printzs(zs) {
    return "[" + zs.map(dcp).join(",") + "]";
}
function product(zs) {
    return zs.filter(function (z) { return z != undefined; })
        .reduce(function (z1, z2) { return z1.mul(z2); }, none);
}
// function polyrootsX(incs: polynomial): Array<numeric.T> {
//     var rps = new Float64Array(incs.map(fixy).map(z => z.x));
//     var ips = new Float64Array(incs.map(fixy).map(z => z.y));
//     var roots = cpolyX(rps, ips);
//     var rootrps = roots[0];
//     var rootips = roots[1];
//     var retval = new Array<numeric.T>(rootips.length);
//     for(var i = 0; i < rootrps.length; i++) {
//         retval[i] = c(rootrps[i], rootips[i]);
//     }
//     return retval;
// }
function polyroots(incs) {
    if (incs.length == 0) {
        return undefined;
    }
    var cs = incs.slice();
    while (cs.length > 0 && iszero(cs[cs.length - 1])) {
        cs.splice(-1, 1);
    }
    var deg = cs.length - 1;
    var leading = cs[cs.length - 1];
    cs = polymult(cs, [none.div(leading)]).map(fixy);
    var f = function (z) { return peval(cs, z); };
    var roots = new Array();
    for (var i = 0; i < deg; i++) {
        roots[i] = c(.4, .9).pow(i);
    }
    if (console != undefined) {
        if (console.log) {
            //	    console.log(pypoly(incs)); 
            //	    console.log(pypoly(cs));
        }
    }
    var n = 0;
    while (n < 100) {
        var dens = new Array();
        var deltas = new Array();
        var newroots = new Array();
        if (console != undefined && console.log != undefined) {
            // console.log("");
            // console.log("Roots: " + printzs(roots));
        }
        for (var i = 0; i < roots.length; i++) {
            var p = roots[i];
            var x = f(p);
            for (var j = 0; j < roots.length; j++) {
                if (i != j) {
                    var x2 = fixy(x.div(p.sub(roots[j])));
                    if (isNaN(x2.x) || isNaN(x2.y)) {
                        throw "";
                    }
                    x = x2;
                }
            }
            /*
                    if(console.log != undefined) {
                    console.log(i + " P:" + printzs([p]) + " f(p):" + printzs([f(p)]) + " x:" + printzs([x]));
                    }
            */
            roots[i] = p.sub(x);
            // All of our zeroes are in the disk - keep things from going crazy.
            // if(roots[i].abs().x > 2) {
            //     roots[i] = roots[i].div(roots[i].abs());
            // }
        }
        // roots = newroots;
        n++;
    }
    return roots;
}
function linterp(xmin, xmax, ymin, ymax) {
    return function (x) { return ymin + (ymax - ymin) * (x - xmin) / (xmax - xmin); };
}
function zinterp(xmin, xmax, ymin, ymax) {
    var li = linterp(xmin, xmax, ymin, ymax);
    return function (z) {
        var unitvec = z.div(z.abs());
        var znorm = z.abs().x;
        return unitvec.mul(li(znorm));
    };
}
//# sourceMappingURL=polynomials.js.map