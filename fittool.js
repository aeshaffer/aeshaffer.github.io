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