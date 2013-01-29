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
    for(i in composedobjs) {
	var o = composedobjs[i];
	var tr = $("<tr>");
	var td1 = $("<td>");
	td1.text(dc(o.outerzero));
	tr.append(td1);
	for(j in o.preimages) {
	    var pimg = o.preimages[i];
	    var td2 = $("<td>");
	    td2.text(dc(pimg));
	    tr.append(td2);
	}
	$("#preimages tbody").append(tr);
    }
}

function resizeMe() {
    $(this).attr("rows", $(this).val().split("&").length);
    var ns = $(this).val().replace(/\n/g, "").replace(/&/g, "\n&");
    $(this).val(ns);
}

$(function() {
    $("#composebutton").on("click", doCompose);
    $("#composedzs").on("change", resizeMe);
    $("#composedzs").on("change", function() {
	$("#permalink").attr("href", "./blaschke.html?"+$("#composedzs").val());
    });
    $("#innerzs").on("change", resizeMe);    
    $("#outerzs").on("change", resizeMe);
    $("#testbutton").on("click", function() {
	$("#outerzs").val("z=-0.5,-0.5&z=0,0.75&z=0,0&z=0.5,0");
	$("#innerzs").val("z=-0.5,-0.5&z=0,0.75&z=0,0&z=0.5,0");
	$("#outerzs").change();
	$("#innerzs").change();
    });    
});