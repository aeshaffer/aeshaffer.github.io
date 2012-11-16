zs = [
    numeric.t(0, .25),
    numeric.t(0,.5),
    numeric.t(0, .75),
    numeric.t(0,0),
    numeric.t(.5, 0)
];
ys = numeric.linspace(-1,1,100).map(function(l) {return numeric.t(0,l);})
xs = numeric.linspace(-1,1,100).map(function(l) {return numeric.t(l,0);})

pi = 3.1415;

var nzero = numeric.t(0,0);
var none = numeric.t(1,0);

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
	return (N*4)*(N-1-row) + 4*col;
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

function coeffs(zs) {
    var terms = zs.map(function(z) {return [none, z]});
    var coeffs = [none];
    for(var i = 0; i < terms.length; i++) {
	var t = terms[i];
	coeffs = polymult(coeffs, t);
    }
    return coeffs;
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

function bpterm(a, z) {
    if(a.x == 0 && a.y == 0) {
	return z;
    } else {
	var l = a.conj().div(a.abs()); // a*/|a|
	var num = a.sub(z); // (a - z)
	var den = none.sub(a.conj().mul(z)); // (1-a*z)
	return l.mul(num.div(den));
    }
}

function bpeval(as, z) {
    var retval = none;
    for(i in as) {
	var term = bpterm(as[i], z);
	retval = retval.mul(term);
    }
    return retval;
}

bpzs = bpgrideval(200, zs); 
var go = function() {
    o = draweval(bpzs.zs, bpzs.bpzs); 
    o.ctx.putImageData(o.idata, 0, 0)
}