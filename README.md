# th3me.js
A tiny tool to create a THREE.js project swiftly

## Dependency
* [THREE.js](three)
* [TWEEN.js](tween)
* [OrbitControls.js](orbit)
* [Stats.js](stats)

## Getting Started
1. Include or require the denpendency files/modules and last th3me.js itself

2. Use the object 'th3me' to init as followed:
```javascript
const dom = document.getElementById('container');
let options = { ... };
let env = 'test';
th3me(dom, options, env);
```
then you'll get a threejs project initialized and run

3. UDF

The most important part is the second param - "options", inside which you can define your own objects and animations. But it is required to use the same props/method name since the class method override mechanism. All the inner prop/method names are as followed:

props
* canvasSet
* cameraSet
* fontSet
* colorSet
* textureSet
* dataSet

all props have its own attributes and the default values are as followed:
```javascript
let canvasSet = {
  width: Th3me.dom.clientWidth || window.innerWidth,
  height: Th3me.dom.clientHeight || window.innerHeight,
};
let cameraSet = {
  fov: 45,
  aspect: canvasSet.width / canvasSet.height,
  near: 1,
  far: 10000,
  zoom: 0.75,
  angle: 0,
};
let fontSet = {
  font: null,
  fontName: 'gentilis',
  fontWeight: 'regular',
  height: 0.1,
  size: Math.floor(canvasSet.radius / 10),
  url: '',
};
let colorSet = [0x004ccb, 0x00a2ff, 0x2d4ddc];
let textureSet = [];
let dataSet = [];
```
where 'canvasSet.radius' of fontSet.size as
```javascript
canvasSet.radius = cameraSet.zoom * Math.min(canvasSet.width, canvasSet.height) / 2;
```
and 'url' of fontSet links to 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/fonts/' as empty string by default.

methods
* initParams
* initData
* initRenderer
* initScene
* initCamera
* initLight
* initHelper
* initObject - to create objects on the scene
* initTween - to create tween object
* updatePerFrame - some other animation logic during per frame



[three]: https://cdnjs.cloudflare.com/ajax/libs/three.js/84/three.min.js
[tween]: https://cdnjs.cloudflare.com/ajax/libs/tween.js/16.6.0/Tween.min.js
[orbit]:https://threejs.org/examples/js/controls/OrbitControls.js
[stats]: https://threejs.org/examples/js/libs/stats.min.js