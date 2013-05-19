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

var spheres = [new THREE.Vector2(0.0, 0.0),
	       new THREE.Vector2(Math.sin(Math.PI/4)/2, Math.cos(Math.PI/4)/2),
	       new THREE.Vector2(0.5, 0.5)];

var sphereMeshes = [];

function getUniforms(t) {
    var retval = {
	"zeroes": {type: "v2v", value: spheres},
	"numzeroes": {type: "i", value: spheres.length}
    };
    return retval
}

function c(event) {
    event.preventDefault();
    
    var vector = new THREE.Vector3(
        ( event.clientX / window.innerWidth ) * 2 - 1,
	    - ( event.clientY / window.innerHeight ) * 2 + 1,
        0.5
    );
    var projector = new THREE.Projector();
    projector.unprojectVector( vector, camera );
    
    var ray = new THREE.Raycaster( camera.position, 
				   vector.sub( camera.position ).normalize() );
    
    var intersects = ray.intersectObjects( [squareMesh] );
    
    if ( intersects.length > 0 ) {
	var pt = intersects[ 0 ].point;
	spheres.push(new THREE.Vector2(pt.x/300, pt.y/300));
	var sphereMesh = new THREE.Mesh(new THREE.SphereGeometry(20,20,20), new THREE.MeshNormalMaterial());
	sphereMeshes.push(sphereMesh);
        sphereMesh.position = pt;
        scene.add(sphereMesh);
    }
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

    for(var i = 0; i < spheres.length; i++) {
	var sphereMesh = new THREE.Mesh(new THREE.SphereGeometry(20,20,20), new THREE.MeshNormalMaterial());
	sphereMeshes.push(sphereMesh);
	scene.add(sphereMesh);
    }

    squareMesh = new THREE.Mesh(square, squareMat);
    scene.add(squareMesh);

    //geometry = new THREE.CubeGeometry( 200, 200, 200 );
    //material = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: true } );
    
    //mesh = new THREE.Mesh( geometry, material );
    //scene.add( mesh );
    
    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth - 20, window.innerHeight -20);
    
    document.body.appendChild( renderer.domElement );
    $(renderer.domElement).click(c);
    
}

function animate() {
    
    // note: three.js includes requestAnimationFrame shim
    requestAnimationFrame( animate );
    
    // uniforms = getUniforms(time);
    time += .05;
    spheres[1].x = Math.cos(time)/2;
    spheres[1].y = Math.sin(time)/2;
    for(var i = 0; i < spheres.length; i++) {
	squareMat.uniforms.zeroes.value[i] = spheres[i];
	sphereMeshes[i].position.x = spheres[i].x*300;
	sphereMeshes[i].position.y = spheres[i].y*300;
    }
    squareMat.uniforms.numzeroes.value = spheres.length;
    // squareMat.uniforms.zeroes.value.push(new THREE.Vector2(.2, .2)); squareMat.uniforms.numzeroes.value = 4;    
    squareMat.uniforms.zeroes._array = undefined;

    renderer.render( scene, camera );
    
}
