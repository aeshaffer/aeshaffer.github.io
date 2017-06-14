/// <reference path="bpui.ts" />

var outerwidget: BPWidget;
var innerwidget: BPWidget;
var composewidget: BPWidget;

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
    var zs1 = outerwidget.zs;
    var zs2 = innerwidget.zs;
    var composedzs = bpcompose(zs1, zs2);
    $("#composedzs").val(zsString(composedzs));
    $("#composedzs").change();
    $("#preimages tbody").empty();
    var composedobjs = bpcompose2(zs1, zs2);
    $("#preimages #ipimgs").attr('colspan', composedobjs.length);
    for (var i = 0; i < composedobjs.length; i++) {
        var o = composedobjs[i];
        var tr = $("<tr>");
        var td1 = $("<td>");
        td1.text(dc(o.outerzero));
        tr.append(td1);
        for (var j = 0; j < o.preimages.length; j++) {
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
    var zs = parseZsString($(this).val());
    $(this).attr("rows", zs.length);    
}

function replot() {
    outerwidget.resizeRescatterAndReplotMe();
    innerwidget.resizeRescatterAndReplotMe();
    composewidget.resizeRescatterAndReplotMe();
    var innerdata = innerwidget.regions.element.getContext('2d').getImageData(0, 0, 300, 300);
    var image = composewidget.regions.element.getContext('2d').getImageData(0, 0, 300, 300);

    var overlay = <HTMLCanvasElement>$("#overlay")[0];
    overlay.getContext('2d').putImageData(image, 0, 0);
    var inneroverlay = <HTMLCanvasElement>$("#inneroverlay")[0];
    inneroverlay.getContext('2d').putImageData(innerdata, 0, 0);
}

$(function () {

    $(".clearplots").on("click", function () {
        outerwidget.resizeCanvasesRescatter();
        innerwidget.resizeCanvasesRescatter();
        composewidget.resizeCanvasesRescatter();
        clearAllGraphs();
    });

    $("#plotallbutton").on("click", replot);
    $("#composedzs")
        .on("change", resizeMe)
        .on("change", function () {
            var qs = zsQueryStringFromString($(this).val());
            $("#permalink").attr("href", "./blaschke.html?" + $(this).val());
        });
    $("#innerzs")
        .on("change", resizeMe)
        .on("change", function () {
            var qs = zsQueryStringFromString($(this).val());
            $("#innerpermalink").attr("href", "./blaschke.html?" + qs);
        });
    $("#outerzs")
        .on("change", resizeMe)
        .on("change", function () {
            var qs = zsQueryStringFromString($(this).val());
            $("#outerpermalink").attr("href", "./blaschke.html?" + $(this).val());
        });
    $("#testbutton").on("click", function () {
        $("#outerzs").val(["-0.5,-0.5", "0,0.75", "0,0", "0.5,0"].join("\n"));
        $("#innerzs").val(["-0.5,-0.5", "0,0.75", "0,0", "0.5,0"].join("\n"));
        $("#outerzs").change();
        $("#innerzs").change();
        handleFinish();
    });
});

function doAutoPlot() { return $("#autoplot").is(":checked"); }

function handleFinish() {
    if (doAutoPlot()) {
        clearCanvas($(".rblines"));
        replot();
    } else { 
        clearAllGraphs(); 
    }
}

class ComposeWidget extends EasyResizeWidget {
    setAllDims: Function;
    plotregions: JQuerySingletonWrapper<HTMLInputElement>;
    constructor(obj) {
        super(obj);

        var that = this;

        this.plotregions = new JQuerySingletonWrapper<HTMLInputElement>($("#plotregions"));

        this.plotregions.inner.on("change", function (e) {
            if (that.plotregions.inner.is(":checked")) {
                that.regions.parent("div").show();
            } else {
                that.regions.parent("div").hide();
            }
        });

        this.plotregions.inner.change();

        this.plotDims = function () {
            return { N: 150, zoom: 1, windowN: 300, graphN: 300 };
        }
        this.updatezero = function (zdiv) {
            BPWidget.prototype.updatezero.call(this, zdiv);
            doCompose();
        }
        this.addZero = function (z) {
            BPWidget.prototype.addZero.call(this, z);
            doCompose();
        }
        this.dropzero = function (z) {
            BPWidget.prototype.dropzero.call(this, z);
            handleFinish();
        }
        this.setAllDims();
    }
}
