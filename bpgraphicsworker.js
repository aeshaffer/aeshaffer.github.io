importScripts('hsvToRGB.js', 'numeric-1.2.3.js', 'polynomials.js', 'blaschke.js', 
	      'bpgraphics.js'); 

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

var rpip;

self.onmessage = function(event) {
    var cvangles = event.data.cvangles;
    var bprpip = event.data.bprpip;
    cvanges = cifyrow(cvangles);

    var rainbowidata = event.data.rainbowidata;
    if(rainbowidata != null) {
	rainbowidata = new Uint8ClampedArray(4*bprpip.realparts.length);
	var rainbowstatus = function(row) { 
	    postMessage({rainbowrow: row, senddate: (new Date()).getTime() });
	}
	rpipToHue(bprpip, rainbowidata, angle);
	postMessage({rainbowidata: rainbowidata, senddate: (new Date()).getTime() });
    }

    var regionsidata = event.data.regionsidata;
    if(regionsidata != null) {
	regionsidata = new Uint8ClampedArray(4*bprpip.realparts.length);
	var regionsstatus = function(row) { 
	    postMessage({regionsrow: row, senddate: (new Date()).getTime() });
	}
	rpipToHue(bprpip, regionsidata, function(bpz) { return region(cvangles, bpz);});
	postMessage({regionsidata: regionsidata, senddate: (new Date()).getTime() });
    }
}