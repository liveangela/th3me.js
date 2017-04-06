/**
 * th3me.js - Licensed under the MIT license
 * -----------------------------------------
 * https://github.com/liveangela/th3me.js
 * 
 * A little package to create three.js project swiftly
 * Dependency:
 *  Three.js: https://cdnjs.cloudflare.com/ajax/libs/three.js/84/three.min.js
 * 	Tween.js: https://cdnjs.cloudflare.com/ajax/libs/tween.js/16.6.0/Tween.min.js
 * Dependency under development env:
 * 	Stats.js: https://threejs.org/examples/js/libs/stats.min.js
 * 	OrbitControls.js: https://threejs.org/examples/js/controls/OrbitControls.js
 * Copyright 2017 Thyme Chen
 */

'use strict';

// public tools
const util = {
  // _.merge
  merge(a, b = {}) {
    let c = {};
    Object.keys(a).forEach((prop) => {
      c[prop] = undefined !== b[prop] ? b[prop] : a[prop];
    });
    return c;
  },

  // get HSL color
  getHSL(h = 0, s = 0, l = 0) {
    let c = new THREE.Color();
    c.setHSL(h, s, l);
    return c;
  },
  
  // get no-repeat rand
  getRand(min = 0, max = 1, type, split = null) {
    let rand;
    if (type) {
      rand = THREE.Math.randInt(min, max);
    } else {
      rand = THREE.Math.randFloat(min, max);
    }
    if (split === rand) {
      util.getRand(min, max, type, split);
    }
    return rand;
  },
  
  // texture loader
  loadTexture(url, cb) {
    let loader = new THREE.TextureLoader();
    loader.crossOrigin = 'anonymous';
    loader.load(
      url,
      (texture) => {
        texture.needsUpdate = true;
        cb(texture);
      },
      (xhr) => {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
      },
      (xhr) => {
        console.log('An error happened');
      }
    );
  },
  
  // font loader
  loadFont(font, cb) {
    const baseUrl = 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/fonts/';
    const fontUrl = font.url || baseUrl + font.fontName + '_' + font.fontWeight + '.typeface.json';
    let loader = new THREE.FontLoader();
    loader.load(fontUrl, (res) => {
      font.font = res;
      cb(font);
    });
  },

  //
};


// class
class Th3me {

  constructor(dom, opt = {}, env = '') {
    this.dom = dom;
    this.env = env;
    const {
      // props
      dataSet,
      fontSet,
      colorSet,
      cameraSet,
      textureSet,
      // methods
      initParams,
      initData,
      initRenderer,
      initScene,
      initCamera,
      initLight,
      initHelper,
      initObject,
      initTween,
      updatePerFrame,
    } = opt;
    
    if (dataSet) this.dataSet = dataSet;
    if (fontSet) this.fontSet = fontSet;
    if (colorSet) this.colorSet = colorSet;
    if (cameraSet) this.cameraSet = cameraSet;
    if (textureSet) this.textureSet = textureSet;

    if (initParams) this.initParams = initParams;
    if (initData) this.initData = initData;
    if (initRenderer) this.initRenderer = initRenderer;
    if (initScene) this.initScene = initScene;
    if (initCamera) this.initCamera = initCamera;
    if (initLight) this.initLight = initLight;
    if (initHelper) this.initHelper = initHelper;
    if (initObject) this.initObject = initObject;
    if (initTween) this.initTween = initTween;
    if (updatePerFrame) this.updatePerFrame = updatePerFrame;
  }
  
