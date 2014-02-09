var delta = 2*Math.PI/6;
var alphas = [0*delta, 1*delta, 2*delta, 3*delta, 4*delta, 5*delta];
var betas = alphas.map(function(t) { return t + delta/2; });
$(function() {
    $("#demo").click(function() {
	$("#alphas").val(alphas.join("\n"));
	$("#betas").val(betas.join("\n"));
    });
    $("#interpolate").click(function() {
	var alphas = $("#alphas").val().split("\n").map(parseFloat);
	var betas = $("#betas").val().split("\n").map(parseFloat);
	var retval = interpolate([alphas, betas]);
	var z2 = retval.zeroes.map(function(z) { 
	    var nx = (Math.abs(z.x) < 0.00001) ? 0 : z.x;
	    var ny = (Math.abs(z.y) < 0.00001) ? 0 : z.y;
	    return c(nx, ny);
	});			     
	$("#zsstring")
	    .val(zsString(z2))
	    .change();
    });
    $("#zsstring").change(function() {
	$("#permalink").attr("href", "./blaschke.html?"+$(this).val());
    });
});
