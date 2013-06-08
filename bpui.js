function getNudge(div) {
    var nudge = div.width()/2;
    nudge += parseFloat(div.css("border-left-width").replace("px", ""), 10);
    return nudge;
}

function cssscatter(cw, canvaswidth, pts, cssclass, doclear) {
    if(doclear == undefined || doclear) {
	cw.find("."+cssclass).remove();
    }
    var offset = canvaswidth/2;
    //console.log("Rescattering ", cw, cssclass, " at ", canvaswidth, offset);
    
    for(var i = 0; i < pts.length; i++) {
	var z = pts[i];
	var x = z.x;
	var y = z.y == undefined ? 0: z.y;
	var div = $("<div />");
	cw.append(div);
	
	div.addClass(cssclass);
	div.addClass("scatterpoint");
	div.addClass(cssclass+i);
	div.attr("zeroid", i);
	var nudge = getNudge(div);
	div.css("top",  Math.round(offset - offset*y - nudge));
	div.css("left", Math.round(offset + offset*x - nudge));
/*
	console.log(cssclass+i, " at ", 
		    offset - offset*y, div.css("top"), 
		    offset - offset*x, div.css("left"), 
		    nudge, div.width());
*/
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
	ctx.strokeStyle="#000000";
	ctx.fill();
	ctx.lineWidth = 1;
	ctx.stroke();
    }
    ctx.restore();
}

function ttp(t0) {
    return [numeric.cos(t0), numeric.sin(t0)];
}

function zeroFromClick(canvas, e) {
    var unit = $(canvas).width() / 2.0;
    var mouseX = e.pageX - $(canvas).offset().left;
    var mouseY = e.pageY - $(canvas).offset().top;
    var x = (mouseX/unit) - 1;
    var y = -1 * (mouseY/unit -1);
    return c(x,y);
}

