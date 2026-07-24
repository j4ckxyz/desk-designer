// WebGL scene engine (Three.js). Owns the renderer, camera, lights, desk,
// object meshes, selection + drag interaction, and PNG export.
//
// Rendering is ON-DEMAND: we only draw a frame when something changed
// (camera move, selection, geometry/material edit, drag). This keeps the
// GPU idle when the scene is static.

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { FINISHES } from '../presets.js';
import { cmToWorld } from '../units.js';

const M = cmToWorld; // cm -> metres shorthand

const BG = {
  studio: { css: true,  floor: 0xffffff, ground: 0x000000 },
  light:  { css: false, color: 0xe9eaec, floor: 0xf3f4f6 },
  dark:   { css: false, color: 0x15171b, floor: 0x1b1e24 }
};

export class SceneEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.objects = new Map(); // id -> THREE.Mesh
    this.textureCache = new Map(); // url -> THREE.Texture
    this.dirty = true;
    this.dragging = null;
    this.deskState = null;
    this.bgMode = 'studio';

    this._initRenderer();
    this._initScene();
    this._initLights();
    this._initControls();
    this._initInteraction();

    this._raf = this._loop.bind(this);
    requestAnimationFrame(this._raf);
  }

  // ---- setup ------------------------------------------------------------

  _initRenderer() {
    const r = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true // needed for PNG export
    });
    r.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    r.shadowMap.enabled = true;
    r.shadowMap.type = THREE.PCFSoftShadowMap;
    r.toneMapping = THREE.ACESFilmicToneMapping;
    r.toneMappingExposure = 1.05;
    r.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer = r;
  }

  _initScene() {
    this.scene = new THREE.Scene();

    // Image-based lighting for realistic PBR reflections.
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    this.camera = new THREE.PerspectiveCamera(38, 1, 0.05, 100);
    this.camera.position.set(1.1, 1.2, 1.6);

    // Ground plane — catches contact shadows.
    this.ground = new THREE.Mesh(
      new THREE.PlaneGeometry(60, 60),
      new THREE.ShadowMaterial({ opacity: 0.28 })
    );
    this.ground.rotation.x = -Math.PI / 2;
    this.ground.receiveShadow = true;
    this.scene.add(this.ground);

    this.deskGroup = new THREE.Group();
    this.scene.add(this.deskGroup);

    // Grid drawn on the desk surface.
    this.grid = null;

    // Selection outline.
    this.selectionBox = new THREE.BoxHelper(new THREE.Object3D(), 0x2f80ff);
    this.selectionBox.material.depthTest = false;
    this.selectionBox.material.transparent = true;
    this.selectionBox.visible = false;
    this.scene.add(this.selectionBox);

    this.applyBackground('studio');
  }

  _initLights() {
    const key = new THREE.DirectionalLight(0xffffff, 2.1);
    key.position.set(2.5, 4, 2);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.camera.near = 0.5;
    key.shadow.camera.far = 20;
    const s = 3;
    key.shadow.camera.left = -s;
    key.shadow.camera.right = s;
    key.shadow.camera.top = s;
    key.shadow.camera.bottom = -s;
    key.shadow.bias = -0.0004;
    key.shadow.normalBias = 0.02;
    this.scene.add(key);
    this.keyLight = key;

    const fill = new THREE.DirectionalLight(0xffffff, 0.5);
    fill.position.set(-3, 2, -1);
    this.scene.add(fill);

    this.scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 0.35));
  }

  _initControls() {
    const c = new OrbitControls(this.camera, this.canvas);
    c.enableDamping = true;
    c.dampingFactor = 0.08;
    c.minDistance = 0.4;
    c.maxDistance = 8;
    c.maxPolarAngle = Math.PI / 2 - 0.02; // never go under the floor
    c.target.set(0, 0.4, 0);
    c.addEventListener('change', () => (this.dirty = true));
    this.controls = c;
  }

  _initInteraction() {
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    this.dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

    this._onPointerDown = this._pointerDown.bind(this);
    this._onPointerMove = this._pointerMove.bind(this);
    this._onPointerUp = this._pointerUp.bind(this);
    this.canvas.addEventListener('pointerdown', this._onPointerDown);
    window.addEventListener('pointermove', this._onPointerMove);
    window.addEventListener('pointerup', this._onPointerUp);
  }

  // ---- callbacks (wired from the Svelte layer) --------------------------

  onSelect = () => {};
  onDragMove = () => {};   // (id, {x, z})
  onDragEnd = () => {};

  // ---- background / environment -----------------------------------------

  applyBackground(mode) {
    this.bgMode = mode;
    const cfg = BG[mode] || BG.studio;
    if (cfg.css) {
      this.scene.background = null;
      this.renderer.setClearAlpha(0);
      this.ground.material = new THREE.ShadowMaterial({ opacity: 0.26 });
    } else {
      this.scene.background = new THREE.Color(cfg.color);
      this.renderer.setClearAlpha(1);
      this.ground.material = new THREE.MeshStandardMaterial({
        color: cfg.floor, roughness: 0.95, metalness: 0
      });
    }
    this.ground.receiveShadow = true;
    this.dirty = true;
  }

  // ---- desk -------------------------------------------------------------

  syncDesk(desk) {
    this.deskState = desk;
    // rebuild geometry
    while (this.deskGroup.children.length) {
      const c = this.deskGroup.children.pop();
      c.geometry?.dispose();
    }
    const w = M(desk.w), d = M(desk.d), t = M(desk.thickness), h = M(desk.height);
    const surfaceY = h;           // top of the desk surface
    const topCenterY = h - t / 2; // centre of the slab

    const mat = this._material({ color: desk.color, finish: desk.finish });

    const top = new THREE.Mesh(new THREE.BoxGeometry(w, t, d), mat);
    top.position.y = topCenterY;
    top.castShadow = true;
    top.receiveShadow = true;
    top.userData.deskTop = true;
    this.deskGroup.add(top);

    this._buildLegs(desk, w, d, h, t);

    // grid on the surface
    if (this.grid) { this.scene.remove(this.grid); this.grid.geometry.dispose(); }
    const divisions = Math.max(4, Math.round(desk.w / 10));
    const grid = new THREE.GridHelper(Math.max(w, d), divisions, 0x2f80ff, 0x8a8f98);
    grid.material.transparent = true;
    grid.material.opacity = 0.22;
    grid.scale.set(w / Math.max(w, d), 1, d / Math.max(w, d));
    grid.position.y = surfaceY + 0.001;
    grid.visible = this._gridVisible ?? true;
    this.grid = grid;
    this.scene.add(grid);

    this.surfaceY = surfaceY;
    this.dragPlane.constant = 0; // set per-object during drag (top + lift)

    // reposition all objects to sit on the (possibly moved) surface
    for (const [, node] of this.objects) this._placeNodeY(node);
    this.dirty = true;
  }

  _buildLegs(desk, w, d, h, t) {
    if (desk.legs === 'none') return;
    const legMat = new THREE.MeshStandardMaterial({
      color: 0x3a3d42, roughness: 0.4, metalness: 0.7
    });
    const legH = h - t;
    if (desk.legs === 'panel') {
      const pw = M(2);
      for (const sx of [-1, 1]) {
        const panel = new THREE.Mesh(new THREE.BoxGeometry(pw, legH, d * 0.82), legMat);
        panel.position.set(sx * (w / 2 - M(4)), legH / 2, 0);
        panel.castShadow = true;
        this.deskGroup.add(panel);
      }
    } else {
      const legR = M(2);
      const inset = M(5);
      for (const sx of [-1, 1]) {
        for (const sz of [-1, 1]) {
          const leg = new THREE.Mesh(new THREE.BoxGeometry(legR, legH, legR), legMat);
          leg.position.set(sx * (w / 2 - inset), legH / 2, sz * (d / 2 - inset));
          leg.castShadow = true;
          this.deskGroup.add(leg);
        }
      }
    }
  }

  setGridVisible(v) { this._gridVisible = v; if (this.grid) { this.grid.visible = v; this.dirty = true; } }
  setFloorVisible(v) { this.ground.visible = v; this.dirty = true; }

  // ---- objects ----------------------------------------------------------

  syncObjects(list) {
    const seen = new Set();
    for (const o of list) {
      seen.add(o.id);
      let node = this.objects.get(o.id);
      if (!node) {
        node = new THREE.Group();
        node.userData.id = o.id;
        node.userData.sig = '';
        this.scene.add(node);
        this.objects.set(o.id, node);
      }
      this._updateNode(node, o);
    }
    // remove deleted
    for (const [id, node] of this.objects) {
      if (!seen.has(id)) {
        this.scene.remove(node);
        this._disposeNode(node);
        this.objects.delete(id);
      }
    }
    this.dirty = true;
  }

  _updateNode(node, o) {
    node.position.x = M(o.x);
    node.position.z = M(o.z);
    node.rotation.y = -(o.rotation * Math.PI) / 180;
    this._placeNodeY(node, o);

    // Rebuild geometry + material only when a structural/visual input changes.
    const sig = `${o.model || 'box'}|${o.color}|${o.finish}|${o.texture ? o.texture.url + o.texture.face + o.texture.fit : 'none'}|${o.w}x${o.d}x${o.h}`;
    if (node.userData.sig !== sig) {
      this._disposeNode(node, true); // dispose children, keep the node
      this._buildNode(node, o);
      node.userData.sig = sig;
    }
    if (this.selectionBox.visible && this.selectionBox.object === node) {
      this.selectionBox.update();
    }
  }

  // Children are built with their base at local y = 0; the node is lifted to
  // the desk surface (plus any manual lift).
  _placeNodeY(node, o) {
    const lift = o ? (o.lift || 0) : (node.userData.lift || 0);
    node.userData.lift = lift;
    node.position.y = (this.surfaceY || 0) + M(lift);
  }

  _disposeNode(node, childrenOnly = false) {
    for (const c of node.children) {
      c.geometry?.dispose?.();
      this._disposeMaterial(c.material);
    }
    node.clear();
  }

  // ---- object model builders -------------------------------------------

  _buildNode(node, o) {
    const model = o.model || 'box';
    if (model === 'monitor') this._buildMonitor(node, o);
    else if (model === 'cylinder') this._buildCylinder(node, o);
    else this._buildBox(node, o);
    node.traverse((c) => {
      if (c.isMesh) {
        if (c.castShadow === undefined || c.userData.noShadow !== true) c.castShadow = true;
        c.receiveShadow = true;
        c.userData.id = o.id;
      }
    });
  }

  _buildBox(node, o) {
    const w = M(o.w), h = M(o.h), d = M(o.d);
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), this._objectMaterial(o));
    mesh.position.y = h / 2;
    node.add(mesh);
  }

  _buildCylinder(node, o) {
    const r = M(Math.min(o.w, o.d)) / 2;
    const h = M(o.h);
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 48), this._material(o));
    mesh.position.y = h / 2;
    node.add(mesh);
  }

  // A monitor = thin screen panel on a neck + flat base. Screen faces +Z.
  _buildMonitor(node, o) {
    const w = M(o.w), h = M(o.h), d = M(o.d);
    const body = this._material({ color: o.color, finish: o.finish });

    const baseH = Math.min(M(1.6), h * 0.06);
    const baseW = w * 0.42;
    const baseD = d * 0.92;
    const base = new THREE.Mesh(new THREE.BoxGeometry(baseW, baseH, baseD), body);
    base.position.set(0, baseH / 2, 0);
    node.add(base);

    const panelThk = Math.min(M(3.5), Math.max(M(2), d * 0.28));
    const panelBottom = h * 0.28;
    const panelH = h - panelBottom;
    const neckH = Math.max(panelBottom - baseH, M(1));
    const neckW = Math.max(w * 0.09, M(4));
    const neckThk = Math.min(M(3), panelThk);
    const neckZ = -d / 2 + baseD * 0.4;
    const neck = new THREE.Mesh(new THREE.BoxGeometry(neckW, neckH, neckThk), body);
    neck.position.set(0, baseH + neckH / 2, neckZ);
    node.add(neck);

    const panelZ = neckZ + neckThk / 2 + panelThk / 2;
    const panelY = panelBottom + panelH / 2;
    const panel = new THREE.Mesh(new THREE.BoxGeometry(w, panelH, panelThk), body);
    panel.position.set(0, panelY, panelZ);
    node.add(panel);

    // Screen face on the front (+Z) of the panel.
    const bezel = M(1.2);
    const screenW = Math.max(w - bezel * 2, w * 0.82);
    const screenH = Math.max(panelH - bezel * 2, panelH * 0.82);
    const screenMat = this._screenMaterial(o, screenW, screenH);
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(screenW, screenH), screenMat);
    screen.position.set(0, panelY, panelZ + panelThk / 2 + 0.0015);
    screen.castShadow = false;
    screen.userData.noShadow = true;
    node.add(screen);
  }

  _screenMaterial(o, screenW, screenH) {
    if (o.texture && o.texture.url) {
      const src = this._loadTexture(o.texture.url);
      const t = src.clone();
      t.colorSpace = THREE.SRGBColorSpace;
      t.needsUpdate = true;
      const fit = () => {
        const img = src.image;
        if (!img || !img.width) return;
        const ia = img.width / img.height, fa = screenW / screenH;
        let rx = 1, ry = 1;
        if (ia > fa) rx = fa / ia; else ry = ia / fa;
        t.repeat.set(rx, ry);
        t.offset.set((1 - rx) / 2, (1 - ry) / 2);
        t.needsUpdate = true;
        this.dirty = true;
      };
      if (src.image) { t.image = src.image; t.needsUpdate = true; fit(); }
      else src.userData.onReady = () => { t.image = src.image; t.needsUpdate = true; fit(); };
      return new THREE.MeshStandardMaterial({ map: t, roughness: 0.22, metalness: 0, emissive: 0x0a0a0a });
    }
    return new THREE.MeshStandardMaterial({ color: 0x0a0b0d, roughness: 0.12, metalness: 0 });
  }

  // ---- materials --------------------------------------------------------

  _material({ color, finish }) {
    const f = FINISHES[finish] || FINISHES.satin;
    const m = new THREE.MeshStandardMaterial({
      color: new THREE.Color(color),
      roughness: f.roughness,
      metalness: f.metalness
    });
    if (finish === 'glass') { m.transparent = true; m.opacity = 0.4; }
    return m;
  }

  _objectMaterial(o) {
    const base = () => this._material(o);
    if (!o.texture || !o.texture.url) return base();

    const tex = this._loadTexture(o.texture.url);
    const faceIndex = { right: 0, left: 1, top: 2, bottom: 3, front: 4, back: 5 };

    const applyFit = (t, faceW, faceH) => {
      const img = t.image;
      if (!img || !img.width) return;
      const imgAspect = img.width / img.height;
      const faceAspect = faceW / faceH;
      let rx = 1, ry = 1;
      if (o.texture.fit === 'contain') {
        if (imgAspect > faceAspect) ry = imgAspect / faceAspect;
        else rx = faceAspect / imgAspect;
      } else { // cover
        if (imgAspect > faceAspect) rx = faceAspect / imgAspect;
        else ry = imgAspect / faceAspect;
      }
      t.repeat.set(rx, ry);
      t.offset.set((1 - rx) / 2, (1 - ry) / 2);
      t.needsUpdate = true;
      this.dirty = true;
    };

    if (o.texture.face === 'all') {
      const m = base();
      m.map = tex;
      if (tex.image) applyFit(tex, o.w, o.h);
      else tex.userData.onReady = () => applyFit(tex, o.w, o.h);
      return m;
    }

    // per-face: only the chosen face gets the texture
    const dims = {
      right: [o.d, o.h], left: [o.d, o.h],
      top: [o.w, o.d], bottom: [o.w, o.d],
      front: [o.w, o.h], back: [o.w, o.h]
    };
    const mats = [0, 1, 2, 3, 4, 5].map(() => base());
    const idx = faceIndex[o.texture.face] ?? 2;
    const faceTex = tex.clone();
    faceTex.needsUpdate = true;
    faceTex.colorSpace = THREE.SRGBColorSpace;
    mats[idx].map = faceTex;
    const [fw, fh] = dims[o.texture.face] || [o.w, o.h];
    if (tex.image) applyFit(faceTex, fw, fh);
    else tex.userData.onReady = () => { faceTex.image = tex.image; faceTex.needsUpdate = true; applyFit(faceTex, fw, fh); };
    return mats;
  }

  _loadTexture(url) {
    if (this.textureCache.has(url)) return this.textureCache.get(url);
    const tex = new THREE.Texture();
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
    const img = new Image();
    img.onload = () => {
      tex.image = img;
      tex.needsUpdate = true;
      tex.userData.onReady?.();
      this.dirty = true;
    };
    img.src = url;
    this.textureCache.set(url, tex);
    return tex;
  }

  _disposeMaterial(mat) {
    if (!mat) return;
    const arr = Array.isArray(mat) ? mat : [mat];
    for (const m of arr) { m.map?.dispose?.(); m.dispose(); }
  }

  // ---- selection --------------------------------------------------------

  setSelection(id) {
    const mesh = id ? this.objects.get(id) : null;
    if (mesh) {
      this.selectionBox.setFromObject(mesh);
      this.selectionBox.object = mesh;
      this.selectionBox.visible = true;
    } else {
      this.selectionBox.visible = false;
      this.selectionBox.object = null;
    }
    this.dirty = true;
  }

  // ---- pointer interaction ---------------------------------------------

  _updatePointer(e) {
    const rect = this.canvas.getBoundingClientRect();
    this.pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  }

  _pointerDown(e) {
    if (e.button !== 0) return;
    this._updatePointer(e);
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hits = this.raycaster.intersectObjects([...this.objects.values()], true);
    if (hits.length) {
      const id = hits[0].object.userData.id;
      const node = this.objects.get(id);
      if (!node) { this.onSelect(null); return; }
      this.onSelect(id);
      // begin drag on the horizontal plane at this object's base height
      const planeY = node.position.y;
      this.dragPlane.set(new THREE.Vector3(0, 1, 0), -planeY);
      const p = new THREE.Vector3();
      this.raycaster.ray.intersectPlane(this.dragPlane, p);
      this.dragging = {
        id,
        offset: new THREE.Vector3(p.x - node.position.x, 0, p.z - node.position.z),
        moved: false
      };
      this.controls.enabled = false;
    } else {
      this.onSelect(null);
      this._pendingDeselect = true;
    }
  }

  _pointerMove(e) {
    if (!this.dragging) return;
    this._updatePointer(e);
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const p = new THREE.Vector3();
    if (!this.raycaster.ray.intersectPlane(this.dragPlane, p)) return;
    const x = p.x - this.dragging.offset.x;
    const z = p.z - this.dragging.offset.z;
    this.dragging.moved = true;
    this.onDragMove(this.dragging.id, { x: x / M(1), z: z / M(1) });
  }

  _pointerUp() {
    if (this.dragging) {
      if (this.dragging.moved) this.onDragEnd(this.dragging.id);
      this.dragging = null;
      this.controls.enabled = true;
    }
  }

  // ---- camera presets ---------------------------------------------------

  frame(view = 'iso') {
    const d = this.deskState;
    const w = d ? M(d.w) : 1.2;
    const surfaceY = this.surfaceY || 0.74;
    const dist = Math.max(w, 1) * 1.35;
    const positions = {
      iso:   [dist * 0.8, surfaceY + dist * 0.7, dist * 0.9],
      front: [0, surfaceY + dist * 0.25, dist * 1.15],
      top:   [0.001, surfaceY + dist * 1.4, 0.001],
      side:  [dist * 1.2, surfaceY + dist * 0.35, 0.001]
    };
    const pos = positions[view] || positions.iso;
    this.camera.position.set(...pos);
    this.controls.target.set(0, surfaceY * 0.7, 0);
    this.controls.update();
    this.dirty = true;
  }

  // ---- export -----------------------------------------------------------

  exportPNG({ scale = 2, transparent = null } = {}) {
    const gridWasVisible = this.grid?.visible;
    const selWasVisible = this.selectionBox.visible;
    if (this.grid) this.grid.visible = false;
    this.selectionBox.visible = false;

    const rect = this.canvas.getBoundingClientRect();
    const w = Math.round(rect.width * scale);
    const h = Math.round(rect.height * scale);

    const prevPR = this.renderer.getPixelRatio();
    this.renderer.setPixelRatio(1);
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.render(this.scene, this.camera);
    const url = this.renderer.domElement.toDataURL('image/png');

    // restore
    this.renderer.setPixelRatio(prevPR);
    this.resize();
    if (this.grid) this.grid.visible = gridWasVisible;
    this.selectionBox.visible = selWasVisible;
    this.dirty = true;
    return url;
  }

  // ---- loop / resize ----------------------------------------------------

  resize() {
    const w = this.canvas.clientWidth || 1;
    const h = this.canvas.clientHeight || 1;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.dirty = true;
  }

  _loop() {
    requestAnimationFrame(this._raf);
    this.controls.update();
    if (this.dirty) {
      this.dirty = false;
      this.renderer.render(this.scene, this.camera);
    }
  }

  dispose() {
    this.canvas.removeEventListener('pointerdown', this._onPointerDown);
    window.removeEventListener('pointermove', this._onPointerMove);
    window.removeEventListener('pointerup', this._onPointerUp);
    this.controls.dispose();
    this.renderer.dispose();
    for (const [, node] of this.objects) this._disposeNode(node);
  }
}
