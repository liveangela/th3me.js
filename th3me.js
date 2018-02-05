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

(function (root, factory) {
  if (typeof module !== 'undefined' && typeof exports === 'object') {
    // Node.js
    const THREE = require("three");
    const TWEEN = require("@tweenjs/tween.js");
    module.exports = factory(THREE, TWEEN);
  } else if (typeof define === 'function' && define.amd) {
    // AMD
    define([], function () {
      return Th3me;
    });
  } else if (root !== undefined) {
    // Global variable
    const THREE = root.THREE;
    const TWEEN = root.TWEEN;
    root.Th3me = factory(THREE, TWEEN);
  }
})(this, function (THREE, TWEEN) {

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

    // get mid point
    getMidPoint(p1, p2) {
      let xMid = (p1.x + p2.x) / 2;
      let yMid = (p1.y + p2.y) / 2;
      let zMid = (p1.z + p2.z) / 2;
      let d = Math.sqrt(
        Math.pow((p2.x - p1.x), 2) +
        Math.pow((p2.y - p1.y), 2) +
        Math.pow((p2.z - p1.z), 2)
      );
      return {
        x: xMid,
        y: yMid,
        z: zMid,
        d: d,
      };
    },

    // texture loader
    loadTexture(url, cb = null) {
      let _url = url;
      let isUrlObj = false;
      if (typeof url !== 'string' && url.url) {
        if (url.texture) {
          if (cb) cb(url.texture);
          return;
        } else {
          _url = url.url;
          isUrlObj = true;
        }
      }
      let loader = new THREE.TextureLoader();
      loader.crossOrigin = 'anonymous';
      loader.load(
        _url,
        (texture) => {
          texture.needsUpdate = true;
          if (isUrlObj) url.texture = texture;
          if (cb) cb(texture);
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
    loadFont(font, cb = null) {
      if (font.font) {
        if (cb) cb(font);
        return;
      }
      const fontUrl = font.baseUrl + font.fontName + '_' + font.fontWeight + '.typeface.json';
      let loader = new THREE.FontLoader();
      loader.load(fontUrl, (res) => {
        font.font = res;
        if (cb) cb(font);
      });
    },

    // make text as a texture with simple background color
    makeTextTexture(opt) {
      let {
        text = '',
        fontSize = 24,
        fontFamily = 'Arial',
        fontWeight = 'Normal',
        color = 'rgb(255, 255, 255)',
        bgColor = 'rgba(0, 0, 0, 0)',
        padding = '0 0 0 0',
        textBaseline = 'middle',
        textAlign = 'center',
        addon = (obj) => {},
      } = opt;

      if ('' === text) {
        console.warn('invalid text opt, texture making canceled');
        return;
      }

      let paddingArr = padding.split(' ');
      let paddingH = paddingArr[0] + paddingArr[2];
      let paddingW = paddingArr[1] + paddingArr[3];

      let c = document.createElement('canvas');
      let t = new THREE.CanvasTexture(c);
      let ctx = c.getContext('2d');
      ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
      let textW = ctx.measureText(text).width;
      let cW = THREE.Math.nextPowerOfTwo(textW);
      let cH = THREE.Math.nextPowerOfTwo(fontSize);
      let factor = Math.min((cW - paddingW) / textW, (cH - paddingH) / fontSize);
      let x = 0;
      let y = cH / 2;
      c.width = cW;
      c.height = cH;

      switch (textAlign) {
        case 'center': x = cW / 2; break;
        case 'right': x = cW; break;
      }

      let change = (content) => {
        ctx.clearRect(0, 0, cW, cH);
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, cW, cH);
        ctx.fillStyle = color;
        ctx.font = `${fontWeight} ${fontSize * factor}px ${fontFamily}`;
        ctx.textBaseline = textBaseline;
        ctx.textAlign = textAlign;
        ctx.fillText(content, x, y);
        addon({
          ctx,
          cW,
          cH,
        });
        t.needsUpdate = true;
      };

      change(text);

      t.anisotropy = 64;
      t.userData = {
        w: cW,
        h: cH,
        cb: change,
      };
      return t;
    },

    // make text with or without background
    makeText(opt) {
      let {
        text = '',
        material = null,
        fontSet = {
          font: null,
          size: 12,
          height: 0.1,
          color: 0x000000,
        },
        bgTexture = '',
        bgOption = {
          wModifier: 1.2, // deside horizental padding between text and bg border
          hModifier: 2.5, // deside vertical padding ...
          material: {
            transparent: true,
            depthWrite: false,
            side: THREE.DoubleSide,
          },
        },
      } = opt;

      if ('' === text || null === fontSet.font) {
        console.warn('invalid text opt, text mesh canceled');
        return;
      }

      let g = new THREE.Group();
      let geo = new THREE.TextGeometry(text.toString(), fontSet);
      let mat = material || new THREE.MeshBasicMaterial({
        color: fontSet.color,
      });
      let mesh = new THREE.Mesh(geo, mat);
      geo.computeBoundingBox();
      let w = geo.boundingBox.max.x - geo.boundingBox.min.x;
      let h = geo.boundingBox.max.y - geo.boundingBox.min.y;
      mesh.position.x -= w / 2;
      mesh.position.y -= h / 2 * 0.5;
      g.add(mesh);
      g.userData.width = w;
      g.userData.height = h;

      if (bgTexture) {
        let bgW = bgOption.wModifier * w;
        let bgH = bgOption.hModifier * h;
        let bgGeo = new THREE.PlaneBufferGeometry(bgW, bgH);
        let matOpt = bgOption.material;
        matOpt.map = bgTexture;
        let bgMat = new THREE.MeshBasicMaterial(matOpt);
        let bgMesh = new THREE.Mesh(bgGeo, bgMat);
        g.add(bgMesh);
        g.userData.width = bgW;
        g.userData.height = bgH;
      }

      return g;
    },

    // make number text pool, like '0'~'9' and '.'
    makeNumTextPool(fontSet, material = null) {
      let res = [];
      for (let i = 0; i <= 9; i++) {
        let text = i;
        let t = util.makeText({
          text,
          material,
          fontSet,
        });
        res.push(t);
      }
      // dot text
      res.push(util.makeText({
        text: '.',
        material,
        fontSet,
      }));
      return res;
    },

    // make multi number text group from a given numTextPool,
    // only support for x axis direction lined-up
    makeMultiNumText(num, numTextPool, wordSpace = 5) {
      let g = new THREE.Group();
      let str = num.toString();
      let len = str.length;
      let startPos = 0;
      let lastSpan = 0;
      for (let i = 0; i < len; i++) {
        let char = str[i];
        let thisNum = parseInt(char);
        if (isNaN(thisNum)) thisNum = numTextPool.length - 1; // '.' should be put at last
        let posFix = 10 === thisNum ? [-8, -4] : [0, 0];
        let singleCharGroup = numTextPool[thisNum].clone();
        let singleWidth = singleCharGroup.userData.width;
        singleCharGroup.position.x = startPos + posFix[0];
        singleCharGroup.position.y += posFix[1];
        lastSpan = singleWidth + wordSpace;
        startPos += lastSpan;
        g.add(singleCharGroup);
      }
      g.position.x -= (startPos - lastSpan) / 2;
      return g;
    },

    // make a plane to close the pie object
    makePiePlane(opt) {
      let geo = new THREE.PlaneBufferGeometry(opt.radius, opt.height);
      let plane = new THREE.Mesh(geo, opt.material);
      let phi = opt.phi;
      let x = opt.radius / -2 * Math.cos(phi);
      let z = opt.radius / 2 * Math.sin(phi);
      plane.rotation.y = phi;
      plane.position.set(x, 0, z);
      return plane;
    },

    // make a pie object
    makePie(opt) {
      let g = new THREE.Group();
      // pie base
      let geo = new THREE.CylinderBufferGeometry(
        opt.radius, opt.radius, opt.height,
        64, 1, false,
        opt.thetaStart, opt.thetaLength
      );
      let mat = opt.material || new THREE.MeshPhongMaterial({
        color: opt.color,
        transparent: true,
        side: THREE.DoubleSide,
        shininess: 50,
      });
      let pie = new THREE.Mesh(geo, mat);
      // two planes
      opt.material = mat;
      opt.phi = opt.thetaStart + Math.PI / 2;
      let plane1 = Th3me.util.makePiePlane(opt);
      opt.phi += opt.thetaLength;
      let plane2 = Th3me.util.makePiePlane(opt);
      // position msg for single pie animation
      let midTheta = opt.thetaStart + opt.thetaLength / 2;
      g.userData.midP = {
        x: opt.radius / 8 * Math.sin(midTheta),
        y: opt.height,
        z: opt.radius / 8 * Math.cos(midTheta),
      };

      g.add(pie, plane1, plane2);
      return g;
    },

    // tween - self rotation on single axis, best for none stop rotate
    tweenSelfRotate({obj, duration = 10000, x = 0, y = 0, z = 1}) {
      let targetRotateObj = {
        x: obj.rotation.x + 2 * Math.PI * x,
        y: obj.rotation.y + 2 * Math.PI * y,
        z: obj.rotation.z + 2 * Math.PI * z,
      };
      let t = new TWEEN.Tween(obj.rotation)
        .to(targetRotateObj, duration)
        .easing(TWEEN.Easing.Linear.None)
        .repeat(Infinity);
      return t;
    },

    // tween - zoom an object, e.g bars
    // dir is a string to specify the direction to move forward
    tweenZoom({obj, duration = 3000, x = null, y = null, z = null, dir = null}) {
      let originScale = obj.scale;
      let originPos = obj.position;
      let scaleTarget = {};
      let scaleSpan = {};
      let posTarget = {};
      let temp = {
        x: x,
        y: y,
        z: z,
      };
      Object.keys(temp).map(function(key) {
        let tVal = temp[key];
        let oVal = originScale[key];
        if (null !== tVal && tVal !== oVal) {
          scaleTarget[key] = tVal;
          scaleSpan[key] = (tVal - oVal) / 2;
        }
      });
      let keyOfSpan = Object.keys(scaleSpan);
      if (0 === keyOfSpan.length) {
        console.warn('Th3me.js: tweenZoom unchanged scale');
        return new TWEEN.Tween();
      }
      // calculate the component vector length, like dir = 'xy' while only scale on 'z',
      // then get the z length on x and y axis respectively
      if (null !== dir) {
        if (!(1 === keyOfSpan.length && 2 === dir.length)) {
          console.warn('Th3me.js: tweenZoom unknown direction');
          return new TWEEN.Tween();
        }
        let dir1 = dir[0];
        let dir2 = dir[1];
        let span = scaleSpan[keyOfSpan[0]];
        let theta = Math.atan(originPos[dir2] / originPos[dir1]);
        let newScaleSpan = {};
        if (originPos[dir1] < 0 ) span = -span;
        newScaleSpan[dir1] = Math.cos(theta) * span;
        newScaleSpan[dir2] = Math.sin(theta) * span;
        scaleSpan = newScaleSpan;
      }
      Object.keys(scaleSpan).map(function(key) {
        posTarget[key] = originPos[key] + scaleSpan[key];
      });
      let scale = new TWEEN.Tween(obj.scale)
        .to(scaleTarget, duration)
        .easing(TWEEN.Easing.Exponential.Out);
      let move = new TWEEN.Tween(obj.position)
        .to(posTarget, duration)
        .easing(TWEEN.Easing.Exponential.Out);
      let t = new TWEEN.Tween();
      t.chain(scale, move);
      return t;
    },

    // tween - ring
    tweenRing({
      obj,
      duration = 5000,
      scale = 10,
      repeat = Infinity,
      easing = TWEEN.Easing.Exponential.InOut
    }) {
      let a = new TWEEN.Tween();
      let s = new TWEEN.Tween(obj.scale)
        .to({ x: scale, y: scale, z: scale }, duration)
        .easing(easing)
        .repeat(repeat);
      let o = new TWEEN.Tween(obj.material)
        .to({ opacity: 0.0 }, duration)
        .easing(easing)
        .repeat(repeat);
      a.chain(s, o);
      return a;
    },

    // tween - move along a shape
    tweenMoveAlong(object, shape, options) {
      options = util.merge({
        from: 0,
        to: 1,
        spanDuration: 50,
        duration: null,
        start: false,
        repeat: false,
        yoyo: false,
        onStart: null,
        onComplete: null,
        onUpdate: null,
        smoothness: 100,
        easing: TWEEN.Easing.Linear.None
      }, options);

      // array of vectors to determine shape
      if (shape instanceof THREE.Shape) {

      } else if (shape.constructor === Array) {
        shape = new THREE.CatmullRomCurve3(shape);
      } else {
        throw '2nd argument is not a Shape, nor an array of vertices';
      }

      options.duration = options.duration || shape.getLength() * options.spanDuration;

      let tween = new TWEEN.Tween({ distance: options.from })
        .to({ distance: options.to }, options.duration)
        .easing(options.easing)
        .onStart(function() {
          if (options.onStart) options.onStart(this, object);
        })
        .onComplete(function() {
          if (options.onComplete) options.onComplete(this, object);
        })
        .onUpdate(function() {
          // get the position data half way along the path
          let pathPosition = shape.getPointAt(this.distance);
          // move to that position
          object.position.set(pathPosition.x, pathPosition.y, pathPosition.z);
          object.updateMatrix();
          if (options.onUpdate) options.onUpdate(this, object);
        });

      if (options.repeat) tween.repeat(options.repeat);
      if (options.repeat && options.yoyo) tween.yoyo(true);
      if (options.start) tween.start();
      return tween;
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
        userSet,
        // methods
        initData,
        initRenderer,
        initScene,
        initCamera,
        initLight,
        initHelper,
        initObject,
        initTween,
        initEvent,
        updatePerFrame,
      } = opt;

      if (dataSet) this.dataSet = dataSet;
      if (fontSet) this.fontSet = fontSet;
      if (colorSet) this.colorSet = colorSet;
      if (cameraSet) this.cameraSet = cameraSet;
      if (textureSet) this.textureSet = textureSet;
      if (userSet) this.userSet = userSet;

      if (initData) this.initData = initData;
      if (initRenderer) this.initRenderer = initRenderer;
      if (initScene) this.initScene = initScene;
      if (initCamera) this.initCamera = initCamera;
      if (initLight) this.initLight = initLight;
      if (initHelper) this.initHelper = initHelper;
      if (initObject) this.initObject = initObject;
      if (initTween) this.initTween = initTween;
      if (initEvent) this.initEvent = initEvent;
      if (updatePerFrame) this.updatePerFrame = updatePerFrame;

      this.init();
    }

    initParams() {
      // const
      const O = new THREE.Vector3();

      // three.js
      let scene = new THREE.Scene();
      let clock = new THREE.Clock();
      let group = new THREE.Group();
      let raycaster = new THREE.Raycaster();
      let mouse = new THREE.Vector2();
      let tween = {
        param: {},
        object: {},
        method: {},
        action: {
          always: []
        },
      };
      let helper = [];
      let light = [];

      // uer defined
      let canvasSet = {
        width: this.dom.clientWidth || window.innerWidth,
        height: this.dom.clientHeight || window.innerHeight,
      };
      let cameraSet = util.merge({
        type: 'p',
        fov: 45,
        aspect: canvasSet.width / canvasSet.height,
        near: 1,
        far: 10000,
        zoom: 0.75,
        angle: 0,
      }, this.cameraSet);
      canvasSet.height = canvasSet.width / cameraSet.aspect
      cameraSet.distance = Math.max(canvasSet.width, canvasSet.height) / cameraSet.zoom;
      canvasSet.radius = cameraSet.zoom * Math.min(canvasSet.width, canvasSet.height) / 2;
      let fontSet = util.merge({
        font: null,
        fontName: 'gentilis',
        fontWeight: 'regular',
        height: 0.1,
        size: Math.floor(canvasSet.radius * 0.075),
        color: 0xcccccc,
        baseUrl: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/fonts/',
      }, this.fontSet);
      let colorSet = this.colorSet || [0x004ccb, 0x00a2ff, 0x2d4ddc];
      let textureSet = this.textureSet || [];
      let dataSet = this.dataSet || [];

      Th3me.util = util;
      Th3me.O = O; // base point vector
      this.R = canvasSet.radius; // radius suit to dom
      this.scene = scene;
      this.clock = clock;
      this.group = group;
      this.raycaster = raycaster;
      this.mouse = mouse;
      this.tween = tween;
      this.helper = helper;
      this.light = light;
      this.canvasSet = canvasSet;
      this.cameraSet = cameraSet;
      this.fontSet = fontSet;
      this.colorSet = colorSet;
      this.textureSet = textureSet;
      this.dataSet = dataSet;
      this.rafID = null;
      this.isDestroied = false;
    }

    initFunc() {
      let getEventObj = (e, targets, count = 1, recursive = false) => {
        e.preventDefault();
        this.mouse.x = (e.layerX / this.canvasSet.width) * 2 - 1;
        this.mouse.y = (1 - e.layerY / this.canvasSet.height) * 2 - 1;
        this.raycaster.setFromCamera(this.mouse, this.camera);

        let intersects = null;
        let obj = null;
        if (Array.isArray(targets)) {
          intersects = this.raycaster.intersectObjects(targets, recursive);
        } else {
          intersects = this.raycaster.intersectObject(targets, recursive);
        }
        if (intersects.length > 0) {
          obj = [];
          for (let i = 0; i < count; i++) {
            obj.push(intersects[i].object);
          }
        }
        return obj;
      };

      this.getEventObj = getEventObj;
    }

    initData() {
      // init your data
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
      let type = this.cameraSet.type;
      let camera = null;
      if ('p' === type) {
        camera = new THREE.PerspectiveCamera(
          this.cameraSet.fov,
          this.cameraSet.aspect,
          this.cameraSet.near,
          this.cameraSet.far
        );
      } else if ('o' === type) {
        camera = new THREE.OrthographicCamera(
          this.canvasSet.width / -1,
          this.canvasSet.width,
          this.canvasSet.height,
          this.canvasSet.height / -1,
          this.cameraSet.near,
          this.cameraSet.far
        );
      } else {
        throw 'Th3me.js: unknown camera type, should be p or o';
      }
      camera.up.set(0, 1, 0);
      camera.position.set(
        0,
        this.cameraSet.distance * Math.sin(this.cameraSet.angle),
        this.cameraSet.distance * Math.cos(this.cameraSet.angle)
      );
      camera.lookAt(Th3me.O);
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
        this.dom.style.position = 'relative';
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.top = 0;
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
        console.warn('THREE.OrbitControls needs required to init');
      }
    }

    initObject() {
      // create main objects
    }

    initTween() {
      // create main tween
    }

    initEvent() {
      // create main events
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

    render() {
      this.renderer.render(this.scene, this.camera);
    }

    updatePerFrame() {
      // create udf animation for every frame update
    }

    init() {
      this.initParams();
      this.initFunc();
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
      this.initEvent();
      this.show();
    }

    animate() {
      if (this.isDestroied) return false;
      this.rafID = requestAnimationFrame(() => {
        this.animate();
      });
      if (TWEEN) TWEEN.update();
      if (this.viewCtrl) this.viewCtrl.update();
      if (this.stats) this.stats.update();
      this.updatePerFrame();
      this.render();
    }

    resize() {
      let w = this.dom.clientWidth || window.innerWidth;
      let h = this.dom.clientHeight || window.innerHeight;
      // this.camera.aspect =  w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, w / this.cameraSet.aspect);
    }

    destroy() {
      this.isDestroied = true;
      cancelAnimationFrame(this.rafID);
      this.renderer = null;
      this.scene = null;
      this.util = null;
      this.dom = null;
    }

  }

  Th3me.util = util;

  return Th3me;
})
