// Central reactive application app (Svelte 5 runes).
// All lengths/positions are in centimetres. Positions x,z are measured
// from the CENTRE of the desk surface (x = left/right, z = front/back).

import { DESK_PRESETS, ITEM_BY_ID, FINISHES } from './presets.js';

let idCounter = 1;
const nextId = () => `obj-${idCounter++}`;

const defaultDesk = () => {
  const p = DESK_PRESETS[1]; // Standard
  return {
    presetId: p.id,
    w: p.w,
    d: p.d,
    thickness: p.thickness,
    height: p.height,
    color: '#c8a06a',
    finish: 'wood',
    legs: 'four' // 'four' | 'panel' | 'none'
  };
};

export const app = $state({
  unit: 'cm',
  desk: defaultDesk(),
  objects: [],
  selectedId: null,
  settings: {
    showGrid: true,
    showFloor: true,
    snap: false,
    snapSize: 1, // cm
    background: 'studio' // 'studio' | 'light' | 'dark'
  }
});

// ---- history (undo / redo) ---------------------------------------------

const history = { past: [], future: [], limit: 60 };

// Reactive mirror of history availability (for enabling toolbar buttons).
export const hist = $state({ canUndo: false, canRedo: false });
function syncHist() {
  hist.canUndo = history.past.length > 0;
  hist.canRedo = history.future.length > 0;
}

function snapshot() {
  return JSON.stringify({ desk: app.desk, objects: app.objects });
}
function restore(snap) {
  const data = JSON.parse(snap);
  app.desk = data.desk;
  app.objects = data.objects;
  if (!app.objects.some((o) => o.id === app.selectedId)) app.selectedId = null;
}

let lastSnap = snapshot();

export function commit() {
  const snap = snapshot();
  if (snap === lastSnap) return;
  history.past.push(lastSnap);
  if (history.past.length > history.limit) history.past.shift();
  history.future.length = 0;
  lastSnap = snap;
  syncHist();
}

export function undo() {
  if (!history.past.length) return;
  const snap = history.past.pop();
  history.future.push(lastSnap);
  restore(snap);
  lastSnap = snap;
  syncHist();
}

export function redo() {
  if (!history.future.length) return;
  const snap = history.future.pop();
  history.past.push(lastSnap);
  restore(snap);
  lastSnap = snap;
  syncHist();
}

// ---- desk ---------------------------------------------------------------

export function applyDeskPreset(presetId) {
  const p = DESK_PRESETS.find((d) => d.id === presetId);
  if (!p) return;
  app.desk.presetId = p.id;
  app.desk.w = p.w;
  app.desk.d = p.d;
  app.desk.thickness = p.thickness;
  app.desk.height = p.height;
  clampAllToDesk();
  commit();
}

export function setDeskMaterial(mat) {
  app.desk.color = mat.color;
  app.desk.finish = mat.finish;
  commit();
}

// Keep objects inside the desk footprint when it shrinks.
export function clampAllToDesk() {
  for (const o of app.objects) clampToDesk(o);
}

export function clampToDesk(o) {
  const halfW = app.desk.w / 2;
  const halfD = app.desk.d / 2;
  const ow = footprintW(o) / 2;
  const od = footprintD(o) / 2;
  o.x = Math.max(-halfW + ow, Math.min(halfW - ow, o.x));
  o.z = Math.max(-halfD + od, Math.min(halfD - od, o.z));
}

// Footprint accounts for rotation (only 90° steps meaningfully swap axes,
// but we compute the rotated AABB for smooth clamping).
export function footprintW(o) {
  const r = (o.rotation * Math.PI) / 180;
  return Math.abs(o.w * Math.cos(r)) + Math.abs(o.d * Math.sin(r));
}
export function footprintD(o) {
  const r = (o.rotation * Math.PI) / 180;
  return Math.abs(o.w * Math.sin(r)) + Math.abs(o.d * Math.cos(r));
}

// ---- objects ------------------------------------------------------------

