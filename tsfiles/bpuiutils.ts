/// <reference path="numeric-1.2.3.d.ts" />
/// <reference path="polynomials.ts" />
/// <reference path="blaschke.ts" />
/// <reference path="jquery.d.ts" />
/// <reference path="hsvToRGB.ts" />

// From http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values

function getQSMap(s: string) {
    if (s == "") return {};
    var a = s.split("&");
    var b = {};
    for (var i = 0; i < a.length; ++i) {
        var p = a[i].split('=');
        if (p.length != 2) continue;
        var val = decodeURIComponent(p[1].replace(/\+/g, " "));
        if (b[p[0]] == undefined) {
            b[p[0]] = [val];
        } else {
            b[p[0]].push(val);
        }
    }
    return b;
}

function parseZsString(s, key?): C[] {
    var k = (key == undefined ? "z" : key);
    if (s.indexOf("&") == 0) {
        s = s.slice(1);
    }
    var zs = getQSMap(s)[k];
    var retval = new Array();
    if (zs == undefined) { return retval; }
    for (var i = 0; i < zs.length; i++) {
        var parts = zs[i].split(",");
        retval.push(c(parseFloat(parts[0]), parseFloat(parts[1])));
    }
    return retval;
}

function setupRegions(sel: JQuery) {
    var html = '<div class="circle"></div>'
        + '<canvas class="regions graph"></canvas>'
        + '<canvas class="rblines graph lines"></canvas>';
    sel.append($(html));
}

// Add necessary HTML to setup a widget.
function setupCanvases(sel: JQuery) {
    var html = '<div class="circle"></div>'
        + '<canvas class="rainbow graph"></canvas>'
        + '<canvas class="rblines graph lines"></canvas>';
    sel.append($(html));
}

function getNudge(div) {
    var nudge = div.width() / 2;
    var s : string = div.css("border-left-width").replace("px", "");
    nudge += parseFloat(s);
    return nudge;
}

function cssscatter(cw : JQuery, canvaswidth: number, pts: Array<C>, cssclass: string, doclear?: boolean): JQuery {
    var moveexisting = pts.length == cw.find("." + cssclass).length;
    if (!moveexisting) {
        if (doclear == undefined || doclear) {
            cw.find("." + cssclass).remove();
        }
    }
    var offset = canvaswidth / 2;
    //console.log("Rescattering ", cw, cssclass, " at ", canvaswidth, offset);

    for (var i = 0; i < pts.length; i++) {
        var z = pts[i];
        var x = z.x;
        var y = z.y == undefined ? 0 : z.y;
        var div;
        if (!moveexisting) {
            div = $("<div />");
            cw.append(div);

            div.addClass(cssclass);
            div.addClass("scatterpoint");
            div.addClass(cssclass + i);
            div.attr("zeroid", i);
        } else {
            div = cw.find("." + cssclass + "[zeroid='" + i + "']");
        }
        var nudge = getNudge(div);
        div.css("top", Math.round(offset - offset * y - nudge));
        div.css("left", Math.round(offset + offset * x - nudge));
        /*
            console.log(cssclass+i, " at ", 
                    offset - offset*y, div.css("top"), 
                    offset - offset*x, div.css("left"), 
                    nudge, div.width());
        */
    }
    return cw.find("." + cssclass);
}

function scatter(ctx: CanvasRenderingContext2D, pts: C[], color: string, N: number) {
    ctx.save();
    var Nover2 = N / 2;
    ctx.translate(Nover2, Nover2);
    for (var i in pts) {
        var z = pts[i];
        ctx.beginPath();
        var x = z.x;
        var y = z.y == undefined ? 0 : z.y;
        ctx.arc(Nover2 * z.x, -Nover2 * y, 2, 0, Math.PI * 2, true);
        //ctx.linewidth=10;
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.strokeStyle = "#000000";
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.stroke();
    }
    ctx.restore();
}

function H(n) { n = Math.round(n); return (n < 16 ? "0" : "") + n.toString(16); }

function ttp(t0: number): number[] {
    return [numeric.cos(t0), numeric.sin(t0)];
}

