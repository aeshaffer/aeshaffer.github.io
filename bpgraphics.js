var rainbowworker = new Worker("bpgraphicsworker.js");
var regionsworker = new Worker("bpgraphicsworker.js");

workerhandler =  function(event) {
    var rsst = $("#drawstatus");
    if(event.data.rainbowidata != null) {
	finishCanvas(event.data.rainbowidata, "rainbow");
    }
    if(event.data.rainbowrow != null) {
	$("#rainbowstatus").text(event.data.rainbowrow);
    }
    if(event.data.regionsidata != null) {
	finishCanvas(event.data.regionsidata, "regions");
    }
    if(event.data.regionsrow != null) {
	$("#regionsstatus").text(event.data.regionsrow);
    }
}

rainbowworker.onmessage = workerhandler;
regionsworker.onmessage = workerhandler;

function finishCanvas(idata0, cname) {
    var N = Math.sqrt(idata0.length/4);
    var rainbowctx = document.getElementById(cname)
	.getContext("2d");
    var idata1 = rainbowctx.createImageData(N, N);
    for(var i = 0; i < idata0.length; i++) {
	idata1.data[i] = idata0[i];
    }
    rainbowctx.putImageData(idata1, 0, 0);
    scatter(rainbowctx, cpi.cps, "#000000", N);
    scatter(rainbowctx, zs, "#ffffff", N);
}

function workerDrawPlot(bpzs, N, cvangles) {    
    $("#rainbowstatus").text("-1");
    $("#regionsstatus").text("-1");
    rainbowworker.postMessage({rainbowidata: N, //getID("rainbow", N),
				cvangles: cvangles,
				bpzs: bpzs
			       });
    regionsworker.postMessage({regionsidata: N, //getID("regions", N),
				cvangles: cvangles,
				bpzs: bpzs
			       });
}

function getCtx(cname) {
    return document.getElementById(cname).getContext("2d");
}

function getID(cname, N) {
    return getCtx(cname).createImageData(N,N);
}

function doRange(bpzs, cpi, N) {
    var rangecxt = getCtx("range");
    var rangeidata = getID("range", N);
    showRegions(rangeidata.data, bpzs.zs, bpzs.zs, cpi.cvangles);
    rangecxt.putImageData(rangeidata, 0, 0);
    scatter(rangecxt, cpi.cvs, "#000000", N);
}

function drawPlots(bpzs, N) {
    if(bpzs == undefined) {return;}

    doRange(bpzs, cpi, N);
    
    var rainbowidata = getID("rainbow", N).data;
    draweval(rainbowidata, bpzs.zs, bpzs.bpzs);
    finishCanvas(rainbowidata, "rainbow");
    
    var regionsidata = getID("regions", N).data;
    showRegions(regionsidata, bpzs.zs, bpzs.bpzs, cpi.cvangles);
    finishCanvas(regionsidata, "regions");
}

function replot(zs, cpi) {
    var N = $("#pixels").val();
    resizeCanvases();    
    var ctx;
    if(true) {
	bpzs = bpgrideval(N, zs);
	drawPlots(bpzs, N);
    } else {
	var c=document.getElementById("graph");
	var ctx=c.getContext("2d");
    }
}