function baseObject(over = {}) {
  return {
    id: nextId(),
    name: 'Block',
    model: 'box', // 'box' | 'monitor' | 'cylinder'
    w: 20, d: 20, h: 10,
    x: 0, z: 0,
    lift: 0, // cm above desk surface (for stacking)
    rotation: 0, // degrees around vertical axis
    color: '#d6d8da',
    finish: 'satin',
    texture: null, // { url, face: 'top'|'front'|'all', fit: 'contain'|'cover' }
    ...over
  };
}

// Spawn slightly offset from centre so successive adds don't perfectly overlap.
let spawnOffset = 0;
function spawnPosition() {
  const ring = spawnOffset++ % 8;
  const angle = (ring / 8) * Math.PI * 2;
  const r = spawnOffset > 8 ? 12 : 6;
  return { x: Math.round(Math.cos(angle) * r), z: Math.round(Math.sin(angle) * r) };
}

export function addItem(itemId) {
  const item = ITEM_BY_ID[itemId];
  if (!item) return;
  const pos = spawnPosition();
  const o = baseObject({
    name: item.name,
    model: item.model || 'box',
    w: item.w, d: item.d, h: item.h,
    color: item.color, finish: item.finish,
    x: pos.x, z: pos.z
  });
  clampToDesk(o);
  app.objects.push(o);
  app.selectedId = o.id;
  commit();
  return o.id;
}

export function addCustom({ name, w, d, h, color, finish }) {
  const pos = spawnPosition();
  const o = baseObject({
    name: name || 'Custom Block',
    w: Number(w) || 10, d: Number(d) || 10, h: Number(h) || 10,
    color: color || '#d6d8da', finish: finish || 'satin',
    x: pos.x, z: pos.z
  });
  clampToDesk(o);
  app.objects.push(o);
  app.selectedId = o.id;
  commit();
  return o.id;
}

export function updateObject(id, patch, { history: hist = true } = {}) {
  const o = app.objects.find((x) => x.id === id);
  if (!o) return;
  Object.assign(o, patch);
  clampToDesk(o);
  if (hist) commit();
}

export function removeObject(id) {
  const i = app.objects.findIndex((x) => x.id === id);
  if (i === -1) return;
  app.objects.splice(i, 1);
  if (app.selectedId === id) app.selectedId = null;
  commit();
}

export function duplicateObject(id) {
  const o = app.objects.find((x) => x.id === id);
  if (!o) return;
  const copy = baseObject({ ...structuredClone($state.snapshot(o)), id: nextId() });
  copy.x += 6; copy.z += 6;
  copy.name = o.name;
  clampToDesk(copy);
  app.objects.push(copy);
  app.selectedId = copy.id;
  commit();
}

export function selectObject(id) {
  app.selectedId = id;
}

export function clearAll() {
  app.objects = [];
  app.selectedId = null;
  commit();
}

export const selected = () => app.objects.find((o) => o.id === app.selectedId) || null;

export const finishParams = (finish) => FINISHES[finish] || FINISHES.satin;

// ---- serialization / persistence ---------------------------------------

export const SCHEMA_VERSION = 1;
const AUTOSAVE_KEY = 'desk-designer:autosave';
const FIN_KEYS = Object.keys(FINISHES);
const MODEL_KEYS = ['box', 'monitor', 'cylinder'];

function r2(n) { return Math.round((Number(n) || 0) * 100) / 100; }
function num(v, fallback) { const n = Number(v); return isFinite(n) ? n : fallback; }
function str(v, fallback) { return typeof v === 'string' && v ? v : fallback; }
function enumOr(v, allowed, fallback) { return allowed.includes(v) ? v : fallback; }
function validTexture(t) {
  if (!t || typeof t !== 'object' || typeof t.url !== 'string') return null;
  return {
    url: t.url,
    face: enumOr(t.face, ['top', 'front', 'all'], 'top'),
    fit: enumOr(t.fit, ['contain', 'cover'], 'contain')
  };
}

