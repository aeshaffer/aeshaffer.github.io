/// <reference path="numeric-1.2.3.d.ts" />
/// <reference path="polynomials.ts" />
/// <reference path="lmellipse.ts" />
/// <reference path="ellipse.ts" />

function bpgridevalArrayOrig(N: number, as: Array<numeric.T>, rowcallback: any) {
    var bpe = getBPF(as);
    return bpgridevalArrayInner(bpe, N, as, rowcallback);
}

// function bpgridevalArrayPolys(N, as, rowcallback) {
//     var bpe = bpepolys(as);
//     return bpgridevalArrayInner(bpe, N, as, rowcallback);
// }

var bpgridevalArray = bpgridevalArrayOrig;

function bpBoundaryEval(bpe: BPF, N: number) {
    var ts = numeric.linspace(-Math.PI, Math.PI, N);
    var outthetas = new Array(N);
    var outzs = new Array(N);
    var z: C;
    var bpz: C;
    var t: number;
    for (var ti = 0; ti < N; ti++) {
        t = ts[ti];
        z = c(numeric.cos(t), numeric.sin(t));
        bpz = bpe(z);
        outthetas[ti] = [t, (bpz.angle() + 2 * Math.PI) % (2 * Math.PI)];
        outzs[ti] = [t, bpz];
    }
    return { thetas: outthetas, zs: outzs };
}

function bpgridevalArrayInner(bpe: BPF, N: number, as: BPZeroes, rowcallback: (n: number) => void) {
    // We want (-1,1) in the upper-left corner.
    var xs = numeric.linspace(-1, 1, N);
    var ys = numeric.linspace(1, -1, N);
    var realparts = new Float32Array(N * N);
    var imagparts = new Float32Array(N * N);
    var z: C;
    var bpz: C;
    for (var yi = 0; yi < N; yi++) {
        for (var xi = 0; xi < N; xi++) {
            var addr = N * yi + xi;
            z = c(xs[xi], ys[yi]);
            if (z.norm2() <= 1) {
                bpz = bpe(z);
                realparts[addr] = bpz.x;
                imagparts[addr] = bpz.y;
            } else {
                realparts[addr] = -10;
                imagparts[addr] = -10;
            }
        }
        if (typeof (rowcallback) == "function") {
            rowcallback(yi);
        }
    }
    var retval: RPIP = { realparts: realparts, imagparts: imagparts /*, N: N */ };
    return retval;
}

/*
function lt(a) {
    
    if(a.abs().x == 0) {
	return c(1);
    } else {
	return a.conj().div(a.abs());
    }
}
*/

function benchmark0() {
    var as = [c(1, 0), c(2, 0), c(3, 0), c(4, 0), c(6, 0), c(7, 0)];
    var N = 800;

    var start = performance.now();
    var retval = bpEvalMaybeFast(N, as);
    var end = performance.now();
    console.log(end - start);

    var start2 = performance.now();
    var bpf = getBPF(as);
    var retval2 = bpgridevalArrayInner(bpf, N, as, null);
    var end2 = performance.now();
    console.log(end2 - start2);
    return { retval, retval2 };
}

function bpevalMaybeFastWrapper(coeffs: polynomial, zs: C[]) {
    var coeffsRP = new Float32Array(coeffs.map(z => z.x));
    var coeffsIP = new Float32Array(coeffs.map(z => z.y == undefined ? 0 : z.y));
    var zsRP = new Float32Array(zs.map(z => z.x));
    var zsIP = new Float32Array(zs.map(z => z.y == undefined ? 0 : z.y));
    var retval0 = polyvalMaybeFast(coeffsRP, coeffsIP, zsRP, zsIP);
    var retval = new Array<C>(zs.length);
    for (var i = 0; i < zs.length; i++) {
        retval[i] = c(retval0.bpzRPs[i], retval0.bpzIPs[i]);
    }
    return retval;
}

function getZSRPIP(N: number) {
    var xs = numeric.linspace(-1, 1, N);
    var ys = numeric.linspace(1, -1, N);
    var zs = new Array<C>(xs.length * ys.length);
    for (var i = 0; i < xs.length; i++) {
        for (var j = 0; j < ys.length; j++) {
            zs[j * xs.length + i] = c(xs[i], ys[j]);
        }
    }
    var zsRP = new Float32Array(zs.map(z => z.x));
    var zsIP = new Float32Array(zs.map(z => z.y == undefined ? 0 : z.y));
    return { zs, zsRP, zsIP };
}

