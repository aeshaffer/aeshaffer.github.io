
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

function peval(coeffs, z) {    
    var retval = nzero;
    for(var i = 0; i < coeffs.length; i++) {
	var zn = z.pow(i);
	var term = zn.mul(coeffs[i]);
	retval = retval.add(term);
    }
    return retval;
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
    if(cs.length == 0) {
	return undefined;
    }
    var f = function(z) { return peval(cs, z); }
    while(cs.length > 0 && iszero(cs[cs.length -1])) {
	cs.splice(-1,1);
    }
    var leading = cs[cs.length - 1];    
    cs = polymult(cs, [none.div(leading)]);
    var deg = cs.length - 1;
    var roots = Array();
    for(var i = 1; i < deg+1; i++) {
	roots[i-1] = c(.4, .9).pow(i);
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

