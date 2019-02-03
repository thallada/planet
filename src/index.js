import * as THREE from "three";

var OrbitControls = require("three-orbit-controls")(THREE);

const scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);

var geometry = new THREE.IcosahedronBufferGeometry(5, 7);

var position = geometry.getAttribute("position");
var colors = [];
var color = new THREE.Color(Math.random(), Math.random(), Math.random());
for (var i = 0; i < position.count / 3; i += 1) {
  color.setRGB(i / (position.count / 3), i / (position.count / 3), i / (position.count / 3));
  colors.push(color.r, color.g, color.b);
  colors.push(color.r, color.g, color.b);
  colors.push(color.r, color.g, color.b);
}

function disposeArray() {
  this.array = null;
}
geometry.addAttribute("color", new THREE.Float32BufferAttribute(colors, 3).onUpload(disposeArray));
var material = new THREE.MeshBasicMaterial({ vertexColors: THREE.FaceColors });
var sphere = new THREE.Mesh(geometry, material);
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
