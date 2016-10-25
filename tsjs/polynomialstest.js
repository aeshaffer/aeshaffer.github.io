/// <reference path="../tsfiles/numeric-1.2.3.d.ts" />
/// <reference path="../tsfiles/polynomials.ts" />
/// <reference path="../tsfiles/jquery.d.ts" />
/// <reference path="../tsfiles/jqueryui.d.ts" />
/// <reference path="../tsfiles/lmellipse.ts" />
/// <reference path="../tsfiles/ellipseutils.ts" />
/// <reference path="../tsfiles/bpuiutils.ts" />
/// <reference path="../tsfiles/blaschke.ts" />
$(function () {
    $("#go").on("click", function () {
        var inzs = parseZsString($("#inputzeroes").val());
        inzs = inzs.sort(function (a, b) { return a.abs().x - b.abs().x; });
        $("#inputzeroes").val(zsString(inzs));
        var bpp = getBPrimeNumerator(inzs);
        var cps = polyroots(bpp).filter(function (z) { return z.abs().x <= 1; });
        var cpsEvalNorm = function (z) { return peval(bpp, z).abs().x; };
        $("#cps").val(zsString(cps));
        $("#cpsNorms").val(Math.max.apply(Math, cps.map(cpsEvalNorm)));
        var coeffsX = coeffs(inzs);
        var outzs = polyroots(coeffsX);
        outzs = outzs.sort(function (a, b) { return a.abs().x - b.abs().x; });
        $("#outputzeroes").val(zsString(outzs));
        var evalNorm = function (z) { return peval(coeffsX, z).abs().x; };
        var inNorms = inzs.map(evalNorm);
        $("#inputnorms").val(inNorms.join("\r\n"));
        $("#maxinputnorm").val(Math.max.apply(Math, inNorms));
        var outNorms = outzs.map(evalNorm);
        $("#outputnorms").val(outNorms.join("\r\n"));
        $("#maxoutputnorm").val(Math.max.apply(Math, outNorms));
    });
});
//# sourceMappingURL=polynomialstest.js.map