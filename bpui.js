
//zs = bpcompose(zeroonehalf, [c(0,0), c(.51, 0)] );

var zs;
var cpi;
var bpzs;

function cssscatter(canvas, pts, cssclass, doclear) {
    if(doclear == undefined || doclear) {
	$(canvas).parent('div').find("."+cssclass).remove();
    }
    var canvaswidth = $(canvas).width();
    var offset = canvaswidth/2;
    for(i in pts) {
	var z = pts[i];
	var x = z.x;
	var y = z.y == undefined ? 0: z.y;
	var div = $("<div />");
	div.addClass(cssclass);
	div.addClass("scatterpoint");
	div.attr("id", cssclass+i);
	div.css("top",  offset - offset*y);
	div.css("left", offset + offset*x);
	$(canvas).parent('div').append(div);
	var nudge = Math.floor(div.width()/2);
	div.css("top", div.position().top - nudge);
	div.css("left", div.position().left - nudge);
    }
    return $(canvas).parent('div').find("."+cssclass);
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
    $("#criticalpoints").empty();
    for(var i = 0; i < cpi.cps.length; i++) {
	var li = $("<li>");
	li.text(dcomplex(cpi.cps[i]));
	$("#criticalpoints").append(li);
    }    
    $("#zeroes").empty();
    for(var i = 0; i < zs.length; i++) {
	var li = $("<li>");
	li.text(dcomplex(zs[i]));
	$("#zeroes").append(li);
    }    
    $("#criticalvalues").empty();
    for(var i = 0; i < cpi.cvs.length; i++) {
	var li = $("<li>");
	li.text(dcomplex(cpi.cvs[i]));
	$("#criticalvalues").append(li);
    }   
    $("#criticalangles").empty();
    var rolledcvangles = roll(cpi.cvangles);
    for(var i = 0; i < cpi.cvangles.length; i++) {
	var li = $("<li>");
	li.text(round2(cpi.cvangles[i]) +"-" + round2(rolledcvangles[i]));
	var rgb = hsvToRgb(1.0*i/(cpi.cvangles.length), 1, 1);
	li.attr("id", "ca"+i);
	function H(n) { n = Math.round(n); return (n < 16 ? "0" : "") + n.toString(16); }
	var rgbstring = "#"+H(rgb[0]) + H(rgb[1]) + H(rgb[2]);
	li.css("background-color", rgbstring);
	$("#criticalangles").append(li);
    }   
}

