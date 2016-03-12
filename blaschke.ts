/// <reference path="numeric-1.2.3.d.ts" />
/// <reference path="polynomials.ts" />
/// <reference path="lmellipse.ts" />

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
    var z : C;
    var bpz : C;
    var t : number;
    for(var ti = 0; ti < N; ti++) {
        t = ts[ti];
        z = c(numeric.cos(t), numeric.sin(t));
        bpz = bpe(z);
        outthetas[ti] = [t, (bpz.angle()+2*Math.PI) % (2*Math.PI)];
        outzs[ti] = [t, bpz];
    }
    return {thetas: outthetas, zs: outzs};
}

function bpgridevalArrayInner(bpe: BPF, N: number, as: BPZeroes, rowcallback: (n: number) => void) {
    // We want (-1,1) in the upper-left corner.
    var xs = numeric.linspace(-1,1,N);
    var ys = numeric.linspace(1,-1,N);
    var realparts = new Float32Array(N*N);
    var imagparts = new Float32Array(N*N);
    var z : C;
    var bpz : C;
    for(var yi = 0; yi < N; yi++) {
        for(var xi = 0; xi < N; xi++) {
            z = c(xs[xi], ys[yi]);
            if(z.abs().x <= 1) {
                bpz = bpe(z);
                var addr = N*yi + xi;
                realparts[addr] = bpz.x;
                imagparts[addr] = bpz.y;
            } else {
                realparts[addr] = NaN;
                imagparts[addr] = NaN;
            }
        }
        if(typeof(rowcallback) == "function") {
            rowcallback(yi);
        }
    }
    return {realparts: realparts, imagparts: imagparts, N: N};
}

