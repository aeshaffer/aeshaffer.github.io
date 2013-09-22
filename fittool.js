var targetwidget;

function fitSetup() {
    setupCanvases($("#targetdiv .zeroesholder"));
    targetwidget = new FitWidget($("#targetdiv"));
    targetwidget.setup();
    composewidget.zsstring.change(replotBoundaries);
    var urlZS = window.location.search.replace(/^\?/, '');
    var ozs = parseZsString(urlZS, "Oz");
    var izs = parseZsString(urlZS, "Iz");
    var tzs = parseZsString(urlZS, "Tz");

    if(ozs.length > 0) { outerwidget.zs = ozs; outerwidget.rescatter(); }
    if(izs.length > 0) { innerwidget.zs = izs; innerwidget.rescatter(); }
    if(tzs.length > 0) { targetwidget.zs = tzs; targetwidget.rescatter(); }

    replotBoundaries();
}

var FitWidget = function(obj) {
    BPWidgetSetup.call(this, obj);
    var that = this;
    this.zsstring.change(function() {
	that.zs = parseZsString(that.zsstring.val());
	that.rescatter();
	replotBoundaries();
    });
    this.plotDims = function() {
	return {N: 100, zoom: 3, windowN: 300, graphN: 300};
    }
}

function getflips(ts) {

    // Find all points in data1 where we go from 2Pi back to zero.
    // collect the indices where the function is "at zero."
    var flippoints = new Array();

    var l;
    var r;

    for(var r = 0; r < ts.length; r++) {
	l = (r - 1 + ts.length) % ts.length;
	if(ts[l] > ts[r]) {
	    flippoints.push(r);
	}
    }
    
    return flippoints
}

FitWidget.prototype = new BPWidget();

var thetaplot;
var diffplot;

function maxdiff(norms) {
    var maxnorm = 0;
    var outi = 0;
    var n;
    for(var i = 0; i < norms.length; i++) {
	n = norms[i][1];
	if(n > maxnorm) {
	    outi = i; maxnorm = n;
	}
    }
    return outi;
}

function getNorms(data1, data2) {
    var norms = new Array(data1.length);
    var t;
    var n = 0;
    for(var i = 0; i < data1.length; i++) {
	t = data1[i][0];
	n = data1[i][1].sub(data2[i][1]).abs().x;
	norms[i] = [t, n];
    }
    return norms;
}

function rotArray(A, n) {
    var retval = new Array(A.length);
    for(var i = 0; i < A.length; i++) {
	retval[i] = A[(i+n) % A.length];
    }
    return retval;
}

function rotArrayValues(A, n) {
    var retval = new Array(A.length);
    for(var i = 0; i < A.length; i++) {
	retval[i] = [A[i][0], A[(i+n) % A.length][1]];
    }
    return retval;

}

var targetdata;
var targetBPF;
var guessdata;
var guessBPF;