// Produce the canonical, human-readable JSON document for the current design.
export function toJSON() {
  const s = $state.snapshot(app);
  return {
    type: 'desk-designer',
    version: SCHEMA_VERSION,
    unit: s.unit,
    desk: {
      w: r2(s.desk.w), d: r2(s.desk.d),
      thickness: r2(s.desk.thickness), height: r2(s.desk.height),
      color: s.desk.color, finish: s.desk.finish, legs: s.desk.legs
    },
    settings: {
      showGrid: !!s.settings.showGrid,
      showFloor: !!s.settings.showFloor,
      snap: !!s.settings.snap,
      snapSize: s.settings.snapSize,
      background: s.settings.background
    },
    objects: s.objects.map((o) => ({
      name: o.name,
      model: o.model || 'box',
      w: r2(o.w), d: r2(o.d), h: r2(o.h),
      x: r2(o.x), z: r2(o.z), lift: r2(o.lift || 0), rotation: r2(o.rotation || 0),
      color: o.color, finish: o.finish,
      ...(o.texture ? { texture: o.texture } : {})
    }))
  };
}

export function toJSONString() { return JSON.stringify(toJSON(), null, 2); }

// Replace the whole design from a JSON document (object or string). Tolerant:
// missing fields fall back to defaults, unknown values are clamped.
export function fromJSON(data) {
  const d = typeof data === 'string' ? JSON.parse(data) : data;
  if (!d || typeof d !== 'object') throw new Error('Not a Desk Designer document.');

  if (d.desk && typeof d.desk === 'object') {
    app.desk = {
      presetId: 'custom',
      w: num(d.desk.w, 120), d: num(d.desk.d, 60),
      thickness: num(d.desk.thickness, 2.5), height: num(d.desk.height, 74),
      color: str(d.desk.color, '#c8a06a'),
      finish: enumOr(d.desk.finish, FIN_KEYS, 'wood'),
      legs: enumOr(d.desk.legs, ['four', 'panel', 'none'], 'four')
    };
  }
  if (d.unit) app.unit = enumOr(d.unit, ['cm', 'mm', 'in'], 'cm');
  if (d.settings && typeof d.settings === 'object') {
    app.settings = {
      showGrid: d.settings.showGrid ?? app.settings.showGrid,
      showFloor: d.settings.showFloor ?? app.settings.showFloor,
      snap: d.settings.snap ?? app.settings.snap,
      snapSize: num(d.settings.snapSize, app.settings.snapSize),
      background: enumOr(d.settings.background, ['studio', 'light', 'dark'], app.settings.background)
    };
  }

  const list = Array.isArray(d.objects) ? d.objects : [];
  app.objects = list.map((o) => baseObject({
    name: str(o && o.name, 'Block'),
    model: enumOr(o && o.model, MODEL_KEYS, 'box'),
    w: num(o && o.w, 10), d: num(o && o.d, 10), h: num(o && o.h, 10),
    x: num(o && o.x, 0), z: num(o && o.z, 0),
    lift: num(o && o.lift, 0), rotation: num(o && o.rotation, 0),
    color: str(o && o.color, '#d6d8da'),
    finish: enumOr(o && o.finish, FIN_KEYS, 'satin'),
    texture: validTexture(o && o.texture)
  }));

  clampAllToDesk();
  app.selectedId = null;
  resetHistory();
}

function resetHistory() {
  history.past.length = 0;
  history.future.length = 0;
  lastSnap = snapshot();
  syncHist();
}

// Browser autosave (localStorage).
export function saveLocal() {
  try { localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(toJSON())); } catch { /* quota / private mode */ }
}
export function loadLocal() {
  try {
    const raw = localStorage.getItem(AUTOSAVE_KEY);
    if (!raw) return false;
    fromJSON(JSON.parse(raw));
    return true;
  } catch { return false; }
}
export function clearLocal() {
  try { localStorage.removeItem(AUTOSAVE_KEY); } catch { /* ignore */ }
}

// Restore the previous session on first load, before anything renders.
loadLocal();
