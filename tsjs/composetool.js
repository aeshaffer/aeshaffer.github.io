/// <reference path="bpui.ts" />
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
    var zs1 = outerwidget.zs;
    var zs2 = innerwidget.zs;
    var composedzs = bpcompose(zs1, zs2);
    composewidget.zs = composedzs;
    $("#composedzs").val(zsString(composedzs));
    $("#composedzs").change();
    $("#preimages tbody").empty();
    var composedobjs = bpcompose2(zs1, zs2);
    $("#preimages #ipimgs").attr('colspan', composedobjs.length);
    for (var i = 0; i < composedobjs.length; i++) {
        var o = composedobjs[i];
        var tr = $("<tr>");
        var td1 = $("<td class='outerzero'>");
        td1.text(dc(o.outerzero));
        tr.append(td1);
        for (var j = 0; j < o.preimages.length; j++) {
            var pimg = o.preimages[j];
            var td2 = $("<td class='innerpreimage'>");
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
    var overlay = $("#overlay")[0];
    overlay.getContext('2d').putImageData(image, 0, 0);
    var inneroverlay = $("#inneroverlay")[0];
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
        $("#permalink").attr("href", "./blaschke.html?" + qs);
    });
    $("#innerzs")
        .on("change", resizeMe)
        .on("change", function () {
        var qs = zsQueryStringFromString($(this).val());
        $("#innerpermalink").attr("href", "./blaschke.html?" + qs);
        doCompose();
    });
    $("#outerzs")
        .on("change", resizeMe)
        .on("change", function () {
        var qs = zsQueryStringFromString($(this).val());
        $("#outerpermalink").attr("href", "./blaschke.html?" + qs);
        doCompose();
    });
    $("#testbutton").on("click", function () {
        $("#outerzs").val(["0,0.75", "0,0", "0.5,0"].join("\n"));
        $("#innerzs").val(["-0.5,-0.5", "0,0"].join("\n"));
        $("#outerzs").change();
        $("#innerzs").change();
        doCompose();
        handleFinish();
    });
});
function doAutoPlot() { return $("#autoplot").is(":checked"); }
function handleFinish() {
    if (doAutoPlot()) {
        clearCanvas($(".rblines"));
        replot();
    }
    else {
        clearAllGraphs();
    }
}
var ComposeWidget = /** @class */ (function (_super) {
    __extends(ComposeWidget, _super);
    function ComposeWidget(obj) {
        var _this = _super.call(this, obj) || this;
        var that = _this;
        _this.plotregions = new JQuerySingletonWrapper($("#plotregions"));
        _this.plotregions.inner.on("change", function (e) {
            if (that.plotregions.inner.is(":checked")) {
                that.regions.parent("div").show();
            }
            else {
                that.regions.parent("div").hide();
            }
        });
        _this.plotregions.inner.change();
        _this.plotDims = function () {
            return { N: 150, zoom: 1, windowN: 300, graphN: 300 };
        };
        _this.updatezero = function (zdiv) {
            BPWidget.prototype.updatezero.call(this, zdiv);
            doCompose();
        };
        _this.addZero = function (z) {
            BPWidget.prototype.addZero.call(this, z);
            doCompose();
        };
        _this.dropzero = function (z) {
            BPWidget.prototype.dropzero.call(this, z);
            handleFinish();
        };
        _this.setAllDims();
        return _this;
    }
    return ComposeWidget;
}(EasyResizeWidget));
//# sourceMappingURL=composetool.js.map