function flatten(array){
    var flat = [];
    for (var i = 0, l = array.length; i < l; i++){
        var type = Object.prototype.toString.call(array[i]).split(' ').pop().split(']').shift().toLowerCase();
        if (type) { flat = flat.concat(/^(array|collection|arguments|object)$/.test(type) ? flatten(array[i]) : array[i]); }
    }
    return flat;
}


var canvas;
var gl;

var cubeVerticesBuffer;
var cubeVerticesTextureCoordBuffer;
var cubeVerticesIndexBuffer;
var cubeVerticesIndexBuffer;
var cubeRotation = 0.0;
var lastCubeUpdateTime = 0;

var mvMatrix;
var shaderProgram;
var vertexPositionAttribute;
var textureCoordAttribute;
var perspectiveMatrix;


var locations = [
    [0, 0], [.5,.5], [-.5,-.5], [-.5,0]
];

locations = [[-.5,0]];

var cvcanvas;
var cvcanvascontext;
var idWhite;
var idBlack;
$(function() {
    cvcanvas = $("#cvcanvas")[0];
    cvcanvascontext = cvcanvas.getContext("2d");
    idWhite = cvcanvascontext.createImageData(1,1);
    idWhite.data[0] = 255;
    idWhite.data[1] = 0; // 255;
    idWhite.data[2] = 0; // 255;
    idWhite.data[3] = 255;
    idBlack = cvcanvascontext.createImageData(1,1);
    idBlack.data[0] = 0;
    idBlack.data[1] = 255; // 0;
    idBlack.data[2] = 0;
    idBlack.data[3] = 255;
});

function getXY2(z) {
    var iccssw = $(canvas).width();
    var iccssh = $(canvas).height();
    var xi = Math.round(iccssw)*(1+z.x)/2;
    var yi = Math.round(iccssh)*(1-z.y)/2;
    return {x: xi, y: yi};
}

function plotCVAngles(cpi) {
    cvcanvascontext.clearRect(0, 0, cvcanvas.width, cvcanvas.height);
    var cvangles = cpi.cvangles;
    var rs = numeric.linspace(0,1,256);
    var zs = locations.map(function(arr) { return c(arr[0], arr[1]); });
    for(var cvai = 0; cvai < cvangles.length; cvai++) {
	var cv = cvangles[cvai];
	var preimages = rs.map(function(r) { return preimage(zs, rt2c(r, cv))});
	var np = [];
	np = np.concat.apply(np, preimages)
	var preimagesPixels = np.map(function(z) {return getXY2(fixy(z));});
	for(var pii = 0; pii < preimagesPixels.length; pii++) {	    
	    var pip = preimagesPixels[pii];
	    cvcanvascontext.putImageData(Math.random() > .5 ? idBlack: idWhite, pip.x, pip.y);
	}
    }
}

function recalcBP(cvlines) {
    bproots = cpinfo(locations.map(xytoc));
    if(cvlines) {  
	plotCVAngles(bproots);
    }
    if($("#plotcps").is(":checked")) {
	cssscatter($(".canvaswrapper"), 640, bproots.cps, "cp", true);
    } else {
	cssscatter($(".canvaswrapper"), 640, [], "cp", true);
    }
}

var bproots = [];

$(function() {
    recalcBP();
});

