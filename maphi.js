"use strict";

/// <reference path="numeric-1.2.3.js" />
var cvs;
var ctx;
var minX, maxX, minY, maxY;
function reset() {
    resetInner(-2, 2, -2, 2);
}
function resetInner(inminX, inmaxX, inminY, inmaxY) {
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

var animationFunction;

function animateF(canvas, context, startTime) {
    // update
    var time = (new Date()).getTime() - startTime;

    var speed = 10000;

    time = time % speed;
    if (time >= speed / 2) { time = speed - time; }

    var f;

    var animate = $("#animate").is(":checked");
    var animationFunction = $("#animationFunction").val();
    if (animationFunction == "phi" || animationFunction == "phirecip") {
        var s;
        if (animate) {
            var minS = -5;
            var maxS = 5;

            s = minS + (maxS - minS) * time / (speed / 2);
            $("#timespan").text("Time: " + time);
            $("#param").val(s.toFixed(2));
            if (s == 0) { s = .001; }
        } else {
            s = parseFloat($("#param").val());
        }
        f = getPhi(s, animationFunction == "phirecip");
    } else if (animationFunction == "Tr" || animationFunction == "Trrecip") {
        var r;
        if (animate) {
            r = -1 + 2 * time / (speed / 2);
            $("#timespan").text("Time: " + time);
            $("#param").val(r.toFixed(2));
        } else {
            r = parseFloat($("#param").val());
        }
        f = getTr(r, animationFunction == "Trrecip");
    } else if (animationFunction == "MaPhi" || animationFunction == "MaPhirecip") {
        var a
        if (animate) {
            a = 2 * time / (speed / 2);
            $("#timespan").text("Time: " + time);
            $("#param").val(a.toFixed(2));
        } else {
            a = parseFloat($("#param").val());
        }
        var ca = c(a, 0);
        var N = parseInt($("#Nparam").val());
        if (animationFunction == "MaPhi") {
            f = function(z) {
                var num = ca.sub(z);
                var den = c(1, 0).sub(ca.mul(z));
                return rt2c(1, 2 * Math.PI / N).mul(num).div(den);
            };
        } else if (animationFunction == "MaPhirecip") {
            f = function(z) {
                var num = ca.sub(z);
                var den = c(1, 0).sub(ca.mul(z));
                return rt2c(1, -2 * Math.PI / N).mul(den).div(num);
            }
        }
    } else {
        alert(animationFunction);
        return;
    }
    reset(-2, 2, -2, 2);
    plotIterates(f);

    // request new frame
    if (animate) {
        requestAnimFrame(function() {
            animateF(canvas, context, startTime);
        });
    }
}

function getPhi(s, recip) {
    return function(z) {
        var TwoIOverS = c(0, 2).div(s);
        var num = c(1, 0).sub(TwoIOverS).mul(z).sub(1);
        var den = z.sub(c(1, 0).add(TwoIOverS));
        return recip ? den.div(num) : num.div(den);
    }
}

function getPhiInv(s, recip) {
    return function(z) {
        var TwoIOverS = c(0, 2).div(s);
        var num = c(-1, 0).add(TwoIOverS.add(1).mul(z));
        var den = z.sub(c(1, 0).add(TwoIOverS));
        return recip ? den.div(num) : num.div(den);
    }
}

function getTr(r, recip) {
    return function(z) {
        var num = z.add(r);
        var den = c(1, 0).add(z.mul(r));
        return recip ? den.div(num) : num.div(den);
    }
}

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

function pathZ(f, z0) {
    var z = z0;
    var points = new Array();
    var numPts = 10;
    for (var i = 0; i < numPts; i++) {
        points.push(z);
        z = f(z);
    }
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (var i = 1; i < numPts; i++) {
        var prevPt = points[i - 1];
        var currentPt = points[i];
        var prevToCurrent = currentPt.sub(prevPt);
        var bigDelta = prevToCurrent.div(.2 * prevToCurrent.abs().x);
        var prevMinusDelta = prevPt.sub(bigDelta)
        var currentPlusDelta = currentPt.add(bigDelta);
        ctx.lineTo(prevMinusDelta.x, prevMinusDelta.y);
        ctx.lineTo(currentPlusDelta.x, currentPlusDelta.y);
        ctx.moveTo(points[i].x, points[i].y);
    }
    ctx.stroke();
}
function plotIterates(f) {
    var N = 50;
    var t = Math.PI * 2 / N;
    for (var n = 0; n < N; n++) {
        pathZ(f, rt2c(1, n * t + .123));
    }
}
$(function() {
    cvs = document.getElementById("graphicscanvas");
    ctx = cvs.getContext('2d');
    reset(-2, 2, -2, 2);

});
function start() {
    setTimeout(function() {
        var startTime = (new Date()).getTime();
        animateF(cvs, ctx, startTime);
    }, 1000);
}