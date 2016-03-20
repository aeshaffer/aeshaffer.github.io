/// <reference path="bpui.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
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
    $(this).attr("rows", $(this).val().split("&").length);
    var ns = $(this).val().replace(/\n/g, "").replace(/&/g, "\n&");
    $(this).val(ns);
}
function replot() {
    outerwidget.replotMe();
    innerwidget.replotMe();
    composewidget.replotMe();
    var innerdata = innerwidget.regions[0].getContext('2d').getImageData(0, 0, 300, 300);
    var image = composewidget.regions[0].getContext('2d').getImageData(0, 0, 300, 300);
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
        clearCanvas($(".graph"));
    });
    $("#plotallbutton").on("click", replot);
    $("#composebutton").on("click", doCompose);
    $("#composedzs")
        .on("change", resizeMe)
        .on("change", function () {
        $("#permalink").attr("href", "./blaschke.html?" + $(this).val());
    });
    $("#innerzs")
        .on("change", resizeMe)
        .on("change", function () {
        $("#innerpermalink").attr("href", "./blaschke.html?" + $(this).val());
    });
    $("#outerzs")
        .on("change", resizeMe)
        .on("change", function () {
        $("#outerpermalink").attr("href", "./blaschke.html?" + $(this).val());
    });
    $("#testbutton").on("click", function () {
        $("#outerzs").val("z=-0.5,-0.5&z=0,0.75&z=0,0&z=0.5,0");
        $("#innerzs").val("z=-0.5,-0.5&z=0,0.75&z=0,0&z=0.5,0");
        $("#outerzs").change();
        $("#innerzs").change();
    });
});
function redisplay() {
    doCompose();
    if ($("#autoplot").is(":checked")) {
        replot();
    }
}
var ComposeWidget = (function (_super) {
    __extends(ComposeWidget, _super);
    function ComposeWidget(obj) {
        _super.call(this, obj, false);
        var setdims = function (i, e) { e.width = 300; e.height = 300; };
        this.rainbow.each(setdims);
        this.regions.each(setdims);
        this.regions.each(setdims);
        this.rblines.each(setdims);
        $("#overlay").each(setdims);
        $("#inneroverlay").each(setdims);
        this.plotDims = function () {
            return { N: 150, zoom: 1, windowN: 300, graphN: 300 };
        };
        this.resizeCanvases = function () {
            resize(this.rainbow, this.plotDims());
            resize(this.rblines, this.plotDims());
            resize(this.regions, this.plotDims());
        };
        this.updatezero = function (zdiv) {
            BPWidget.prototype.updatezero.call(this, zdiv);
            redisplay();
        };
        this.addZero = function (z) {
            BPWidget.prototype.addZero.call(this, z);
            redisplay();
        };
        var that = this;
        this.zsstring.change(function () {
            that.zs = parseZsString(that.zsstring.val());
            that.rescatter();
        });
    }
    return ComposeWidget;
}(BPWidget));
//# sourceMappingURL=composetool.js.map