function updatezero() {
    var unit = $("#rainbow").width() /2.0;
    var nudge = (1.0/2.0)*$(this).width();
    var zeroid = $(this).attr("id").replace("zero", "");
    var p = $(this).position();
    var newpos = {
	left: p.left + nudge,
	top: p.top + nudge
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

    cpi = cpinfo(zs);
    var cps = cpi.cps;
    var cvs = cpi.cvs;
    var cvangles = cpi.cvangles;

    displayTables(zs, cpi);
    
    var zerodivs = cssscatter($("#rainbow"), zs, "zero");
    zerodivs.addClass("draggable")
	.addClass("ui-draggable")
	.addClass("ui-widget-content")
	.draggable({containment: ".canvaswrapper", scroll: false,
		    stop: updatezero});

    for(var i = 0; i < zs.length; i++) {
	if(zs[i].abs().x == 0) {
	    $("#zero"+i).removeClass("draggable")
		.removeClass("ui-draggable")
		.removeClass("ui-widget-content")
		.addClass("zerozero")
		.draggable('disable');
	}
    }

    cssscatter($("#rainbow"), cpi.cps, "cp");
};

$(function() {

    zs = [
	// c(0, .25),
	c(-.5, -.5),
	c(0, .75),
	c(0,0),
	c(.5, 0)
    ];
    
    zeroonehalf = [
	c(0 ,0),
	c(.5,0)
    ];
    
    z = [
	c(0,0)
    ];
    
    // zs = zeroonehalf;

    rescatter(zs);
});

function resizeCanvases() {
    var N = $("#pixels").val();
    var cssN = $("#displaypixels").val();

    resize("range", N, cssN);
    resize("rainbow", N, cssN);
    resize("regions", N, cssN);
}

$(function() {
    resizeCanvases();
    rescatter(zs);
    $("#displaypixels").change(
	function() {resizeCanvases(); rescatter(zs);}
    );
    $("#pixels").change(
	function() {resizeCanvases(); rescatter(zs);}
    );
});

function resize(graphName, N, cssN) {
    $("#"+graphName).parent(".canvaswrapper")
	.css("width", cssN+"px")
	.css("height", cssN+"px");
    var graph = document.getElementById(graphName);
    $(graph).css("width", cssN+"px")
	.css("height", cssN+"px");
    graph.width = N;
    graph.height = N;
    drawPlots(bpzs, N, zs, cpi);
}

function drawPlots(bpzs, N, zs, cpi) {
    if(bpzs == undefined) {return;}
    var range = document.getElementById("range");
    var rangecxt = range.getContext("2d");
    var o0 = showRegions(rangecxt, bpzs.zs, bpzs.zs, cpi.cvangles);
    rangecxt.putImageData(o0.idata, 0, 0);
    scatter(rangecxt, cpi.cvs, "#000000", N);
    
    var regions = document.getElementById("rainbow");
    var regionscxt = regions.getContext("2d");
    var o1 = draweval(regionscxt, bpzs.zs, bpzs.bpzs);
    regionscxt.putImageData(o1.idata, 0, 0);
    scatter(regionscxt, cpi.cps, "#000000", N);
    scatter(regionscxt, zs, "#ffffff", N);
    
    var angles = document.getElementById("regions");
    var anglescxt = angles.getContext("2d");
    var o2 = showRegions(regionscxt, bpzs.zs, bpzs.bpzs, cpi.cvangles);
    //	var o2 = showRegions(regionscxt, bpzs.zs, bpzs.bpzs, [Math.PI/8, Math.PI/8+Math.PI/2, Math.PI/8 + 2*(Math.PI/2), Math.PI/8 + 3*(Math.PI/2)]);
    anglescxt.putImageData(o2.idata, 0, 0);
    scatter(anglescxt, cpi.cps, "#000000", N);
    scatter(anglescxt, zs, "#ffffff", N);    
}

function replot(zs, cpi) {

    var N = $("#pixels").val();
    var cssN = $("#displaypixels").val();

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

function round2(n) {
    return Math.round(n*100)/100;
}

function dcomplex(z) {
    return round2(z.x) + " " + round2(z.y) + "i" + " (" + round2(z.angle()) + ")";
}

$(function() {
    attachcanvasclicks();
    $("#plotbutton").click(function() {
	replot(zs, cpi);
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

function attachcanvasclicks() {
    var cf = function(e) {
	var z = zeroFromClick($(this), e);
	var val = bpeval(zs, c(z.x,z.y));
	$("#point").text(round2(z.x) + " " + round2(z.y) + "i");
	$("#dest").text(dcomplex(val) + " " + getangleindex(val.angle(), cpi.cvangles));	
    };
    var dc = function(e) {
	var z = zeroFromClick($(this), e);
	if(z.abs().x <=1) {
	    zs.push(z);
	    rescatter(zs);
	}
    }
    $("#rainbow").on("dblclick", dc);
    $("#regions").on("dblclick", dc);
    $("#rainbow").on("click", cf);
    $("#regions").on("click", cf);
    $("#clearpreimages").on("click", 
			    function(e) {
				cssscatter($("#regions"), [], "pi", true);
			    }
			   );
    var rangemd = false;
    $("#range")
	.on("mouseleave", function(e) {
	    rangemd = false;
	})
	.on("click", function(e) {
	    rangemd = !rangemd;
	})
	.on("mousemove", function(e) {
	    if(rangemd || e.which == 1) {
		var z = zeroFromClick($(this), e);
		var preimages = preimage(zs, z);
		var pidivs = cssscatter($("#regions"), preimages, "pi", false);
	    }
	});
};