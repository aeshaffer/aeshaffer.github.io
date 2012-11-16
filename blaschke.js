
var nt = numeric.t;

pi = 3.1415;

var nzero = numeric.t(0,0);
var none = numeric.t(1,0);

zs = [
    numeric.t(0, .25),
    numeric.t(0,.5),
    numeric.t(0, .75),
    numeric.t(0,0),
    numeric.t(.5, 0)
];

cs = coeffs(zs);

/**
 * Converts an HSV color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSV_color_space.
 * Assumes h, s, and v are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param   Number  h       The hue
 * @param   Number  s       The saturation
 * @param   Number  v       The value
 * @return  Array           The RGB representation
 */
function hsvToRgb(h, s, v){
    var r, g, b;

    var i = Math.floor(h * 6);
    var f = h * 6 - i;
    var p = v * (1 - s);
    var q = v * (1 - f * s);
    var t = v * (1 - (1 - f) * s);

    switch(i % 6){
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }

    return [r * 255, g * 255, b * 255];
}

function cgrid(N) {
    xs = numeric.linspace(-1,1,N);
    ys = numeric.linspace(-1,1,N);
    var retval = Array(N);
    for(i in xs) {
	retval[i] = Array(N);
	for(j in ys) {
	    retval[i][j] = numeric.t(xs[i], ys[j]);
	}
    }
    return retval;
}

function bpgrideval(N, as) {
    grid = cgrid(N);
    var retval = Array(N);
    for(var i = 0; i < N; i++) {
	retval[i] = Array(N);
	for(var j = 0; j < N; j++) {
	    var z = grid[i][j];
	    retval[i][j] = bpeval(as, z);
	}
    }
    return {zs: grid, bpzs: retval};
}

function draweval(zs, bpzs) {
    var c=document.getElementById("graph");
    var ctx=c.getContext("2d");
    var N = bpzs.length;
    var idata = ctx.createImageData(bpzs.length, bpzs.length);
    function baddr(row,col) {
	return (N*4)*((N-1)-col) + 4*row;
    }
    for(var row = 0; row < N; row++) {
	for (var col = 0; col < N; col++) {
	    var z = zs[row][col];
	    var bpz = bpzs[row][col];
	    if(z.abs().x >= 1) {
	    } else {
		var theta = numeric.atan2(bpz.x, bpz.y);
		var t2 = Math.round(255*(theta+2*pi)/(2*pi)) % 256;
		var rgb = hsvToRgb(t2/256, 1, 1);
		idata.data[baddr(row, col)] = rgb[0];
		idata.data[baddr(row, col)+1] = rgb[1];
		idata.data[baddr(row, col)+2] = rgb[2];
		idata.data[baddr(row, col)+3] = 255;
	    }
	}
    }

    return {ctx: ctx, idata: idata};
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
	retval[i] = numeric.t(i+1, 0).mul(cs[i+1]);
    }
    return retval;
}

function coeffs(zs) {
    var xcoeffs = [none];
    for(var i = 0; i < zs.length; i++) {
	var t = [numeric.t(-1,0).mul(zs[i]), none];
	xcoeffs = polymult(xcoeffs, t);
    }
    return xcoeffs;
}

function cps(zs) {
    var dcs = dcoeffs(coeffs(zs));
    return polyroots(dcs);
}

function peval(coeffs, z) {    
    var retval = nzero;
    for(var i = 0; i < coeffs.length; i++) {
	var zn = z.pow(i);
	var term = zn.mul(coeffs[i]);
	retval = retval.add(term);
    }
    return retval;
}

function lt(a) {
    if(a.abs().x == 0) {
	return nt(1);
    } else {
	return a.conj().div(a.abs());
    }
}

function bpterm(a, z) {
    var l = lt(a); // a*/|a|
    var num = a.sub(z); // (a - z)
    var den = none.sub(a.conj().mul(z)); // (1-a*z)
    return l.mul(num.div(den));
}

function bpeval(as, z) {
    var retval = none;
    for(i in as) {
	var term = bpterm(as[i], z);
	retval = retval.mul(term);
    }
    return retval;
}

function bpeval2(as, z) {
    var l = none;
    for(i in as) {
	var a = as[i];
	l = l.mul(lt(a));
    }
    var num = bpnum(as);
    var numv = peval(num, z);
    var den = bpden(as);
    var denv = peval(den, z);
    return l.mul(numv).div(denv);
}

function bpnum(as) {
    var num = [none];
    for(i in as) {
	var polyterm = [as[i].mul(-1), none];
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

function getbp(as) {
    var num = bpnum(as);
    var nump = dcoeffs(num);
    var den = bpden(as);
    var denp = dcoeffs(den);
    return polysub(polymult(nump, den), polymult(denp, num));
}

function polysub(cs1, cs2) {
    var retval = Array();
    for(var i = 0; i < Math.max(cs1.length, cs2.length); i++) {
	var c1 = nzero;
	var c2 = nzero;
	if(cs1[i] != undefined) {c1 = cs1[i];}
	if(cs2[i] != undefined) {c2 = cs2[i];}
	retval[i] = c1.sub(c2);
    }
    return retval;
}

function polyroots(cs) {
    var f = function(z) { return peval(cs, z); }
    var deg = cs.length - 1
    var roots = Array();
    for(var i = 1; i < deg+1; i++) {
	roots[i-1] = numeric.t(.4, .9).pow(i);
    }
    var n = 0;
    while(n < 100) {
	var newroots = Array();

	for(var i = 0; i < roots.length; i++) {
	    var den = none;
	    for(var j = 0; j < roots.length; j++) {
		if(i != j) {
		    den = den.mul(roots[i].sub(roots[j]));
		}
	    }
	    var fr = f(roots[i]);
	    var delta = fr.div(den);
	    newroots[i] = roots[i].sub(delta); 
	}

	roots = newroots;
	n++;
    }
    return roots;
}

var go = function() {
    bpzs = bpgrideval(200, zs); 
    o = draweval(bpzs.zs, bpzs.bpzs); 
    o.ctx.putImageData(o.idata, 0, 0)
}