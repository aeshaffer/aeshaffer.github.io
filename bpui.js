
function getTables() {
    return {
	criticalpoints: $(".criticalpoints"),
	criticalvalues: $(".criticalvalues"),
	criticalangles: $(".criticalangles"),
	zeroes: $(".zeroes"),
	permalink: $(".permalink"),
	point: $(".point"),
	dest: $(".dest")
    };
}

function getPlots() {
    return {
	rainbow: $(".rainbow"),
	regions: $(".regions"),
	range: $(".range"),
	rblines: $(".rblines"),
	rglines: $(".rglines")
    };
}

function getInputs() {
    return {
	reidonrplot: $(".reidonrplot"),
	windowscale: $(".windowscale"),
	graphzoom: $(".graphzoom"),
	pixels: $(".pixels"),
	workergo: $(".workergo"),
	progress: $(".progress"),
	loadbutton: $(".loadbutton"),
	zsstring: $(".zsstring"),
	plotbutton: $(".plotbutton"),
	skippoints: $(".skippoints"),
	autolinespoints: $(".autolinespoints"),
	theta: $(".theta"),
	clearplots: $(".clearplots"),
	clearlines: $(".clearlines"),
	autolinesgo: $(".autolinesgo"),
	timesPI: $(".timesPI"),
	plottheta: $(".plottheta"),
	clearpreimages: $(".clearpreimages")
    };	
}

$(function() {
    var inputs = getInputs();
    var plots = getPlots();
    var tables = getTables();
    for(var i in inputs) {
	window[i] = inputs[i];
    }
    for(var i in plots) {
	window[i] = plots[i];
    }
    for(var i in tables) {
	window[i] = tables[i];
    }
});

//zs = bpcompose(zeroonehalf, [c(0,0), c(.51, 0)] );

var zs;
var cpi;
var bpzs;

var worker = new Worker("bpworker.js");
var rainbowworker = new Worker("bpgraphicsworker.js");
var regionsworker = new Worker("bpgraphicsworker.js");

function cssscatter(cw, canvaswidth, pts, cssclass, doclear) {
    if(doclear == undefined || doclear) {
	cw.find("."+cssclass).remove();
    }
    var offset = canvaswidth/2;
    console.log("Rescattering ", cw, cssclass, " at ", canvaswidth, offset);
	
    for(i in pts) {
	var z = pts[i];
	var x = z.x;
	var y = z.y == undefined ? 0: z.y;
	var div = $("<div />");
	cw.append(div);

	div.addClass(cssclass);
	div.addClass("scatterpoint");
	div.attr("id", cssclass+i);
	var nudge = Math.floor((1.0)/(2.0)*div.width());
	div.css("top",  offset - offset*y - nudge);
	div.css("left", offset + offset*x - nudge);
    }
    return cw.find("."+cssclass);
}

