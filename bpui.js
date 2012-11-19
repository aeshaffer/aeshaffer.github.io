
//zs = bpcompose(zeroonehalf, [c(0,0), c(.51, 0)] );

function cssscatter(canvas, pts, cssclass) {
    $(canvas).parent('div').find("."+cssclass).remove();
    var N = $(canvas).width();
    var offset = N/2;
    for(i in pts) {
	var z = pts[i];
	var x = z.x;
	var y = z.y == undefined ? 0: z.y;
	var div = $("<div />");
	div.addClass(cssclass);
	div.attr("id", cssclass+i);
	div.css("top", N/2 - (N/2)*y);
	div.css("left", N/2 + (N/2)*x);
	$(canvas).parent('div').append(div);
	var nudge = Math.floor(div.width()/2);
	div.css("top", div.position().top - nudge);
	div.css("left", div.position().left - nudge);
    }
    return $(canvas).parent('div').find("."+cssclass);
}

function scatter(ctx, pts, color, Nover2) {
    ctx.save();
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


var N = 100;

function display(zs, cpi) {
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
	li.css("background-color", "rgb("+rgb[0]+","+rgb[1]+","+rgb[2]+")");
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

    display(zs, cpi);
    

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

var cpi;

var zs;

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

var go = function(zs, cpi) {

    function resize(graph) {
	graph.style.width = 2*N;
	graph.style.height = 2*N;
	graph.width = 2*N;
	graph.height = 2*N;
    }


    var ctx;
    if(true) {
	bpzs = bpgrideval(2*N, zs);

	var range = document.getElementById("range");
	var rangecxt = range.getContext("2d");
	resize(range);
	var o0 = showRegions(rangecxt, bpzs.zs, bpzs.zs, cpi.cvangles);
	rangecxt.putImageData(o0.idata, 0, 0);

	var regions = document.getElementById("rainbow");
	var regionscxt = regions.getContext("2d");
	resize(regions);
	var o1 = draweval(regionscxt, bpzs.zs, bpzs.bpzs);
	regionscxt.putImageData(o1.idata, 0, 0);
	scatter(regionscxt, cpi.cps, "#000000", N);
	scatter(regionscxt, zs, "#ffffff", N);
	
	var angles = document.getElementById("regions");
	var anglescxt = angles.getContext("2d");
	resize(angles);
	var o2 = showRegions(regionscxt, bpzs.zs, bpzs.bpzs, cpi.cvangles);
	//	var o2 = showRegions(regionscxt, bpzs.zs, bpzs.bpzs, [Math.PI/8, Math.PI/8+Math.PI/2, Math.PI/8 + 2*(Math.PI/2), Math.PI/8 + 3*(Math.PI/2)]);
	anglescxt.putImageData(o2.idata, 0, 0);
	scatter(anglescxt, cpi.cps, "#000000", N);
	scatter(anglescxt, zs, "#ffffff", N);
	
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
	go(zs, cpi);
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
};