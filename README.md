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
let methods = { ... };
let env = 'test';
th3me(dom, methods, env);
```
then you'll get a threejs project initialized and run

3. UDF

The most important part is the second param - "methods", inside which you can define your own objects and animations. But it is required to use the same method name since the class method override mechanism. All the inner method names are as followed:

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