function combineNumsDens(N: number, zs: C[], nums: PVMF, dens: any): RPIP {
    var rps = new Float32Array(N*N);
    var ips = new Float32Array(N*N);
    for (var i = 0; i < nums.bpzRPs.length; i++) {
        if (zs[i].norm2() > 1) {
            rps[i] = -10;
            ips[i] = -10;
        } else {
            var xn = nums.bpzRPs[i];
            var yn = nums.bpzIPs[i];
            var xd = dens.bpzRPs[i];
            var yd = dens.bpzIPs[i];
            // Calculate num/den
            var rp = xn * xd + yn * yd;
            var ip = yn * xd - xn * yd;
            var dn = xd * xd + yd * yd;
            rps[i] = rp / dn;
            ips[i] = ip / dn;
        }
    }
    return {realparts: rps, imagparts: ips};
}

function bpEvalMaybeFast(N: number, as: C[]): RPIP {
    var zs = getZSRPIP(N);

    var num = bpnum(as);
    var numcoeffsRP = new Float32Array(num.map(z => z.x));
    var numcoeffsIP = new Float32Array(num.map(z => z.y == undefined ? 0 : z.y));
    var nums = polyvalMaybeFast(numcoeffsRP, numcoeffsIP, zs.zsRP, zs.zsIP);

    var den = bpden(as);
    var dencoeffsRP = new Float32Array(den.map(z => z.x));
    var dencoeffsIP = new Float32Array(den.map(z => z.y == undefined ? 0 : z.y));
    var dens = polyvalMaybeFast(dencoeffsRP, dencoeffsIP, zs.zsRP, zs.zsIP);

    return combineNumsDens(N, zs.zs, nums, dens);
}


function polyvalMaybeFastWrapper(coeffs: polynomial, zs: C[]) {
    var coeffsRP = new Float32Array(coeffs.map(z => z.x));
    var coeffsIP = new Float32Array(coeffs.map(z => z.y == undefined ? 0 : z.y));
    var zsRP = new Float32Array(zs.map(z => z.x));
    var zsIP = new Float32Array(zs.map(z => z.y == undefined ? 0 : z.y));
    var retval0 = polyvalMaybeFast(coeffsRP, coeffsIP, zsRP, zsIP);
    var retval = new Array<C>(zs.length);
    for (var i = 0; i < zs.length; i++) {
        retval[i] = c(retval0.bpzRPs[i], retval0.bpzIPs[i]);
    }
    return retval;
}

class PVMF {
    bpzRPs: Float32Array;
    bpzIPs: Float32Array;
}

function polyvalMaybeFast(
    coeffsRP: Float32Array, coeffsIP: Float32Array,
    zsRP: Float32Array, zsIP: Float32Array): PVMF {
    var degree = coeffsRP.length;
    var bpzRPs = new Float32Array(zsRP.length);
    var bpzIPs = new Float32Array(zsRP.length);
    for (var zi = 0; zi < zsRP.length; zi++) {
        var zRP = zsRP[zi];
        var zIP = zsIP[zi];
        var znRP = 1;
        var znIP = 0;
        bpzRPs[zi] = 0;
        bpzIPs[zi] = 0;
        for (var n = 0; n < degree; n++) {
            bpzRPs[zi] += coeffsRP[n] * znRP - znIP * coeffsIP[n];
            bpzIPs[zi] += coeffsIP[n] * znRP + znIP * coeffsRP[n];
            var znRP0 = znRP * zRP - znIP * zIP;
            var znIP0 = znRP * zIP + znIP * zRP;
            znRP = znRP0;
            znIP = znIP0;
        }
    }
    return { bpzRPs, bpzIPs };
}

function bpevalMaybeFast(as: BPZeroes, zs: C[]): C[] {
    var num = bpnum(as);
    var den = bpden(as);
    var numRP = num.map(z => z.x);
    var numIP = num.map(z => fixy(z).y);
    var denRP = den.map(z => z.x);
    var denIP = den.map(z => fixy(z).y);
    var bpzRP = new Float32Array(zs.length);
    var bpzIP = new Float32Array(zs.length);

    for (var i = 0; i < zs.length; i++) {
        var z = zs[i];
        var bpzR = 0;
        var bpzI = 0;
        var znR = 1;
        var znI = 0;
        for (var n = 0; n < numRP.length; n++) {

        }
    }
    return null;
}

