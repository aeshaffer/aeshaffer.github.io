/// <reference path="numeric-1.2.3.d.ts" />
/// <reference path="polynomials.ts" />
/// <reference path="blaschke.ts" />
/// <reference path="jquery.d.ts" />
/// <reference path="hsvToRGB.ts" />
/// <reference path="bpuiutils.ts" />
/// <reference path="interpolation2.ts" />
/// <reference path="jqueryui.d.ts" />
/// <reference path="bpgraphics.ts" />
/// <reference path="ellipseutils.ts" />
"use strict";
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
var JQuerySingletonWrapper = /** @class */ (function () {
    function JQuerySingletonWrapper() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        this.inner = $.apply(null, args);
        this.element = this.inner[0];
        this.length = this.inner.length;
        // if (this.inner.length != 1) {
        //     throw "WRONG!";
        // } else {
        // }
    }
    JQuerySingletonWrapper.prototype.empty = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return this.inner.empty.apply(this.inner, args);
    };
    JQuerySingletonWrapper.prototype.append = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return this.inner.append.apply(this.inner, args);
    };
    JQuerySingletonWrapper.prototype.val = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return this.inner.val.apply(this.inner, args);
    };
    JQuerySingletonWrapper.prototype.attr = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return this.inner.attr.apply(this.inner, args);
    };
    JQuerySingletonWrapper.prototype.change = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return this.inner.change.apply(this.inner, args);
    };
    JQuerySingletonWrapper.prototype.is = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return this.inner.is.apply(this.inner, args);
    };
    JQuerySingletonWrapper.prototype.parent = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return this.inner.parent.apply(this.inner, args);
    };
    JQuerySingletonWrapper.prototype.css = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return this.inner.css.apply(this.inner, args);
    };
    JQuerySingletonWrapper.prototype.on = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return this.inner.on.apply(this.inner, args);
    };
    JQuerySingletonWrapper.prototype.siblings = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return this.inner.siblings.apply(this.inner, args);
    };
    JQuerySingletonWrapper.prototype.click = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return this.inner.click.apply(this.inner, args);
    };
    JQuerySingletonWrapper.prototype.text = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return this.inner.text.apply(this.inner, args);
    };
    JQuerySingletonWrapper.prototype.hide = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return this.inner.hide.apply(this.inner, args);
    };
    JQuerySingletonWrapper.prototype.each = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return this.inner.each.apply(this.inner, args);
    };
    return JQuerySingletonWrapper;
}());
var PerformanceLog = /** @class */ (function () {
    function PerformanceLog() {
    }
    PerformanceLog.prototype.flopsPerMS = function () {
        return (this.N * this.N * this.degree) / this.timeInMS;
    };
    return PerformanceLog;
}());
var BPWidget = /** @class */ (function () {
    function BPWidget(obj, allElements) {
        this.performanceHistory = new Array(0);
        function g(sel) {
            var retval = new JQuerySingletonWrapper(obj.find(sel));
            if (allElements && retval.length == 0) {
                return null;
            }
            else {
                return retval;
            }
        }
        this.container = obj;
        this.showadvanced = g(".showadvanced");
        this.criticalpoints = g(".criticalpoints");
        this.criticalvalues = g(".criticalvalues");
        this.fixedpointsUL = g(".fixedpoints");
        this.criticalangles = g(".criticalangles");
        this.zeroes = g(".zeroes");
        this.permalink = g(".permalink");
        this.point = g(".point");
        this.dest = g(".dest");
        this.rainbow = g(".rainbow");
        this.regions = g(".regions");
        this.range = g(".range");
        this.rblines = g(".rblines");
        this.rglines = g(".rglines");
        this.reidonrplot = g(".reidonrplot");
        this.solidtangents = g(".solidtangents");
        this.doguessellipse = g(".doguessellipse");
        this.plotinterp = g(".plotinterp");
        this.plotpolygon = g(".plotpolygon");
        this.showcps = g(".showcps");
        this.showfps = g(".showfps");
        this.replotondrop = g(".replotondrop");
        this.windowscale = g(".windowscale");
        this.rayThreshold = g(".raythreshold");
        this.graphzoom = g(".graphzoom");
        this.pixels = g(".pixels");
        this.workergo = g(".workergo");
        this.progress = g(".progress");
        this.loadbutton = g(".loadbutton");
        this.zsstring = g(".zsstring");
        this.plotbutton = g(".plotbutton");
        this.screenshot = g(".screenshot");
        this.skippoints = g(".skippoints");
        this.autolinespoints = g(".autolinespoints");
        //this.theta = g(".theta");
        this.clearplots = g(".clearplots");
        this.clearlines = g(".clearlines");
        this.autolinesgo = g(".autolinesgo");
        this.animatelines = g(".animatelines");
        //this.timesPI = g(".timesPI");
        //this.plottheta = g(".plottheta");
        this.clearpreimages = g(".clearpreimages");
        this.showpreimages = g(".showpreimages");
        this.textz = g(".textz");
        this.gotextz = g(".gotextz");
        this.rangepoint = g(".rangepoint");
        this.findpreimages = g(".findpreimages");
        this.foundpreimages = g(".foundpreimages");
        this.zs = [];
        this.cpi = new CPInfo([], [], [], []);
        this.bpzs = [];
        try {
            this.worker = new Worker("../js/bpworker.js");
            this.rainbowworker = new Worker("../js/bpgraphicsworker.js");
            this.regionsworker = new Worker("../js/bpgraphicsworker.js");
        }
        catch (seex) {
            this.worker = null;
            this.rainbowworker = null;
            this.regionsworker = null;
        }
    }
    BPWidget.prototype.wireup = function () {
        //zs = bpcompose(zeroonehalf, [c(0,0), c(.51, 0)] );
        this.setup();
    };
    ;
    BPWidget.prototype.displayTables = function (zs, cpi) {
        if (this.criticalpoints == null || this.criticalvalues == null) {
            return;
        }
        this.updateCPCVSTable(cpi);
        this.zeroes.empty();
        for (var i = 0; i < zs.length; i++) {
            var li = $("<li>");
            li.text(dcomplex(zs[i]));
            this.zeroes.append(li);
        }
        this.updateCVAnglesTable(cpi);
        this.updateFPSTable(this.zs, cpi);
        var oldval = this.zsstring.val();
        var zsquerystring = zsQueryString(this.zs);
        var zscode = zsString(this.zs);
        if (oldval != zscode) {
            this.zsstring.val(zscode);
            this.zsstring.attr("rows", zs.length);
            this.zsstring.change();
        }
        var wl = window.location.href.replace(window.location.search, "");
        this.permalink.attr("href", wl + "?" + zsquerystring);
    };
    ;
    BPWidget.prototype.updateCPCVSTable = function (cpi) {
        this.criticalpoints.empty();
        this.criticalvalues.empty();
        var doclear = false;
        for (var i = 1; i < cpi.cps.length; i++) {
            if (dcomplex(cpi.cvs[i]) == dcomplex(cpi.cvs[i - 1])) {
                doclear = true;
            }
        }
        var groups = {};
        function dccp(i) { return dcomplex(cpi.cps[i]); }
        function dccv(i) { return dcomplex(cpi.cvs[i]); }
        for (var i = 0; i < cpi.cvs.length; i++) {
            groups[dccv(i)] = [];
        }
        for (var i = 0; i < cpi.cvs.length; i++) {
            groups[dccv(i)].push(i);
        }
        function clearPicked() { $(".cp").removeClass("picked"); $(".cv").removeClass("picked"); }
        for (var i = 0; i < cpi.cps.length; i++) {
            var cpli = $("<li class='cp'>");
            cpli.addClass("cp" + i);
            cpli.text(dccp(i));
            this.criticalpoints.append(cpli);
            var cvli = $("<li class='cv'>");
            cvli.addClass("cv" + i);
            var dci = dcomplex(cpi.cvs[i]);
            cvli.text(dci);
            this.criticalvalues.append(cvli);
            /*
            var rgb = hsvToRgb(anglehue(cpi.cvs[i]), 1, 1);
            function H(n) { n = Math.round(n); return (n < 16 ? "0" : "") + n.toString(16); }
            var rgbstring = "#"+H(rgb[0]) + H(rgb[1]) + H(rgb[2]);
            cvli.css("background-color", rgbstring);
            */
            (function () {
                var j = i;
                var group = groups[dccv(j)];
                cpli
                    .on("mouseover", function () {
                    clearPicked();
                    $(".cp" + j).addClass("picked");
                    $(".cv" + j).addClass("picked");
                })
                    .on("mouseleave", clearPicked);
                cvli
                    .on("mouseover", function () {
                    clearPicked();
                    $(".cv" + j).addClass("picked");
                    for (var k = 0; k < group.length; k++) {
                        $(".cp" + group[k]).addClass("picked");
                    }
                })
                    .on("mouseleave", clearPicked);
            })();
            if (doclear && i - 1 >= 0) {
                var dc0 = dcomplex(cpi.cvs[i - 1]);
                if (dci != dc0) {
                    cpli.css("clear", "left");
                    cvli.css("clear", "left");
                }
            }
        }
    };
    BPWidget.prototype.updateCVAnglesTable = function (cpi) {
        this.criticalangles.empty();
        var rolledcvangles = roll(cpi.cvangles);
        for (var i = 0; i < cpi.cvangles.length; i++) {
            var li = $("<li>");
            li.attr("id", "ca" + i);
            li.text(round5(cpi.cvangles[i]) + "-" + round5(rolledcvangles[i]));
            var rgb = hsvToRgb(1.0 * i / (cpi.cvangles.length), 1, 1);
            var rgbstring = "#" + H(rgb[0]) + H(rgb[1]) + H(rgb[2]);
            li.css("background-color", rgbstring);
            this.criticalangles.append(li);
        }
    };
    BPWidget.prototype.updateFPSTable = function (zs, cpi) {
        this.fixedpointsUL.empty();
        for (var _i = 0, _a = cpi.fps; _i < _a.length; _i++) {
            var fp = _a[_i];
            var li = $("<li>");
            li.text(dcomplex(fp) + " Norm:" + round5(fp.abs().x));
            li.attr("title", " Check:" + dcomplex(bpeval(zs, fp)));
            this.fixedpointsUL.append(li);
        }
    };
    BPWidget.prototype.dropzero = function (zdiv) {
        if (this.replotondrop.is(":checked")) {
            this.justReplotme(true);
        }
    };
    BPWidget.prototype.updatezero = function (zdiv) {
        try {
            var nudge = getNudge($(zdiv));
            var zeroid = $(zdiv).attr("zeroid");
            var zeroid_num = parseInt(zeroid, 10);
            var cw = $(zdiv).parent(".zeroesholder");
            if (cw.length != 0) {
                var p = $(zdiv).position();
                var canvas = cw.find("canvas");
                var contpos;
                var unit;
                if (canvas != null) {
                    unit = canvas.width() / 2.0;
                    contpos = canvas.position();
                }
                else {
                    unit = cw.width() / 2.0;
                    contpos = cw.position();
                }
                var newpos = {
                    left: p.left - contpos.left + nudge,
                    top: p.top - contpos.top + nudge
                };
                var z = c(newpos.left / unit - 1, -(newpos.top / unit - 1));
                if (z.abs().x <= 1) {
                    this.zs[zeroid] = z;
                }
                else {
                    this.zs.splice(zeroid_num, 1);
                }
                this.rescatter();
            }
        }
        catch (err) {
            alert(err);
        }
    };
    ;
    BPWidget.prototype.rescatter = function () {
        if (this.reidonrplot.is(":checked")) {
            this.autojoinpoints();
            clearCanvas(this.rainbow.inner);
            clearCanvas(this.regions.inner);
            clearCanvas(this.range.inner);
        }
        this.cpi = cpinfo(this.zs);
        var cps = this.cpi.cps;
        var cvs = this.cpi.cvs;
        var cvangles = this.cpi.cvangles;
        var fps = this.cpi.plottableFPS();
        this.displayTables(this.zs, this.cpi);
        var cw = this.rainbow.parent(".zeroesholder");
        var cwidth = this.plotDims().graphN;
        var rng = this.range.parent(".zeroesholder");
        var cvs2 = mapCVs(this.cpi);
        cssscatter(rng, cwidth, cvs2, "cv");
        // Put the panel after all the plotted points
        // so it gets our click events.
        var preimages = rng.find(".preimagepanel");
        preimages.css('width', cwidth).css('height', cwidth);
        preimages.remove();
        rng.append(preimages);
        this.attachrangeMD(preimages);
        var rgns = this.regions.parent(".zeroesholder");
        cssscatter(rgns, cwidth, cps, "cp");
        cssscatter(rgns, cwidth, this.cpi.plottableFPS(), "fp");
        cssscatter(rgns, cwidth, this.zs, "zero");
        if (this.plotinterp.is(":checked")) {
            if (this.skippoints.val() != "") {
                var innerguess = parseInt(this.skippoints.val(), 10);
                if (innerguess == 1 || innerguess == this.zs.length ||
                    this.zs.length % innerguess != 0) {
                    cssscatter(cw, cwidth, [], "innerzero", true);
                }
                else {
                    var innertest = algorithmtest(this.zs, innerguess);
                    var innertestdivs = cssscatter(cw, cwidth, innertest.zeroes, "innerzero");
                    console.log("PQ Zeroes:", innertest.pqzeroes);
                }
            }
        }
        else {
            cssscatter(cw, cwidth, [], "innerzero", true);
        }
        cssscatter(cw, cwidth, this.cpi.plottableFPS(), "fp");
        var zerodivs = cssscatter(cw, cwidth, this.zs, "zero");
        var that = this;
        zerodivs.addClass("draggable")
            .addClass("ui-draggable")
            .addClass("ui-widget-content")
            .draggable({
            containment: cw, scroll: false,
            drag: function () { that.updatezero($(this)); },
            stop: function () { that.updatezero($(this)); that.dropzero($(this)); }
        })
            .removeClass("zerozero")
            .draggable('enable');
        for (var i = 0; i < this.zs.length; i++) {
            if (this.zs[i].abs().x == 0) {
                cw.find(".zero" + i).removeClass("draggable")
                    .removeClass("ui-draggable")
                    .removeClass("ui-widget-content")
                    .addClass("zerozero")
                    .draggable('disable');
            }
        }
        cssscatter(cw, cwidth, this.cpi.cps, "cp");
        for (var i = 0; i < this.cpi.cps.length; i++) {
            var pt = cw.find(".cp" + i);
            var cp = this.cpi.cps[i];
            var that = this;
            bindCPClick(pt, cp, that);
        }
    };
    BPWidget.prototype.resizeCanvasesRescatter = function () {
        this.resizeCanvases();
        this.rescatter();
    };
    ;
    BPWidget.prototype.plotDims = function () {
        var N = parseFloat(this.pixels.val());
        var zoom = parseFloat(this.graphzoom.val());
        var windowscaleval = parseFloat(this.windowscale.val());
        var windowN = zoom * N * 1.0 / windowscaleval;
        var graphN = zoom * N;
        return { N: N, zoom: zoom, windowN: windowN, graphN: graphN };
    };
    ;
    BPWidget.prototype.resizeCanvases = function () {
        var pd = this.plotDims();
        resize(this.range.inner, pd);
        resize(this.rainbow.inner, pd);
        resize(this.regions.inner, pd);
        resize(this.rglines.inner, pd);
        resize(this.rblines.inner, pd);
        // drawPlots(bpzs, N, zs, cpi);
    };
    ;
    BPWidget.prototype.fastReplot = function (as, N, cpi, raythreshold) {
        var startBPGE = (new Date()).getTime();
        var rpip = bpgridevalArray(N, as, null);
        var bpzs = rpipToBpzs(rpip);
        var endBPGE = (new Date()).getTime();
        this.progress.append("NWRP " + N + " " + as.length + " " + (endBPGE - startBPGE));
        if (this.regions.length > 0 && $(this.regions.element).is(":visible")) {
            var rgidata = new Uint8Array(4 * N * N);
            rpipToHue(rpip, rgidata, function (bpz) { return region(cpi.cvangles, bpz); });
            finishCanvas(rgidata, this.regions.element, cpi);
        }
        var bad = biggestanglediff(cpi.cps.map(function (bpz) { return bpz.angle(); }));
        var valfun = function (bpz) {
            if (th == 0) {
                return 1;
            }
            if (isNaN(bad.midpt)) {
                return 1;
            }
            if (isNaN(bpz.x) || isNaN(bpz.y)) {
                return 1;
            }
            var th = raythreshold;
            var ad = anglediff(bad.midpt - bpz.angle());
            var aad = Math.abs(ad);
            var val = (1.0 / (4.0 * th)) * aad;
            if (val > 1) {
                return 1;
            }
            else {
                return val;
            }
        };
        var rbidata = new Uint8Array(4 * N * N);
        rpipToHue(rpip, rbidata, anglehue, valfun);
        finishCanvas(rbidata, this.rainbow.element, cpi);
        if (this.range.length > 0) {
            doRange(this.range.element, bpzs, cpi, this.plotDims().N);
        }
    };
    ;
    BPWidget.prototype.getSkips = function () {
        var skips0 = this.skippoints.val().split(",");
        var skips = skips0.map(function (skip) { return parseInt(skip); });
        if (!skips.every(function (n) { return !isNaN(n); })) {
            return null;
        }
        else {
            this.skippoints.css("background-color", "");
            this.skippoints.attr("title", "");
            for (var i = 0; i < skips.length; i++) {
                var skip = skips[i];
                /*
                    if(this.zs.length % skip != 0) {
                        this.skippoints.css("background-color", "red");
                        this.skippoints.attr("title", "Cannot skip "+this.zs.length+" points by " + skip + ".");
                        return null;
                    }
                */
            }
            return skips;
        }
    };
    BPWidget.prototype.drawPILines = function (t) {
        var skips = this.getSkips();
        if (skips != null) {
            var piangles = getPIAngles(this.zs, t);
            for (var i = 0; i < skips.length; i++) {
                var skip = skips[i];
                this.drawPILinesInner(this.rblines.element, piangles, skip);
            }
        }
        //drawPILinesInner(rglines, piangles, skip);
    };
    ;
    BPWidget.prototype.drawPILinesInner = function (lines, piangles, skip, timepct) {
        var N = this.plotDims().windowN;
        var ctx = setupCTX(lines, N);
        var frontier = [];
        var skippedangleses = getSkippedAngles(piangles, skip);
        var numPolys = skippedangleses.length;
        if (timepct == undefined) {
            timepct = 1;
        }
        for (var j = 0; j < numPolys; j++) {
            var drawnLength = 0;
            var skippedangles = skippedangleses[j];
            var totalLength = timepct * getPolylength(skippedangles.map(t2c));
            var t0 = skippedangles[0];
            var t1 = null;
            ctx.beginPath();
            (ctx.moveTo).apply(ctx, ttp(t0));
            var t0z;
            var t1z;
            for (var i = 1; i < skippedangles.length + 1; i++) {
                t1 = skippedangles[i % skippedangles.length];
                t0z = t2c(t0);
                t1z = t2c(t1);
                var lineLength = t1z.sub(t0z).abs().x;
                if (drawnLength + lineLength > totalLength) {
                    // Draw in the same direction with whatever length we have left over.
                    var z = t0z.add(t1z.sub(t0z).div(lineLength).mul(totalLength - drawnLength));
                    t1z = z;
                    console.log("Drawing from" + dc(t0z) + " to " + dc(t1z) + " length " + lineLength);
                    (ctx.lineTo).apply(ctx, c2xyArray(z));
                    drawnLength = totalLength;
                    break;
                }
                else {
                    console.log("Drawing from" + dc(t0z) + " to " + dc(t1z) + " length " + lineLength);
                    (ctx.lineTo).apply(ctx, ttp(t1));
                    drawnLength += lineLength;
                    t0 = t1;
                }
            }
            ctx.stroke();
            frontier.push({ t: piangles[0], dot: t1z });
            // crossHairs(lines, N, skippedangles, drawnLength);
            //ctx.restore();
        }
        ctx.restore();
        return frontier;
    };
    ;
    BPWidget.prototype.drawponcelet = function (ctx, ints) {
        // Draw lines connecting the intersections
        // Not quite correct, since we want the curve to be tangent to the segments,
        // but I think for a large enough sampling it comes close enough.  
        function f(c, w) {
            ctx.beginPath();
            ctx.strokeStyle = c;
            ctx.lineWidth = w;
            ctx.moveTo(ints[0].x, ints[0].y);
            for (var i = 0; i < ints.length; i++) {
                ctx.lineTo(ints[i].x, ints[i].y);
            }
            ctx.closePath();
            ctx.stroke();
        }
        f("black", 6 / this.plotDims().graphN);
        f("red", 4 / this.plotDims().graphN);
    };
    BPWidget.prototype.guessellipse = function (ctx, ints) {
        if (ints.length > 4) {
            ctx.lineWidth = 4.0 / this.plotDims().graphN;
            var mdp = maxDistPair(ints);
            var maj0 = mdp.p0;
            var maj1 = mdp.p1;
            // Find the center of the major axis.
            var cent = maj0.add(maj1).div(2);
            var majorAxisVector = maj0.sub(maj1).div(2);
            var closesttocent = closestToPoint(ints, cent);
            var minDist = cent.sub(closesttocent).abs().x;
            // Get a normal vector.
            var n = majorAxisVector;
            n = n.div(n.abs().x).mul(c(0, 1));
            n = fixy(n);
            var minorAxisVector = n.mul(minDist);
            drawDecoratedEllipse(ctx, cent, majorAxisVector, minorAxisVector);
        }
    };
    BPWidget.prototype.drawtangents = function (ctx, ajpct, drawsolid) {
        var tpts = numeric.linspace(0, 2 * Math.PI - 2 * Math.PI / ajpct, ajpct); // [0, Math.PI];
        for (var ti = 0; ti < tpts.length; ti++) {
            var pts = getTanPoints(this.zs, tpts[ti]);
            if ($("body").hasClass("bigdots")) {
                ctx.lineWidth = 10.0 / this.plotDims().graphN;
            }
            else {
                ctx.lineWidth = 1.0 / this.plotDims().graphN;
            }
            for (var i = 0; i < pts.length; i++) {
                ctx.beginPath();
                ctx.moveTo(pts[i].z1.x, fixy(pts[i].z1).y);
                if (drawsolid) {
                    ctx.strokeStyle = "#000";
                }
                else {
                    ctx.strokeStyle = "#00f";
                    var tanPt = fixy(pts[i].ztan);
                    ctx.lineTo(tanPt.x, tanPt.y);
                    ctx.stroke();
                    var theta = pts[i].z2.sub(pts[i].z1).angle();
                    var nubbin = rt2c(10 * ctx.lineWidth, theta + Math.PI / 2);
                    var nubbinend = tanPt.add(nubbin);
                    ctx.beginPath();
                    ctx.moveTo(tanPt.x, tanPt.y);
                    ctx.lineTo(nubbinend.x, nubbinend.y);
                    ctx.stroke();
                    // ctx.beginPath();
                    // ctx.arc(tanPt.x, tanPt.y, 6 * ctx.lineWidth, theta, theta+Math.PI);
                    // ctx.fillStyle = "black";
                    // ctx.fill();
                    // ctx.beginPath();
                    // ctx.arc(tanPt.x, tanPt.y, 4 * ctx.lineWidth, theta, theta+Math.PI);
                    // ctx.fillStyle = "red";
                    // ctx.fill();
                    ctx.beginPath();
                    ctx.strokeStyle = "#0f0";
                    ctx.moveTo(tanPt.x, tanPt.y);
                }
                ctx.lineTo(pts[i].z2.x, fixy(pts[i].z2).y);
                ctx.stroke();
            }
        }
    };
    BPWidget.prototype.joinpis = function (ajpct) {
        var thetas = spacedAngles(ajpct);
        for (var i = 0; i < thetas.length; i++) {
            this.drawPILines(thetas[i]);
        }
    };
    BPWidget.prototype.setupanimatetangents = function () {
        this.doclearlines();
        var ajpct = parseInt(this.autolinespoints.val(), 10);
        var thetas = spacedAngles(ajpct);
        var preimageangles = [];
        for (var i = 0; i < thetas.length; i++) {
            var t = thetas[i];
            var piangles = getPIAngles(this.zs, t);
            preimageangles.push(piangles);
        }
        var widget = this;
        window.requestAnimationFrame(function () { widget.tangentsframe(widget, new Date(), preimageangles); });
    };
    BPWidget.prototype.tangentsframe = function (widget, timeZero, preimages) {
        var time = new Date();
        var timepct = (time.getTime() - timeZero.getTime()) / 5000.0;
        widget.doclearlines();
        var frontier = [];
        var skips = widget.getSkips();
        if (skips != null) {
            for (var s = 0; s < skips.length; s++) {
                var skip = skips[s];
                for (var i = 0; i < preimages.length; i++) {
                    var piangles = preimages[i];
                    var myfrontier = widget.drawPILinesInner(widget.rblines.element, piangles, skip, timepct);
                    for (var j = 0; j < myfrontier.length; j++) {
                        frontier.push(myfrontier[j]);
                    }
                }
            }
        }
        var N = widget.plotDims().windowN;
        var ctx = setupCTX(widget.rblines.element, N);
        for (var i = 0; i < frontier.length; i++) {
            var t = frontier[i].t;
            var dot = frontier[i].dot;
            ctx.beginPath();
            (ctx.arc).apply(ctx, [dot.x, dot.y, 6 * ctx.lineWidth, 0, 2 * Math.PI]);
            var rgb = hsvToRgb(anglehue(bpeval(widget.zs, t2c(t))), 1, 1);
            ctx.fillStyle = rgbToHex(rgb);
            ctx.strokeStyle = "#000000"; // rgbToHex([255-rgb[0], 255-rgb[1], 255-rgb[2]]);
            ctx.fill();
            ctx.stroke();
        }
        ctx.restore();
        if (timepct <= 1) {
            window.requestAnimationFrame(function () { widget.tangentsframe(widget, timeZero, preimages); });
        }
    };
    BPWidget.prototype.parseSkip = function () {
        return parseInt(this.skippoints.val(), 10);
    };
    BPWidget.prototype.autojoinpoints = function () {
        this.doclearlines();
        var ajpct = parseInt(this.autolinespoints.val(), 10);
        this.joinpis(ajpct);
        // Setup another context
        var ctx = setupCTX(this.rblines.element, this.plotDims().windowN);
        if (this.parseSkip() == 1) {
            var plotpolygon = this.plotpolygon.is(":checked");
            var drawsolid = this.solidtangents.is(":checked");
            this.drawtangents(ctx, ajpct, drawsolid);
            if (drawsolid && plotpolygon) {
                // Get tangent segments.
                var intersections = getTangentSegments(this.zs, ajpct);
                var ints = getSortedByCenter(intersections);
                this.drawponcelet(ctx, ints);
            }
        }
        if (this.doguessellipse.is(":checked")) {
            var ints2 = new Array(); // ajpct*this.zs.length);
            var tpts = numeric.linspace(0, 2 * Math.PI - 2 * Math.PI / ajpct, ajpct);
            for (var ti = 0; ti < tpts.length; ti++) {
                if (this.parseSkip() == 1) {
                    var pts = getTanPoints(this.zs, tpts[ti]);
                    for (var j = 0; j < pts.length; j++) {
                        ints2.push(pts[j].ztan);
                    }
                }
                else {
                    var pts2 = getTanPointsWithSkip(this.zs, tpts[ti], this.parseSkip());
                    for (var i = 0; i < pts2.length; i++) {
                        for (var j = 0; j < pts2[i].length; j++) {
                            ints2.push(pts2[i][j].ztan);
                        }
                    }
                }
            }
            try {
                var a = fitellipseZS2(ints2);
                console.log(numeric.prettyPrint(a.foci));
                console.log(a.axes);
                drawDecoratedEllipse(ctx, a.cent, a.majorAxisVector, a.minorAxisVector);
            }
            catch (err) {
                alert(err);
            }
            //	this.guessellipse(ctx, ints2);
        }
        ctx.restore();
    };
    ;
    BPWidget.prototype.doclearlines = function () {
        clearCanvas(this.rglines.inner);
        clearCanvas(this.rblines.inner);
    };
    ;
    BPWidget.prototype.addZero = function (z) {
        if (z.abs().x <= 1) {
            this.zs.push(z);
            this.rescatter();
            this.dropzero(null);
        }
    };
    BPWidget.prototype.attachrangeMD = function (preimagepanel) {
        var rangemd = false;
        var that = this;
        preimagepanel
            .on("mouseleave", function (e) {
            rangemd = false;
            console.log("RangeMD: " + rangemd);
        })
            .on("click", function (e) {
            rangemd = !rangemd;
            console.log("RangeMD: " + rangemd);
        })
            .on("mousemove", function (e) {
            if (rangemd /* || e.which == 1 */) {
                var z0 = zeroFromClick($(this), e);
                var z = mapZinCVs(z0, that.cpi);
                var preimages = preimage(that.zs, z);
                var v = that.showpreimages.val();
                if (v == "both") {
                    var pidivs = cssscatter(that.rainbow.parent(".zeroesholder"), that.plotDims().graphN, preimages, "pi", false);
                }
                if (v == "regions" || v == "both") {
                    var pidivs = cssscatter(that.regions.parent(".zeroesholder"), that.plotDims().graphN, preimages, "pi", false);
                }
                var idivs = cssscatter(that.range.siblings(".rangepath"), that.plotDims().graphN, [z0], "path", false);
                console.log("Scattering preimages.");
            }
        });
        /*
        preimagepanel.css("background-color", "grey")
        .css('opacity', '0.1');
        */
    };
    BPWidget.prototype.doclearplots = function () {
        this.resizeCanvasesRescatter();
        clearCanvas($(".graph"));
    };
    BPWidget.prototype.attachcanvasclicks = function () {
        var that = this;
        function addpoint(e) {
            var z = zeroFromClick($(this), e);
            that.addZero(z);
        }
        function cf(e) {
            var z = zeroFromClick($(this), e);
            showClick(z, that);
        }
        ;
        function joinpoints(e) {
            var z = zeroFromClick($(this), e);
            if (z.abs().x > .9) {
                var t = z.angle();
                that.drawPILines(t);
            }
        }
        this.rblines.on("dblclick", addpoint);
        this.rblines.on("click", cf);
        this.rglines.on("click", joinpoints);
        this.animatelines.on("click", function () { that.setupanimatetangents(); });
        this.autolinesgo.on("click", function () { that.autojoinpoints(); });
        // this.timesPI.on("click", function() {
        //     var t = parseFloat(that.theta.val());
        //     that.theta.val(Math.PI * t);
        // });
        // this.plottheta.on("click", function() {
        //     var t = parseFloat(that.theta.val());
        //     that.drawPILines(t);
        // });
        this.clearplots.on("click", function () { that.doclearplots(); });
        this.clearlines.on("click", function () { that.doclearlines(); });
        // $("#regions").on("click", cf);
        if (this.clearpreimages != null) {
            this.clearpreimages.on("click");
        }
        this.showpreimages.on("change", function (e) {
            var v = $(e.target).val();
            if (v == "none") {
                that.range.parent("div").hide();
            }
            else {
                that.range.parent("div").show();
            }
        });
        this.showpreimages.change();
    };
    ;
    BPWidget.prototype.setup = function () {
        var urlZS = window.location.search.replace(/^\?/, '');
        this.zs = parseZsString(urlZS);
        if (this.zs.length == 0) {
            this.zs = [
                c(0, 0),
                c(.5, -.5),
                c(.5, .5)
            ];
        }
        /*    zs = [
        // c(0, .25),
        c(-.5, -.5),
        c(0, .75),
        c(0,0),
        c(.5, 0)
        ];
        */
        var zeroonehalf = [
            c(0, 0),
            c(.5, 0)
        ];
        var z = [
            c(0, 0)
        ];
        // zs = zeroonehalf;
        var that = this;
        this.resizeCanvasesRescatter();
        this.showadvanced.change(function () {
            if ($(this).is(":checked")) {
                $(".advanced").show();
            }
            else {
                $(".advanced").hide();
            }
        });
        this.pixels.change(function () {
            if (parseFloat(that.pixels.val()) > 900) {
                $("body").addClass("bigdots");
            }
            else {
                $("body").removeClass("bigdots");
            }
            that.clearplots.click();
        });
        if (this.showcps != null) {
            this.showcps.change(function () {
                if (!$(this).is(":checked")) {
                    $("body").addClass("hidecps");
                }
                else {
                    $("body").removeClass("hidecps");
                }
            });
        }
        if (this.showfps != null) {
            this.showfps.change(function () {
                if ($(this).is(":checked")) {
                    $("body").addClass("showfps");
                }
                else {
                    $("body").removeClass("showfps");
                }
            });
        }
        this.showadvanced.change();
        this.skippoints.change(function () { that.rescatter(); });
        this.windowscale.change(function () { that.resizeCanvasesRescatter(); });
        this.graphzoom.change(function () { that.resizeCanvasesRescatter(); });
        var wom = function (event) {
            if (event.data.rpip != null) {
                var bpzs = rpipToBpzs(event.data.rpip);
                that.workergo.css("background-color", "");
                that.progress.append(" COPY:" + ((new Date()).getTime() - event.data.senddate));
                that.resizeCanvases();
                that.progress.append(" RC:" + ((new Date()).getTime() - event.data.senddate));
                that.rescatter();
                that.progress.append(" RE:" + ((new Date()).getTime() - event.data.senddate));
                workerRainbow(that.rainbowworker, event.data.rpip, that.plotDims().N, that.cpi.cvangles);
                that.progress.append(" WRB:" + ((new Date()).getTime() - event.data.senddate));
                workerRegions(that.regionsworker, event.data.rpip, that.plotDims().N, that.cpi.cvangles);
                that.progress.append(" WRG:" + ((new Date()).getTime() - event.data.senddate));
                doRange(that.range.element, bpzs, that.cpi, that.plotDims().N);
            }
            if (event.data.rowComplete != null) {
                that.progress.text(event.data.rowComplete + " " + event.data.comptime);
            }
        };
        if (this.worker != null) {
            this.rainbowworker.onmessage = function (e) {
                graphicsWorkerHandler(e, that.rainbow.element, that.regions.element, that.cpi, that.zs);
            };
            this.regionsworker.onmessage = function (e) {
                graphicsWorkerHandler(e, that.rainbow.element, that.regions.element, that.cpi, that.zs);
            };
            this.worker.onmessage = wom;
            this.workergo.click(function () {
                that.workergo.css("background-color", "red");
                that.worker.postMessage({ as: that.zs, N: that.plotDims().N });
                that.progress.text("");
            });
        }
        else {
            this.workergo.hide();
        }
        this.attachcanvasclicks();
        this.loadbutton.click(function () {
            that.zs = parseZsString(that.zsstring.val());
            that.resizeCanvasesRescatter();
        });
        this.gotextz.click(function () {
            var zt = that.textz.val().split(",");
            var z = c(parseFloat(zt[0]), parseFloat(zt[1]));
            showClick(z, that);
        });
        this.findpreimages.click(function () {
            var zt = that.rangepoint.val().split(",");
            var z = c(parseFloat(zt[0]), parseFloat(zt[1]));
            var preimages = preimage(that.zs, z);
            that.foundpreimages.empty();
            var pilis = preimages.map(function (cv) { return $("<li>").text(dcomplex(cv)); });
            $.each(pilis, function (i, e) { that.foundpreimages.append(e); });
        });
        if (this.screenshot != null) {
            this.screenshot.click(function () {
                var rainbowcanvas = (that.rainbow.element);
                window.open("./screenshot.html", "width=" + rainbowcanvas.width + "height=" + rainbowcanvas.height);
            });
        }
        this.plotbutton.click(function () {
            that.resizeRescatterAndReplotMe();
        });
    };
    ;
    BPWidget.prototype.resizeRescatterAndReplotMe = function () {
        this.resizeCanvasesRescatter();
        this.justReplotme();
    };
    BPWidget.prototype.getAdaptiveN = function (adaptivePerformance, plotDimsN) {
        if (adaptivePerformance) {
            var adaptiveN;
            if (this.performanceHistory.length == 0) {
                adaptiveN = this.plotDims().N;
            }
            else {
                var averageflopsPerMS = this.performanceHistory.map(function (x) { return x.flopsPerMS(); }).sum() / this.performanceHistory.length;
                adaptiveN = Math.sqrt(1000 * averageflopsPerMS / this.zs.length);
                adaptiveN = Math.round(Math.min(this.plotDims().N, adaptiveN));
            }
            return adaptiveN;
        }
        else {
            return this.plotDims().N;
        }
    };
    BPWidget.prototype.addPerformanceLog = function (degree, N, timeInMS) {
        var pl = new PerformanceLog();
        pl.degree = degree;
        pl.N = N;
        pl.timeInMS = timeInMS;
        this.performanceHistory.push(pl);
        console.log(pl.N + "\t" + pl.degree + "\t" + pl.timeInMS);
        if (this.performanceHistory.length > 10) {
            var startIndex = this.performanceHistory.length - 10;
            this.performanceHistory = this.performanceHistory.slice(startIndex);
        }
    };
    BPWidget.prototype.justReplotme = function (adaptivePerformance) {
        if (adaptivePerformance === void 0) { adaptivePerformance = false; }
        var th = this.rayThreshold.val();
        if (th == undefined || th == "") {
            th = 0;
        }
        else {
            th = parseFloat(this.rayThreshold.val());
        }
        var N = this.getAdaptiveN(adaptivePerformance, this.plotDims().N);
        var t0 = performance.now();
        this.fastReplot(this.zs, N, this.cpi, th);
        var t1 = performance.now();
        this.addPerformanceLog(this.zs.length, N, t1 - t0);
    };
    return BPWidget;
}());
var EasyResizeWidget = /** @class */ (function (_super) {
    __extends(EasyResizeWidget, _super);
    function EasyResizeWidget(obj) {
        var _this = _super.call(this, obj, false) || this;
        _this.plotDims = function () {
            return { N: 150, zoom: 1, windowN: 300, graphN: 300 };
        };
        _this.resizeCanvases = function () {
            resize(this.rainbow, this.plotDims());
            resize(this.rblines, this.plotDims());
            resize(this.regions, this.plotDims());
        };
        var that = _this;
        _this.zsstring.change(function () {
            that.zs = parseZsString(that.zsstring.val());
            that.rescatter();
        });
        var setdims = function (i, e) {
            e.width = that.plotDims().windowN;
            e.height = e.width;
        };
        _this.setAllDims = function () {
            that.rainbow.each(setdims);
            that.regions.each(setdims);
            that.regions.each(setdims);
            that.rblines.each(setdims);
            $("#overlay").each(setdims);
            $("#inneroverlay").each(setdims);
        };
        _this.setAllDims();
        return _this;
    }
    return EasyResizeWidget;
}(BPWidget));
//# sourceMappingURL=bpui.js.map