
function bpgridevalArrayOrig(N, as, rowcallback) {
    var bpe = getBPF(as);
    return bpgridevalArrayInner(bpe, N, as, rowcallback);
}

// function bpgridevalArrayPolys(N, as, rowcallback) {
//     var bpe = bpepolys(as);
//     return bpgridevalArrayInner(bpe, N, as, rowcallback);
// }

var bpgridevalArray = bpgridevalArrayOrig;

function bpBoundaryEval(bpe, N) {
    var ts = numeric.linspace(-Math.PI, Math.PI, N);
    var outthetas = new Array(N);
    var outzs = new Array(N);
    var z;
    var bpz;
    var t;
    for(var ti = 0; ti < N; ti++) {
	t = ts[ti];
	z = c(numeric.cos(t), numeric.sin(t));
	bpz = bpe(z);
	outthetas[ti] = [t, (bpz.angle()+2*Math.PI) % (2*Math.PI)];
	outzs[ti] = [t, bpz];
    }
    return {thetas: outthetas, zs: outzs};
}

function bpgridevalArrayInner(bpe, N, as, rowcallback) {
    // We want (-1,1) in the upper-left corner.
    var xs = numeric.linspace(-1,1,N);
    var ys = numeric.linspace(1,-1,N);
    var realparts = new Float32Array(N*N);
    var imagparts = new Float32Array(N*N);
    var z;
    var bpz;
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

function zsString(zs) {
    return zs.map(function(z) { return "z="+z.x+","+(z.y == undefined ? 0: z.y); }).join("\n&");
}


// Normalize to between 0 and 2Pi.
function normalizeangle(theta) {
    while(true) {
	if(theta > 2*Math.PI) {
	    theta = theta - 2*Math.PI;
	} else if(theta < 0) {
	    theta = theta + 2*Math.PI;
	} else {
	    return theta;
	}
    }
}

// Normalize to between -Pi and Pi.
function anglediff(theta) {
    while(true) {
	if(theta > Math.PI) {
	    theta = theta - 2*Math.PI;
	} else if(theta < -Math.PI) {
	    theta = theta + 2*Math.PI;
	} else {
	    return theta;
	}
    }
}

function biggestanglediff(ts) {
    var maxdiff = 0;
    var maxind = 0;
    for(var i = 0; i < ts.length; i++) {
	var t0 = ts[i];
	var t1 = ts[(i+1) % ts.length];
	var diff = Math.abs(normalizeangle(t1-t0));
	//print("" + t0 + " " + t1 + " " + " "+diff);
	if(diff > maxdiff) {
	    maxdiff = diff;
	    maxind = i;
	}
    }
    var retval = {t0:ts[maxind], t1: ts[(maxind+1) % ts.length]};
    retval.midpt = Math.abs(anglediff((t1+t0)/2));
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

function getBPFExpr(as, ignorefactor) {
    var asNums = new Array();
    var asDens = new Array();
    var asVars = new Array();
    function toc(a) { return "c("+a.x+","+a.y+")"; }
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

function getBPF(as, ignorefactor) {
    return eval(getBPFExpr(as, ignorefactor));
}

function bpeval0(as, z) {
    var f = getBPF(as);
    return f(z);
}

function bpepolys(as) {
    var num = bpnum(as);
    var den = bpden(as);
    return function(z) {
	return peval(num, z).div(peval(den, z));
    }
}

function bpeval(as, z) {

    function bpterm(a) {
	var num;
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
	var term = bpterm(as[i], z);
	retval = retval.mul(term);
    }
    return retval;
}

function bpnum(as) {
    var num = [none];
    for(var i = 0; i < as.length; i++) {
	var polyterm;
	// (z-a)
	polyterm = [as[i].mul(-1), none];
	num = polymult(polyterm, num);
    }
    return num;
}

function bpden(as) {
    var den = [none];
    for(var i =0; i < as.length; i++) {
	var polyterm = [none, as[i].conj().mul(-1)];
	den = polymult(polyterm, den);
    }
    return den;
}

// Gets the numerator of B'.
function getBPprime(as) {
    var num = bpnum(as);
    var nump = dcoeffs(num);
    var nonzeroas = as.filter(function(z) { return z.abs().x > .0001; });
    var den = bpden(nonzeroas);
    var denp = dcoeffs(den);
    return polysub(polymult(nump, den), polymult(denp, num));
}

function getFullBPprime(as) {
    var num = getBPprime(as);
    var nonzeroas = as.filter(function(z) { return z.abs().x > .0001; });
    var den = bpden(nonzeroas);
    var den2 = polymult(den, den);
    var dzmax = den2[den2.length -1];
    den2 = den2.map(function(z) { return z.div(dzmax);});
    num  = num.map(function(z) { return z.div(dzmax);});
    return {"num": num, "den": den2};
}

function getBPTheta(as, ts) {
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

function getTanPoints(as, t) {
    var preimages = preimage(as, rt2c(1,t));
    preimages = preimages.sort(function(i,j) { 
	return normalizeangle(i.angle()) - normalizeangle(j.angle());
    });

    var ts = preimages.map(function(z) { return z.angle(); });
    var bps = getBPTheta(as, ts);
    var retval = new Array(preimages.length);
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

function preimage(zs, beta) {
    var num = bpnum(zs);
    var den = bpden(zs);
    var alphaden = polymult([beta], den);
    var poly = polysub(num, alphaden);
    var preimages = polyroots(poly);    
    return preimages;
}

function bpcompose2(zs1, zs2) {
    var retval = Array();
    for(var i = 0; i < zs1.length; i++) {
	// Find points that zs2 maps to alpha.
	alpha = zs1[i];
	alpharoots = preimage(zs2, alpha);
	var o = {'outerzero': alpha, 'preimages': alpharoots};
	retval.push(o);
    }
    return retval;
}

function bpcompose(zs1, zs2) {
    var preimages = bpcompose2(zs1, zs2);
    return [].concat.apply([], preimages.map(function(pimg) {return pimg.preimages;}));
}

function roll(ar) {
    var retval = ar.slice(0);
    var end = retval.shift();
    retval.push(end);
    return retval;
}

function zeroToNm1(N) {
    var foo = [];
    
    for (var i = 0; i < N; i++) {
	foo.push(i);
    }
    return foo;
}

function sortBy(vals, indices) {
    var foo = []; 
    for(i = 0; i < indices.length; i++) { 
	foo.push(vals[indices[i]]); 
    }
    return foo;
}

function cpinfo(zs) {

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

function getangleindex(theta, ts) {
    // Check the first N-1
    for(var i = 0; i < ts.length-1; i++) {
	if(normalizeangle(theta) >= ts[i] && normalizeangle(theta) < ts[i+1]) {
	    return i;
	}
    }
    return ts.length - 1;
}
