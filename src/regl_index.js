import hexsphere_0 from "./shapes/hexsphere_r1_d0.bin"
import hexsphere_1 from "./shapes/hexsphere_r1_d1.bin"
import hexsphere_2 from "./shapes/hexsphere_r1_d2.bin"
import hexsphere_3 from "./shapes/hexsphere_r1_d3.bin"
import hexsphere_4 from "./shapes/hexsphere_r1_d4.bin"
import hexsphere_5 from "./shapes/hexsphere_r1_d5.bin"
import hexsphere_6 from "./shapes/hexsphere_r1_d6.bin"
import icosahedron_0 from "./shapes/icosahedron_r1_d0.bin"
import icosahedron_1 from "./shapes/icosahedron_r1_d1.bin"
import icosahedron_2 from "./shapes/icosahedron_r1_d2.bin"
import icosahedron_3 from "./shapes/icosahedron_r1_d3.bin"
import icosahedron_4 from "./shapes/icosahedron_r1_d4.bin"
import icosahedron_5 from "./shapes/icosahedron_r1_d5.bin"
import icosahedron_6 from "./shapes/icosahedron_r1_d6.bin"
import icosahedron_7 from "./shapes/icosahedron_r1_d7.bin"

const shapes = {
  "hexsphere_0": hexsphere_0,
  "hexsphere_1": hexsphere_1,
  "hexsphere_2": hexsphere_2,
  "hexsphere_3": hexsphere_3,
  "hexsphere_4": hexsphere_4,
  "hexsphere_5": hexsphere_5,
  "hexsphere_6": hexsphere_6,
  "icosahedron_0": icosahedron_0,
  "icosahedron_1": icosahedron_1,
  "icosahedron_2": icosahedron_2,
  "icosahedron_3": icosahedron_3,
  "icosahedron_4": icosahedron_4,
  "icosahedron_5": icosahedron_5,
  "icosahedron_6": icosahedron_6,
  "icosahedron_7": icosahedron_7,
}

const regl = require("regl")({
  extensions: ["OES_element_index_uint"],
})
const camera = require("regl-camera")(regl, {
  center: [0, 0, 0],
  distance: 3,
})

const drawShape = hexsphere => regl({
  vert: `
  precision mediump float;
  uniform mat4 projection, view;
  attribute vec3 position, normal, color;
  varying vec3 fragNormal, fragPosition, fragColor;
  void main() {
    fragNormal = normal;
    fragPosition = position;
    fragColor = color;
    gl_Position = projection * view * vec4(position, 1.0);
  }`,

  frag: `
  precision mediump float;
  struct Light {
    vec3 color;
    vec3 position;
  };
  uniform Light lights[1];
  varying vec3 fragNormal, fragPosition, fragColor;
  void main() {
    vec3 normal = normalize(fragNormal);
    vec3 light = vec3(0.1, 0.1, 0.1);
    for (int i = 0; i < 1; i++) {
      vec3 lightDir = normalize(lights[i].position - fragPosition);
      float diffuse = max(0.0, dot(lightDir, normal));
      light += diffuse * lights[i].color;
    }
    gl_FragColor = vec4(fragColor * light, 1.0);
  }`,

  attributes: {
    position: hexsphere.positions,
    normal: hexsphere.normals,
    color: hexsphere.colors,
  },
  elements: hexsphere.cells,
  uniforms: {
    "lights[0].color": [1, 1, 1],
    "lights[0].position": ({ tick }) => {
      const t = 0.008 * tick
      return [
        1000 * Math.cos(t),
        1000 * Math.sin(t),
        1000 * Math.sin(t)
      ]
    },
  },
})

let draw = null

const loadShape = shape => {
  fetch(shape)
    .then(response => response.arrayBuffer())
    .then(buffer => {
      let reader = new DataView(buffer);
      let numVertices = reader.getUint32(0, true);
      let numCells = reader.getUint32(4, true);
      const shapeData = {
        positions: new Float32Array(buffer, 8, numVertices * 3),
        normals: new Float32Array(buffer, numVertices * 12 + 8, numVertices * 3),
        colors: new Float32Array(buffer, numVertices * 24 + 8, numVertices * 3),
        cells: new Uint32Array(buffer, numVertices * 36 + 8, numCells * 3),
      }
      draw = drawShape(shapeData)
      regl.frame(() => {
        regl.clear({
          depth: 1,
          color: [0, 0, 0, 1]
        })

        camera(() => {
          draw()
        })
      })
      shapeSelectLoading.style.display = "none"
    })
}

const shapeSelect = document.querySelector("select#shape-select")
const shapeSelectLoading = document.querySelector("#shape-loading")
shapeSelect.value = "hexsphere_4"
loadShape(hexsphere_4)

shapeSelect.addEventListener("change", event => {
  shapeSelectLoading.style.display = "inline"
  loadShape(shapes[event.target.value])
})
