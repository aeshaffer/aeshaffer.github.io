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

function mindiff(xs) {
    var retval = undefined;
    for(var i = 1; i <= xs.length; i++) {
	for(var j = i+1; j <= xs.length; j++) {
	    var d = Math.abs(xs[i] - xs[j]);
	    if(retval == undefined || d < retval) {
		retval = d;
	    }
	}
    }
    return retval;
}

function chunk(ns) {
    // ns.length >= 2
    var p = ns.slice(0, ns.length - 2);
    var mn = ns[ns.length -1];
    var mnm1 = ns[ns.length -2];
    return {p: p, mn: mn, mnm1: mnm1};
}	    

Array.prototype.sum = function(){
    for(var i=0,sum=0;i<this.length;sum+=this[i++]);
    return sum;
}

function interp(inxs, ints, inas) {
    var table = new Object();
    table.xs = inxs;
    table.ts = ints;
    table.as = inas;

    table.x = function(i) { return this.xs[i-1];}
    table.t = function(i) { return this.ts[i-1];}
    table.a = function(i) { return this.as[i-1];}

    table.Cs = function() {
	var retval = new Array();
	for(var i = 1; i <= this.xs.length; i++) {
	    var key = pf(i,i).join(",");
	    var C = this[key];
	    retval.push(C);
	}
	return retval;
    }
    
    table.lambdastar = function() {
	var n = this.xs.length;
	var m = mindiff(this.xs);
	var xna1 = Math.pow((this.x(n) - this.a(1))/m, n -1);
	var tsum = this.ts.sum();
	return xna1*tsum - this.Cs().sum();
    }

    table.xasterm = function(mn, mnm1) {
	var num = (this.x(mn)-this.a(mnm1));
	var den = (this.x(mn)-this.x(mnm1));
	return num/den;
    }

    table.te = function(ns) {
	var key = ns.join(",");
	var val = this[key];
	if(val != undefined) { return val; }

	print("Computing " + key);
	if(ns.length == 1) {
	    var n = ns[0];
	    this[key] = this.t(n);
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

    table.xsas = function(z) {
	var retval = 1;
	for(var j = 1; j <= this.xs.length; j++) {
	    retval = retval * (z-this.x(j)) / (z-this.a(j));
	}
	return retval;
    }

    table.evaltable = function(x) {
	var retval = 0;
	var accum = 1;
	for(var i = 1; i <= this.xs.length; i++) {
	    print("C["+pf(i,i)+"]");
	    var ns = pf(i, i).join(",");
	    var term = this[ns];
	    if(i > 1) {
		accum = accum * (x - this.x(i-1)) / (x - this.a(i-1));
	    }
	    retval = retval + this[ns]*accum;
	}
	var ls = this.lambdastar();
	
	return retval + (ls*this.xsas(x));
    }

    table.te(pf(ints.length, ints.length));

    return table;
}


var table = interp([1,2,3,4], [1.2,2.3,3.4,4.5], [.5,1.5,2.5,3.5]);
//for(var x in table) { print ("C["+x+"]="+table[x]);}