function replotBoundaries() {
    var N = 1024;
    targetBPF = getBPF(targetwidget.zs, $("#correct").is(":checked"));
    guessBPF = getBPF(composewidget.zs, $("#correct").is(":checked"));
    targetdata = bpBoundaryEval(targetBPF, N);
    guessdata = bpBoundaryEval(guessBPF, N);

    var getz = function(tz) { return tz[1]; }
    var targetflips = getflips(targetdata.thetas.map(getz));
    var guessflips = getflips(guessdata.thetas.map(getz));

    var shiftedGuessThetas;
    var norms;
    var maxNorm = 4; // Anything bigger than 2.

    for(var fi = 0; fi < guessflips.length; fi++) {
	var s = (guessflips[fi] - targetflips[0] + guessdata.thetas.length) % guessdata.thetas.length;
	var s = 0;
	var shiftedGuessZs = rotArray(guessdata.zs, s);
	var norms0 = getNorms(targetdata.zs, shiftedGuessZs);
	var maxI = maxdiff(norms0);	
	var maxNorm0 = norms0[maxI][1];
	if(maxNorm0 < maxNorm) {
	    maxNorm = maxNorm0;
	    norms = norms0;
	    shiftedGuessThetas = rotArrayValues(guessdata.thetas, s);
	}
    }

    $("#maxnormdiff").text(maxNorm);
    thetaplot = $.plot(
	$("#targetboundaryplot"), 
	[
	    {data: targetdata.thetas, label: "target"},
	    {data: shiftedGuessThetas,  label: "guess"},
	    {data: norms, label: "normdiff", yaxis: 2}
	], 
	{
	    series: { lines: {show: true}}, 
	    crosshair: { mode: "xy"}, 
	    grid: {hoverable: true, autoHighlight: false}, 
	    yaxes: [
		{ 
		    min: 0, max: 3*Math.PI,
		    ticks: [
			0, [ Math.PI/2, "\u03c0 / 2" ], [ Math.PI, "\u03c0" ],
			[ Math.PI * 3/2, "3\u03c0 / 2" ], [ Math.PI * 2, "2\u03c0" ],
			[ Math.PI * 5/2, ""], [Math.PI * 6/2, ""]
		    ]
		},
		{ 
		    min: 0, max: 2, 
		    alignTicksWithAxis: 1,
		    position: "right"
		}
	    ],
	    xaxis : { ticks: [
		[ -4*Math.PI/4, "-\u03c0" ], [ -3*Math.PI/4, "-3 \u03c0 / 4" ],
		[ -2*Math.PI/4, "-\u03c0 / 2" ], [ -1*Math.PI/4, "-\u03c0 / 4" ],
		0, 
		[ 1*Math.PI/4, "\u03c0 / 4" ],
		[ 2*Math.PI/4, "\u03c0 / 2" ], 
		[ 3*Math.PI/4, "3 \u03c0 / 4" ],
		[ 4*Math.PI/4, "\u03c0" ]
 	    ]}
	}
    );
}

// from www.flotcharts.org/flot/examples/tracking/index.html
var updateLegendTimeout = null;
function updateLegend() {

    var plot = thetaplot;

    updateLegendTimeout = null;
    
    var pos = latestPosition;
    
    var axes = plot.getAxes();
    if (pos.x < axes.xaxis.min || pos.x > axes.xaxis.max ||
	pos.y < axes.yaxis.min || pos.y > axes.yaxis.max) {
	return;
    }
    
    var dataset = plot.getData();

    var targetz = targetBPF(ttcp(pos.x));
    var guessz = guessBPF(ttcp(pos.x));
    var diff = targetz.sub(guessz);
    
    $("#hovertheta").empty();
    var tbl = $("#hovertheta").append("<table />");
    tbl.append("<tr><td>Theta</td><td>"+pos.x+"</td>")
	.append("<tr><td>Left</td><td>"+pos.y1+"</td>")
	.append("<tr><td>Right</td><td>"+pos.y2+"</td>")
	.append("<tr><td>Target Z:</td><td>"+dcomplex(targetz)+"</td></tr>")
	.append("<tr><td>Guess Z:</td><td>"+dcomplex(guessz)+"</td></tr>")
	.append("<tr><td>Diff:</td><td>"+dcomplex(diff)+"</td></tr>")
	.append("<tr><td>Abs:</td><td>"+diff.abs().x+"</td></tr>");
}

function getj(series, x) {
    var j;
    for (j = 0; j < series.data.length; ++j) {
	if (series.data[j][0] > x) {
	    return j;
	}
    }
    return j;
}

function interp(series, x) {
    // Find the nearest points, x-wise
    var j = getj(series, x);
    // Now Interpolate
    
    var y,
    p1 = series.data[j - 1],
    p2 = series.data[j];
    
    if (p1 == null) {
	y = p2[1];
    } else if (p2 == null) {
	y = p1[1];
    } else {
	y = p1[1];
//	y = p1[1] + (p2[1] - p1[1]) * (x - p1[0]) / (p2[0] - p1[0]);
    }
    return y;
}

var latestPosition;
$(function() {
    $("#targetboundaryplot, #diffplot").on("plothover", function(e, p, i) {
	latestPosition = p;
	if(!updateLegendTimeout) {
	    updateLegendTimeout = setTimeout(updateLegend, 50);
	}
    });
    $("#plotallbutton").on("click", function() {targetwidget.replotMe();});
    $("#plottargetboundary").on("click", replotBoundaries);
    $("#copybutton").on("click", function() {
	targetwidget.zsstring.val(composewidget.zsstring.val());
	targetwidget.zsstring.change();});
});