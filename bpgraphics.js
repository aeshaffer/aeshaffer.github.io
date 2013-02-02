function drawPlots(bpzs, N, zs, cpi) {
    if(bpzs == undefined) {return;}

    var range = document.getElementById("range");
    var rangecxt = range.getContext("2d");
    var rangeidata = rangecxt.createImageData(N, N);
    var o0 = showRegions(rangeidata, bpzs.zs, bpzs.zs, cpi.cvangles);
    rangecxt.putImageData(o0.idata, 0, 0);

    scatter(rangecxt, cpi.cvs, "#000000", N);
    
    var rainbow = document.getElementById("rainbow");
    var rainbowctx = rainbow.getContext("2d");
    var rainbowidata = rainbowctx.createImageData(N, N);
    var o1 = draweval(rainbowidata, bpzs.zs, bpzs.bpzs);
    rainbowctx.putImageData(o1.idata, 0, 0);
    scatter(rainbowctx, cpi.cps, "#000000", N);
    scatter(rainbowctx, zs, "#ffffff", N);
    
    var regions = document.getElementById("regions");
    var regionsctx = regions.getContext("2d");
    var regionsidata = regionsctx.createImageData(N, N);
    var o2 = showRegions(regionsidata, bpzs.zs, bpzs.bpzs, cpi.cvangles);
    regionsctx.putImageData(o2.idata, 0, 0);
    scatter(regionsctx, cpi.cps, "#000000", N);
    scatter(regionsctx, zs, "#ffffff", N);    
}

function replot(zs, cpi) {
    var N = $("#pixels").val();
    resizeCanvases();    
    var ctx;
    if(true) {
	bpzs = bpgrideval(N, zs);
	drawPlots(bpzs, N, zs, cpi);
    } else {
	var c=document.getElementById("graph");
	var ctx=c.getContext("2d");
    }
}
