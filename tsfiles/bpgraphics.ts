
function graphicsWorkerHandler(event, rainbow, regions, cpi, zs) {
    var rsst = $("#drawstatus");
    var dd = (new Date()).getTime();
    if(event.data.rainbowidata != null) {
	finishCanvas(event.data.rainbowidata, rainbow, cpi);
	$("#rainbowstatus")
	    .append($("<li>"+(dd - rainbowStart.getTime())+"</li>"))	
	    .append($("<li>"+(dd - event.data.senddate)+"</li>"));
    }
    if(event.data.regionsidata != null) {
	finishCanvas(event.data.regionsidata, regions, cpi);
	$("#regionsstatus")
	    .append($("<li>"+(dd - regionsStart.getTime())+"</li>"))
	    .append($("<li>"+(dd - event.data.senddate)+"</li>"));
    }
}


function finishCanvas(idata0: Uint8ClampedArray, canvas : HTMLCanvasElement, cpi) {
    var N = Math.sqrt(idata0.length/4);
    var rainbowctx = canvas.getContext("2d");
    var idata1 = rainbowctx.createImageData(N, N);
    for(var i = 0; i < idata0.length; i++) {
	    idata1.data[i] = idata0[i];
    }

    var newCanvas = new JQuerySingletonWrapper<HTMLCanvasElement>($("<canvas>")
        .attr("width", N)
        .attr("height", N));

    newCanvas.element.getContext("2d").putImageData(idata1, 0, 0);

    rainbowctx.save();
    rainbowctx.scale(canvas.width/N, canvas.height/N);
    rainbowctx.drawImage(newCanvas.element, 0, 0);
    rainbowctx.restore();

    // rainbowctx.putImageData(idata1, 0, 0);
    // scatter(rainbowctx, cpi.cps, "#888888", N);
    // scatter(rainbowctx, zs, "#ffffff", N);
}

var rainbowStart;
var regionsStart;

function workerRainbow(rainbowworker, bprpip, N, cvangles) {    
    $("#rainbowstatus").text("-1");
    rainbowStart = new Date();
    rainbowworker.postMessage({rainbowidata: N, //getID("rainbow", N),
			       cvangles: cvangles,
			       bprpip: bprpip
			       });
}

function workerRegions(regionsworker, bprpip, N, cvangles) {
    $("#regionsstatus").text("-1");
    regionsStart = new Date();
    regionsworker.postMessage({regionsidata: N, //getID("regions", N),
			       cvangles: cvangles,
			       bprpip: bprpip
			       });
}

function getCtx(canvas: HTMLCanvasElement) {
    return canvas.getContext("2d");
}

function getID(canvas: HTMLCanvasElement, N) {
    return getCtx(canvas).createImageData(N,N);
}

function doRange(canvas: HTMLCanvasElement, bpzs: any, cpi: CPInfo, N: number) {
    var rangecxt = getCtx(canvas);
    var rangeidata = getID(canvas, N);
    showRegions(rangeidata.data, bpzs.zs, bpzs.zs, cpi.cvangles);
    finishCanvas(rangeidata.data, canvas, cpi);
}

function region(cvangles, bpz) {
    var i = getangleindex(bpz.angle(), cvangles);
    return 1.0*i/(cvangles.length);
}

function showRegions(idata: Uint8ClampedArray, zs: C[], bpzs: C[], cvangles: number[], rowcallback?) {    
    return mapOverbpzs(idata, zs, bpzs, 
		       function(z, bpz) { return region(cvangles, bpz); },
		       rowcallback);
}


function mapOverbpzs(idata: Uint8ClampedArray, zs: C[], bpzs: C[], huefn, rowcallback) {
    var N = bpzs.length;
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
	if(typeof(rowcallback) == "function") {
	    rowcallback(row);
	}
    }
    return {idata: idata};
}

function setRGBInner(idata, rgb, addr) {
    idata[addr] = rgb[0];
    idata[addr+1] = rgb[1];
    idata[addr+2] = rgb[2];
    idata[addr+3] = 255;    
}

function setRGB(idata, rgb, N, row, col) {
    var addr = (N*4)*((N-1)-col) + 4*row;
    setRGBInner(idata, rgb, addr);
}

function anglehue(bpz: C) {
    var t = bpz.angle();
    return tanglehue(t);
}

function tanglehue(t) {
    var thetapct = normalizeangle(t)/(2*pi);
    var t2 = Math.round(255*thetapct) % 256;
    return t2/256;
}

function draweval(idata, zs, bpzs, rowcallback) {
    return mapOverbpzs(idata, zs, bpzs, anglehue, rowcallback);
}



function rpipToHue(rpip, idata, huefn, valfn? ) {
    var rp = rpip.realparts;
    var ip = rpip.imagparts;
    var N = Math.sqrt(rp.length);
    var xs = numeric.linspace(-1,1,N);
    var ys = numeric.linspace(1,-1,N);
    for(var xi = 0; xi < N; xi++) {
	for(var yi = 0; yi < N; yi++) {
	    var z = c(xs[xi], ys[yi]);
	    if(z.abs().x <= 1) {
		var i = yi*N + xi;
		var bpz = c(rp[i], ip[i]);		
		var hue = huefn(bpz);
		var val = (valfn == undefined) ? 1 : valfn(bpz);
		var rgb = hsvToRgb(hue, 1, val);
		setRGBInner(idata, rgb, 4*i);	    
	    }
	}
    }
}
