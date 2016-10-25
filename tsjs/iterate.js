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
        var phi = Number($("#phi").val());
        var x = Number($("#rpA").val());
        var y = Number($("#imA").val());
        var a = xy2c({ x: x, y: y });
        var normA = a.abs().x;
        var cos = Math.cos(phi / 2);
        $("#normA").text(normA);
        $("#cos").text(cos);
        if (normA > cos) {
            $("#type").text("Hyperbolic");
        }
        else if (normA < cos) {
            $("#type").text("Elliptic");
        }
        else {
            $("#type").text("Parabolic");
        }
        var count = Number($("#count").val());
        var outzs = new Array();
        var automorphism = function (z) { return t2c(phi).mul(a.sub(z)).div(none.sub(a.conj().mul(z))); };
        var automorphisminv = function (z) { return t2c(-phi).mul(automorphism(t2c(-phi).mul(z))); };
        var test = automorphism(automorphisminv(inzs[0]));
        var lastcopy = inzs;
        for (var i = 1; i <= count; i++) {
            var onecopy = lastcopy.map(automorphisminv);
            lastcopy = onecopy;
            outzs.push(onecopy);
        }
        outzs.push(inzs);
        lastcopy = inzs;
        for (var i = 1; i <= count; i++) {
            var onecopy = lastcopy.map(automorphism);
            lastcopy = onecopy;
            outzs.push(onecopy);
        }
        $("#outputzeroes").val("&" + outzs.map(zsString).join("\r\n&"));
    });
});
//# sourceMappingURL=iterate.js.map