numeric.T.prototype.angle = function() {
    if(this.y == undefined) {
	return numeric.atan2(0, this.x);
    } else {
	return numeric.atan2(this.y, this.x);
    }
}

numeric.T.prototype.pow = function(n) {
    if(this.x == 0 && this.y == 0) {
	return nzero;
    } else {
	var retval = none;
	for(i = 0; i < n; i++) {
	    retval = retval.mul(this);
	}
	return retval;
    }
}

Array.prototype.sum = function(){
    for(var i=0,sum=0;i<this.length;sum+=this[i++]);
    return sum;
}


Array.prototype.csum = function() {
    for(var i=0,sum=c(0,0);i<this.length;sum = sum.add(this[i++]));
    return sum;
}


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

function rt2c(r, t) {
    return ni.mul(t).exp().mul(r);
}

function c(x,y) {
    return numeric.t(x,y);
}

function ttcp(t) {
    return c(numeric.cos(t), numeric.sin(t));
}

function cifyrow(as) {
    return as.map(function(a) { return c(a.x, a.y);});
}

function cifygrid(zs) {
    return zs.map(function(r) { return cifyrow(r);});
}

function cifyrpip(rpip) {
    var rp = rpip.realparts;
    var ip = rpip.imagparts;
    var N = Math.sqrt(rp.length);
    var retval = Array(N);
    for(var i = 0; i < N; i++) {
	retval[i] = Array(N);
	for(var j = 0; j < N; j++) {
	    var addr = N*j+i;
	    retval[i][j] = c(rp[addr], ip[addr]);
	}
    }
    return retval;
}

function round2(n) {
    return Math.round(n*100)/100;
}

function round5(n) {
    return Math.round(n*100000)/100000;
}

function dc(z) {
    var y = z.y == undefined ? 0 : z.y;
    return round5(z.x) + " " + (y >= 0 ? "+": "") +round5(y) + "i";
}

function dcp(z) {
    var y = z.y == undefined ? 0 : z.y;
    return round5(z.x) + " " + (y >= 0 ? "+": "") +round5(y) + "j";
}

function dcomplex(z) {
    return dc(z) + " (arg=" + round2(normalizeangle(z.angle())) + ")";
}

pi = 3.1415;

var nzero = numeric.t(0,0);
var none = numeric.t(1,0);
var nnone = numeric.t(-1,0);
var ni = numeric.t(0.0, 1.0);
var nni = numeric.t(0.0, -1.0);

function iszero(z) {
    return z.abs().x == 0;
}

// Multiply polynomial coefficients.
// coeffs1[0] is the constant term,
// .. etc.
function polymult(coeffs1, coeffs2) {
    var deg1 = coeffs1.length -1;
    var deg2 = coeffs2.length -1;
    var coeffs3 = Array();
    for(i = 0; i < coeffs1.length; i++) {
	for(j = 0; j < coeffs2.length; j++) {
	    if(coeffs3[i+j] == undefined) coeffs3[i+j] = nzero ;
	    coeffs3[i+j] = coeffs3[i+j].add(coeffs1[i].mul(coeffs2[j]));
	}	
    }
    return coeffs3;
}

function dcoeffs(cs) {
    var retval = Array();
    for(var i = 0; i < cs.length -1; i++) {
	retval[i] = c(i+1, 0).mul(cs[i+1]);
    }
    return retval;
}

function coeffs(zs) {
    var xcoeffs = [none];
    for(var i = 0; i < zs.length; i++) {
	var t = [c(-1,0).mul(zs[i]), none];
	xcoeffs = polymult(xcoeffs, t);
    }
    return xcoeffs;
}


function cps(zs) {
    var dcs = dcoeffs(coeffs(zs));
    return polyroots(dcs);
}

function zpowers(z,n) {
    var zpowers = new Array();
    var zn = none;
    zpowers.push(zn);
    for(var i = 0; i < n; i++) {
	zn = zn.mul(z);
	zpowers.push(zn);
    }
    return zpowers;
}

function peval(coeffs, z) {    
    var retval = nzero;
    var zs = zpowers(z, coeffs.length);

    for(var i = 0; i < coeffs.length; i++) {
	var zn = zs[i];
	var term = zn.mul(coeffs[i]);
	retval = retval.add(term);
    }
    return retval;
}

function polysub(cs1, cs2) {
    return polyadd(cs1, cs2.map(function(z) { return z.mul(-1);}));
}

function polyadd(cs1, cs2) {
    var retval = Array();
    for(var i = 0; i < Math.max(cs1.length, cs2.length); i++) {
	var c1 = nzero;
	var c2 = nzero;
	if(cs1[i] != undefined) {c1 = cs1[i];}
	if(cs2[i] != undefined) {c2 = cs2[i];}
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
    return zs.filter(function(z) { return z != undefined; })
	.reduce(function(z1,z2) { return z1.mul(z2);}, none);
}

function polyroots(incs) {
    if(incs.length == 0) {
	return undefined;
    }
    var cs = incs.slice();
    while(cs.length > 0 && iszero(cs[cs.length -1])) {
	cs.splice(-1,1);
    }
    var deg = cs.length - 1;
    var leading = cs[cs.length - 1];    
    cs = polymult(cs, [none.div(leading)]);
    var f = function(z) { return peval(cs, z); }
    var roots = Array();
    for(var i = 0; i < deg; i++) {
	roots[i] = c(.4, .9).pow(i);
    }
    if(console != undefined) {
	if(console.log) { 
//	    console.log(pypoly(incs)); 
//	    console.log(pypoly(cs));
	}
    }
    var n = 0;
    while(n < 100) {
	var dens = new Array();
	var deltas = new Array();
	var newroots = new Array();

	if(console != undefined && console.log != undefined) {
/*
	    console.log("");
	    console.log("Roots: " + printzs(roots));
*/
	}

	for(var i = 0; i < roots.length; i++) {
	    var p = roots[i];
	    var x = f(p);
	    for(var j = 0; j < roots.length; j++) {
		if(i != j) {
		    x = x.div(p.sub(roots[j]));
		}
	    }
/*
	    if(console.log != undefined) {
		console.log(i + " P:" + printzs([p]) + " f(p):" + printzs([f(p)]) + " x:" + printzs([x]));
	    }
*/
	    roots[i] = p.sub(x);
	}

	// roots = newroots;
	n++;
    }
    return roots;
}