function getBPFExpr(as: BPZeroes, ignorefactor: boolean = null) {
    var asNums = new Array<string>();
    var asDens = new Array<string>()
    var asVars = new Array<string>();
    function toc(a: C): string { return "c(" + a.x + "," + a.y + ")"; }
    for (var i = 0; i < as.length; i++) {
        var a = as[i];
        asVars.push("var a" + i + " = " + toc(a));
        if (iszero(a)) {
            asNums.push(".mul(z)");
            asDens.push(".div(none)");
        } else {
            asNums.push(".mul(z.sub(a" + i + "))");
            asDens.push(".div(none.sub(a" + i + ".conj().mul(z)))");
        }
    }

    var expr = asVars.join(';') + "; var f = function(z) { return c(1,0)" +
        asNums.join('') + asDens.join('') + "; }; {f};"

    return expr;
}

type BPZeroes = Array<numeric.T>;

interface BPF {
    (z: C): C;
}

function getBPF(as: BPZeroes, ignorefactor: boolean = null): BPF {
    var f = eval(getBPFExpr(as, ignorefactor));
    return <BPF>(z => fixy(f(z)));
}

function bpeval0(as: BPZeroes, z: C): C {
    var f = getBPF(as);
    return f(z);
}

function bpepolys(as: BPZeroes): BPF {
    var num = bpnum(as);
    var den = bpden(as);
    return function (z) {
        return peval(num, z).div(peval(den, z));
    }
}

function bpeval(as: BPZeroes, z: C): C {

    function bpterm(a: C): C {
        var num: C;
        if (!iszero(a)) {
            num = z.sub(a); // (z-a)
        } else {
            num = z;
        }
        var den = none.sub(a.conj().mul(z)); // (1-a*z)
        return num.div(den);
    }

    var retval = none;
    for (var i = 0; i < as.length; i++) {
        var term = bpterm(as[i]);
        retval = retval.mul(term);
    }
    return retval;
}

function bpnum(as: BPZeroes): polynomial {
    var num = [none];
    for (var i = 0; i < as.length; i++) {
        var polyterm: polynomial;
        // (z-a)
        polyterm = [as[i].mul(-1), none];
        num = polymult(polyterm, num);
    }
    return num;
}

function bpden(as: BPZeroes): polynomial {
    var den = [none];
    for (var i = 0; i < as.length; i++) {
        var polyterm = [none, as[i].conj().mul(-1)];
        den = polymult(polyterm, den);
    }
    return den;
}

// Gets the numerator of B'.
function getBPrimeNumerator(as: BPZeroes): polynomial {
    var num = bpnum(as);
    var nump = dcoeffs(num);
    var nonzeroas = as.filter(function (z) { return z.abs().x > .0001; });
    var den = bpden(nonzeroas);
    var denp = dcoeffs(den);
    return polysub(polymult(nump, den), polymult(denp, num)).map(fixy);
}

class NumDen {
    num: polynomial;
    den: polynomial;
}

function getFullBPprime(as: BPZeroes): NumDen {
    var num = getBPrimeNumerator(as);
    var nonzeroas = as.filter(function (z) { return z.abs().x > .0001; });
    var den = bpden(nonzeroas);
    var den2 = polymult(den, den);
    var dzmax = den2[den2.length - 1];
    den2 = den2.map(function (z) { return z.div(dzmax); });
    num = num.map(function (z) { return z.div(dzmax); });
    return <NumDen>{ "num": num, "den": den2 };
}

function getBPTheta(as: BPZeroes, ts: Array<number>): Array<numeric.T> {
    var retval = new Array(ts.length);
    var bpnumden = getFullBPprime(as);
    for (var i = 0; i < ts.length; i++) {
        var t = ts[i];
        var z = ttcp(t);
        var bpt = peval(bpnumden.num, z).div(peval(bpnumden.den, z));
        bpt = bpt.mul(ni).mul(z);
        retval[i] = bpt;
    }
    return retval;
}

class Z1Z2ZTan {
    constructor(z1: C, z2: C, ztan: C, lambdaangle: number) {
        this.z1 = z2, this.z2 = z2, this.ztan = ztan, this.lambdaangle = lambdaangle;
    }
    z1: C;
    z2: C;
    ztan: C;
    lambdaangle: number;
}

// Get lists of preimages of exp(i*t), along with the point of
// intersection.
function getTanPoints(as: BPZeroes, t: number, skip: number = 1): Array<Z1Z2ZTan> {
    var preimages = preimage(as, rt2c(1, t));
    preimages = preimages.sort(function (i, j) {
        return normalizeangle(i.angle()) - normalizeangle(j.angle());
    });
    return getTanPointsForPIs(as, preimages, t, skip);
}

