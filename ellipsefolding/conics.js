
function buildAxis( src, dst, colorHex, dashed ) {
        var geom = new THREE.Geometry(),
            mat; 

        if(dashed) {
                mat = new THREE.LineDashedMaterial({ linewidth: 3, color: colorHex, dashSize: 1, gapSize: 1 });
        } else {
                mat = new THREE.LineBasicMaterial({ linewidth: 3, color: colorHex });
        }

        geom.vertices.push( src.clone() );
        geom.vertices.push( dst.clone() );
        geom.computeLineDistances(); // This one is SUPER important, otherwise dashed lines will appear as simple plain lines

        var axis = new THREE.LineSegments(geom, mat);

        return axis;

}

function buildAxes( length ) {
        var axes = new THREE.Object3D();

        axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( length, 0, 0 ), 0xFF0000, false ) ); // +X
        axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( -length, 0, 0 ), 0xFF0000, true) ); // -X
        axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, length, 0 ), 0x00FF00, false ) ); // +Y
        axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, -length, 0 ), 0x00FF00, true ) ); // -Y
        axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, length ), 0x0000FF, false ) ); // +Z
        axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, -length ), 0x0000FF, true ) ); // -Z

        return axes;

}


var rectGeom;
var rectMesh;
var scene;
var camera;
var cone;
var controls;

function checksides(v1, v2, pp, n) {
    var v1mpp = new THREE.Vector3().subVectors(v1, pp);
    var v2mpp = new THREE.Vector3().subVectors(v2, pp);
    var v1d = v1mpp.dot(n);
    var v2d = v2mpp.dot(n);
    return (v1d > 0) != (v2d > 0);
}

function separate(geom, pp, n) {
    var v0 = geom.vertices[0];
    var sameside = [0];
    var otherside = []
    for(var i = 1; i < geom.vertices.length; i++) {
        var v1 = geom.vertices[i];
        if(checksides(v0, v1, pp, n)) {
            otherside.push(i);
        } else {
            sameside.push(i);
        }
    }
    return {"sameside": sameside, "otherside": otherside};
}

function project(vertices, conepoint, inds, pp, n) {
    var plane = new THREE.Plane(n, pp.length());
    var verts = inds.map(function(i) { return new THREE.Vector3().copy(vertices[i]); });
    var pToCP = plane.distanceToPoint(conepoint);
    function f(v) {    
        var perpDistance = pToCP + Math.abs(plane.distanceToPoint(v));
        var vMinusCP = new THREE.Vector3().subVectors(v, conepoint);
        var percentage = pToCP/perpDistance;
        var cpToPlane = new THREE.Vector3().copy(vMinusCP);
        cpToPlane.multiplyScalar(percentage);
        var proj = new THREE.Vector3().addVectors(conepoint, cpToPlane);
        return proj;
    }
    var projverts = verts.map(f);
    return projverts;
}

function getProjections() {
    var x = separate(cone.geometry, new THREE.Vector3(0,0,0), new THREE.Vector3(0,1,0)); 
    function copyWorld(v) {
        return v.clone().applyMatrix4(cone.matrixWorld);
    }
    var conepoint = copyWorld(cone.geometry.vertices[x.sameside[0]]);
    var otherside = x.otherside;
    var vertices = cone.geometry.vertices.map(copyWorld);
    var retval = project(vertices, conepoint, otherside, new THREE.Vector3(0,0,0), new THREE.Vector3(0,1,0));
    return retval;
}

function showProjPoints() {
    var projs = getProjections();
    var projsGeometry = new THREE.Geometry();
    projsGeometry.vertices = projs;
    var pts = new THREE.Points(projsGeometry);
    pts.material.size=.10
    scene.add(pts);
}