function tocoords(me) {
    var c = me.currentTarget;
    var w = $(c).width();
    var w2 = w/2;
    var h = $(c).height();
    var h2 = h/2;
    var offX  = (me.offsetX || me.clientX - $(me.target).offset().left);
    var offY  = (me.offsetY || me.clientY - $(me.target).offset().top);
    var x = (offX - c.clientLeft - w2)/w2;
    var y = -1*(offY - c.clientTop - h2)/h2;
    return {x:x, y:y};
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

$(function() {
   
    $("#glcanvas, #cvcanvas")
	.mouseenter(function(me) {
	    stopped();
	})
	.mouseleave(function(me) {
	    stopped();
	})
	.on("dblclick", function(me) {
	    var xy = tocoords(me);
	    locations.push([xy.x,xy.y]);
	    recalcBP(true);
	})
	.mousemove(function(me) {
	    if(locationindex != -1) {
		var z = tocoords(me);
		locations[locationindex] = [z.x, z.y];
		recalcBP(false);
	    }
	})
	.mousedown(function(me) {	    
	    var z = tocoords(me);
	    var closepoints = locations.map(function(e,i) { 
		return {i:i, d: Math.pow(e[0] - z.x, 2) + 
			Math.pow(e[1] - z.y, 2)}; })
		.filter(function(id) { return id.d < .05; });
	    
	    console.log(closepoints);
	    if(closepoints.length > 1) {
		var ds = closepoints.map(function(id) { return id.d; });
		var mind = Math.min.apply(null, ds);
		var cp2 = closepoints.filter(function(id) { return id.d == mind;});
		locationindex = cp2[0].i;
		moving();
	    } 
	    else if(closepoints.length == 1) {
		locationindex = closepoints[0].i;
		moving();
	    } else {
		stopped();
	    }
	    console.log(z, locations[locationindex]);
	    me.originalEvent.preventDefault();
	})
	.mouseup(function(me) {
	    if(locationindex >=0) {
		var z = tocoords(me);
		if(c(z.x, z.y).abs().x > 1) {
		    locations.splice(locationindex, 1);
		}
	    }
	    recalcBP(true);
	    stopped();
	});
});

//
// start
//
// Called when the canvas is created to get the ball rolling.
//
function start() {
  canvas = document.getElementById("glcanvas");

  initWebGL(canvas);      // Initialize the GL context
  
  // Only continue if WebGL is available and working
  
  if (gl) {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
    gl.clearDepth(1.0);                 // Clear everything
    gl.enable(gl.DEPTH_TEST);           // Enable depth testing
    gl.depthFunc(gl.LEQUAL);            // Near things obscure far things
    
    // Initialize the shaders; this is where all the lighting for the
    // vertices and so forth is established.
    
    initShaders();
    
    // Here's where we call the routine that builds all the objects
    // we'll be drawing.
    
    initBuffers();

      initTextures();
    
    // Set up to draw the scene periodically.
    
    setInterval(drawScene, 15);
  }
}

//
// initWebGL
//
// Initialize WebGL, returning the GL context or null if
// WebGL isn't available or could not be initialized.
//
function initWebGL() {
  gl = null;
  
  try {
    gl = canvas.getContext("experimental-webgl");
  }
  catch(e) {
  }
  
  // If we don't have a GL context, give up now
  
  if (!gl) {
    alert("Unable to initialize WebGL. Your browser may not support it.");
  }
}

  // Now create an array of vertices for the cube.
  
  var vertices = [
    // Front face
    -1.0, -1.0,  1.0,
     1.0, -1.0,  1.0,
     1.0,  1.0,  1.0,
    -1.0,  1.0,  1.0,
  ];
  
  var textureCoordinates = [
    // Front
    0.0,  0.0,
    1.0,  0.0,
    1.0,  1.0,
    0.0,  1.0
  ];

  // This array defines each face as two triangles, using the
  // indices into the vertex array to specify each triangle's
  // position.
  
  var cubeVertexIndices = [
    0,  1,  2,      0,  2,  3
  ]


//
// initBuffers
//
// Initialize the buffers we'll need. For this demo, we just have
// one object -- a simple two-dimensional cube.
//
function initBuffers() {
  
  // Create a buffer for the cube's vertices.
  
  cubeVerticesBuffer = gl.createBuffer();
  
  // Select the cubeVerticesBuffer as the one to apply vertex
  // operations to from here out.
  
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeVerticesBuffer);
  
  // Now pass the list of vertices into WebGL to build the shape. We
  // do this by creating a Float32Array from the JavaScript array,
  // then use it to fill the current vertex buffer.
  
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

  // Map the texture onto the cube's faces.
  
  cubeVerticesTextureCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeVerticesTextureCoordBuffer);  
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates),
                gl.STATIC_DRAW);

  // Build the element array buffer; this specifies the indices
  // into the vertex array for each face's vertices.
  
  cubeVerticesIndexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVerticesIndexBuffer);  
  
  // Now send the element array to GL
  
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(cubeVertexIndices), gl.STATIC_DRAW);
}

//
// drawScene
//
// Draw the scene.
//
function drawScene() {
  // Clear the canvas before we start drawing on it.

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
  // Establish the perspective with which we want to view the
  // scene. Our field of view is 45 degrees, with a width/height
  // ratio of 640:480, and we only want to see objects between 0.1 units
  // and 100 units away from the camera.
  
  //perspectiveMatrix = makePerspective(45, 640.0/480.0, 0.1, 100.0);

  perspectiveMatrix = makeOrtho(-1,1,-1,1,-2,2);
  
  // Set the drawing position to the "identity" point, which is
  // the center of the scene.
  
  loadIdentity();
  
  // Now move the drawing position a bit to where we want to start
  // drawing the cube.
  
  //mvTranslate([-0.0, 0.0, -6.0]);
  
  // Save the current matrix, then rotate before we draw.
  
  mvPushMatrix();
  //mvRotate(cubeRotation, [1, 0, 1]);
  
  // Draw the cube by binding the array buffer to the cube's vertices
  // array, setting attributes, and pushing it to GL.
  
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeVerticesBuffer);
  gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
  
  // Set the texture coordinates attribute for the vertices.
  
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeVerticesTextureCoordBuffer);
  gl.vertexAttribPointer(textureCoordAttribute, 2, gl.FLOAT, false, 0, 0);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, cubeTexture);
    gl.uniform1i(gl.getUniformLocation(shaderProgram, "uSampler"), 0);
  
  // Draw the cube.
  
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVerticesIndexBuffer);
  setMatrixUniforms();
  gl.drawElements(gl.TRIANGLES, cubeVertexIndices.length, gl.UNSIGNED_SHORT, 0);
  
  // Restore the original matrix
  
  mvPopMatrix();
  
  // Update the rotation for the next draw, if it's time to do so.
  
  var currentTime = (new Date).getTime();
  if (lastCubeUpdateTime) {
    var delta = currentTime - lastCubeUpdateTime;
    
    cubeRotation += (30 * delta) / 1000.0;
  }
  
  lastCubeUpdateTime = currentTime;
}

