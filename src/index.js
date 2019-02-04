import * as THREE from "three";

var OrbitControls = require("three-orbit-controls")(THREE);

const scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);

var geometry = new THREE.IcosahedronGeometry(10, 2);

var vertToFaces = {};
var newVertices = geometry.vertices;
var newFaces = [];

for (var i = 0; i < geometry.faces.length; i += 1) {
  var face = geometry.faces[i];

  if (vertToFaces[face.a]) {
    vertToFaces[face.a].push(i);
  } else {
    vertToFaces[face.a] = [i];
  }

  if (vertToFaces[face.b]) {
    vertToFaces[face.b].push(i);
  } else {
    vertToFaces[face.b] = [i];
  }

  if (vertToFaces[face.c]) {
    vertToFaces[face.c].push(i);
  } else {
    vertToFaces[face.c] = [i];
  }
}

var originalVertCount = geometry.vertices.length;

var faceCentroids = {};
for (var i = 0; i < geometry.faces.length; i += 1) {
  var face = geometry.faces[i];
  var vertexA = geometry.vertices[face.a];
  var vertexB = geometry.vertices[face.b];
  var vertexC = geometry.vertices[face.c];
  var centroid = new THREE.Vector3(
    (vertexA.x + vertexB.x + vertexC.x) / 3,
    (vertexA.y + vertexB.y + vertexC.y) / 3,
    (vertexA.z + vertexB.z + vertexC.z) / 3,
  );

  var centroidIndex = newVertices.push(centroid) - 1;
  faceCentroids[i] = centroidIndex;
}

for (var i = 0; i < originalVertCount; i += 1) {
  var faces = vertToFaces[i];
  var color = new THREE.Color(Math.random(), Math.random(), Math.random());
  for (var j = 0; j < faces.length; j += 1) {
    var faceIndex = faces[j];
    var face = geometry.faces[faceIndex];
    var nonCenterVerts = [face.a, face.b, face.c].filter(vert => vert !== i);
    var sortedFace = new THREE.Face3(i, nonCenterVerts[0], nonCenterVerts[1]);

    var vertexA = geometry.vertices[sortedFace.a];
    var vertexB = geometry.vertices[sortedFace.b];
    var vertexC = geometry.vertices[sortedFace.c];
    var halfAB = vertexA.clone().lerp(vertexB, 0.5);
    var halfAC = vertexA.clone().lerp(vertexC, 0.5);
    var halfBC = vertexB.clone().lerp(vertexC, 0.5);

    // TODO: cache these and retrieve in future iteration (use .toFixed(3) in hash)
    var centroidIndex = faceCentroids[faceIndex];
    var halfABIndex = newVertices.push(halfAB) - 1;
    var halfACIndex = newVertices.push(halfAC) - 1;
    var halfBCIndex = newVertices.push(halfBC) - 1;

    var face1 = new THREE.Face3(sortedFace.a, centroidIndex, halfABIndex);
    face1.color = color;
    var face2 = new THREE.Face3(sortedFace.a, centroidIndex, halfACIndex);
    face2.color = color;

    newFaces.push(face1, face2);
  }
}

function disposeArray() {
  this.array = null;
}

var newGeometry = new THREE.Geometry();
newGeometry.vertices = newVertices;
newGeometry.faces = newFaces;
newGeometry.computeFaceNormals();
newGeometry.computeVertexNormals();
newGeometry.normalize();

var material = new THREE.MeshBasicMaterial({ vertexColors: THREE.FaceColors, side: THREE.DoubleSide });
var sphere = new THREE.Mesh(newGeometry, material);
scene.add(sphere);

var controls = new OrbitControls(camera);

camera.position.z = 15;
controls.update()

var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  controls.update();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();
