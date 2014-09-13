
var imagecanvas;
var imagecontext;
var mapcanvas;
var mapcontext;

$(function() {
    imagecanvas = document.getElementById('imagecanvas');
    imagecontext = imagecanvas.getContext('2d');
    mapcanvas = document.getElementById('mapcanvas');
    mapcontext = mapcanvas.getContext('2d');
});

function loadCanvas(dataURL) {
    // load image from data url
    var imageObj = new Image();
    imageObj.onload = function() {
	
	var dim = Math.max(this.height, this.width);

/*
	$(imagecanvas).css("height", dim+"px");
	$(imagecanvas).css("width", dim+"px");
*/
	imagecanvas.width = dim;
	imagecanvas.height = dim;
	$(imagecanvas).css("height", "400px");
	$(imagecanvas).css("width", "400px");

	imagecontext.save();
	
	// Create a circle
	imagecontext.beginPath();
	imagecontext.arc(dim/2, dim/2, dim/2, 0, Math.PI*2, false);
	
	// Clip to the current path
	imagecontext.clip();
	
	imagecontext.drawImage(this, (dim - this.width)/2, (dim-this.height)/2, this.width, this.height);
	
	// Undo the clipping
	imagecontext.restore();
	
    };
    
    imageObj.src = dataURL;
}

function rpipToRGBA(rpip, idata, rgbfn) {
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
		var rgb = rgbfn(bpz);
		setRGBInner(idata, rgb, 4*i);	    
	    }
	}
    }
}


$(function() {
    $("#mapimage").click(function() {

	function getXY(z) {
	    var xi = Math.round(imagecanvas.width*(1+z.x)/2);
	    var yi = Math.round(imagecanvas.height*(1-z.y)/2);
	    return {x: xi, y: yi};
	}

	var iccssw = $(imagecanvas).width();
	var iccssh = $(imagecanvas).height();

	function getXY2(z) {
	    var xi = Math.round(iccssw)*(1+z.x)/2;
	    var yi = Math.round(iccssh)*(1-z.y)/2;
	    return {x: xi, y: yi};
	}

	function getI(z) {
	    var xy = getXY(z);
	    var i = xy.x+imagecanvas.width*xy.y;
	    //console.log(bpz);
	    //console.log(xi, yi);
	    i = 4*i;
	    return i;
	}

	var N = bpwidget.plotDims().N;
	var rpip = bpgridevalArray(N, bpwidget.zs, null);
	var imgData= imagecontext.getImageData(0,0,imagecanvas.width,imagecanvas.height);
	var rbidata = new Uint8Array(4*imagecanvas.width*imagecanvas.height);
	var rgbfn = function(bpz) {
	    var retval = new Array(4);
	    var i = getI(bpz, imagecanvas.width, imagecanvas.height);
	    retval[0] = imgData.data[i+0];
	    retval[1] = imgData.data[i+1];
	    retval[2] = imgData.data[i+2];
	    retval[3] = imgData.data[i+3];
	    return retval;
	}
	var images = rpipToRGBA(rpip, rbidata, rgbfn);
	var idata1 = mapcontext.createImageData(N, N);
	for(var i = 0; i < rbidata.length; i++) {
            idata1.data[i] = rbidata[i];
	}
	mapcontext.putImageData(idata1, 0, 0);
	this.cpi = cpinfo(bpwidget.zs);
	var cps = this.cpi.cps;
	var cvs = this.cpi.cvs;
	var cvangles = this.cpi.cvangles;
	var id = mapcontext.createImageData(1,1);
	id.data[0] = 255;
	id.data[1] = 255;
	id.data[2] = 255;
	id.data[3] = 255;

	var rs = numeric.linspace(0,1,256);
	for(var cvai = 0; cvai < cvangles.length; cvai++) {
	    var cv = cvangles[cvai];
	    var preimages = rs.map(function(r) { return preimage(bpwidget.zs, rt2c(r, cv))});
	    var np = [];
	    np = np.concat.apply(np, preimages)
	    var preimagesPixels = np.map(function(z) {return getXY2(fixy(z));});
	    for(var pii = 0; pii < preimagesPixels.length; pii++) {
		var pip = preimagesPixels[pii];
		mapcontext.putImageData(id, pip.x, pip.y);
	    }
	}
    });
    $("#goloadimage").click(function() {
	var request = new XMLHttpRequest();
	var url = $("#loadimage").val();
	request.open('GET', url, true);
	request.onreadystatechange = function() {
            // Makes sure the document is ready to parse.
            if(request.readyState == 4) {
		// Makes sure it's found the file.
		if(request.status == 200) {
		    loadCanvas(url);
		}
            }
	};
	request.send(null);
    });
});
