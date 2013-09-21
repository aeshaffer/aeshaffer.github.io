var targetwidget;

function fitSetup() {
    setupCanvases($(".zeroesholder"));
    targetwidget = new FitWidget($("#targetdiv"));
    targetwidget.setup();
}

var FitWidget = function(obj) {
    BPWidgetSetup.call(this, obj);
    var that = this;
    this.zsstring.change(function() {
	that.zs = parseZsString(that.zsstring.val());
	that.rescatter();
    });
    this.plotDims = function() {
	return {N: 100, zoom: 3, windowN: 300, graphN: 300};
    }
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

function replotBoundaries() {
    var N = 256;
    var targetdata = bpBoundaryEval(getBPF(targetwidget.zs), N);
    var guessdata = bpBoundaryEval(getBPF(composewidget.zs), N);
    
    norms = getNorms(targetdata.zs, guessdata.zs);

    var maxI = maxdiff(norms);

    var maxT = targetdata.zs[maxI][0];

    $("#maxnormdiff").text(norms[maxI]);
    thetaplot = $.plot(
	$("#targetboundaryplot"), 
	[
	    {data: targetdata.thetas, label: "target"},
	    {data: guessdata.thetas,  label: "guess"},
	    {data: norms, label: "normdiff", yaxis: 2}
	], 
	{
	    series: { lines: {show: true}}, 
	    crosshair: { mode: "x"}, 
	    grid: {hoverable: true, autoHighlight: false}, 
	    yaxes: [
		{ min: 0, max: 2*Math.PI+3, tickDecimals: 2},
		{ 
		    min: 0, max: 2, 
		    alignTicksWithAxis: 1,
		    position: "right"
		}
	    ]
	}
    );

/*
    diffplot = $.plot($("#diffplot"), 
		      [
			  {data : norms}	       
		      ], 
		      {
			  crosshair: {mode: "x"},
			  grid: {hoverable: true, autoHighlight: false},
			  yaxis: {min: 0, max: 2, tickDecimals: 2}
		      });
*/
    
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

    $("#hovertheta").empty();
    $("#hovertheta").text(pos.x);
    $("#hovertheta").append("<br />");
    var ttheta = interp(dataset[0], pos.x);
    var gtheta = interp(dataset[1], pos.x);
    $("#hovertheta").append("Target: " + ttheta + "<br />");
    $("#hovertheta").append("Guess: " + gtheta + "<br />");
    var diffdata = dataset[2];
    var ndiff = interp(diffdata, pos.x);
    $("#hovertheta").append("Diff Norm: " + ndiff +"<br />");

}

function interp(series, x) {
    // Find the nearest points, x-wise
    var j;
    for (j = 0; j < series.data.length; ++j) {
	if (series.data[j][0] > x) {
	    break;
	}
    }
    
    // Now Interpolate
    
    var y,
    p1 = series.data[j - 1],
    p2 = series.data[j];
    
    if (p1 == null) {
	y = p2[1];
    } else if (p2 == null) {
	y = p1[1];
    } else {
	y = p1[1] + (p2[1] - p1[1]) * (x - p1[0]) / (p2[0] - p1[0]);
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
});