function zeroFromClick(canvas, e) {
    var unit = $(canvas).width() / 2.0;
    var mouseX = e.pageX - $(canvas).offset().left;
    var mouseY = e.pageY - $(canvas).offset().top;
    var x = (mouseX / unit) - 1;
    var y = -1 * (mouseY / unit - 1);
    return c(x, y);
}

function resizeCW(cw: JQuery, pd: PlotDimensions) {
    $(cw).find(".circle")
        .css("width", (pd.graphN - 2) + "px")
        .css("height", (pd.graphN - 2) + "px");

    cw
        .css("width", pd.windowN + "px")
        .css("height", pd.windowN + "px");
    if (pd.graphN > pd.windowN) {
        cw
            .addClass("zeroesholderScroll")
            .removeClass("zeroesholderHidden");
    } else {
        cw
            .removeClass("zeroesholderScroll")
            .addClass("zeroesholderHidden");
    }
}

// N is the number of pixels in the canvas
// wrapperN is the size of the canvas wrapper
function resize(g: JQuery, pd: PlotDimensions) {
    var cw = g.parent(".zeroesholder");
    resizeCW(cw, pd);

    var graph = <HTMLCanvasElement>$(g)[0] ;
    if (graph == undefined) { return; }
    /*
      var oldImgData = graph.toDataURL("image/png");
      var img = new Image(); img.src = oldImgData;
    */
    $(graph)
        .css("width", pd.graphN + "px")
        .css("height", pd.graphN + "px");
    if ($(graph).hasClass("lines")) {
        if (graph.width != pd.windowN) {
            graph.width = pd.windowN;
            graph.height = pd.windowN;
        }
    } else {
        if (graph.width != pd.N) {
            graph.width = pd.N;
            graph.height = pd.N;
        }
    }
    /*
      img.onload = function() {
      graph.getContext("2d").drawImage(img, 0, 0);
      }
    */
}

function rpipToBpzs(rpip: RPIP) {
    var bpzs = cifyrpip(rpip);
    var bpzs2 = { bpzs: bpzs, zs: cgrid(bpzs.length) };
    return bpzs2;
}

function bindCPClick(pt: JQuery, cp, that) {
    var cp2 = cp;
    pt.bind("click", function() { showClick(cp2, that); });
}

function setupCTX(lines: HTMLCanvasElement, N: number) {
    var ctx = lines.getContext("2d");
    var Nover2 = N / 2;
    ctx.save();
    ctx.translate(Nover2, Nover2);
    ctx.scale(Nover2, -Nover2);
    ctx.lineWidth = 1.00001 / Nover2;
    return ctx;
}

function rgbToHex(rgb: number[]) {
    var s = ("0000000" + (Math.round(rgb[0]) * 65536 + Math.round(rgb[1]) * 256 + Math.round(rgb[2])).toString(16));
    return "#" + s.substr(s.length - 6);
}

// function crossHairs(lines: HTMLCanvasElement, N: number, skippedangles, drawnLength) {

//     var endpointzs = skippedangles.map(t2c);
//     var segment = getCurrentSegment(endpointzs, drawnLength);
//     var pt = c2xy(segment.point);
//     var ctx = setupCTX(lines, N);
//     //ctx.save();
//     ctx.beginPath();
//     ctx.moveTo(pt.x, -1);
//     ctx.lineTo(pt.x, 1);
//     ctx.stroke();

//     ctx.beginPath();
//     ctx.moveTo(-1, pt.y);
//     ctx.lineTo(1, pt.y);
//     ctx.stroke();
//     /* 		
//         ctx.arc(pt.x, pt.y, .1, 0, 2*Math.PI);
//         ctx.fillStyle = "#FF0000";
//         ctx.fill();
//             */
// }

// Scrap code to find points which are closest to the 
// minor axis.
// function getNormalDist(p) { 
// 	var amp = cent.sub(p);
// 	var rhs = n.mul(amp.x * n.x + amp.y * n.y);
// 	return amp.sub(rhs).abs().x;
// }

// var closesttoma = ints.sort(function(a,b) { return getNormalDist(b) - getNormalDist(a); });