/*     
    var translateMatrix = (new THREE.Matrix4()).makeTranslation(-conepoint.x, -conepoint.y, -conepoint.z);    
    var rotationQuat = new THREE.Quaternion().setFromUnitVectors(pp.normalize(), (new THREE.Vector3(0,0,1)).normalize());
    rotationMatrix = (new THREE.Matrix4().makeRotationFromQuaternion(rotationQuat));
    var shearmatrix = new THREE.Matrix4().
    var transverts = verts.map(function(v) { return v.applyMatrix(translateMatrix); });
*/

function updateRotation(mesh) {
    mesh.updateMatrix()
mesh.geometry.applyMatrix(mesh.matrix);
mesh.matrix.identity();
mesh.geometry.verticesNeedUpdate = true;
mesh.rotation.set(0,0,0);

}

var cvs;
var ctx;

$(function() {
    cvs=document.getElementById("canvas");
    ctx=cvs.getContext("2d");
    ctx.transform(128, 0, 0, -128, 128, 128);
    ctx.lineWidth = 1.0/cvs.width;
    ctx.beginPath();
    ctx.moveTo(-1, 0);
    ctx.lineTo(1, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, -1);
    ctx.lineTo(0, 1);
    ctx.stroke();

    $("#go3d").bind("click", function() {



        scene = new THREE.Scene();
         camera = new THREE.PerspectiveCamera( 75, 1, 0.1, 1000 );
        camera.position.x = 1;
        camera.position.y = 1;
        camera.position.z = 1;
        var renderer = new THREE.WebGLRenderer();
        renderer.setSize( 512,512 );
        $("#canvas3dcontainer").append(renderer.domElement);
        var geometry = new THREE.CylinderGeometry( 0, 1, 2, 16, 1, true );
        var material = new THREE.MeshNormalMaterial({});
        material.side = THREE.DoubleSide;
        cone = new THREE.Mesh( geometry, material );
        cone.rotateZ(Math.PI/6);
        // updateRotation(cone);
        scene.add( cone );

var rectLength = 1, rectWidth = 1;

var rectShape = new THREE.Shape();
rectShape.moveTo( -1,1 );
rectShape.lineTo( -1, -1 );
rectShape.lineTo( 1, -1 );
rectShape.lineTo( 1, 1  );
rectShape.lineTo( -1, 1 );

rectGeom = new THREE.ShapeGeometry( rectShape );
var texture2 = new THREE.Texture(cvs);
var rectMaterial =new THREE.MeshBasicMaterial( { transparent: true, opacity: .5, side: THREE.DoubleSide, color: 0xff0000} ) ;
var material2 = new THREE.MeshBasicMaterial( {map: texture2, side:THREE.DoubleSide} );
material2.map.offset.set(.5, .5);
material2.map.repeat.set(.5, .5);
material2.transparent = false;
material2.map.needsUpdate = true;

rectMesh = new THREE.Mesh( rectGeom, material2) ;
rectMesh.rotateX(Math.PI/2);
updateRotation(rectMesh);
scene.add( rectMesh );


var pointLight = new THREE.PointLight( 0xFFFF8F );

// set its position
pointLight.position.x = 10;
pointLight.position.y = 50;
pointLight.position.z = 130;

// add to the scene
scene.add(pointLight);

var axes = buildAxes(20);
scene.add(axes);
        


				controls = new THREE.TrackballControls( camera );

				controls.rotateSpeed = 50.0;
				controls.zoomSpeed = 1.2;
				controls.panSpeed = 0.8;

				controls.noZoom = false;
				controls.noPan = false;

				controls.staticMoving = true;
				controls.dynamicDampingFactor = 0.3;

				controls.keys = [ 65, 83, 68 ];

				controls.addEventListener( 'change', render );



        camera.lookAt(new THREE.Vector3(0,0,0));
        function render() {
            requestAnimationFrame( render );
            renderer.render( scene, camera );
        }


			function animate() {

				requestAnimationFrame( animate );
				controls.update();

			}
       
        render();

        animate();

    });
