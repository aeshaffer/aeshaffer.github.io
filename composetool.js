var outerwidget;
var innerwidget;
var composewidget;

function composeSetup() {
    setupCanvases($("#outerzeroesdiv .rainbowholder"));
    setupCanvases($("#innerzeroesdiv .rainbowholder"));
    setupCanvases($("#composeddiv    .rainbowholder"));    
    setupRegions($("#outerzeroesdiv .regionsholder"));
    setupRegions($("#innerzeroesdiv .regionsholder"));
    setupRegions($("#composeddiv    .regionsholder"));    
    outerwidget = new ComposeWidget($("#outerzeroesdiv"));
    innerwidget = new ComposeWidget($("#innerzeroesdiv"));
    composewidget = new ComposeWidget($("#composeddiv"));
    outerwidget.setup();
    innerwidget.setup();
    composewidget.setup();
    doCompose();
}

function doCompose() {
    var zss1 = $("#outerzs").val();
    var zss2 = $("#innerzs").val();
    var zs1 = parseZsString(zss1);
    var zs2 = parseZsString(zss2);
    var composedzs = bpcompose(zs1, zs2);
    $("#composedzs").val(zsString(composedzs));
    $("#composedzs").change();
    $("#preimages tbody").empty();
    var composedobjs = bpcompose2(zs1, zs2);
    $("#preimages #ipimgs").attr('colspan', composedobjs.length);
    for(var i = 0; i < composedobjs.length; i++) {
	var o = composedobjs[i];
	var tr = $("<tr>");
	var td1 = $("<td>");
	td1.text(dc(o.outerzero));
	tr.append(td1);
	for(var j = 0; j < o.preimages.length; j++) {
	    var pimg = o.preimages[j];
	    var td2 = $("<td>");
	    td2.text(dc(pimg));
	    tr.append(td2);
	}
	$("#preimages tbody").append(tr);
    }
    composewidget.rescatter();
}

function resizeMe() {
    $(this).attr("rows", $(this).val().split("&").length);
    var ns = $(this).val().replace(/\n/g, "").replace(/&/g, "\n&");
    $(this).val(ns);
}

function replot() {
    outerwidget.replotMe();
    innerwidget.replotMe();
    composewidget.replotMe();
    var innerdata = innerwidget.regions[0].getContext('2d').getImageData(0,0,300,300);
    var image = composewidget.regions[0].getContext('2d').getImageData(0,0,300,300);

    $("#overlay")[0].getContext('2d').putImageData(image, 0, 0);
    $("#inneroverlay")[0].getContext('2d').putImageData(innerdata, 0, 0);
}

$(function() {
    
    $("#plotallbutton").on("click", replot);
    $("#composebutton").on("click", doCompose);
    $("#composedzs")
	.on("change", resizeMe)
	.on("change", function() {
		$("#permalink").attr("href", "./blaschke.html?"+$(this).val());
	    });
    $("#innerzs")
	.on("change", resizeMe)
	.on("change", function() {
		$("#innerpermalink").attr("href", "./blaschke.html?"+$(this).val());
	    });    
    $("#outerzs")
	.on("change", resizeMe)
	.on("change", function() {
		$("#outerpermalink").attr("href", "./blaschke.html?"+$(this).val());
	    });   
    $("#testbutton").on("click", function() {
	$("#outerzs").val("z=-0.5,-0.5&z=0,0.75&z=0,0&z=0.5,0");
	$("#innerzs").val("z=-0.5,-0.5&z=0,0.75&z=0,0&z=0.5,0");
	$("#outerzs").change();
	$("#innerzs").change();
    });    
});

function redisplay() {
    doCompose();
    if($("#autoplot").is(":checked")) {
	replot();
    }
}

var ComposeWidget = function(obj) {
    BPWidgetSetup.call(this, obj);
    this.rainbow[0].width = 300;
    this.rainbow[0].height = 300;
    this.regions[0].width = 300;
    this.regions[0].height = 300;
    $("#overlay")[0].width = 150;
    $("#overlay")[0].height = 150;
    $("#inneroverlay")[0].width = 150;
    $("#inneroverlay")[0].height = 150;
    this.plotDims = function() {
	return {N: 150, zoom: 1, windowN: 300, graphN: 300};
    }
    this.resizeCanvases = function() {
	resize(this.rainbow, this.plotDims());
	resize(this.rblines, this.plotDims());
	resize(this.regions, this.plotDims());	
    }
    this.updatezero = function(zdiv) {
	BPWidget.prototype.updatezero.call(this, zdiv);
	redisplay();
    }
    this.addZero = function(z) {
	BPWidget.prototype.addZero.call(this, z);
	redisplay();
    }
    var that = this;
    this.zsstring.change(function() {
	that.zs = parseZsString(that.zsstring.val());
	that.rescatter();
    });
}

ComposeWidget.prototype = new BPWidget();