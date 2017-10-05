/// <reference path="interpolation2.ts" />
/// <reference path="jquery.d.ts" />
/// <reference path="blaschke.ts" />
/// <reference path="polynomials.ts" />
/// <reference path="bpui.ts" />
/// <reference path="composetool.ts" />
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
var widget;
var InterpolationWidget = /** @class */ (function (_super) {
    __extends(InterpolationWidget, _super);
    function InterpolationWidget(obj) {
        var _this = _super.call(this, obj) || this;
        _this.plotDims = function () {
            return { N: 301, zoom: 1, windowN: 301, graphN: 301 };
        };
        _this.setAllDims();
        return _this;
    }
    return InterpolationWidget;
}(EasyResizeWidget));
function interpolationSetup() {
    setupCanvases($("#zeroesdiv .rainbowholder"));
    widget = new InterpolationWidget($("#zeroesdiv"));
    widget.setup();
    widget.zsstring.val("z=0,0").change();
}
var delta = 2 * Math.PI / 7;
var alphas = [0 * delta, 1 * delta, 2 * delta, 3 * delta, 4 * delta, 5 * delta];
var betas = alphas.map(function (t) { return t + delta / 2; });
var alphas2 = [0, Math.PI / 2];
var betas2 = [Math.PI / 6, Math.PI];
var alphas3 = [1.570796327,
    3.141592654,
    4.71238898,
];
var betas3 = [2.35619449,
    3.926990817,
    5.497787144
];
function cleanepsilons(z) {
    var nx = (Math.abs(z.x) < 0.00001) ? 0 : z.x;
    var ny = (Math.abs(z.y) < 0.00001) ? 0 : z.y;
    return c(nx, ny);
}
function getZs(sel) {
    return $(sel).val().split("\n").filter(function (z) { return z.length > 0; }).map(parseFloat);
}
function drawTicksCanvas(alphasbetas, bpf, N, widgetCanvas) {
    var tickscanvas = $("#tickscanvas")[0];
    var ticksctx = tickscanvas.getContext('2d');
    var tN = tickscanvas.width;
    ticksctx.clearRect(0, 0, tN, tN);
    ticksctx.drawImage(widgetCanvas, (tN - N) / 2, (tN - N) / 2);
    ticksctx.strokeStyle = "black";
    ticksctx.beginPath();
    ticksctx.moveTo(0, tN / 2);
    ticksctx.moveTo(tN, tN / 2);
    ticksctx.stroke();
    ticksctx.beginPath();
    ticksctx.moveTo(tN / 2, 0);
    ticksctx.moveTo(tN / 2, tN);
    ticksctx.stroke();
    ticksctx.save();
    ticksctx.translate(tN / 2, tN / 2);
    ticksctx.scale(N / 2, -N / 2);
    for (var _i = 0, alphasbetas_1 = alphasbetas; _i < alphasbetas_1.length; _i++) {
        var theta = alphasbetas_1[_i];
        var z = t2c(theta);
        var z2 = z.mul(1.05).mul(t2c(Math.PI / 64));
        var z3 = z.mul(1.05).mul(t2c(-Math.PI / 64));
        var bpz = bpf(z);
        var xy = c2xyArray(z);
        var x = xy[0];
        var y = xy[1];
        var hue = anglehue(bpz);
        var rgb = hsvToRgbString(hue, 1, 1);
        ticksctx.beginPath();
        ticksctx.fillStyle = rgb;
        // Nudge the tickmarks in a few pixels so it
        // overlaps the fuzzy edges.
        ticksctx.moveTo((1 - 4.0 / N) * x, (1 - 4.0 / N) * y);
        ticksctx.lineTo(z2.x, z2.y);
        ticksctx.lineTo(z3.x, z3.y);
        ticksctx.lineWidth = 4 / 150.0;
        ticksctx.fill();
    }
    ticksctx.restore();
}
function checkAlphasBetas(alphas, betas, alphasbetas) {
    if (alphas.length != betas.length) {
        alert("The two lists must be of identical length.");
        return false;
    }
    if (alphasbetas.filter(function (x) { return x < 0 || x > Math.PI * 2; }).length > 0) {
        alert("All angles must be between 0 and 2*Pi");
        return false;
    }
    for (var i = 0; i < alphas.length; i++) {
        var alpha = alphas[i];
        var nextbeta = betas[i];
        if (i == 0) {
            if (!(alpha < nextbeta)) {
                alert("Points must be interspersed: " + alpha + "<" + nextbeta);
                return false;
            }
        }
        else {
            var prevbeta = i == 0 ? 0 : betas[(alphas.length + i - 1) % alphas.length];
            if (!(prevbeta < alpha && alpha < nextbeta)) {
                alert("Points must be interspersed: " + prevbeta + "<" + alpha + "<" + nextbeta);
                return false;
            }
        }
    }
    return true;
}
$(function () {
    $("#alphas, #betas").change(function () {
        $(this).attr("rows", getZs(this).length);
    });
    $("#demo").click(function () {
        $("#alphas").val(alphas.join("\n")).change();
        $("#betas").val(betas.join("\n")).change();
    });
    $("#demo2").click(function () {
        $("#alphas").val(alphas2.join("\n")).change();
        $("#betas").val(betas2.join("\n")).change();
    });
    $("#demo3").click(function () {
        $("#alphas").val(alphas3.join("\n")).change();
        $("#betas").val(betas3.join("\n")).change();
    });
    $("#interpolate").click(function () {
        var alphas = getZs("#alphas");
        var betas = getZs("#betas");
        var alphasbetas = alphas.concat(betas).sort(o);
        if (!checkAlphasBetas(alphas, betas, alphasbetas)) {
            return;
        }
        var retval = interpolate([alphas, betas]);
        // var bpzs0 = <BPZeroes>(retval.zeroes);
        // var bpf0 = getBPF(bpzs0);
        // var valueAlpha = bpf0(t2c(alphas[0]));
        // var valueBeta = bpf0(t2c(betas[0]));
        // var ws = [nzero, valueAlpha, valueBeta];
        // var zs = [nzero, none, none.mul(-1)];
        // var phi = gettransform(ws, zs);
        var bpzs = (retval.zeroes.map(function (z) { return z; }));
        var bpf = getBPF(bpzs);
        var values = alphasbetas.map(t2c).map(bpf).map(cleanepsilons);
        var zs2 = retval.zeroes.map(cleanepsilons);
        $("#zsstring")
            .val(zsString(zs2))
            .change();
        widget.resizeCanvasesRescatter();
        widget.resizeRescatterAndReplotMe();
        drawTicksCanvas(alphasbetas, bpf, widget.plotDims().graphN, widget.rainbow.element);
        fillTable(alphasbetas, bpf);
    });
    $("#zsstring").change(function () {
        $("#permalink").attr("href", "./blaschke.html?" + $(this).val());
    });
});
function fillTable(alphasbetas, bpf) {
    $("#valuestable tbody").empty();
    var even = true;
    for (var _i = 0, alphasbetas_2 = alphasbetas; _i < alphasbetas_2.length; _i++) {
        var theta = alphasbetas_2[_i];
        var z = t2c(theta);
        var value = cleanepsilons(bpf(z));
        var tr = $("<tr>");
        var rgb = hsvToRgbString(anglehue(value), 1, 1);
        tr.append($("<td>").text(theta));
        tr.append($("<td>").text(dc(z)));
        tr.append($("<td>").text(dc(value)));
        tr.append($("<td>").text(value.angle().toString(10)).css("background-color", rgb));
        if (even) {
            tr.addClass("even");
        }
        else {
            tr.addClass("odd");
        }
        $("#valuestable tbody").append(tr);
    }
}
//# sourceMappingURL=interpolationdemo.js.map