function calctangents(zs: numeric.T[], numangles: number, skip: number) {
    var tpts = numeric.linspace(0, 2 * Math.PI - 2 * Math.PI / numangles, numangles); // [0, Math.PI];
    var tanpoints = new Array<Z1Z2ZTan[]>(tpts.length);
    for (var ti = 0; ti < tpts.length; ti++) {
        var pts = getTanPoints(zs, tpts[ti], skip);
        tanpoints[ti] = pts;
    }
    return tanpoints;
}

function calcinteresections(allpts3:Z1Z2ZTan[], i: number) {
    var mytriple = allpts3[i];
    var prevtriple = allpts3[(i - 1 + allpts3.length) % allpts3.length];
    var nexttriple = allpts3[(i + 1) % allpts3.length];
    var prevaverage = mytriple.z1.Cadd(prevtriple.z1).div(2);
    var nextaverage = mytriple.z1.Cadd(nexttriple.z1).div(2);

    var previntersection = lineLineIntersectionZZ(mytriple.z1, mytriple.ztan, prevtriple.z1, prevtriple.ztan);
    var nextintersection = lineLineIntersectionZZ(mytriple.z1, mytriple.ztan, nexttriple.z1, nexttriple.ztan);

    var prevtanaverage = mytriple.ztan.Cadd(previntersection).div(2);
    var nexttanaverage = mytriple.ztan.Cadd(nextintersection).div(2);
    return {previntersection, nextintersection, prevaverage, nextaverage, mytriple};
}


function getTanPointsWithSkip(as: BPZeroes, t: number, skip: number): Z1Z2ZTan[][] {
    var preimages = preimage(as, rt2c(1, t));
    preimages = preimages.sort(function (i, j) {
        return normalizeangle(i.angle()) - normalizeangle(j.angle());
    });
    var polys = getSkippedAngles(preimages.map(z => z.angle()), skip);
    var retval = new Array<Array<Z1Z2ZTan>>();
    for (var i = 0; i < polys.length; i++) {
        var polyangles = polys[i];
        var polyZs = polyangles.map(t2c);
        var x = getTanPointsForPIs(as, polyZs, t);
        retval.push(x);
    }
    return retval;
}

function getTanPointsForPIs(as: BPZeroes, preimages: Array<C>, theta: number, skip: number = 1): Array<Z1Z2ZTan> {
    var ts = preimages.map(function (z) { return z.angle(); });
    var bps = getBPTheta(as, ts);
    var retval = new Array<Z1Z2ZTan>(preimages.length);
    for (var i = 0; i < preimages.length; i++) {
        var j = (i + skip) % preimages.length;
        var z1 = preimages[i];
        var z2 = preimages[j];
        var bp1 = bps[i].abs();
        var bp2 = bps[j].abs();
        var l = bp2.div(bp2.add(bp1));
        var ztan = z1.add(z2.sub(z1).mul(l));
        retval[i] = { "z1": z1, "z2": z2, "ztan": ztan, "lambdaangle": theta};
    }
    return retval;
}

function getCurrentSegment(zs: BPZeroes, targetLength: number) {
    var drawnLength = 0;
    var z0: C;
    var z1: C;
    for (var i = 0; i < zs.length + 1; i++) {
        z0 = zs[i % zs.length];
        z1 = zs[(i + 1) % zs.length];
        var z1mz0 = z1.sub(z0);
        var lineLength = z1mz0.abs().x;
        if (drawnLength + lineLength >= targetLength) {
            // Draw in the same direction with whatever length we have left over.
            var z = z0.add(z1mz0.div(lineLength).mul(targetLength - drawnLength));
            return { segment: [z0, z1], point: z };
        }
        drawnLength += lineLength;
    }
    return { segment: [z0, z1], point: z1 };
}

function getSkippedAngles(piangles: Array<number>, skip: number): Array<Array<number>> {
    var numLines: number;

    if (piangles.length % skip == 0) {
        numLines = skip;
    } else {
        numLines = gcd_rec(skip, piangles.length);
    }

    var retval = new Array<Array<number>>(numLines);
    for (var j = 0; j < numLines; j++) {
        var polyarray = new Array<number>();
        var i = j;
        do {
            polyarray.push(piangles[i % (piangles.length)]);
            i = (i + skip) % piangles.length;
        } while (i != j);
        retval[j] = polyarray;
    }

    return retval;
}

