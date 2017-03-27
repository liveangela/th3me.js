# th3me.js
A tiny tool to create a THREE.js project swiftly

## Dependency
[THREE.js] [three]
[TWEEN.js] [tween]
[OrbitControls.js] [orbit]
[Stats.js] [stats]

## Getting Started
1. Include or require the denpendency files/modules and last th3me.js itself
2. Use the object 'th3me' to init as followed:
```javascript
const dom = document.getElementById('container');
let methods = {};
let demo = th3me(dom, methods);
demo.init()
```
then you'll get a threejs project initialized
3. To animate the scene
```javascript
let animate = function animate() {
  requestAnimationFrame(animate);
  demo.viewCtrl.update();
  demo.stats.update();
  demo.render();
}
animate();
```

[three]: https://cdnjs.cloudflare.com/ajax/libs/three.js/84/three.min.js
[tween]: https://cdnjs.cloudflare.com/ajax/libs/tween.js/16.6.0/Tween.min.js
[orbit]:https://threejs.org/examples/js/controls/OrbitControls.js
[stats]: https://threejs.org/examples/js/libs/stats.min.js