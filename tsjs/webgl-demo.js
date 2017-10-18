/// <reference path="../tsfiles/numeric-1.2.3.d.ts" />
/// <reference path="../tsfiles/blaschke.ts" />
/// <reference path="../tsfiles/bpuiutils.ts" />
/// <reference path="../tsfiles/loadshaders.ts" />
function flatten(array) {
    var flat = [];
    for (var i = 0, l = array.length; i < l; i++) {
        var type = Object.prototype.toString.call(array[i]).split(' ').pop().split(']').shift().toLowerCase();
        if (type) {
            flat = flat.concat(/^(array|collection|arguments|object)$/.test(type) ? flatten(array[i]) : array[i]);
        }
    }
    return flat;
}
var canvas;
var gl;
var squareVerticesBuffer;
var squareVerticesTextureCoordBuffer;
var squareVerticesIndexBuffer;
var shaderProgram;
var vertexPositionAttribute;
var textureCoordAttribute;
var vertexShader;
var shaders;
var fragmentShader;
var squareTexture;
var cubeImage;
var locations = [
    [0, 0], [.5, .5], [-.5, -.5], [-.5, 0]
];
locations = [[-.5, 0]];
var cvcanvas;
var cvcanvascontext;
var idWhite;
var idBlack;
$(function () {
    cvcanvas = $("#cvcanvas")[0];
    cvcanvascontext = cvcanvas.getContext("2d");
    idWhite = cvcanvascontext.createImageData(1, 1);
    idWhite.data[0] = 255;
    idWhite.data[1] = 0; // 255;
    idWhite.data[2] = 0; // 255;
    idWhite.data[3] = 255;
    idBlack = cvcanvascontext.createImageData(1, 1);
    idBlack.data[0] = 0;
    idBlack.data[1] = 255; // 0;
    idBlack.data[2] = 0;
    idBlack.data[3] = 255;
});
function getXY2(z) {
    var iccssw = $(canvas).width();
    var iccssh = $(canvas).height();
    var xi = Math.round(iccssw) * (1 + z.x) / 2;
    var yi = Math.round(iccssh) * (1 - z.y) / 2;
    return { x: xi, y: yi };
}
function plotCVAngles(cpi) {
    cvcanvascontext.clearRect(0, 0, cvcanvas.width, cvcanvas.height);
    var cvangles = cpi.cvangles;
    if (cvangles.length > 0) {
        var rs = numeric.linspace(0, 1, Math.round(256 / cvangles.length));
        var zs = locations.map(function (arr) { return c(arr[0], arr[1]); });
        for (var cvai = 0; cvai < cvangles.length; cvai++) {
            var cv = cvangles[cvai];
            var preimages = rs.map(function (r) { return preimage(zs, rt2c(r, cv)); });
            var np = [];
            np = np.concat.apply(np, preimages);
            var preimagesPixels = np.map(function (z) { return getXY2(fixy(z)); });
            for (var pii = 0; pii < preimagesPixels.length; pii++) {
                var pip = preimagesPixels[pii];
                //cvcanvascontext.putImageData(Math.random() > .5 ? idBlack: idWhite, pip.x, pip.y);
                cvcanvascontext.beginPath();
                cvcanvascontext.arc(pip.x, pip.y, 2, 0, 2 * Math.PI, false);
                cvcanvascontext.fillStyle = Math.random() > .5 ? 'blue' : 'orange';
                cvcanvascontext.fill();
            }
        }
    }
}
var bproots;
function recalcBP(cvlines) {
    bproots = cpinfo(locations.map(xytoc));
    if (cvlines) {
        plotCVAngles(bproots);
        var xys = locations.map(function (a) { return getXY2(c(a[0], a[1])); });
        for (var i = 0; i < xys.length; i++) {
            var xy = xys[i];
            cvcanvascontext.beginPath();
            cvcanvascontext.arc(xy.x, xy.y, 5, 0, 2 * Math.PI, false);
            cvcanvascontext.strokeStyle = 'black';
            cvcanvascontext.lineWidth = 2;
            cvcanvascontext.stroke();
        }
    }
    if ($("#plotcps").is(":checked")) {
        cssscatter($(".canvaswrapper"), 640, bproots.cps, "cp", true);
    }
    else {
        cssscatter($(".canvaswrapper"), 640, [], "cp", true);
    }
}
$(function () {
    recalcBP(null);
});
function tocoords(me) {
    var c = me.currentTarget;
    var w = $(c).width();
    var w2 = w / 2;
    var h = $(c).height();
    var h2 = h / 2;
    var offX = (me.offsetX || me.clientX - $(me.target).offset().left);
    var offY = (me.offsetY || me.clientY - $(me.target).offset().top);
    var x = (offX - c.clientLeft - w2) / w2;
    var y = -1 * (offY - c.clientTop - h2) / h2;
    return { x: x, y: y };
}
function xytoc(xy) {
    return c(xy[0], xy[1]);
}
var locationindex = -1;
function moving() {
    $("#glcanvaswrapper").addClass("moving");
}
function stopped() {
    locationindex = -1;
    $("#glcanvaswrapper").removeClass("moving");
}
$(function () {
    $("#glcanvas, #cvcanvas")
        .mouseenter(function (me) {
        stopped();
    })
        .mouseleave(function (me) {
        stopped();
    })
        .on("dblclick", function (me) {
        var xy = tocoords(me);
        locations.push([xy.x, xy.y]);
        recalcBP(true);
    })
        .mousemove(function (me) {
        if (locationindex != -1) {
            var z = tocoords(me);
            locations[locationindex] = [z.x, z.y];
            recalcBP(false);
        }
    })
        .mousedown(function (me) {
        var z = tocoords(me);
        var closepoints = locations.map(function (e, i) {
            return {
                i: i, d: Math.pow(e[0] - z.x, 2) +
                    Math.pow(e[1] - z.y, 2)
            };
        })
            .filter(function (id) { return id.d < .05; });
        console.log(closepoints);
        if (closepoints.length > 1) {
            var ds = closepoints.map(function (id) { return id.d; });
            var mind = Math.min.apply(null, ds);
            var cp2 = closepoints.filter(function (id) { return id.d == mind; });
            locationindex = cp2[0].i;
            moving();
        }
        else if (closepoints.length == 1) {
            locationindex = closepoints[0].i;
            moving();
        }
        else {
            stopped();
        }
        console.log(z, locations[locationindex]);
        me.originalEvent.preventDefault();
    })
        .mouseup(function (me) {
        if (locationindex >= 0) {
            var z = tocoords(me);
            if (c(z.x, z.y).abs().x > 1) {
                locations.splice(locationindex, 1);
            }
        }
        recalcBP(true);
        stopped();
    });
});
function start() {
    canvas = document.getElementById("glcanvas");
    initWebGL();
    if (gl) {
        gl.clearColor(0.0, 0.0, 0.0, 1.0); // Clear to black 
        gl.clearDepth(1.0); // Clear everything
        gl.enable(gl.DEPTH_TEST); // Enable depth testing
        gl.depthFunc(gl.LEQUAL); // Near things obscure far things
        initShaders();
        initBuffers();
        initTextures();
        setInterval(drawScene, 15);
    }
}
function initWebGL() {
    gl = null;
    try {
        gl = canvas.getContext("experimental-webgl");
    }
    catch (e) {
        console.log(e);
    }
    // If we don't have a GL context, give up now
    if (!gl) {
        alert("Unable to initialize WebGL. Your browser may not support it.");
    }
}
// Corners of a square at z=1.
var vertices = [
    -1.0, -1.0, 1.0,
    1.0, -1.0, 1.0,
    1.0, 1.0, 1.0,
    -1.0, 1.0, 1.0,
];
var textureCoordinates = [
    // Front
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0
];
// Make a square out of two triangles for 
// us to render our texture onto.
var squareVertexIndices = [
    0, 1, 2, 0, 2, 3
];
function initBuffers() {
    squareVerticesBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, squareVerticesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    squareVerticesTextureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, squareVerticesTextureCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates), gl.STATIC_DRAW);
    squareVerticesIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, squareVerticesIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(squareVertexIndices), gl.STATIC_DRAW);
}
function drawScene() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.bindBuffer(gl.ARRAY_BUFFER, squareVerticesBuffer);
    gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, squareVerticesTextureCoordBuffer);
    gl.vertexAttribPointer(textureCoordAttribute, 2, gl.FLOAT, false, 0, 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, squareTexture);
    gl.uniform1i(gl.getUniformLocation(shaderProgram, "uSampler"), 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, squareVerticesIndexBuffer);
    setMatrixUniforms();
    gl.drawElements(gl.TRIANGLES, squareVertexIndices.length, gl.UNSIGNED_SHORT, 0);
}
$(function () {
    $("#goupload").click(function () {
        var file = $("#uploadfile")[0].files[0];
        var fr = new FileReader();
        fr.onload = function () {
            initTexturesFile(fr.result);
        };
        fr.readAsDataURL(file);
    });
});
function initTexturesFile(durl) {
    squareTexture = gl.createTexture();
    cubeImage = new Image();
    cubeImage.onload = function () {
        var origcanvas = document.getElementById('origcanvas');
        var squarecanvas = document.getElementById('squarecanvas');
        var sourcecanvas = document.getElementById('sourcecanvas');
        // Draw the image into the canvas
        var origctx = origcanvas.getContext("2d");
        var dim = Math.min(cubeImage.width, cubeImage.height);
        origcanvas.width = cubeImage.width;
        origcanvas.height = cubeImage.height;
        origctx.drawImage(cubeImage, 0, 0, cubeImage.width, cubeImage.height);
        // Get the centered square region of the original image.
        var squareID = origctx.getImageData((cubeImage.width - dim) / 2, (cubeImage.height - dim) / 2, dim, dim);
        squarecanvas.width = dim;
        squarecanvas.height = dim;
        squarecanvas.getContext("2d").putImageData(squareID, 0, 0);
        var squareImageURL = squarecanvas.toDataURL();
        var squareImage = new Image();
        squareImage.onload = function () {
            sourcecanvas.getContext("2d").drawImage(squareImage, 0, 0, 512, 512);
            var sourceImage = new Image();
            sourceImage.onload = function () { handleTextureLoaded(sourceImage, squareTexture); };
            sourceImage.src = sourcecanvas.toDataURL();
        };
        squareImage.src = squareImageURL;
    };
    cubeImage.src = durl;
}
function initTextures() {
    squareTexture = gl.createTexture();
    cubeImage = new Image();
    cubeImage.onload = function () { handleTextureLoaded(cubeImage, squareTexture); };
    cubeImage.src = "clock2.png";
}
function handleTextureLoaded(image, texture) {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindTexture(gl.TEXTURE_2D, null);
}
function initShaders() {
    shaders = loadShaders(gl, "vs", ["vshader"], null);
    vertexShader = shaders[0];
    shaders = loadShaders(gl, "fs", ["texturebp"], null);
    fragmentShader = shaders[0];
    // Create the shader program
    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Unable to initialize the shader program.");
    }
    gl.useProgram(shaderProgram);
    vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(vertexPositionAttribute);
    textureCoordAttribute = gl.getAttribLocation(shaderProgram, "aTextureCoord");
    gl.enableVertexAttribArray(textureCoordAttribute);
}
function setMatrixUniforms() {
    var pUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
    var perspectiveMatrix = [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, -0.5,
        0, -0, -0, -0, 1
    ];
    gl.uniformMatrix4fv(pUniform, false, new Float32Array(perspectiveMatrix));
    var mvUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
    var I4 = [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ];
    gl.uniformMatrix4fv(mvUniform, false, new Float32Array(I4));
    var zeroesUniform = gl.getUniformLocation(shaderProgram, "zeroes");
    gl.uniform2fv(zeroesUniform, flatten(locations));
    var numzeroesUniform = gl.getUniformLocation(shaderProgram, "numzeroes");
    gl.uniform1i(numzeroesUniform, locations.length);
}
//# sourceMappingURL=webgl-demo.js.map