function getPIAngles(zs: BPZeroes, t: number): Array<number> {
    var z2 = c(numeric.cos(t), numeric.sin(t));
    // var bz2 = bpeval0(this.zs, z2);
    var bz2 = z2;
    var preimages = preimage(zs, bz2);
    var piangles = preimages.map(function (cv) { return cv.angle(); })
    piangles = piangles.sort(function (a, b) { return a - b });
    return piangles;
}

function getPolylength(zs: Array<C>): number {
    var retval = 0;
    for (var i = 0; i < zs.length; i++) {
        var z0 = zs[i % zs.length];
        var z1 = zs[(i + 1) % zs.length];
        retval += z0.sub(z1).abs().x;
    }
    return retval;
}


function getSortedByCenter(intersections: Array<Array<IntersectionData>>): Array<C> {
    var ints = new Array<C>();
    for (var i = 0; i < intersections.length; i++) {
        for (var j = 0; j < intersections[i].length; j++) {
            ints.push(intersections[i][j].inter);
        }
    }

    // Find the center of mass
    var avg = nzero;
    for (var i = 0; i < ints.length; i++) {
        avg = avg.add(ints[i]);
    }
    avg = avg.div(ints.length);
    // Sort them by angle around this center.
    ints = ints.map(function (z) { return z.sub(avg); });
    ints = ints.sort(function (a, b) { return b.angle() - a.angle(); });
    ints = ints.map(function (z) { return z.add(avg); });

    return ints;
}

function maxDistPair(ints: Array<C>) {

    var maxDist = 0;
    var maxI = -1;
    var maxJ = -1;
    for (var i = 0; i < ints.length; i++) {
        for (var j = i + 1; j < ints.length; j++) {
            var dist0 = ints[i].sub(ints[j]).abs().x;
            if (dist0 > maxDist) {
                maxI = i;
                maxJ = j;
                maxDist = dist0;
            }
        }
    }
    return { p0: ints[maxI], p1: ints[maxJ] };
}

function fixedpoints(zs: BPZeroes): Array<numeric.T> {
    var num = bpnum(zs);
    var den = bpden(zs);
    var zpoly = [c(0, 0), c(1, 0)];
    var zden = polymult(zpoly, den);
    var poly = polysub(num, zden);
    var fixedpoints = polyroots(poly);
    return fixedpoints;
}

function preimage(zs: BPZeroes, beta: C): Array<numeric.T> {
    var num = bpnum(zs);
    var den = bpden(zs);
    var alphaden = polymult([beta], den);
    var poly = polysub(num, alphaden);
    var preimages = polyroots(poly);
    return preimages;
}

class OuterZeroAndPreimages {
    outerzero: C;
    preimages: Array<numeric.T>;
}

function bpcompose2(zs1: BPZeroes, zs2: BPZeroes): Array<OuterZeroAndPreimages> {
    var retval = new Array<OuterZeroAndPreimages>();
    for (var i = 0; i < zs1.length; i++) {
        // Find points that zs2 maps to alpha.
        var alpha = zs1[i];
        var alpharoots = preimage(zs2, alpha);
        var o = { 'outerzero': alpha, 'preimages': alpharoots };
        retval.push(o);
    }
    return retval;
}

function bpcompose(zs1: BPZeroes, zs2: BPZeroes): BPZeroes {
    var preimages = bpcompose2(zs1, zs2);
    return [].concat.apply([], preimages.map(function (pimg) { return pimg.preimages; }));
}

function roll<T>(ar: Array<T>): Array<T> {
    var retval = ar.slice(0);
    var end = retval.shift();
    retval.push(end);
    return retval;
}

function zeroToNm1(N: number): Array<number> {
    var foo = new Array<number>();

    for (var i = 0; i < N; i++) {
        foo.push(i);
    }
    return foo;
}

function sortBy<T>(vals: Array<T>, indices: Array<number>): Array<T> {
    var foo = new Array<T>();
    for (var i = 0; i < indices.length; i++) {
        foo.push(vals[indices[i]]);
    }
    return foo;
}

class CPInfo {
    constructor(cps: Array<numeric.T>, cvs: Array<numeric.T>, cvangles: Array<number>, fps: Array<numeric.T>) {
        this.cps = cps, this.cvs = cvs; this.cvangles = cvangles; this.fps = fps;
    }
    cps: Array<numeric.T>;
    cvs: Array<numeric.T>;
    cvangles: Array<number>;
    fps: Array<numeric.T>;
    plottableFPS() { return this.fps.filter(z => fixy(z).x <= 1.1 && fixy(z).y <= 1.1); }
}

