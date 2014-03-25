function isBetween(x, y1, y2) {
    // Assumption: all angles are from 0 to 2Pi.
    // The second case is for when we wrap around.
    return ((y1 < y2) && (x > y1) && (x < y2)) 
	|| ((y1 > y2) && ((x > y1) || (x < y2)));
}

function intersection(a1,a2,b1,b2) {
    var M = [[-a2.x + a1.x, b2.x - b1.x], 
	     [-a2.y + a1.y, b2.y - b1.y]];
    var v = [a1.x - b1.x, a1.y - b1.y];
    var ts = numeric.solve(M, v);
    return a1.add(a2.sub(a1).mul(ts[0]));
}

function padLeft(nr, n, str){
    return Array(n-String(nr).length+1).join(str||'0')+nr;
}

function pdc(z) {
    return padLeft(dc(z), 21, " ");
}

function fixy(z) { return c(z.x, z.y == undefined ? 0 : z.y); }

function getTangentSegments(zs, ajpct) {
    var adelta = 2.0*Math.PI/ajpct;
    var getangle = function(cv) { return normalizeangle(cv.angle()); }
    var nsort = function(a,b) { return getangle(a)-getangle(b); }
    function getPIs(i) {
	var t = i*adelta;
	var z = c(numeric.cos(t), numeric.sin(t));
	var preimages = preimage(zs, z);
	preimages = preimages.sort(nsort);
	return preimages;
    }
    var deg = zs.length;
    var imoddeg = function(arr, i) {
	return arr[i % deg];
    }
    var intersections = new Array(deg);
    for(var i = 0; i < deg; i++) {
	intersections[i] = new Array(ajpct);
    }
    var prevpis = getPIs(-1);
    var tagpi  = function(z,i) { return {tag: "pi", i:i, tagi: "pi_" + i, z: z}; }
    var tagppi = function(z,i) { return {tag: "ppi", i:i, tagi: "ppi_" + i, z: z}; }
    for(var i = 0; i < ajpct; i++) {
	var pis = getPIs(i);
	var taggedpis = pis.map(tagpi);
	var taggedprevpis = prevpis.map(tagppi);
	var allpis = taggedpis
	    .concat(taggedprevpis)
	    .sort(function(tza, tzb) { 
		return nsort(tza.z, tzb.z); 
	    });
	// console.log(allpis.map(function (tz) { return dc(tz.z) + " " + tz.tag;}));
	// console.log(allpis.map(function (tz) { return getangle(tz.z);}));
	if(allpis[0].tag == "pi") {
	    allpis = roll(allpis);
	}
	for(var j = 0; j < deg; j ++) {	    
	    var x1 = allpis[2*j];
	    var y1 = allpis[(2*j+1) % (2*deg) ];
	    var x2 = allpis[(2*j+2) % (2*deg) ];
	    var y2 = allpis[(2*j+3) % (2*deg) ];
	    var inter = intersection(fixy(x1.z), fixy(x2.z), fixy(y1.z), fixy(y2.z));
	    if(inter.abs().x > 1) {
		throw "Intersection is outside the circle."
	    }
	    intersections[j][i] = 
		{/* x1: x1, x2: x2, y1: y1, y2: y2, */
		 inter: inter, 
		    dc: pdc(x1.z) + "->" + pdc(x2.z) + "\tx\t " 
			+ pdc(y1.z) + "->" + pdc(y2.z) + "\tat\t " + dc(inter) 
			+ " " + inter.angle()};
	    // console.log(intersections[j][i].dc);
	}	
	prevpis = pis;
    }
    return intersections;
}