//for(var i = 0; i < closesttoma.length; i++) {
// 	if(dists[i] < minDist) {
// 	    minDist = dists[i];
// 	    minI = i;
// 	}
// }

function closestToPoint(ints: C[], cent: C) {
    // Find the point that's closest to the center of the major axis.
    var closesttocent = ints.slice();
    closesttocent.sort(function(a, b) { return a.sub(cent).abs().x - b.sub(cent).abs().x; })
    return closesttocent[0];
}

function drawEllipse(ctx: CanvasRenderingContext2D, cent: C, 
    majorAxisVector: C, minorAxisVector: C, strokeStyle: string, odd?: number ) {
    if (odd == undefined) { odd = 0; }

    /* 
    ctx.beginPath();
    ctx.moveTo(cent.add(minorAxisVector).x, cent.add(minorAxisVector).y);
    ctx.lineTo(cent.sub(minorAxisVector).x, cent.sub(minorAxisVector).y);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cent.add(majorAxisVector).x, cent.add(majorAxisVector).y);
    ctx.lineTo(cent.sub(majorAxisVector).x, cent.sub(majorAxisVector).y);
    ctx.stroke();
    */
    ctx.strokeStyle = strokeStyle;

    ctx.beginPath();
    ctx.moveTo(cent.add(minorAxisVector).x, cent.add(minorAxisVector).y);
    for (var t0 = 0; t0 <= 128; t0++) {
        var t = Math.PI * 2.0 / 128 * t0;
        var v1 = majorAxisVector.mul(Math.sin(t));
        var v2 = minorAxisVector.mul(Math.cos(t));
        var pt = cent
            .add(v1)
            .add(v2);
        pt = fixy(pt);
        if (t0 % 2 == odd) {
            ctx.moveTo(pt.x, pt.y);
        } else {
            ctx.lineTo(pt.x, pt.y);
        }
    }
    ctx.closePath();
    ctx.stroke();
}

function spacedAngles(n: number): number[] {
    var delta = Math.PI * 2.0 / n;
    var ts = [];
    for (var i = 0; i < n; i++) {
        ts.push(delta * i);
    }
    return ts;
}

function clearCanvasInner(cxt: CanvasRenderingContext2D, preserveTransform: boolean) {
    if (preserveTransform) {
        cxt.save();
        cxt.setTransform(1, 0, 0, 1, 0, 0);
    }

    cxt.clearRect(0, 0, cxt.canvas.width, cxt.canvas.height);

    if (preserveTransform) {
        cxt.restore();
    }
}

function clearCanvas(selector: JQuery) {
    if (selector != null) {
        selector.each(function(i, e) { 
            var e2 = (<HTMLCanvasElement>e); 
            clearCanvasInner(e2.getContext("2d"), false);});
    }    
}

function showClick(z: C, that: any) {
    var val = bpeval(that.zs, c(z.x, z.y));
    that.point.text(dcomplex(z));
    that.dest.text(dcomplex(val)); //  + " " + getangleindex(val.angle(), that.cpi.cvangles));
};


// Zoom in on the critical values.
function mapCVs(cpi: CPInfo) {
    var cvs = cpi.cvs;
    var cvnorms = $.map(cvs, function(e, i) { return e.abs().x; });
    var maxcvabs = Math.max.apply(null, cvnorms);
    var mincvabs = Math.min.apply(null, cvnorms);
    var f = zinterp(mincvabs, maxcvabs, .25, .75);
    return cvs.map(
        function(z, i) {
            return f(z);
        });
}

function mapZinCVs(z: C, cpi: CPInfo) : C{
    var cvs = cpi.cvs;
    var cvnorms = $.map(cvs, function(e, i) { return e.abs().x; });
    var maxcvabs = Math.max.apply(null, cvnorms);
    var mincvabs = Math.min.apply(null, cvnorms);
    var znorm = z.abs().x;
    if (znorm > .75) {
        return (zinterp(.75, 1, maxcvabs, 1))(z);
    } else if (znorm < .25) {
        return (zinterp(0, .25, 0, mincvabs))(z);
    } else {
        return (zinterp(.25, .75, mincvabs, maxcvabs))(z);
    }
}
