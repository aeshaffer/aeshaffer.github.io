
function cgrid(N) {
    xs = numeric.linspace(-1,1,N);
    ys = numeric.linspace(-1,1,N);
    var retval = Array(N);
    for(i in xs) {
	retval[i] = Array(N);
	for(j in ys) {
	    retval[i][j] = c(xs[i], ys[j]);
	}
    }
    return retval;
}

function bpgrideval(N, as, rowcallback) {
    var bpe = getBPF(as);
    grid = cgrid(N);
    var retval = Array(N);
    for(var i = 0; i < N; i++) {
	retval[i] = Array(N);
	for(var j = 0; j < N; j++) {
	    var z = grid[i][j];
	    retval[i][j] = bpe(z);
	}
	if(typeof(rowcallback) == "function") {
	    rowcallback(i);
	}
    }
    return {zs: grid, bpzs: retval};
}

function zsString(zs) {
    return zs.map(function(z) { return "z="+z.x+","+(z.y == undefined ? 0: z.y); }).join("\n&");
}

function parseZsString(s) {
    var zs = s.replace(/\n/g, "").replace(/z=/g, "").split("&");
    var retval = new Array();
    for(i in zs) {
	var parts = zs[i].split(",");
	retval.push(c(parseFloat(parts[0]), parseFloat(parts[1])));
    }
    return retval;
}

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

function region(cvangles, z, bpz) {
    var i = getangleindex(bpz.angle(), cvangles);
    return 1.0*i/(cvangles.length);
}

function showRegions(idata, zs, bpzs, cvangles, rowcallback) {    
    return mapOverbpzs(idata, zs, bpzs, 
		       function(z, bpz) { return region(cvangles, z, bpz); },
		       rowcallback);
}

function mapOverbpzs(idata, zs, bpzs, huefn, rowcallback) {
    var N = bpzs.length;
    for(var row = 0; row < N; row++) {
	for(var col = 0; col < N; col++) {
	    var z = zs[row][col];
	    var bpz = bpzs[row][col];
	    if(z.abs().x < 1) {
		var hue = huefn(z, bpz);
		var rgb = hsvToRgb(hue, 1, 1);
		setRGB(idata, rgb, N, row, col);
	    }
	}
	if(typeof(rowcallback) == "function") {
	    rowcallback(row);
	}
    }
    return {idata: idata};
}

function setRGB(idata, rgb, N, row, col) {
    var addr = (N*4)*((N-1)-col) + 4*row;
    idata[addr] = rgb[0];
    idata[addr+1] = rgb[1];
    idata[addr+2] = rgb[2];
    idata[addr+3] = 255;    
}

function draweval(idata, zs, bpzs, rowcallback) {
    function angle(z, bpz) {
	var thetapct = normalizeangle(bpz.angle())/(2*pi);
	var t2 = Math.round(255*thetapct) % 256;
	return t2/256;
    }
    return mapOverbpzs(idata, zs, bpzs, angle, rowcallback);
}

function lt(a) {
    if(a.abs().x == 0) {
	return c(1);
    } else {
	return a.conj().div(a.abs());
    }
}

function getBPFExpr(as) {
    var asNums = new Array();
    var asDens = new Array();
    var asVars = new Array();
    var l = none;
    function toc(a) { return "c("+a.x+","+a.y+")"; }
    for(i in as) {
	var a = as[i];
	asVars.push("var a"+i+" = "+toc(a));
	if(iszero(a)) {
	    asNums.push(".mul(z)");
	    asDens.push(".div(none)");
	} else {
	    asNums.push(".mul(a"+i+".sub(z))");
	    asDens.push(".div(none.sub(a"+i+".conj().mul(z)))");
	    l = l.mul(lt(a));
	}
    }
    
    var expr = asVars.join(';') + "; var l = "+toc(l)+"; var f = function(z) { return l" +  asNums.join('') + asDens.join('') + "; }; {f};"
    return expr;
}

function getBPF(as) {
    return eval(getBPFExpr(as));
}

function bpeval0(as, z) {
    var f = getBPF(as);
    return f(z);
}


function bpeval(as, z) {

    function bpterm(a) {
	var l = lt(a); // (a*)/|a|
	var num;
	if(!iszero(a)) {
	    num = a.sub(z); // (a - z)
	} else {
	    num = z;
	}
	var den = none.sub(a.conj().mul(z)); // (1-a*z)
	return l.mul(num).div(den);
    }

    var retval = none;
    for(i in as) {
	var term = bpterm(as[i], z);
	retval = retval.mul(term);
    }
    return retval;
}
/*

function bpeval2(as, z) {
    var lambda = l(as);
    var num = bpnum(as);
    var numv = peval(num, z);
    var den = bpden(as);
    var denv = peval(den, z);
    return lambda.mul(numv).div(denv);
}

*/

function l(as) {
    var l = none;
    for(i in as) {
	var a = as[i];
	l = l.mul(lt(a));
    }
    return l;
}

function bpnum(as) {
    // cancel the sign on the z (as[i] == 0) term.
    var num = [none.mul(-1)];
    for(i in as) {
	var polyterm;
	polyterm = [as[i], none.mul(-1)];
	num = polymult(polyterm, num);
    }
    return num;
}

function bpden(as) {
    var den = [none];
    for(i in as) {
	var polyterm = [none, as[i].conj().mul(-1)];
	den = polymult(polyterm, den);
    }
    return den;
}

function getBPprime(as) {
    var num = bpnum(as);
    var nump = dcoeffs(num);
    var den = bpden(as);
    var denp = dcoeffs(den);
    return polysub(polymult(nump, den), polymult(denp, num));
}

function preimage(zs, beta) {
    var num = bpnum(zs);
    var den = bpden(zs);
    var lambda = l(zs);
    var lambdanum = polymult([lambda], num);
    var alphaden = polymult([beta], den);
    var poly = polysub(lambdanum, alphaden);
    var preimages = polyroots(poly);    
    return preimages;
}

function bpcompose2(zs1, zs2) {
    var retval = Array();
    for(i in zs1) {
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
    for(i in cps) {
	var cp = cps[i];
	if(cp.abs().x < 1) {
	    circlecps.push(cp);
	}
    }
    var cvs = circlecps.map(function(cp) {return bpeval(zs, cp);});

    var cvangles = cvs.map(function(cv) {return cv.angle();}).map(normalizeangle);
    cvangles.sort(function(a,b) {return a-b});
    return {"cps": circlecps, "cvs": cvs, "cvangles": cvangles};
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
