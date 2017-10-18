/// <reference path="jquery.d.ts" />
/// <reference path="numeric-1.2.3.d.ts" />


function resizeAndCopy(mine, openers) {
	mine.width = openers.width;
	mine.height = openers.height;
	var myctx = mine.getContext("2d");
	myctx.putImageData(openers.getContext("2d").getImageData(0, 0, openers.width, openers.height), 0, 0);
	return mine;
}

function drawCircles(ssctx, zs, r) {
	for (var i = 0; i < zs.length; i++) {
		var z = zs[i];
		ssctx.beginPath();
		ssctx.arc(z.x, z.y, r, 0, 2.0 * Math.PI);
		ssctx.stroke();
		ssctx.fill();
	}
}

$(function () {


	if (!parent.window.opener) {
		alert("No Window Opener!");
	} else {
		var margin = 5;
		var rainbow = <HTMLCanvasElement>window.opener.$("canvas.rainbow")[0];
		var lines = <HTMLCanvasElement>window.opener.$("canvas.rblines")[0];
		var ss = <HTMLCanvasElement>$("#screenshot")[0];
		ss.width = lines.width + 2 * margin;
		ss.height = lines.height + 2 * margin;

		// Copy the canvas image data into local canvases.
		var mylines = resizeAndCopy($("#lines")[0], lines);
		var myrainbow = resizeAndCopy($("#rainbow")[0], rainbow);

		var ssctx = ss.getContext("2d");
		// Redraw the images, scaled.
		ssctx.drawImage(myrainbow,
			margin, margin,
			lines.width, lines.height);
		ssctx.drawImage(mylines,
			margin, margin,
			lines.width, lines.height);

		var zs = window.opener.bpwidget.zs;
		var cpi = window.opener.bpwidget.cpi;

		// Circle 
		// Move to the center of the canvas		
		ssctx.translate((ss.width) / 2.0, ss.height / 2.0);
		// Scale so that the *lines* width is 1 unit.
		var s = lines.width / 2.0;
		ssctx.scale(s, -s);
		var unitsPerPixel = 1.0 / s;
		ssctx.lineWidth = 1;
		var rdelta = 2 * unitsPerPixel;
		var r = 5.0 * unitsPerPixel;
		var lw = 1 * unitsPerPixel;
		if (lines.width >= 900) {
			r *= 2;
			lw *= 2;
		}

		ssctx.lineWidth = lw;
		ssctx.strokeStyle = "white";
		ssctx.fillStyle = "white";
		drawCircles(ssctx, zs, r + rdelta);

		ssctx.strokeStyle = "black";
		ssctx.fillStyle = "white";
		drawCircles(ssctx, zs, r);

		// if (!window.opener.bpwidget.hidecps.is(":checked")) {
		// 	ssctx.strokeStyle = "black";
		// 	ssctx.fillStyle = "grey";
		// 	drawCircles(ssctx, cpi.cps, r, s);
		// }
		ssctx.lineWidth = 4 * lw;
		ssctx.beginPath();
		ssctx.arc(0, 0, 1, 0, 2.0 * Math.PI);
		ssctx.stroke();
		$("#download").attr("href", ss.toDataURL("image/png"));
	}
});