function zsString(zs: Array<C>) : string {
    return zs.map(function(z) { return "z="+z.x+","+(z.y == undefined ? 0: z.y); }).join("\n&");
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

function getBPFExpr(as: BPZeroes, ignorefactor: boolean = null) {
    var asNums = new Array<string>();
    var asDens = new Array<string>()
    var asVars = new Array<string>();
    function toc(a: C) : string { return "c("+a.x+","+a.y+")"; }
    for(var i  = 0; i < as.length; i++) {
        var a = as[i];
        asVars.push("var a"+i+" = "+toc(a));
        if(iszero(a)) {
            asNums.push(".mul(z)");
            asDens.push(".div(none)");
        } else {
            asNums.push(".mul(z.sub(a"+i+"))");
            asDens.push(".div(none.sub(a"+i+".conj().mul(z)))");
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
    return <BPF>f;
}

function bpeval0(as: BPZeroes, z: C): C {
    var f = getBPF(as);
    return f(z);
}

function bpepolys(as: BPZeroes): BPF {
    var num = bpnum(as);
    var den = bpden(as);
    return function(z) {
	    return peval(num, z).div(peval(den, z));
    }
}

function bpeval(as: BPZeroes, z: C): C {

    function bpterm(a: C) : C {
        var num : C;
        if(!iszero(a)) {
            num = z.sub(a); // (z-a)
        } else {
            num = z;
        }
        var den = none.sub(a.conj().mul(z)); // (1-a*z)
        return num.div(den);
    }

    var retval = none;
    for(var i = 0; i < as.length; i++) {
        var term = bpterm(as[i]);
        retval = retval.mul(term);
    }
    return retval;
}

function bpnum(as: BPZeroes): polynomial {
    var num = [none];
    for(var i = 0; i < as.length; i++) {
        var polyterm : polynomial;
        // (z-a)
        polyterm = [as[i].mul(-1), none];
        num = polymult(polyterm, num);
    }
    return num;
}

function bpden(as: BPZeroes): polynomial {
    var den = [none];
    for(var i =0; i < as.length; i++) {
        var polyterm = [none, as[i].conj().mul(-1)];
        den = polymult(polyterm, den);
    }
    return den;
}

// Gets the numerator of B'.
function getBPprime(as: BPZeroes): polynomial {
    var num = bpnum(as);
    var nump = dcoeffs(num);
    var nonzeroas = as.filter(function(z) { return z.abs().x > .0001; });
    var den = bpden(nonzeroas);
    var denp = dcoeffs(den);
    return polysub(polymult(nump, den), polymult(denp, num));
}

class NumDen {
    num: polynomial;
    den: polynomial;
}

function getFullBPprime(as: BPZeroes): NumDen {
    var num = getBPprime(as);
    var nonzeroas = as.filter(function(z) { return z.abs().x > .0001; });
    var den = bpden(nonzeroas);
    var den2 = polymult(den, den);
    var dzmax = den2[den2.length -1];
    den2 = den2.map(function(z) { return z.div(dzmax);});
    num  = num.map(function(z) { return z.div(dzmax);});
    return <NumDen>{"num": num, "den": den2};
}

function getBPTheta(as: BPZeroes, ts: Array<number>): Array<numeric.T> {
    var retval = new Array(ts.length);
    var bpnumden = getFullBPprime(as);
    for(var i = 0; i < ts.length; i++) {
        var t = ts[i];
        var z = ttcp(t);
        var bpt = peval(bpnumden.num, z).div(peval(bpnumden.den, z));
        bpt = bpt.mul(ni).mul(z);
        retval[i] = bpt;
    }
    return retval;
}

class Z1Z2ZTan {
    z1: C;
    z2: C;
    ztan: C;
}

function getTanPoints(as: BPZeroes, t: number): Array<Z1Z2ZTan> {
    var preimages = preimage(as, rt2c(1,t));
    preimages = preimages.sort(function(i,j) { 
	    return normalizeangle(i.angle()) - normalizeangle(j.angle());
    });

    var ts = preimages.map(function(z) { return z.angle(); });
    var bps = getBPTheta(as, ts);
    var retval = new Array<Z1Z2ZTan>(preimages.length);
    for(var i = 0; i < preimages.length; i++) {
        var j = (i+1) % preimages.length;
        var z1 = preimages[i];
        var z2 = preimages[j];
        var bp1 = bps[i].abs();
        var bp2 = bps[j].abs();
        var l = bp2.div(bp2.add(bp1));
        var ztan = z1.add(z2.sub(z1).mul(l));
        retval[i] = {"z1": z1, "z2": z2, "ztan": ztan};
    }
    return retval;
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
    for(var i = 0; i < zs1.length; i++) {
        // Find points that zs2 maps to alpha.
        var alpha = zs1[i];
        var alpharoots = preimage(zs2, alpha);
        var o = {'outerzero': alpha, 'preimages': alpharoots};
        retval.push(o);
    }
    return retval;
}

function bpcompose(zs1: BPZeroes, zs2: BPZeroes): BPZeroes {
    var preimages = bpcompose2(zs1, zs2);
    return [].concat.apply([], preimages.map(function(pimg) {return pimg.preimages;}));
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
    for(var i = 0; i < indices.length; i++) { 
	    foo.push(vals[indices[i]]); 
    }
    return foo;
}

class CPInfo {
    cps: Array<numeric.T>;
    cvs: Array<numeric.T>;
    cvangles : Array<number>;
}

function cpinfo(zs: BPZeroes): CPInfo {

    var bpp = getBPprime(zs);
    // FIXME: For some reason, for a large number
    // of zeroes, I get mostly derivative zeroes
    // outside the circle.  Dunno why, perhaps
    // I need more iterations?
    // cps.map(function(z) { return peval(bpp, z).abs().x; })
    // The above shows that all the roots are indeed close to zero...
    var cps = polyroots(bpp);
    var circlecps = new Array();
    for(var i=0; i < cps.length;i++) {
        var cp = cps[i];
        if(cp.abs().x < 1) {
            circlecps.push(cp);
        }
    }

    var cvs = circlecps.map(function(cp) {return bpeval(zs, cp);});
    var perm = zeroToNm1(cvs.length);
    var perm2 = perm.sort(function(i,j) { return normalizeangle(cvs[i].angle()) - normalizeangle(cvs[j].angle());});

    var sortedcvs = sortBy(cvs, perm2);
    var sortedcps = sortBy(circlecps, perm2);

    var cvangles = sortedcvs.map(function(cv) {return cv.angle();}).map(normalizeangle);
    cvangles.sort(function(a,b) {return a-b});
    // circlecps.sort(function(a,b) { return normalizeangle(a.angle()) - normalizeangle(b.angle()); });
    return {"cps": sortedcps, "cvs": sortedcvs, "cvangles": cvangles};
}

function getangleindex(theta: number, ts: Array<number>): number {
    // Check the first N-1
    for(var i = 0; i < ts.length-1; i++) {
        if(normalizeangle(theta) >= ts[i] && normalizeangle(theta) < ts[i+1]) {
            return i;
        }
    }
    return ts.length - 1;
}

function quadPerspective(zs: Array<numeric.T>) {
    var N = 16;
    var ts = numeric.linspace(0, Math.PI*2, N).slice(0,N-1).map(function(t) { return rt2c(1,t); });
    var preimages = ts.map(function(z) { return preimage(zs, z); });
    function anglesort(z1: C,z2: C): number {
	    return normalizeangle(z1.angle()) - normalizeangle(z2.angle());
    };
    var angleSorted = preimages.map(function(zs2) { return zs2.sort(anglesort);});    
    var goodpoints = new Array();
    for(var i = 0; i < 4; i++) {
        for(var j = 0; j < angleSorted.length; j++) {
            var ppt = perspective(angleSorted[j], i);
            if(isNaN(ppt.x) || isNaN(ppt.y) || Math.abs(ppt.x) > 10000 || Math.abs(ppt.y) > 10000) {
                //console.log("Burp.");
            } else {
                //console.log(ppt);
                goodpoints.push(ppt);
            }
        }
    }
    goodpoints = goodpoints.sort(function(a,b) { return a.x - b.x; });
    var gpxs = goodpoints.map(function(xy) { return xy.x;});
    var gpys = goodpoints.map(function(xy) { return xy.y;});
    var ls = findLineByLeastSquares(gpxs, gpys);
    var diffs = new Array();
    for(var i = 0; i < ls.points[1].length; i++) { 
	    diffs[i] = Math.abs(ls.points[1][i] - gpys[i]);
    }
    
}

function perspective(zs: BPZeroes, i: number) {
    var z1 = zs[(0+i) % zs.length];
    var z2 = zs[(1+i) % zs.length];
    var z3 = zs[(2+i) % zs.length];
    var z4 = zs[(3+i) % zs.length];
    var m12 = z2.sub(z1);
    var m34 = z4.sub(z3);
    var b: Array<number> = [z1.sub(z3).x, z1.sub(z3).y];
    var M = [[-z2.sub(z1).x, -fixy(z2.sub(z1)).y], [z4.sub(z3).x, fixy(z4.sub(z3)).y]];
    var ts = numeric.solve(numeric.transpose(M),b);    
    var intz12 = z1.add(z2.sub(z1).mul(ts[0]));
    var intz34 = z3.add(z4.sub(z3).mul(ts[1]));
    return intz12;
}