// N is the number of pixels in the canvas
// wrapperN is the size of the canvas wrapper
function resize(g, pd) {
    var cw = $(g).parent(".zeroesholder");
    
    $(cw).find(".circle")
	.css("width", (pd.graphN-2)+"px")
	.css("height",(pd.graphN-2)+"px");
    
    cw
	.css("width", pd.windowN+"px")
	.css("height", pd.windowN+"px");
    if(pd.graphN > pd.windowN) {
	cw
	    .addClass("zeroesholderScroll")
	    .removeClass("zeroesholderHidden");
    } else {
	cw
	    .removeClass("zeroesholderScroll")
	    .addClass("zeroesholderHidden");
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

var rpipToBpzs = function(rpip) {
    var bpzs = cifyrpip(rpip);
    bpzs = {bpzs: bpzs, zs: cgrid(bpzs.length)};
    return bpzs;
}

function BPWidget(obj) {
    function g(sel) {
	return obj.find(sel);
    }
    
    this.criticalpoints= g(".criticalpoints");
    this.criticalvalues= g(".criticalvalues");
    this.criticalangles= g(".criticalangles");
    this.zeroes= g(".zeroes");
    this.permalink= g(".permalink");
    this.point= g(".point");
    this.dest= g(".dest");

    this.rainbow= g(".rainbow");
    this.regions= g(".regions");
    this.range= g(".range");
    this.rblines= g(".rblines");
    this.rglines= g(".rglines");

    this.reidonrplot= g(".reidonrplot");
    this.plotinterp = g(".plotinterp");
    this.windowscale= g(".windowscale");
    this.rayThreshold = g(".raythreshold");
    this.graphzoom= g(".graphzoom");
    this.pixels= g(".pixels");
    this.workergo= g(".workergo");
    this.progress= g(".progress");
    this.loadbutton= g(".loadbutton");
    this.zsstring= g(".zsstring");
    this.plotbutton= g(".plotbutton");
    this.skippoints= g(".skippoints");
    this.autolinespoints= g(".autolinespoints");
    this.theta= g(".theta");
    this.clearplots= g(".clearplots");
    this.clearlines= g(".clearlines");
    this.autolinesgo= g(".autolinesgo");
    this.timesPI= g(".timesPI");
    this.plottheta= g(".plottheta");
    this.clearpreimages= g(".clearpreimages");
    this.showpreimages = g(".showpreimages");

    this.zs = {};
    this.cpi = {};
    this.bpzs = {};
    
    try {
	this.worker = new Worker("bpworker.js");
	this.rainbowworker = new Worker("bpgraphicsworker.js");
	this.regionsworker = new Worker("bpgraphicsworker.js");    
    } catch (seex) {
	this.worker = null;
	this.rainbowworker = null;
	this.regionsworker = null;
    }
}

BPWidget.prototype.wireup = function() {
    
    //zs = bpcompose(zeroonehalf, [c(0,0), c(.51, 0)] );

    this.setup();
};

BPWidget.prototype.displayTables = function(zs, cpi) {
    this.criticalpoints.empty();
    this.criticalvalues.empty();

    var doclear = false;

    for(var i = 1; i < cpi.cps.length; i++) {
	if(dcomplex(cpi.cvs[i]) == dcomplex(cpi.cvs[i-1])) {
	    doclear = true;
	}
    }

    for(var i = 0; i < cpi.cps.length; i++) {
	var cpli = $("<li>");
	cpli.text(dcomplex(cpi.cps[i]));
	this.criticalpoints.append(cpli);

	var cvli = $("<li>");
	var dc = dcomplex(cpi.cvs[i]);
	cvli.text(dc);
	this.criticalvalues.append(cvli);

	if(doclear && i - 1 >= 0) {
	    var dc0 = dcomplex(cpi.cvs[i-1]);
	    if (dc != dc0) {
		cpli.css("clear", "left");
		cvli.css("clear", "left");
	    }
	}
    }    

    this.zeroes.empty();
    for(var i = 0; i < zs.length; i++) {
	var li = $("<li>");
	li.text(dcomplex(zs[i]));
	this.zeroes.append(li);
    }    
        
    this.criticalangles.empty();
    var rolledcvangles = roll(cpi.cvangles);
    for(var i = 0; i < cpi.cvangles.length; i++) {
	var li = $("<li>");
	li.text(round5(cpi.cvangles[i]) +"-" + round5(rolledcvangles[i]));
	var rgb = hsvToRgb(1.0*i/(cpi.cvangles.length), 1, 1);
	li.attr("id", "ca"+i);
	function H(n) { n = Math.round(n); return (n < 16 ? "0" : "") + n.toString(16); }
	var rgbstring = "#"+H(rgb[0]) + H(rgb[1]) + H(rgb[2]);
	li.css("background-color", rgbstring);
	this.criticalangles.append(li);
    }   
    
    this.zsstring.val("");
    var zscode = zsString(this.zs);
    this.zsstring.val(zscode);
    this.zsstring.attr("rows", zs.length);
    var wl = window.location.href.replace(window.location.search, "");
    this.permalink.attr("href", wl+"?"+zscode);
};

BPWidget.prototype.updatezero = function(zdiv) {
    var nudge = getNudge($(zdiv));
    var zeroid = $(zdiv).attr("zeroid");
    var cw = $(zdiv).parent(".zeroesholder");
    var canvas = cw.find("canvas");
    var unit = canvas.width() /2.0;
    var p = $(zdiv).position();
    var newpos = {
	left: p.left - canvas.position().left + nudge,
	top: p.top - canvas.position().top + nudge
    };    
    var z = c(newpos.left/unit-1, -(newpos.top/unit - 1));
    if(z.abs().x <= 1) {
	this.zs[zeroid] = z;
    } else {
	this.zs.splice(zeroid, 1);
    }
    
    this.rescatter();
};

BPWidget.prototype.rescatter = function() {
    
    if(this.reidonrplot.is(":checked")) {
	this.autojoinpoints();
	this.rainbow[0].getContext("2d").clear();
	this.regions[0].getContext("2d").clear();
	this.range[0].getContext("2d").clear();
    }

    this.cpi = cpinfo(this.zs);
    var cps = this.cpi.cps;
    var cvs = this.cpi.cvs;
    var cvangles = this.cpi.cvangles;
    
    this.displayTables(this.zs, this.cpi);
    
    var cw = this.rainbow.parent(".zeroesholder");
    var cwidth = this.plotDims().graphN;

    var innertest = [];
    if(this.plotinterp.is(":checked")) {
	if(this.skippoints.val() != "") {
	    var innerguess = parseInt(this.skippoints.val(), 10);
	    if(innerguess == 1 || innerguess == this.zs.length || 
	       this.zs.length % innerguess != 0) {
		cssscatter(cw, cwidth, [], "innerzero", true);
	    } else {
		innertest = algorithmtest(this.zs, innerguess);
		var innertestdivs = cssscatter(cw, cwidth, innertest.zeroes, "innerzero");
		console.log("PQ Zeroes:", innertest.pqzeroes);
	    }
	} 
    } else {
	cssscatter(cw, cwidth, [], "innerzero", true);
    }
    

    
    var zerodivs = cssscatter(cw, cwidth, this.zs, "zero");
    var that = this;
    zerodivs.addClass("draggable")
	.addClass("ui-draggable")
	.addClass("ui-widget-content")
	.draggable({
	    containment: ".zeroesholder", scroll: false,
	    stop: function() { that.updatezero($(this));}
	});
    

    for(var i = 0; i < this.zs.length; i++) {
	if(this.zs[i].abs().x == 0) {
	    cw.find(".zero"+i).removeClass("draggable")
		.removeClass("ui-draggable")
		.removeClass("ui-widget-content")
		.addClass("zerozero")
		.draggable('disable');
	}
    }
    
    cssscatter(cw, cwidth, this.cpi.cps, "cp");
    for(var i = 0; i < this.cpi.cps.length; i++) {
	var pt = cw.find(".cp"+i);
	var cp = this.cpi.cps[i];
	var that = this;
	bindCPClick(pt, cp, that);
    }
};

function bindCPClick(pt, cp, that) {
    var cp2 = cp;
    pt.bind("click", function() { showClick(cp2, that);	});
}

BPWidget.prototype.resizeCanvasesRescatter = function() {
    this.resizeCanvases();
    this.rescatter();
};
    
BPWidget.prototype.plotDims = function() {
    var N = parseFloat(this.pixels.val());
    var zoom = parseFloat(this.graphzoom.val());
    var windowscaleval = parseFloat(this.windowscale.val());
    var windowN = zoom*N*1.0/windowscaleval;
    var graphN = zoom*N;
    return {N: N, zoom: zoom, windowN: windowN, graphN: graphN};
};

BPWidget.prototype.resizeCanvases = function() {
    var pd = this.plotDims();
    resize(this.range, pd);
    resize(this.rainbow, pd);
    resize(this.regions, pd);
    resize(this.rglines, pd);
    resize(this.rblines, pd);
    // drawPlots(bpzs, N, zs, cpi);
};

BPWidget.prototype.fastReplot = function(as, N, cpi, raythreshold) {
    var startBPGE = (new Date()).getTime();
    var rpip = bpgridevalArray(N, as, null);
    bpzs = rpipToBpzs(rpip);
    var endBPGE = (new Date()).getTime();
    this.progress.append("NWRP " + N + " " + as.length + " " + (endBPGE - startBPGE));

    var rgidata = new Uint8ClampedArray(4*N*N);
    rpipToHue(rpip, rgidata, function(bpz) { return region(cpi.cvangles, bpz);});
    finishCanvas(rgidata, this.regions[0], cpi, as);

    var bad = biggestanglediff(cpi.cps.map(function(bpz) { return bpz.angle();}));

    var valfun = function(bpz) {
	if(th == 0) { return 1; }
	if(isNaN(bpz.x) || isNaN(bpz.y)) { return 1; }
	var th = raythreshold;
	var ad = anglediff(bad.midpt - bpz.angle());
	var aad = Math.abs(ad);
	var val = (1.0/(4.0*th))*aad;
	if (val > 1) { return 1; } else { return val; }
    }	

    var rbidata = new Uint8ClampedArray(4*N*N);
    rpipToHue(rpip, rbidata, anglehue, valfun);
    finishCanvas(rbidata, this.rainbow[0], cpi);

    doRange(this.range[0], bpzs, cpi, this.plotDims().N);
};



BPWidget.prototype.drawPILines = function(t) {
    var skip = parseInt(this.skippoints.val(), 10);
    if(this.zs.length % skip != 0) {
	this.skippoints.css("background-color", "red");
	this.skippoints.attr("title", "Cannot skip "+this.zs.length+" points by " + skip + ".");
	return;
    } else {
	this.skippoints.css("background-color", "");
	this.skippoints.attr("title", "");
    }

    var z2 = c(numeric.cos(t), numeric.sin(t));
    var bz2 = bpeval0(this.zs, z2);
    var preimages = preimage(this.zs, bz2);
    var piangles = preimages.map(function(cv) { return cv.angle();})
    piangles = piangles.sort(function(a,b){return a-b});
    
    this.drawPILinesInner(this.rblines[0], piangles, skip);
    //drawPILinesInner(rglines, piangles, skip);
};

BPWidget.prototype.drawPILinesInner = function(lines, piangles, skip){

    var ctx = lines.getContext("2d");
    var N = this.plotDims().windowN;
    var Nover2 = N/2;
    ctx.save();
    ctx.translate(Nover2,Nover2);
    ctx.scale(Nover2, -Nover2);
    ctx.lineWidth = 1.00001/Nover2;

    for(var j = 0; j < skip; j++) {
	var i = j;
	var t0 = piangles[i];

	ctx.beginPath();
	(ctx.moveTo).apply(ctx, ttp(t0));
	for(i = j+skip; i < piangles.length; i+= skip) {
	    t0 = piangles[i];
	    (ctx.lineTo).apply(ctx, ttp(t0));
	}
	ctx.closePath();
	ctx.stroke();

    }
    ctx.restore();
};

BPWidget.prototype.autojoinpoints = function() {	
    this.doclearlines();
    var ajpct = parseInt(this.autolinespoints.val(), 10);
    var adelta = Math.PI*2.0/ajpct;
    for(var i = 0; i < ajpct; i++) {
	console.log("Joining points that map to"+i*adelta);
	this.drawPILines(i*adelta);
    }
};

BPWidget.prototype.doclearlines = function () {
    this.rglines[0].getContext("2d").clear();
    this.rblines[0].getContext("2d").clear();
};

function showClick(z, that) {
    var val = bpeval(that.zs, c(z.x,z.y));
    that.point.text(dcomplex(z));
    that.dest.text(dcomplex(val) + " " + getangleindex(val.angle(), that.cpi.cvangles));
};

BPWidget.prototype.attachcanvasclicks = function() {
    var that = this;
    function addpoint(e) {
	var z = zeroFromClick($(this), e);
	if(z.abs().x <=1) {
	    that.zs.push(z);
	    that.rescatter();
	}
    }
    function cf(e) {
	var z = zeroFromClick($(this), e);
	showClick(z, that);
    };
    function joinpoints(e) {
	var z = zeroFromClick($(this), e);
	var t = z.angle();
	that.drawPILines(t);
    }

    function doclearplots() {
	that.resizeCanvasesRescatter();
	$(".graph").each(function(i) {$(this)[0].getContext("2d").clear();});
    }

    this.rblines.on("dblclick", addpoint);
    this.rblines.on("click", cf);
    this.rglines.on("click", joinpoints);

    this.autolinesgo.on("click", function() {that.autojoinpoints();});
    this.timesPI.on("click", function() {
	var t = parseFloat(that.theta.val());
	that.theta.val(Math.PI*t);
    });
    this.plottheta.on("click", function() {
	var t = parseFloat(that.theta.val());
	that.drawPILines(t);
    });
    this.clearplots.on("click", doclearplots);
    this.clearlines.on("click", function() {that.doclearlines();});
    // $("#regions").on("click", cf);
   
    var rangemd = false;
    this.range
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
		var preimages = preimage(that.zs, z);
		var v = that.showpreimages.val();
		if(v == "both") {
		    var pidivs = cssscatter(that.rainbow.parent(".zeroesholder"),
					    that.plotDims().graphN, preimages, "pi", false);
		}
		if(v == "regions" || v == "both") {
		    var pidivs = cssscatter(that.regions.parent(".zeroesholder"),
					    that.plotDims().graphN, preimages, "pi", false);
		}
		console.log("Scattering preimages.");
	    }
	});
    this.clearpreimages.on("click", 
			   function(e) {
			       cssscatter(that.regions.parent(".zeroesholder"), 
					  that.plotDims().graphN,
					  [], "pi", true);
			       cssscatter(that.rainbow.parent(".zeroesholder"), 
					  that.plotDims().graphN,
					  [], "pi", true);
			   }
			  );
    this.showpreimages.on("change", function(e) {
	var v = $(e.target).val();
	if(v == "none") {
	    that.range.parent("div").hide();
	} else {
	    that.range.parent("div").show();
	}
    });

    this.showpreimages.change();

};

