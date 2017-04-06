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
  merge: (a, b = {}) => {
    let c = {};
    Object.keys(a).forEach((prop) => {
      c[prop] = undefined !== b[prop] ? b[prop] : a[prop];
    });
    return c;
  },

  // get HSL color
  getHSL: (h = 0, s = 0, l = 0) => {
    let c = new THREE.Color();
    c.setHSL(h, s, l);
    return c;
  },
  
  // get no-repeat rand
  getRand: (min = 0, max = 1, type, split = null) => {
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
  loadTexture: (url, cb) => {
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
  loadFont: (font, cb) => {
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
    Th3me.dom = dom;
    Th3me.env = env;
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
    
    if (dataSet) Th3me.dataSet = dataSet;
    if (fontSet) Th3me.fontSet = fontSet;
    if (colorSet) Th3me.colorSet = colorSet;
    if (cameraSet) Th3me.cameraSet = cameraSet;
    if (textureSet) Th3me.textureSet = textureSet;

    if (initParams) Th3me.initParams = initParams;
    if (initData) Th3me.initData = initData;
    if (initRenderer) Th3me.initRenderer = initRenderer;
    if (initScene) Th3me.initScene = initScene;
    if (initCamera) Th3me.initCamera = initCamera;
    if (initLight) Th3me.initLight = initLight;
    if (initHelper) Th3me.initHelper = initHelper;
    if (initObject) Th3me.initObject = initObject;
    if (initTween) Th3me.initTween = initTween;
    if (updatePerFrame) Th3me.updatePerFrame = updatePerFrame;

    this.util = util;
  }
  
  static initParams() {		
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
      width: Th3me.dom.clientWidth || window.innerWidth,
      height: Th3me.dom.clientHeight || window.innerHeight,
    };
    let cameraSet = util.merge({
      fov: 45,
      aspect: canvasSet.width / canvasSet.height,
      near: 1,
      far: 10000,
      zoom: 0.75,
      angle: 0,
    }, Th3me.cameraSet);
    cameraSet.distance = Math.max(canvasSet.width, canvasSet.height) / cameraSet.zoom;
    canvasSet.radius = cameraSet.zoom * Math.min(canvasSet.width, canvasSet.height) / 2;
    let fontSet = util.merge({
      font: null,
      fontName: 'gentilis',
      fontWeight: 'regular',
      height: 0.1,
      size: Math.floor(canvasSet.radius / 10),
      url: '',
    }, Th3me.fontSet);
    let colorSet = Th3me.colorSet || [0x004ccb, 0x00a2ff, 0x2d4ddc];
    let textureSet = Th3me.textureSet || [];
    let dataSet = Th3me.dataSet || [];
    
    Th3me.PI = PI;
    Th3me.O = O;
    Th3me.scene = scene;
    Th3me.clock = clock;
    Th3me.group = group;
    Th3me.tween = tween;
    Th3me.helper = helper;
    Th3me.light = light;
    Th3me.canvasSet = canvasSet;
    Th3me.cameraSet = cameraSet;
    Th3me.fontSet = fontSet;
    Th3me.colorSet = colorSet;
    Th3me.textureSet = textureSet;
    Th3me.dataSet = dataSet;
  }

  static initData() {
    // init your data here
  }
  
  static initRenderer() {
    let renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(Th3me.canvasSet.width, Th3me.canvasSet.height);
    renderer.setClearAlpha(0.0);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
    Th3me.renderer = renderer;
  }
  
  static initScene() {
    // init your scene
  }
  
  static initCamera() {
    let camera = new THREE.PerspectiveCamera(
      Th3me.cameraSet.fov,
      Th3me.cameraSet.aspect,
      Th3me.cameraSet.near,
      Th3me.cameraSet.far
    );
    camera.up.set(0, 1, 0);
    camera.lookAt(Th3me.O);
    camera.position.set(
      0,
      Th3me.cameraSet.distance * Math.sin(Th3me.cameraSet.angle),
      Th3me.cameraSet.distance * Math.cos(Th3me.cameraSet.angle)
    );
    Th3me.camera = camera;
  }
  
  static initLight() {
    let lightAmb = new THREE.AmbientLight(0xffffff);
    Th3me.light.push(lightAmb);
  }

  static initHelper() {
    let axisHelper = new THREE.AxisHelper(Th3me.cameraSet.distance / 5);
    Th3me.helper.push(axisHelper);
  }
  
  static initStats() {
    if (window.Stats) {
      let stats = new Stats();
      Th3me.stats = stats;
    } else {
      console.warn('Stats.js needs required to init');
    }
  }
  
  static initViewCtrl() {
    if (THREE.OrbitControls) {
      let viewCtrl = new THREE.OrbitControls(Th3me.camera, Th3me.renderer.domElement);
      Th3me.viewCtrl = viewCtrl;
    } else {
      console.warn('THREE.OribitControls needs required to init');
    }
  }
  
  static initObject() {
    // create main objects
  }
  
  static initTween() {
    // create main tween
  }
  
  static show() {
    Th3me.dom.appendChild(Th3me.renderer.domElement);
    Th3me.scene.add(Th3me.group);
    Th3me.light.forEach((each, index) => {
      Th3me.scene.add(each);
    });
    if (Th3me.env) {
      Th3me.helper.forEach((each, index) => {
        Th3me.scene.add(each);
      });
      Th3me.dom.appendChild(Th3me.stats.domElement);
    }
    if (Th3me.tween.action && Th3me.tween.action.always.length > 0) {
      Th3me.tween.action.always.forEach((each) => {
        each.start();
      });
    }
    Th3me.render();
  }

  static animate() {
    requestAnimationFrame(Th3me.animate);
    if (TWEEN) TWEEN.update();
    if (Th3me.viewCtrl) Th3me.viewCtrl.update();
    if (Th3me.stats) Th3me.stats.update();
    Th3me.updatePerFrame();
    Th3me.render();
  }
  
  static render() {
    Th3me.renderer.render(Th3me.scene, Th3me.camera);
  }

  static updatePerFrame() {
    // create udf animation for every frame update
  }
  
  
  init() {
    Th3me.initParams();
    Th3me.initData();
    Th3me.initRenderer();
    Th3me.initScene();
    Th3me.initCamera();
    Th3me.initLight();
    if (Th3me.env) {
      Th3me.initHelper();
      Th3me.initStats();
      Th3me.initViewCtrl();
    }
    Th3me.initObject();
    Th3me.initTween();
    Th3me.show();
    Th3me.animate();
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