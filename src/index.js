import * as THREE from "three";

var OrbitControls = require("three-orbit-controls")(THREE);

const scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);

console.time("init geo");
var geometry = new THREE.IcosahedronGeometry(10, 8);
console.timeEnd("init geo");

console.time("Hexsphere");
var vertToFaces = {};
var newVertices = [];
var colors = [];

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

  // var centroidIndex = (newVertices.push(centroid.x, centroid.y, centroid.z) / 3) - 1;
  faceCentroids[i] = centroid;
}

console.time("dual");
var midVertCache = {};
var hexCount = 0;
var pentCount = 0;
for (var i = 0; i < originalVertCount; i += 1) {
  var faces = vertToFaces[i];
  if (faces.length === 6) {
    hexCount += 1;
  } else if (faces.length === 5) {
    pentCount += 1;
  }
  var color = new THREE.Color(Math.random(), Math.random(), Math.random());
  for (var j = 0; j < faces.length; j += 1) {
    var faceIndex = faces[j];
    var face = geometry.faces[faceIndex];
    var nonCenterVerts = [face.a, face.b, face.c].filter(vert => vert !== i);
    var sortedFace = new THREE.Face3(i, nonCenterVerts[0], nonCenterVerts[1]);
    // var sortedFace = face;

    var vertexA = geometry.vertices[sortedFace.a];
    var vertexB = geometry.vertices[sortedFace.b];
    var vertexC = geometry.vertices[sortedFace.c];

    var midABKey = sortedFace.a + "," + sortedFace.b
    var midAB = midVertCache[midABKey];
    if (!midAB) {
      midAB = vertexA.clone().lerp(vertexB, 0.5);
      midVertCache[midABKey] = midAB;
    }
    var midACKey = sortedFace.a + "," + sortedFace.c
    var midAC = midVertCache[midACKey];
    if (!midAC) {
      midAC = vertexA.clone().lerp(vertexC, 0.5);
      midVertCache[midACKey] = midAC;
    }
    var centroid = faceCentroids[faceIndex];

    newVertices.push(
      vertexA.x, vertexA.y, vertexA.z,
      centroid.x, centroid.y, centroid.z,
      midAB.x, midAB.y, midAB.z,

      vertexA.x, vertexA.y, vertexA.z,
      centroid.x, centroid.y, centroid.z,
      midAC.x, midAC.y, midAC.z,
    );

    colors.push(
      color.r, color.g, color.b,
      color.r, color.g, color.b,
      color.r, color.g, color.b,

      color.r, color.g, color.b,
      color.r, color.g, color.b,
      color.r, color.g, color.b,
    );
  }
}
console.timeEnd("dual");
console.log(`hexagons: ${hexCount}`);
console.log(`pentagons: ${pentCount}`);

function disposeArray() {
  this.array = null;
}

console.time("find geo");
var newGeometry = new THREE.BufferGeometry();
newGeometry.addAttribute("position", new THREE.Float32BufferAttribute(newVertices, 3));
newGeometry.addAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
// newGeometry.computeFaceNormals();
// newGeometry.computeVertexNormals();
// newGeometry.normalize();
console.timeEnd("find geo");


console.time("other render");
var material = new THREE.MeshBasicMaterial({ vertexColors: THREE.VertexColors, side: THREE.DoubleSide });
var sphere = new THREE.Mesh(newGeometry, material);
scene.add(sphere);

var controls = new OrbitControls(camera);

camera.position.z = 15;
controls.update()

var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );
console.timeEnd("other render");
console.timeEnd("Hexsphere");

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