BPWidget.prototype.setup = function() {	     

    if(window.location.search != "") {
	var urlZS = window.location.search.replace(/^\?/, '');
	this.zs = parseZsString(urlZS);
    } else {
	this.zs = [
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
    var that = this;
    this.resizeCanvasesRescatter();

    this.skippoints.change(function() { that.rescatter(); });
    this.windowscale.change(function() { that.resizeCanvasesRescatter(); });
    this.graphzoom.change(function() { that.resizeCanvasesRescatter(); });

    var wom = function(event) {
	if(event.data.rpip != null) {
	    bpzs = rpipToBpzs(event.data.rpip);
	    that.workergo.css("background-color", "");
	    that.progress.append(" COPY:" + ((new Date()).getTime() - event.data.senddate));
	    that.resizeCanvases();
	    that.progress.append(" RC:" + ((new Date()).getTime() - event.data.senddate));
	    that.rescatter();
	    that.progress.append(" RE:" + ((new Date()).getTime() - event.data.senddate));
	    workerRainbow(that.rainbowworker, event.data.rpip, that.plotDims().N, that.cpi.cvangles);
	    that.progress.append(" WRB:" + ((new Date()).getTime() - event.data.senddate));
	    workerRegions(that.regionsworker, event.data.rpip, that.plotDims().N, that.cpi.cvangles);
	    that.progress.append(" WRG:" + ((new Date()).getTime() - event.data.senddate));
	    doRange(that.range[0], bpzs, that.cpi, that.plotDims().N);
	}
	if(event.data.rowComplete != null) {
	    that.progress.text(event.data.rowComplete + " " + event.data.comptime);
	}
    }
    if(this.worker != null) {
	this.rainbowworker.onmessage = function(e) {
	    graphicsWorkerHandler(e, that.rainbow[0], that.regions[0], that.cpi, that.zs);
	}
	this.regionsworker.onmessage = function(e) {
	    graphicsWorkerHandler(e, that.rainbow[0], that.regions[0], that.cpi, that.zs);
	}    
	this.worker.onmessage = wom;
	this.workergo.click(function() {
	    that.workergo.css("background-color", "red");
	    that.worker.postMessage({as: that.zs, N: that.plotDims().N});
	    that.progress.text("");	    
	});
    } else {
	this.workergo.hide();
    }
    this.attachcanvasclicks();
    this.loadbutton.click(function() {
	that.zs = parseZsString(that.zsstring.val());
	that.resizeCanvasesRescatter();
    });
    this.replotMe = function() {
	that.resizeCanvasesRescatter();
	that.fastReplot(that.zs, that.plotDims().N, that.cpi, 
			parseFloat(that.rayThreshold.val()));
    }
    this.plotbutton.click(function() {
	that.replotMe();
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
