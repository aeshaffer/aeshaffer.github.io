load("numeric-1.2.3.js");
load("polynomials.js");

function pf(lastentry,numterms) {
    if(numterms == 1) { return [lastentry]; }
    else {
	var retval = new Array();
	for(var i = 1; i <= numterms-1; i++) {
	    retval.push(i);
	}
	retval.push(lastentry);
	return retval;
    }
}

function chunk(ns) {
    // ns.length >= 2
    var p = ns.slice(0, ns.length - 2);
    var mn = ns[ns.length -1];
    var mnm1 = ns[ns.length -2];
    return {p: p, mn: mn, mnm1: mnm1};
}	    

function interp(inxs, ints, inas) {
    var table = new Object();
    table.xs = new Array();
    table.ts = new Array();
    table.as = new Array();

    for(var i = 0; i < inxs.length; i++) {
	table.xs[i+1] = inxs[i];
	table.ts[i+1] = ints[i];
	table.as[i+1] = inas[i];
    }

    table.xasterm = function(mn, mnm1) {
	var num = (this.xs[mn]-this.as[mnm1]);
	var den = (this.xs[mn]-this.xs[mnm1]);
	return num/den;
    }

    table.te = function(ns) {
	var key = ns.join(",");
	var val = this[key];
	if(val != undefined) { return val; }

	print("Computing " + key);
	if(ns.length == 1) {
	    var n = ns[0];
	    this[key] = this.ts[n];
	} else {
	    var c = chunk(ns);
	    var nk = (c.p).concat(c.mn);
	    var nm1k = (c.p).concat(c.mnm1);
	    var Cn = this.te(nk);
	    var Cnm1 = this.te(nm1k);
	    var xas = this.xasterm(c.mn, c.mnm1);
	    print ("C["+nk+"]="+Cn);
	    print ("C["+nm1k+"]="+Cnm1);
	    print ("XAS:" + xas);
	    this[key] = xas * (Cn-Cnm1);
	}	
	print(" Result of "+key+"=" + this[key]);
	return this[key];
    }

    table.printtable = function() {
	for(var x in this) { print ("C["+x+"]="+this[x]);}
    }

    table.evaltable = function(x) {
	var retval = 0;
	var accum = 1;
	for(var i = 1; i <= this.xs.length - 1; i++) {
	    print("C["+pf(i,i)+"]");
	    var ns = pf(i, i).join(",");
	    var term = this[ns];
	    if(i > 1) {
		accum = accum * (x - this.xs[i-1]) / (x - this.as[i-1]);
	    }
	    retval = retval + this[ns]*accum;
	}
	return retval;
    }

    table.te(pf(ints.length, ints.length));

    return table;
}


var table = interp([1,2,3,4], [1,2,3,4], [1.5,2.5,3.5,4.5]);
//for(var x in table) { print ("C["+x+"]="+table[x]);}