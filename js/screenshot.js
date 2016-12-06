/// <reference path="numeric-1.2.3.js" />
function resizeAndCopy(mine, openers) {
	mine.width = openers.width; 
	mine.height = openers.height;
	var myctx = mine.getContext("2d");
	myctx.putImageData(openers.getContext("2d").getImageData(0,0,openers.width,openers.height),0,0);
	return mine;
}

function drawCircles(ssctx, zs, r, s) {
	for (var i = 0; i < zs.length; i++) {
		var z = zs[i];
		ssctx.beginPath(); 
		ssctx.arc(z.x*s,z.y*s,r,0,2.0*Math.PI); 
		ssctx.stroke();
		ssctx.fill();
	}
}

var ss;
var ssctx;

$(function() {


    if(!window.opener) {
		alert("blah");
    } else {
		var margin = 5;
    	var rainbow = window.opener.$("canvas.rainbow")[0];
    	var lines = window.opener.$("canvas.rblines")[0];
    	ss = $("#screenshot")[0];
    	ss.width = rainbow.width + 2*margin;
    	ss.height = rainbow.height + 2*margin;
		var mylines = resizeAndCopy($("#lines")[0], lines);
		var myrainbow = resizeAndCopy($("#rainbow")[0], rainbow);
    	ssctx = ss.getContext("2d");
    	ssctx.drawImage(myrainbow, margin, margin);
    	ssctx.drawImage(mylines,margin, margin);
    	var zs = window.opener.bpwidget.zs;
		var zsdelta = new numeric.T(margin, margin);
		//zs = zs.map(function(z) { return xy2c(z).add(zsdelta);});	
    	var cpi = window.opener.bpwidget.cpi;
    	var s = rainbow.width / 2.0;
    	ssctx.translate(margin + (myrainbow.width)/ 2.0, margin + myrainbow.height / 2.0);
    	ssctx.scale(1.0, -1.0);
    	ssctx.lineWidth=1;
    	var r = 5;
    	var lw = 1;
    	if(rainbow.width >= 900) { r = 10; lw=2; }
    	ssctx.lineWidth = lw;
		ssctx.strokeStyle="white";
		ssctx.fillStyle="white";
		drawCircles(ssctx, zs, r+2, s);
		ssctx.strokeStyle="black";
		ssctx.fillStyle="white";
		drawCircles(ssctx, zs, r, s);
		if(!window.opener.bpwidget.hidecps.is(":checked")) {
			ssctx.strokeStyle="black";
			ssctx.fillStyle="grey";
			drawCircles(ssctx, cpi.cps, r, s);
		}
		ssctx.lineWidth = 2;
		ssctx.beginPath();
		ssctx.arc(0,0,(rainbow.width)/2.0, 0, 2.0*Math.PI);
		ssctx.stroke();
    }
    $("#download").attr("href",ss.toDataURL("image/png"));

});
