"use strict";

/// <reference path="numeric-1.2.3.js" />
var cvs;
var ctx;
var minX, maxX, minY, maxY;
function reset(inminX, inmaxX, inminY, inmaxY) {
    minX = inminX; minY = inminY;
    maxX = inmaxX; maxY = inmaxY;
    var h = $(window).height() - $(cvs).offset().top - 50;
    $(cvs).height(h).attr("height", h).width(h).attr("width", h);

    ctx.resetTransform();
    ctx.transform(cvs.width / 2, 0, 0, -cvs.width / 2, cvs.width / 2, cvs.width / 2);
    ctx.scale(2 / (maxX - minX), 2 / (maxY - minY));
    ctx.translate(-(maxX + minX) / 2, -(maxY + minY) / 2);
    ctx.lineWidth = 1.0 / cvs.width * (maxX - minX);
    axes();
    ctx.beginPath();
    ctx.arc(0, 0, 1, 0, 2 * Math.PI);
    ctx.stroke();
}
window.requestAnimFrame = (function(callback) {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
        function(callback) {
            window.setTimeout(callback, 1000 / 60);
        };
})();
function animatePhi(canvas, context, startTime) {
    // update
    var time = (new Date()).getTime() - startTime;

    var speed = 10000;

    time = time % speed;
    if (time >= speed / 2) { time = speed - time; }

    var minS = -5;
    var maxS = 5;

    var s = minS + (maxS - minS) * time / (speed / 2);
    $("#timespan").text("Time: " + time);
    $("#sspan").text(" S: " + s.toFixed(2));
    if (s == 0) { s = .001; }
    phiS = getPhi(s);

    reset(-2, 2, -2, 2);
    plotIterates(phiS);

    // request new frame
    requestAnimFrame(function() {
        animatePhi(canvas, context, startTime);
    });
}

function animateTr(canvas, context, startTime) {
    // update
    var time = (new Date()).getTime() - startTime;
    var speed = 10000;
    time = time % speed;
    if (time >= speed / 2) { time = speed - time; }
    var r = -1 + 2 * time / (speed / 2);
    $("#timespan").text("Time: " + time);
    $("#sspan").text(" r: " + r.toFixed(2));
    Tr = getTr(r);

    reset(-2, 2, -2, 2);
    plotIterates(Tr);

    // request new frame
    requestAnimFrame(function() {
        animateTr(canvas, context, startTime);
    });
}

function getPhi(s) {
    return function(z) {
        var TwoIOverS = c(0, 2).div(s);
        var num = c(1, 0).sub(TwoIOverS).mul(z).sub(1);
        var den = z.sub(c(1, 0).add(TwoIOverS));
        return num.div(den);
    }
}

function getTr(r) {
    return function(z) {
        var num = z.add(r);
        var den = c(1,0).add(z.mul(r));
        return num.div(den);
    }
}


var phiS = getPhi(-1);

var Tr = getTr(-1);

function axes() {
    ctx.clearRect(minX, minY, maxX - minX, maxY - minY);
    ctx.fillStyle = "#ff0000";

    ctx.beginPath();
    ctx.moveTo(minX, 0);
    ctx.lineTo(maxX, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, minY);
    ctx.lineTo(0, maxY);
    ctx.stroke();

}

function pathZ(f,z0) {
    var z = z0;
    var points = new Array();
    var numPts = 50;
    for (var i = 0; i < numPts; i++) {
        points.push(z);
        z = f(z);
    }
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (var i = 1; i < numPts; i++) {
        ctx.lineTo(points[i].x, points[i].y)
    }
    ctx.stroke();
}
function plotIterates(f) {
    var z = c(-1, 0);
    var N = 50;
    var t = Math.PI * 2 / N;
    for (var n = 0; n < N; n++) {
        pathZ(f,rt2c(1, n * t));
    }
}
$(function() {
    cvs = document.getElementById("graphicscanvas");
    ctx = cvs.getContext('2d');
    reset(-2, 2, -2, 2);
    
});
function startTr() {
    setTimeout(function() {
        var startTime = (new Date()).getTime();
        animateTr(cvs, ctx, startTime);
    }, 1000);
}
function startPhi() {
    setTimeout(function() {
        var startTime = (new Date()).getTime();
        animatePhi(cvs, ctx, startTime);
    }, 1000);
}