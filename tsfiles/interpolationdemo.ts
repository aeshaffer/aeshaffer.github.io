/// <reference path="interpolation2.ts" />
/// <reference path="jquery.d.ts" />
/// <reference path="blaschke.ts" />
/// <reference path="polynomials.ts" />

var delta = 2 * Math.PI / 12;
var alphas = [0 * delta, 1 * delta, 2 * delta, 3 * delta, 4 * delta, 5 * delta];
var betas = alphas.map(function (t) { return t + delta / 2; });

function cleanepsilons(z: C): C {
	var nx = (Math.abs(z.x) < 0.00001) ? 0 : z.x;
	var ny = (Math.abs(z.y) < 0.00001) ? 0 : z.y;
	return c(nx, ny);
}

$(function () {
	$("#demo").click(function () {
		$("#alphas").val(alphas.join("\n"));
		$("#betas").val(betas.join("\n"));
	});
	$("#interpolate").click(function () {
		var alphas: number[] = $("#alphas").val().split("\n").filter(z => z.length > 0).map(parseFloat);
		var betas: number[] = $("#betas").val().split("\n").filter(z => z.length > 0).map(parseFloat);
		if (alphas.length != betas.length) {
			alert("The two lists must be of identical length.");
			return;
		}
		var alphasbetas = alphas.concat(betas).sort(o);
		if (alphasbetas.filter(x => x < 0 || x > Math.PI * 2).length > 0) {
			alert("All angles must be between 0 and 2*Pi");
			return;
		}
		for (var i = 0; i < alphas.length; i++) {
			var alpha = alphas[i];
			var nextbeta = betas[i];
			if (i == 0) {
				if (!(alpha < nextbeta)) {
					alert("Points must be interspersed: " + alpha + "<" + nextbeta);
					return;
				}

			} else {
				var prevbeta = i == 0 ? 0 : betas[(alphas.length + i - 1) % alphas.length];
				if (!(prevbeta < alpha && alpha < nextbeta)) {
					alert("Points must be interspersed: " + prevbeta + "<" + alpha + "<" + nextbeta);
					return;
				}
			}
		}
		var retval = interpolate([alphas, betas]);

		var bpzs0 = <BPZeroes>(retval.zeroes);
		var bpf0 = getBPF(bpzs0);

		var valueAlpha = bpf0(t2c(alphas[0]));
		var valueBeta = bpf0(t2c(betas[0]));

    var ws = [nzero, valueAlpha, valueBeta];
    var zs = [nzero, none, none.mul(-1)];
    var phi = gettransform(ws, zs);

		// var bpzs = <BPZeroes>(retval.zeroes.map(z => meval(phi, z)));
		var bpzs = <BPZeroes>(retval.zeroes.map(z => z));
		var bpf = getBPF(bpzs);
		var values = alphasbetas.map(t2c).map(bpf).map(cleanepsilons);

		var z2 = retval.zeroes.map(cleanepsilons);
		$("#zsstring")
			.val(zsString(z2))
			.change();

		$("#valuestable tbody").empty();
		for (var theta of alphasbetas) {
			var z = t2c(theta);
			var value = cleanepsilons(bpf(z));
			var tr = $("<tr>");
			tr.append($("<td>").text(theta));
			tr.append($("<td>").text(zString(z)));
			tr.append($("<td>").text(zString(value)));
			tr.append($("<td>").text(value.angle().toString(10)));
			$("#valuestable tbody").append(tr);
		}
	});
	$("#zsstring").change(function () {
		$("#permalink").attr("href", "./blaschke.html?" + $(this).val());
	});
});
