import * as THREE from "three";

const OrbitControls = require("three-orbit-controls")(THREE);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);

console.time("init geo");
const geometry = new THREE.IcosahedronGeometry(10, 6);
console.timeEnd("init geo");

console.time("Hexsphere");
const vertToFaces = {};
const newVertices = [];
const colors = [];

for (let i = 0; i < geometry.faces.length; i += 1) {
  const face = geometry.faces[i];

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

const originalVertCount = geometry.vertices.length;

const calculateCentroid = (pa, pb, pc) => {
  const vabHalf = pb.clone().sub(pa).divideScalar(2);
  const pabHalf = pa.clone().add(vabHalf);
  const centroid = pc.clone().sub(pabHalf).multiplyScalar(1/3).add(pabHalf);
  return centroid;
}

const faceCentroids = {};
for (let i = 0; i < geometry.faces.length; i += 1) {
  const face = geometry.faces[i];
  const vertexA = geometry.vertices[face.a];
  const vertexB = geometry.vertices[face.b];
  const vertexC = geometry.vertices[face.c];

  faceCentroids[i] = calculateCentroid(vertexA, vertexB, vertexC);
}

const findAdjacentFace = (vertexIndex, faces) => {
  for (let i = 0; i < faces.length; i += 1) {
    const faceIndex = faces[i];
    const face = geometry.faces[faceIndex];
    if ([face.a, face.b, face.c].includes(vertexIndex)) return faceIndex;
  }
}

const findCenterPoint = faces => {
  const centerPoint = new THREE.Vector3(0, 0, 0);
  for (let i = 0; i < faces.length; i += 1) {
    centerPoint.add(faceCentroids[faces[i]]);
  }
  centerPoint.divideScalar(faces.length);
  return centerPoint;
}

const midCentroidCache = {};
const calculateMidCentroid = (vertexIndex, faces, centroid) => {
  const adjFaceIndex = findAdjacentFace(vertexIndex, faces);
  const adjCentroid = faceCentroids[adjFaceIndex];
  const midCentroidKey = vertexIndex + ",F" + adjFaceIndex;
  let midCentroid = midCentroidCache[midCentroidKey];
  if (!midCentroid) {
    midCentroid = centroid.clone().lerp(adjCentroid, 0.5);
    midCentroidCache[midCentroidKey] = midCentroid;
  }
  return midCentroid;
}


console.time("dual");
let hexCount = 0;
let pentCount = 0;
for (let i = 0; i < originalVertCount; i += 1) {
  const faces = vertToFaces[i];
  if (faces.length === 6) {
    hexCount += 1;
  } else if (faces.length === 5) {
    pentCount += 1;
  }

  const color = new THREE.Color(Math.random(), Math.random(), Math.random());
  const centerPoint = findCenterPoint(faces);

  for (let j = 0; j < faces.length; j += 1) {
    const faceIndex = faces[j];
    const face = geometry.faces[faceIndex];
    const sortedVerts = [face.a, face.b, face.c].filter(vert => vert !== i);
    sortedVerts.unshift(i)

    const centroid = faceCentroids[faceIndex];
    const midBCentroid = calculateMidCentroid(sortedVerts[1], faces, centroid);
    const midCCentroid = calculateMidCentroid(sortedVerts[2], faces, centroid);

    newVertices.push(
      centerPoint.x, centerPoint.y, centerPoint.z,
      centroid.x, centroid.y, centroid.z,
      midBCentroid.x, midBCentroid.y, midBCentroid.z,

      centerPoint.x, centerPoint.y, centerPoint.z,
      centroid.x, centroid.y, centroid.z,
      midCCentroid.x, midCCentroid.y, midCCentroid.z,
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
const newGeometry = new THREE.BufferGeometry();
newGeometry.addAttribute("position", new THREE.Float32BufferAttribute(newVertices, 3).onUpload(disposeArray));
newGeometry.addAttribute("color", new THREE.Float32BufferAttribute(colors, 3).onUpload(disposeArray));
newGeometry.computeFaceNormals();
newGeometry.computeVertexNormals();
console.timeEnd("find geo");


console.time("other render");
const material = new THREE.MeshBasicMaterial({ vertexColors: THREE.VertexColors, side: THREE.DoubleSide });
const sphere = new THREE.Mesh(newGeometry, material);
scene.add(sphere);

const controls = new OrbitControls(camera);

camera.position.z = 15;
controls.update()

const renderer = new THREE.WebGLRenderer();
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