  initParams() {
    // const
    const PI = Math.PI;
    const O = new THREE.Vector3();

    // three.js
    let scene = new THREE.Scene();
    let clock = new THREE.Clock();
    let group = new THREE.Group();
    let tween = {
      object: {
        base: []
      },
      action: {
        always: []
      }
    };
    let helper = [];
    let light = [];

    // uer defined
    let canvasSet = {
      width: this.dom.clientWidth || window.innerWidth,
      height: this.dom.clientHeight || window.innerHeight,
    };
    let cameraSet = util.merge({
      fov: 45,
      aspect: canvasSet.width / canvasSet.height,
      near: 1,
      far: 10000,
      zoom: 0.75,
      angle: 0,
    }, this.cameraSet);
    cameraSet.distance = Math.max(canvasSet.width, canvasSet.height) / cameraSet.zoom;
    canvasSet.radius = cameraSet.zoom * Math.min(canvasSet.width, canvasSet.height) / 2;
    let fontSet = util.merge({
      font: null,
      fontName: 'gentilis',
      fontWeight: 'regular',
      height: 0.1,
      size: Math.floor(canvasSet.radius / 10),
      url: '',
    }, this.fontSet);
    let colorSet = this.colorSet || [0x004ccb, 0x00a2ff, 0x2d4ddc];
    let textureSet = this.textureSet || [];
    let dataSet = this.dataSet || [];
    
    Th3me.util = util;
    Th3me.PI = PI;
    Th3me.O = O;
    this.scene = scene;
    this.clock = clock;
    this.group = group;
    this.tween = tween;
    this.helper = helper;
    this.light = light;
    this.canvasSet = canvasSet;
    this.cameraSet = cameraSet;
    this.fontSet = fontSet;
    this.colorSet = colorSet;
    this.textureSet = textureSet;
    this.dataSet = dataSet;
  }

  initData() {
    // init your data here
  }
  
  initRenderer() {
    let renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(this.canvasSet.width, this.canvasSet.height);
    renderer.setClearAlpha(0.0);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
    this.renderer = renderer;
  }
  
  initScene() {
    // init your scene
  }
  
  initCamera() {
    let camera = new THREE.PerspectiveCamera(
      this.cameraSet.fov,
      this.cameraSet.aspect,
      this.cameraSet.near,
      this.cameraSet.far
    );
    camera.up.set(0, 1, 0);
    camera.lookAt(Th3me.O);
    camera.position.set(
      0,
      this.cameraSet.distance * Math.sin(this.cameraSet.angle),
      this.cameraSet.distance * Math.cos(this.cameraSet.angle)
    );
    this.camera = camera;
  }
  
  initLight() {
    let lightAmb = new THREE.AmbientLight(0xffffff);
    this.light.push(lightAmb);
  }

  initHelper() {
    let axisHelper = new THREE.AxisHelper(this.cameraSet.distance / 5);
    this.helper.push(axisHelper);
  }
  
  initStats() {
    if (window.Stats) {
      let stats = new Stats();
      this.stats = stats;
    } else {
      console.warn('Stats.js needs required to init');
    }
  }
  
  initViewCtrl() {
    if (THREE.OrbitControls) {
      let viewCtrl = new THREE.OrbitControls(this.camera, this.renderer.domElement);
      this.viewCtrl = viewCtrl;
    } else {
      console.warn('THREE.OribitControls needs required to init');
    }
  }
  
  initObject() {
    // create main objects
  }
  
  initTween() {
    // create main tween
  }
  
  show() {
    this.dom.appendChild(this.renderer.domElement);
    this.scene.add(this.group);
    this.light.forEach((each, index) => {
      this.scene.add(each);
    });
    if (this.env) {
      this.helper.forEach((each, index) => {
        this.scene.add(each);
      });
      this.dom.appendChild(this.stats.domElement);
    }
    if (this.tween.action && this.tween.action.always.length > 0) {
      this.tween.action.always.forEach((each) => {
        each.start();
      });
    }
    this.render();
  }

  animate() {
    requestAnimationFrame(() => {
      this.animate();
    });
    if (TWEEN) TWEEN.update();
    if (this.viewCtrl) this.viewCtrl.update();
    if (this.stats) this.stats.update();
    this.updatePerFrame();
    this.render();
  }
  
  render() {
    this.renderer.render(this.scene, this.camera);
  }

  updatePerFrame() {
    // create udf animation for every frame update
  }
  
  
  init() {
    this.initParams();
    this.initData();
    this.initRenderer();
    this.initScene();
    this.initCamera();
    this.initLight();
    if (this.env) {
      this.initHelper();
      this.initStats();
      this.initViewCtrl();
    }
    this.initObject();
    this.initTween();
    this.show();
    this.animate();
  }
}


(function (root) {
  if (typeof module !== 'undefined' && typeof exports === 'object') {
    // Node.js
    module.exports = Th3me;
  } else if (typeof define === 'function' && define.amd) {
    // AMD
    define([], function () {
      return Th3me;
    });
  } else if (root !== undefined) {
    // Global variable
    root.Th3me = Th3me;
  }
})(this);