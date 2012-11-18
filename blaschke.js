function c(x,y) {
    return numeric.t(x,y);
}

pi = 3.1415;

var nzero = numeric.t(0,0);
var none = numeric.t(1,0);

zs = [
    c(0, .25),
    c(0,.5),
    c(0, .75),
    c(0,0),
    c(.5, 0)
];

zeroonehalf = [
    c(0 ,0),
    c(.5,0)
];

z = [
    c(0,0)
];

cs = coeffs(zs);

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

    

function lt(a) {
    if(a.abs().x == 0) {
	return c(1);
    } else {
	return a.conj().div(a.abs());
    }
}

function bpeval(as, z) {

    function bpterm(a) {
	var l = lt(a); // a*/|a|
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

function bpeval2(as, z) {
    var lambda = l(as);
    var num = bpnum(as);
    var numv = peval(num, z);
    var den = bpden(as);
    var denv = peval(den, z);
    return lambda.mul(numv).div(denv);
}

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

function getbp(as) {
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

function bpcompose(zs1, zs2) {
    var retval = Array();
    var num = bpnum(zs2);
    var den = bpden(zs2);
    var lambda = l(zs2);
    for(i in zs1) {
	retval = retval.concat(alpharoots);
    }
    return retval;
}

var go = function() {
    bpzs = bpgrideval(200, zs); 
    o = draweval(bpzs.zs, bpzs.bpzs); 
    o.ctx.putImageData(o.idata, 0, 0)
}