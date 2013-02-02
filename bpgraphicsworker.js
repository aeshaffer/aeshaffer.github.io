importScripts('hsvToRGB.js', 'numeric-1.2.3.js', 'polynomials.js', 'blaschke.js'); 
function wonkify(idata) {
    var N = Math.sqrt(idata.length);
    for(var row = 0; row < N; row++) {
	for(var col = 0; col < N; col++) {
	    var addr = (N*4)*((N-1)-col) + 4*row;
	    idata[addr+0] = (idata[addr+0]/2 + row) % 255;
	    idata[addr+1] = (idata[addr+1]/2 + col) % 255;
	    idata[addr+2] = 0; //(idata[addr+2]/2 + (row + col)) % 255;
	    idata[addr+3] = 255;
	}
    }
}

self.onmessage = function(event) {
    var cvangles = event.data.cvangles;
    var bpzs = event.data.bpzs.bpzs;
    var zs = event.data.bpzs.zs;
    cvanges = cifyrow(cvangles);
    bpzs = cifygrid(bpzs);
    zs = cifygrid(zs);

    var rainbowidata = event.data.rainbowidata;
    if(rainbowidata != null) {
	rainbowidata = new Uint8ClampedArray(4*bpzs.length*bpzs.length);
	var rainbowstatus = function(row) { 
	    postMessage({rainbowrow: row});
	} 
	draweval(rainbowidata, zs, bpzs, rainbowstatus);
	//wonkify(rainbowidata);
	postMessage({rainbowidata: rainbowidata});
    }

    var regionsidata = event.data.regionsidata;
    if(regionsidata != null) {
	regionsidata = new Uint8ClampedArray(4*bpzs.length*bpzs.length);
	var regionsstatus = function(row) { 
	    postMessage({regionsrow: row});
	}
	showRegions(regionsidata, zs, bpzs, cvangles, regionsstatus);
	//wonkify(regionsidata);
	postMessage({regionsidata: regionsidata});
    }
}