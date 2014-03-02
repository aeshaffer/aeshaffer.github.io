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


var arcxs = [ 3.51182,  3.58677,  3.50432,  3.44992,  3.41224,  3.39515,  3.27298,  3.20485,  
	      3.11253,  2.94097,  2.88668,  2.71332,  2.63923,  2.47275,  2.28147,  2.10834,  
	      2.00382,  1.878  ,  1.69188,
              1.56785,  1.4722 ,  1.31048,  1.20466,  1.03061,  0.96586,  0.80022];

var arcys = [ 1.04312,  1.12758,  1.21515,  1.31683,  1.47263,  1.51821,  1.64427,  1.73452,  
	      1.75604,  1.86025,  1.88096,  1.94535,  2.00012,  2.03097,  2.01613,  2.09714,  
	      2.08792,  2.0529 ,  2.04301,
              2.00292,  1.94969,  1.91225,  1.82351,  1.75461,  1.69008,  1.62968];

function fitellipseZS(zs) {
    // http://nicky.vanforeest.com/misc/fitEllipse/fitEllipse.html
    var xs = zs.map(function(z) { return z.x; });
    var ys = zs.map(function(z) { return fixy(z).y;});
    return fitellipse(xs,ys);
}

function fitellipse(xs,ys) {

    var D = [
	numeric.mul(xs,xs),
	numeric.mul(xs,ys),
	numeric.mul(ys,ys),
	xs,
	ys,
	xs.map(function(x) { return 1; }),
    ];

    // Turn the rows into columns.  (Matches sample python code.)
    D = numeric.transpose(D);
    var S = numeric.dot(numeric.transpose(D), D);
    var C = [
	[0,0 ,2,0,0,0],
	[0,-1,0,0,0,0],
	[2,0 ,0,0,0,0],
	[0,0 ,0,0,0,0],
	[0,0 ,0,0,0,0],
	[0,0 ,0,0,0,0]
    ];
    
    var SinvC = numeric.dot(numeric.inv(S), C)

    var EVS = numeric.eig(SinvC);

    var labs = numeric.abs(EVS.lambda.x);
    var mlambda = Math.max.apply(null, labs);
    var i = labs.indexOf(mlambda);

    return numeric.transpose(EVS.E.x)[i];

    // return EVS.E.getRow(i);
}

function ellipse_angle_of_rotation(ina) {
    var b=ina[1]/2, c=ina[2], d=ina[3]/2, f=ina[4]/2, g=ina[5], a=ina[0];
    return 0.5*numeric.atan(2*b/(a-c))
}

function ellipse_center(ina) {
    var b=ina[1]/2, c=ina[2], d=ina[3]/2, f=ina[4]/2, g=ina[5], a=ina[0];
    var num = b*b-a*c;
    var x0 = (c*d-b*f)/num;
    var y0 = (a*f-b*d)/num;
    return [x0,y0];
}

function ellipse_axis_length(ina) {
    var b=ina[1]/2, c=ina[2], d=ina[3]/2, f=ina[4]/2, g=ina[5], a=ina[0];
    var up = 2*(a*f*f+c*d*d+g*b*b-2*b*d*f-a*c*g);
    var down1=(b*b-a*c)*( (c-a)*numeric.sqrt(1+4*b*b/((a-c)*(a-c)))-(c+a));
    var down2=(b*b-a*c)*( (a-c)*numeric.sqrt(1+4*b*b/((a-c)*(a-c)))-(c+a));
    var res1=numeric.sqrt(up/down1);
    var res2=numeric.sqrt(up/down2);
    return [res1, res2];
}

function ellipse_foci(ina) {
    var center = ellipse_center(ina);
    var axislengths = ellipse_axis_length(ina);
    var angle = ellipse_angle_of_rotation(ina);

    var major = Math.max.apply(null, axislengths);
    var minor = Math.min.apply(null, axislengths);

    var rootC = Math.sqrt(major*major-minor*minor);

    var ctof = fixy(rt2c(rootC, angle));

    var f1 = numeric.add(center, [ctof.x,ctof.y]);
    var f2 = numeric.sub(center, [ctof.x,ctof.y]);
    return [f1, f2];
}