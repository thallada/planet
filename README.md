# Hexsphere and Icosahedron Viewer

View live at: https://www.hallada.net/planet/

Renders shapes generated from my other project 
[icosahedron](https://crates.io/crates/icosahedron) ([github 
repo](https://github.com/thallada/icosahedron)) using 
[regl.js](https://github.com/regl-project/regl).

Since this is hosted on Github, which has a 100 MB file limit. The most detailed 
shapes available for rendering are the hexsphere at detail level 6 and the 
icosahedron at detail level 7.

## Running

Checkout and then run:

```
npm install
npm start
```

## Building

Compiles files to the `/docs` folder which is the folder set up for Github pages 
hosting.

```
npm run build
```

Any output needs to be committed for it to appear on Github pages.