var cubeTexture;
var cubeImage;

function initTextures() {
  cubeTexture = gl.createTexture();
  cubeImage = new Image();
  cubeImage.onload = function() { handleTextureLoaded(cubeImage, cubeTexture); }
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

//
// initShaders
//
// Initialize the shaders, so WebGL knows how to light our scene.
//
function initShaders() {
   shaders = loadShaders(gl, "vs", ["vshader"]);
    vertexShader = shaders[0];
    shaders = loadShaders(gl, "fs", ["texturebp"]);
    fragmentShader = shaders[0];
  
  // Create the shader program
  
  shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);
  
  // If creating the shader program failed, alert
  
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert("Unable to initialize the shader program.");
  }
  
  gl.useProgram(shaderProgram);
  
  vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
  gl.enableVertexAttribArray(vertexPositionAttribute);
  
  textureCoordAttribute = gl.getAttribLocation(shaderProgram, "aTextureCoord");
  gl.enableVertexAttribArray(textureCoordAttribute);
}

//
// getShader
//
// Loads a shader program by scouring the current document,
// looking for a script with the specified ID.
//
function getShader(gl, id) {
  var shaderScript = document.getElementById(id);
  
  // Didn't find an element with the specified ID; abort.
  
  if (!shaderScript) {
    return null;
  }
  
  // Walk through the source element's children, building the
  // shader source string.
  
  var theSource = "";
  var currentChild = shaderScript.firstChild;
  
  while(currentChild) {
    if (currentChild.nodeType == 3) {
      theSource += currentChild.textContent;
    }
    
    currentChild = currentChild.nextSibling;
  }
  
  // Now figure out what type of shader script we have,
  // based on its MIME type.
  
  var shader;
  
  if (shaderScript.type == "x-shader/x-fragment") {
    shader = gl.createShader(gl.FRAGMENT_SHADER);
  } else if (shaderScript.type == "x-shader/x-vertex") {
    shader = gl.createShader(gl.VERTEX_SHADER);
  } else {
    return null;  // Unknown shader type
  }
  
  // Send the source to the shader object
  
  gl.shaderSource(shader, theSource);
  
  // Compile the shader program
  
  gl.compileShader(shader);
  
  // See if it compiled successfully
  
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader));
    return null;
  }
  
  return shader;
}

//
// Matrix utility functions
//

function loadIdentity() {
  mvMatrix = Matrix.I(4);
}

function multMatrix(m) {
  mvMatrix = mvMatrix.x(m);
}

function mvTranslate(v) {
  multMatrix(Matrix.Translation($V([v[0], v[1], v[2]])).ensure4x4());
}

function setMatrixUniforms() {
    var pUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
    gl.uniformMatrix4fv(pUniform, false, new Float32Array(perspectiveMatrix.flatten()));
    
    var mvUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
    gl.uniformMatrix4fv(mvUniform, false, new Float32Array(mvMatrix.flatten()));
    
    var zeroesUniform = gl.getUniformLocation(shaderProgram, "zeroes");
    gl.uniform2fv(zeroesUniform, flatten(locations));
    var numzeroesUniform = gl.getUniformLocation(shaderProgram, "numzeroes");
    gl.uniform1i(numzeroesUniform, locations.length);
}

var mvMatrixStack = [];

function mvPushMatrix(m) {
  if (m) {
    mvMatrixStack.push(m.dup());
    mvMatrix = m.dup();
  } else {
    mvMatrixStack.push(mvMatrix.dup());
  }
}

function mvPopMatrix() {
  if (!mvMatrixStack.length) {
    throw("Can't pop from an empty matrix stack.");
  }
  
  mvMatrix = mvMatrixStack.pop();
  return mvMatrix;
}

function mvRotate(angle, v) {
  var inRadians = angle * Math.PI / 180.0;
  
  var m = Matrix.Rotation(inRadians, $V([v[0], v[1], v[2]])).ensure4x4();
  multMatrix(m);
}