function cpinfo(zs: BPZeroes): CPInfo {
    if (zs.length == 0) {
        return new CPInfo(new Array<numeric.T>(), new Array<numeric.T>(), new Array<number>(), new Array<numeric.T>());
    }
    var bpp = getBPrimeNumerator(zs);
    // FIXME: For some reason, for a large number
    // of zeroes, I get mostly derivative zeroes
    // outside the circle.  Dunno why, perhaps
    // I need more iterations?
    // cps.map(function(z) { return peval(bpp, z).abs().x; })
    // The above shows that all the roots are indeed close to zero...
    var cps = polyroots(bpp);
    var circlecps = new Array();
    for (var i = 0; i < cps.length; i++) {
        var cp = cps[i];
        if (cp.abs().x < 1) {
            circlecps.push(cp);
        }
    }

    var cvs = circlecps.map(function (cp) { return bpeval(zs, cp); });
    var perm = zeroToNm1(cvs.length);
    var perm2 = perm.sort(function (i, j) { return normalizeangle(cvs[i].angle()) - normalizeangle(cvs[j].angle()); });

    var sortedcvs = sortBy(cvs, perm2);
    var sortedcps = sortBy(circlecps, perm2);

    var cvangles = sortedcvs.map(function (cv) { return cv.angle(); }).map(normalizeangle);
    cvangles.sort(function (a, b) { return a - b });
    // circlecps.sort(function(a,b) { return normalizeangle(a.angle()) - normalizeangle(b.angle()); });
    var fps = fixedpoints(zs)
    return new CPInfo(sortedcps, sortedcvs, cvangles, fps);
}

function getangleindex(theta: number, ts: Array<number>): number {
    // Check the first N-1
    for (var i = 0; i < ts.length - 1; i++) {
        if (normalizeangle(theta) >= ts[i] && normalizeangle(theta) < ts[i + 1]) {
            return i;
        }
    }
    return ts.length - 1;
}

function quadPerspective(zs: Array<numeric.T>) {
    var N = 16;
    var ts = numeric.linspace(0, Math.PI * 2, N).slice(0, N - 1).map(function (t) { return rt2c(1, t); });
    var preimages = ts.map(function (z) { return preimage(zs, z); });
    function anglesort(z1: C, z2: C): number {
        return normalizeangle(z1.angle()) - normalizeangle(z2.angle());
    };
    var angleSorted = preimages.map(function (zs2) { return zs2.sort(anglesort); });
    var goodpoints = new Array();
    for (var i = 0; i < 4; i++) {
        for (var j = 0; j < angleSorted.length; j++) {
            var ppt = perspective(angleSorted[j], i);
            if (isNaN(ppt.x) || isNaN(ppt.y) || Math.abs(ppt.x) > 10000 || Math.abs(ppt.y) > 10000) {
                //console.log("Burp.");
            } else {
                //console.log(ppt);
                goodpoints.push(ppt);
            }
        }
    }
    goodpoints = goodpoints.sort(function (a, b) { return a.x - b.x; });
    var gpxs = goodpoints.map(function (xy) { return xy.x; });
    var gpys = goodpoints.map(function (xy) { return xy.y; });
    var ls = findLineByLeastSquares(gpxs, gpys);
    var diffs = new Array();
    for (var i = 0; i < ls.points[1].length; i++) {
        diffs[i] = Math.abs(ls.points[1][i] - gpys[i]);
    }

}

function perspective(zs: BPZeroes, i: number) {
    var z1 = zs[(0 + i) % zs.length];
    var z2 = zs[(1 + i) % zs.length];
    var z3 = zs[(2 + i) % zs.length];
    var z4 = zs[(3 + i) % zs.length];
    var m12 = z2.sub(z1);
    var m34 = z4.sub(z3);
    var b: Array<number> = [z1.sub(z3).x, z1.sub(z3).y];
    var M = [[-z2.sub(z1).x, -fixy(z2.sub(z1)).y], [z4.sub(z3).x, fixy(z4.sub(z3)).y]];
    var ts = numeric.solve(numeric.transpose(M), b);
    var intz12 = z1.add(z2.sub(z1).mul(ts[0]));
    var intz34 = z3.add(z4.sub(z3).mul(ts[1]));
    return intz12;
}

