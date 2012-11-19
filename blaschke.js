function c(x,y) {
    return numeric.t(x,y);
}

pi = 3.1415;

var nzero = numeric.t(0,0);
var none = numeric.t(1,0);

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

function showRegions(ctx, zs, bpzs, cvangles) {    
    function region(z, bpz) {
	var i = getangleindex(bpz.angle(), cvangles);
	return 1.0*i/(cvangles.length);
    }
    return mapOverbpzs(ctx, zs, bpzs, region);
}

function mapOverbpzs(ctx, zs, bpzs, huefn) {
    var N = bpzs.length;
    var idata = ctx.createImageData(N, N);
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
    }
    return {ctx: ctx, idata: idata};
}

function setRGB(idata, rgb, N, row, col) {
    function baddr(row,col) {
	return (N*4)*((N-1)-col) + 4*row;
    }
    var addr = baddr(row, col);
    idata.data[addr] = rgb[0];
    idata.data[addr+1] = rgb[1];
    idata.data[addr+2] = rgb[2];
    idata.data[addr+3] = 255;    
}

function draweval(ctx, zs, bpzs) {
    function angle(z, bpz) {
	var thetapct = normalizeangle(bpz.angle())/(2*pi);
	var t2 = Math.round(255*thetapct) % 256;
	return t2/256;
    }
    return mapOverbpzs(ctx, zs, bpzs, angle);
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

function bpcompose(zs1, zs2) {
    var retval = Array();
    var num = bpnum(zs2);
    var den = bpden(zs2);
    var lambda = l(zs2);
    for(i in zs1) {
	// Find points that zs2 maps to alpha.
	alpha = zs1[i];
	alpharoots = preimage(zs2, alpha);
	retval = retval.concat(alpharoots);
    }
    return retval;
}

//zs = bpcompose(zeroonehalf, [c(0,0), c(.51, 0)] );

function scatter(ctx, pts, color, Nover2) {
    ctx.save();
    ctx.translate(Nover2,Nover2);
    for(i in pts) {
	var z = pts[i];
	ctx.beginPath();
	var x = z.x;
	var y = z.y == undefined ? 0: z.y;
	ctx.arc(Nover2*z.x, -Nover2*y, 2, 0, Math.PI*2, true);
	//ctx.linewidth=10;
	ctx.closePath();
	ctx.fillStyle=color;
	ctx.fill();
    }
    ctx.restore();
}

function roll(ar) {
    var retval = ar.slice(0);
    var end = retval.shift();
    retval.push(end);
    return retval;
}

function cpinfo(zs) {

    var bpp = getBPprime(zs);
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
    cvangles.sort(function(a,b) {a-b});
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

 
zs = [
   // c(0, .25),
//    c(-.5, -.5),
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

// zs = zeroonehalf;

var cpi = cpinfo(zs);
var cps = cpi.cps;
var cvs = cpi.cvs;
var cvangles = cpi.cvangles;

var N = 100;

function display(zs, cpi) {
    $("#criticalpoints").empty();
    for(var i = 0; i < cpi.cps.length; i++) {
	var li = $("<li>");
	li.text(dcomplex(cpi.cps[i]));
	$("#criticalpoints").append(li);
    }    
    $("#zeroes").empty();
    for(var i = 0; i < zs.length; i++) {
	var li = $("<li>");
	li.text(dcomplex(zs[i]));
	$("#zeroes").append(li);
    }    
    $("#criticalvalues").empty();
    for(var i = 0; i < cpi.cvs.length; i++) {
	var li = $("<li>");
	li.text(dcomplex(cpi.cvs[i]));
	$("#criticalvalues").append(li);
    }   
    $("#criticalangles").empty();
    var rolledcvangles = roll(cpi.cvangles);
    for(var i = 0; i < cpi.cvangles.length; i++) {
	var li = $("<li>");
	li.text(round2(cpi.cvangles[i]) +"-" + round2(rolledcvangles[i]));
	var rgb = hsvToRgb(1.0*i/(cvangles.length), 1, 1);
	li.css("background-color", "rgb("+rgb[0]+","+rgb[1]+","+rgb[2]+")");
	$("#criticalangles").append(li);
    }   
}

var go = function() {

    function resize(graph) {
	graph.style.width = 2*N;
	graph.style.height = 2*N;
	graph.width = 2*N;
	graph.height = 2*N;
    }

    display(zs, cpi);

    var ctx;
    if(true) {
	bpzs = bpgrideval(2*N, zs);

	var range = document.getElementById("range");
	var rangecxt = range.getContext("2d");
	resize(range);
	var o0 = showRegions(rangecxt, bpzs.zs, bpzs.zs, cpi.cvangles);
	rangecxt.putImageData(o0.idata, 0, 0);

	var regions = document.getElementById("regions");
	var regionscxt = regions.getContext("2d");
	resize(regions);
	var o1 = draweval(regionscxt, bpzs.zs, bpzs.bpzs);
	regionscxt.putImageData(o1.idata, 0, 0);
	scatter(regionscxt, cpi.cps, "#000000", N);
	scatter(regionscxt, zs, "#ffffff", N);
	
	var angles = document.getElementById("rainbow");
	var anglescxt = angles.getContext("2d");
	resize(angles);
	var o2 = showRegions(regionscxt, bpzs.zs, bpzs.bpzs, cpi.cvangles);
	//	var o2 = showRegions(regionscxt, bpzs.zs, bpzs.bpzs, [Math.PI/8, Math.PI/8+Math.PI/2, Math.PI/8 + 2*(Math.PI/2), Math.PI/8 + 3*(Math.PI/2)]);
	anglescxt.putImageData(o2.idata, 0, 0);
	scatter(anglescxt, cpi.cps, "#000000", N);
	scatter(anglescxt, zs, "#ffffff", N);

    } else {
	var c=document.getElementById("graph");
	var ctx=c.getContext("2d");
    }
}

function round2(n) {
    return Math.round(n*100)/100;
}

function dcomplex(z) {
    return round2(z.x) + " " + round2(z.y) + "i" + " (" + round2(z.angle()) + ")";
}

$(function() {
    var cf = function(e) {
	var mouseX = e.pageX - this.offsetLeft;
	var mouseY = e.pageY - this.offsetTop;
	
	var unit = $(this).width() /2; // Pixels per unit length

	var x = (mouseX/unit) - 1;
	var y = -1.0 * (mouseY / unit - 1)
	var val = bpeval(zs, c(x,y));
	$("#point").text(round2(x) + " " + round2(y) + "i");
	$("#dest").text(dcomplex(val) + " " + getangleindex(val.angle(), cpi.cvangles));
	
   };
    $("#rainbow").click(cf);
    $("#regions").click(cf);
});