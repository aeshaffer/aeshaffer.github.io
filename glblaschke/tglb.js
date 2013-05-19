var camera, scene, renderer;
var geometry, material, mesh;
var square, squareMat, squareMesh;
var vertexShader, fragmentShader;
var uniforms;

function getshaderfromfile(filename) {
    var retval;
    $.ajax(filename, {async: false})
	.done(function(data) {
	    retval = data;
	}).fail(function(e) {
	    console.log(e);
	});
    return "#define THREE_JS\n" + retval;
}
    

$(function() {
    vertexShader = getshaderfromfile("vshader.c");
    fragmentShader = getshaderfromfile("blah.c");

    init();
    animate();
});

function getUniforms(t) {
    var z0 = new THREE.Vector2(0.0, 0.0);
    var z1 = new THREE.Vector2(Math.sin(t)/2, Math.cos(t)/2);
    var z2 = new THREE.Vector2(0.5, 0.5);
    var zeroes = [z0, z1, z2]
    var retval = {
	"zeroes": {type: "v2v", value: zeroes},
	"numzeroes": {type: "i", value: zeroes.length}
    };
    return retval
}

var time = 0;

function init() {
    
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );
    camera.position.z = 1000;
    
    scene = new THREE.Scene();
    
    square = new THREE.PlaneGeometry(600,600,1,1);
    squareMat = new THREE.MeshBasicMaterial( {color: 0x00ff00 } );
    uniforms = getUniforms(time);
    squareMat = new THREE.ShaderMaterial({
	vertexShader: vertexShader,
	fragmentShader: fragmentShader,
	uniforms: uniforms
    });

    squareMesh = new THREE.Mesh(square, squareMat);
    scene.add(squareMesh);

    geometry = new THREE.CubeGeometry( 200, 200, 200 );
    material = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: true } );
    
    mesh = new THREE.Mesh( geometry, material );
    scene.add( mesh );
    
    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth - 20, window.innerHeight -20);
    
    document.body.appendChild( renderer.domElement );
    
}

function animate() {
    
    // note: three.js includes requestAnimationFrame shim
    requestAnimationFrame( animate );
    
    // uniforms = getUniforms(time);
    time += .1;
    squareMat.uniforms.zeroes.value[1] = new THREE.Vector2(Math.sin(time)/2, Math.cos(time)/2);
    // squareMat.uniforms.zeroes.value.push(new THREE.Vector2(.2, .2)); squareMat.uniforms.numzeroes.value = 4;    
    squareMat.uniforms.zeroes._array = undefined;

    renderer.render( scene, camera );
    
}