function scatter(ctx, pts, color, N) {
    ctx.save();
    var Nover2 = N/2;
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

function displayTables(zs, cpi) {
    criticalpoints.empty();
    for(var i = 0; i < cpi.cps.length; i++) {
	var li = $("<li>");
	li.text(dcomplex(cpi.cps[i]));
	criticalpoints.append(li);
    }    
    zeroes.empty();
    for(var i = 0; i < zs.length; i++) {
	var li = $("<li>");
	li.text(dcomplex(zs[i]));
	zeroes.append(li);
    }    
    zsstring.val("");
    var zscode = zsString(zs);
    zsstring.val(zscode);
    zsstring.attr("rows", zs.length);
    var wl = window.location.href.replace(window.location.search, "");
    permalink.attr("href", wl+"?"+zscode);
    criticalvalues.empty();
    for(var i = 0; i < cpi.cvs.length; i++) {
	var li = $("<li>");
	li.text(dcomplex(cpi.cvs[i]));
	criticalvalues.append(li);
    }   
    criticalangles.empty();
    var rolledcvangles = roll(cpi.cvangles);
    for(var i = 0; i < cpi.cvangles.length; i++) {
	var li = $("<li>");
	li.text(round2(cpi.cvangles[i]) +"-" + round2(rolledcvangles[i]));
	var rgb = hsvToRgb(1.0*i/(cpi.cvangles.length), 1, 1);
	li.attr("id", "ca"+i);
	function H(n) { n = Math.round(n); return (n < 16 ? "0" : "") + n.toString(16); }
	var rgbstring = "#"+H(rgb[0]) + H(rgb[1]) + H(rgb[2]);
	li.css("background-color", rgbstring);
	criticalangles.append(li);
    }   
}

function updatezero() {
    var nudge = Math.floor((1.0/2.0)*$(this).width());
    var zeroid = $(this).attr("id").replace("zero", "");
    var cw = $(this).parent(".canvaswrapper");
    var canvas = cw.find("canvas");
    var unit = canvas.width() /2.0;
    var p = $(this).position();
    var newpos = {
	left: p.left - canvas.position().left + nudge,
	top: p.top - canvas.position().top + nudge
    };    
    var z = c(newpos.left/unit-1, -(newpos.top/unit - 1));
    if(z.abs().x <= 1) {
	zs[zeroid] = z;
    } else {
	zs.splice(zeroid, 1);
    }
    
    rescatter(zs);
}

function rescatter(zs) {

    if(reidonrplot.is(":checked")) {
	autojoinpoints();
	rainbow[0].getContext("2d").clear();
	regions[0].getContext("2d").clear();
	range[0].getContext("2d").clear();
    }

    cpi = cpinfo(zs);
    var cps = cpi.cps;
    var cvs = cpi.cvs;
    var cvangles = cpi.cvangles;

    displayTables(zs, cpi);
    
    var cw = rainbow.parent(".canvaswrapper");
    var cwidth = plotDims().graphN;

    var zerodivs = cssscatter(cw, cwidth, zs, "zero");
    zerodivs.addClass("draggable")
	.addClass("ui-draggable")
	.addClass("ui-widget-content")
	.draggable({containment: ".canvaswrapper", scroll: false,
		    stop: updatezero});

    for(var i = 0; i < zs.length; i++) {
	if(zs[i].abs().x == 0) {
	    cw.find(".zero"+i).removeClass("draggable")
		.removeClass("ui-draggable")
		.removeClass("ui-widget-content")
		.addClass("zerozero")
		.draggable('disable');
	}
    }

    cssscatter(cw, cwidth, cpi.cps, "cp");
};

$(function() {

    if(window.location.search != "") {
	var urlZS = window.location.search.replace(/^\?/, '');
	zs = parseZsString(urlZS);
    } else {
	zs = [
	    c(0,0),
	    c(.5, -.5),
	    c(.5, .5)
	];
    }

/*    zs = [
	// c(0, .25),
	c(-.5, -.5),
	c(0, .75),
	c(0,0),
	c(.5, 0)
    ];
  */

    zeroonehalf = [
	c(0 ,0),
	c(.5,0)
    ];
    
    z = [
	c(0,0)
    ];
    
    // zs = zeroonehalf;
    resizeCanvasesRescatter();
});

$(function() {
    windowscale.change(resizeCanvasesRescatter);
    graphzoom.change(resizeCanvasesRescatter);
});

function resizeCanvasesRescatter() {
    resizeCanvases();
    rescatter(zs);
}    

function plotDims() {
    var N = parseFloat(pixels.val());
    var zoom = parseFloat(graphzoom.val());
    var windowscaleval = parseFloat(windowscale.val());
    var windowN = zoom*N*1.0/windowscaleval;
    var graphN = zoom*N;
    return {N: N, zoom: zoom, windowN: windowN, graphN: graphN};
}

function resizeCanvases() {
    var pd = plotDims();
    resize(range, pd);
    resize(rainbow, pd);
    resize(regions, pd);
    resize(rglines, pd);
    resize(rblines, pd);
    // drawPlots(bpzs, N, zs, cpi);
}

// N is the number of pixels in the canvas
// wrapperN is the size of the canvas wrapper
function resize(g, pd) {
    var cw = $(g).parent(".canvaswrapper");

    $(cw).find(".circle")
	.css("width", pd.graphN+"px")
	.css("height", pd.graphN+"px")
	.css("border-radius", pd.graphN/2+"px")
	.css("border-color", "black")
	.css("border-style", "solid");
    
    cw
	.css("width", pd.windowN+"px")
	.css("height", pd.windowN+"px");
    if(pd.graphN > pd.windowN) {
	cw
	    .addClass("canvaswrapperScroll")
	    .removeClass("canvaswrapperHidden");
    } else {
	cw
	    .removeClass("canvaswrapperScroll")
	    .addClass("canvaswrapperHidden");
    }

    var graph = $(g)[0];
/*
  var oldImgData = graph.toDataURL("image/png");
  var img = new Image(); img.src = oldImgData;
*/
    $(graph)
	.css("width", pd.graphN+"px")
	.css("height", pd.graphN+"px");
    if($(graph).hasClass("lines")) {
	if(graph.width != pd.windowN) {
	    graph.width = pd.windowN;
	    graph.height = pd.windowN;
	}	
    } else {
	if(graph.width != pd.N) {
	    graph.width = pd.N;
	    graph.height = pd.N;
	}
    }
/*
    img.onload = function() {
	graph.getContext("2d").drawImage(img, 0, 0);
    }
*/
}

$(function() {
    rainbowworker.onmessage = function(e) {graphicsWorkerHandler(e, rainbow[0], regions[0]);}
    regionsworker.onmessage = function(e) {graphicsWorkerHandler(e, rainbow[0], regions[0]);}
});

$(function() {
    workergo.click(function() {
	workergo.css("background-color", "red");
	worker.postMessage({as: zs, N: plotDims().N});
	progress.text("");
    });
});

function fastReplot(as, N, cpi) {
    var startBPGE = (new Date()).getTime();
    var rpip = bpgridevalArray(N, as, null);
    bpzs = rpipToBpzs(rpip);
    var endBPGE = (new Date()).getTime();
    progress.append("NWRP " + N + " " + as.length + " " + (endBPGE - startBPGE));

    var rgidata = new Uint8ClampedArray(4*N*N);
    rpipToHue(rpip, rgidata, function(bpz) { return region(cpi.cvangles, bpz);});
    finishCanvas(rgidata, regions[0]);

    var rbidata = new Uint8ClampedArray(4*N*N);
    rpipToHue(rpip, rbidata, angle);
    finishCanvas(rbidata, rainbow[0]);

    doRange(range[0], bpzs, cpi, plotDims().N);

}

function rpipToBpzs(rpip) {
    var bpzs = cifyrpip(rpip);
    bpzs = {bpzs: bpzs, zs: cgrid(bpzs.length)};
    return bpzs;
}

	     
worker.onmessage = function(event) {
    if(event.data.rpip != null) {
	bpzs = rpipToBpzs(event.data.rpip);
        workergo.css("background-color", "");
	progress.append(" COPY:" + ((new Date()).getTime() - event.data.senddate));
	resizeCanvases();
	progress.append(" RC:" + ((new Date()).getTime() - event.data.senddate));
	rescatter(zs);
	progress.append(" RE:" + ((new Date()).getTime() - event.data.senddate));
        workerRainbow(event.data.rpip, plotDims().N, cpi.cvangles);
	progress.append(" WRB:" + ((new Date()).getTime() - event.data.senddate));
        workerRegions(event.data.rpip, plotDims().N, cpi.cvangles);
	progress.append(" WRG:" + ((new Date()).getTime() - event.data.senddate));
	doRange(range[0], bpzs, cpi, plotDims().N);
    }
    if(event.data.rowComplete != null) {
	progress.text(event.data.rowComplete + " " + event.data.comptime);
    }
}

$(function() {
    attachcanvasclicks();
    loadbutton.click(function() {
	zs = parseZsString(zsstring.val());
	resizeCanvasesRescatter();
    });
});

$(function() {
    plotbutton.click(function() {
	resizeCanvasesRescatter();
	fastReplot(zs, plotDims().N, cpi);
    });
});

function zeroFromClick(canvas, e) {
    var unit = $(canvas).width() / 2.0;
    var mouseX = e.pageX - $(canvas).offset().left;
    var mouseY = e.pageY - $(canvas).offset().top;
    var x = (mouseX/unit) - 1;
    var y = -1 * (mouseY/unit -1);
    return c(x,y);
}

function ttp(t0) {
    return [numeric.cos(t0), numeric.sin(t0)];
}

function drawPILines(t) {
    var skip = parseInt(skippoints.val(), 10);
    if(zs.length % skip != 0) {
	alert("Cannot skip "+zs.length+" points by " + skip + ".");
	return;
    }

    var z2 = c(numeric.cos(t), numeric.sin(t));
    var bz2 = bpeval0(zs, z2);
    var preimages = preimage(zs, bz2);
    var piangles = preimages.map(function(cv) { return cv.angle();})
    piangles = piangles.sort(function(a,b){return a-b});

    drawPILinesInner(rblines[0], piangles, skip);
    //drawPILinesInner(rglines, piangles, skip);
}

function drawPILinesInner(lines, piangles, skip){

    var ctx = lines.getContext("2d");
    var N = plotDims().windowN;
    var Nover2 = N/2;
    ctx.save();
    ctx.translate(Nover2,Nover2);
    ctx.scale(Nover2, -Nover2);
    ctx.lineWidth = 1/Nover2;

    for(var j = 0; j < skip; j++) {
	ctx.beginPath();
	var i = j;
	var t0 = piangles[i];
	(ctx.moveTo).apply(ctx, ttp(t0));
	for(i = j+skip; i < piangles.length; i+= skip) {
	    t0 = piangles[i];
	    (ctx.lineTo).apply(ctx, ttp(t0));
	}
	ctx.closePath();
	ctx.stroke();
    }
    ctx.restore();
}

var cf = function(e) {
    var z = zeroFromClick($(this), e);
    var val = bpeval(zs, c(z.x,z.y));
    point.text(round2(z.x) + " " + round2(z.y) + "i");
    dest.text(dcomplex(val) + " " + getangleindex(val.angle(), cpi.cvangles));	
};

var addpoint = function(e) {
    var z = zeroFromClick($(this), e);
    if(z.abs().x <=1) {
	zs.push(z);
	rescatter(zs);
    }
}
var joinpoints = function(e) {
    var z = zeroFromClick($(this), e);
    var t = z.angle();
    drawPILines(t);
}
var autojoinpoints = function() {	
    doclearlines();
    var ajpct = parseInt(autolinespoints.val(), 10);
    var adelta = Math.PI*2.0/ajpct;
    for(var i = 0; i < ajpct; i++) {
	drawPILines(i*adelta);
    }
}

var doclearlines = function() {
    rglines[0].getContext("2d").clear();
    rblines[0].getContext("2d").clear();
}

var doclearplots = function() {
    resizeCanvasesRescatter();
    $(".graph").each(function(i) {$(this)[0].getContext("2d").clear();});
}

function attachcanvasclicks() {
    rglines.on("dblclick", addpoint);
    rainbow.on("dblclick", addpoint);
    rblines.on("dblclick", addpoint);
    rainbow.on("click", cf);
    rglines.on("click", joinpoints);
    autolinesgo.on("click", autojoinpoints);
    timesPI.on("click", function() {
	var t = parseFloat(theta.val());
	theta.val(Math.PI*t);
    });
    plottheta.on("click", function() {
	var t = parseFloat(theta.val());
	drawPILines(t);
    });
    clearplots.on("click", doclearplots);
    clearlines.on("click", doclearlines);
    // $("#regions").on("click", cf);
    clearpreimages.on("click", 
		      function(e) {
			  cssscatter(regions.parent(".canvaswrapper"), 
				     plotDims().graphN,
				     [], "pi", true);
		      }
		     );
    var rangemd = false;
    range
	.on("mouseleave", function(e) {
	    rangemd = false;
	    console.log("RangeMD: " + rangemd);
	})
 	.on("click", function(e) {
	    rangemd = !rangemd;
	    console.log("RangeMD: " + rangemd);
	})
	.on("mousemove", function(e) {
	    if(rangemd || e.which == 1) {
		var z = zeroFromClick($(this), e);
		var preimages = preimage(zs, z);
		var pidivs = cssscatter(regions.parent(".canvaswrapper"),
					plotDims().graphN, preimages, "pi", false);
		console.log("Scattering preimages.");
	    }
	});
};

CanvasRenderingContext2D.prototype.clear = 
  CanvasRenderingContext2D.prototype.clear || function (preserveTransform) {
    if (preserveTransform) {
      this.save();
      this.setTransform(1, 0, 0, 1, 0, 0);
    }

    this.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (preserveTransform) {
      this.restore();
    }           
};