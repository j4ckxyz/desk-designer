<script>
  import { onMount } from 'svelte';
  import { SceneEngine } from '../engine/SceneEngine.js';
  import { engineRef } from '../engine/engineRef.js';
  import {
    app, selectObject, updateObject, removeObject,
    duplicateObject, commit, undo, redo, selected
  } from '../store.svelte.js';

  let canvas;
  let engine;

  onMount(() => {
    engine = new SceneEngine(canvas);
    engineRef.current = engine;

    engine.onSelect = (id) => selectObject(id);
    engine.onDragMove = (id, { x, z }) => {
      let nx = x, nz = z;
      if (app.settings.snap) {
        const s = app.settings.snapSize;
        nx = Math.round(x / s) * s;
        nz = Math.round(z / s) * s;
      }
      updateObject(id, { x: nx, z: nz }, { history: false });
    };
    engine.onDragEnd = () => commit();

    const ro = new ResizeObserver(() => engine.resize());
    ro.observe(canvas.parentElement);
    engine.resize();
    engine.syncDesk($state.snapshot(app.desk));
    engine.frame('iso');

    return () => { ro.disconnect(); engine.dispose(); engineRef.current = null; };
  });

  // ---- reactive sync: app -> engine ----
  $effect(() => {
    if (!engine) return;
    const desk = $state.snapshot(app.desk);
    engine.syncDesk(desk);
  });

  $effect(() => {
    if (!engine) return;
    const objs = $state.snapshot(app.objects);
    engine.syncObjects(objs);
  });

  $effect(() => {
    if (!engine) return;
    engine.setSelection(app.selectedId);
  });

  $effect(() => {
    if (!engine) return;
    engine.setGridVisible(app.settings.showGrid);
    engine.setFloorVisible(app.settings.showFloor);
    engine.applyBackground(app.settings.background);
  });

  // ---- keyboard controls ----
  function isTyping(e) {
    const t = e.target;
    return t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable);
  }

  function onKey(e) {
    const mod = e.metaKey || e.ctrlKey;
    if (mod && e.key.toLowerCase() === 'z') {
      e.preventDefault();
      e.shiftKey ? redo() : undo();
      return;
    }
    if (mod && e.key.toLowerCase() === 'y') { e.preventDefault(); redo(); return; }
    if (isTyping(e)) return;

    const o = selected();
    if (mod && e.key.toLowerCase() === 'd' && o) { e.preventDefault(); duplicateObject(o.id); return; }
    if (!o) return;

    const step = e.shiftKey ? 5 : 1;
    let handled = true;
    switch (e.key) {
      case 'ArrowLeft':  updateObject(o.id, { x: o.x - step }); break;
      case 'ArrowRight': updateObject(o.id, { x: o.x + step }); break;
      case 'ArrowUp':    updateObject(o.id, { z: o.z - step }); break;
      case 'ArrowDown':  updateObject(o.id, { z: o.z + step }); break;
      case 'r': case 'R': {
        const d = e.shiftKey ? -15 : 15;
        updateObject(o.id, { rotation: (o.rotation + d) % 360 });
        break;
      }
      case 'Delete': case 'Backspace': removeObject(o.id); break;
      case 'Escape': selectObject(null); break;
      default: handled = false;
    }
    if (handled) e.preventDefault();
  }
</script>

<svelte:window on:keydown={onKey} />

<div class="viewport">
  <canvas bind:this={canvas}></canvas>
  <div class="hint">
    <span><kbd>drag</kbd> orbit</span>
    <span><kbd>scroll</kbd> zoom</span>
    <span><kbd>drag object</kbd> move</span>
    <span><kbd>↑↓←→</kbd> nudge</span>
    <span><kbd>R</kbd> rotate</span>
    <span><kbd>⌫</kbd> delete</span>
  </div>
</div>

<style>
  .viewport {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background:
      radial-gradient(120% 100% at 50% 0%, #f4f6f9 0%, #dfe3e9 55%, #c9cfd8 100%);
  }
  :global([data-theme='dark']) .viewport {
    background:
      radial-gradient(120% 100% at 50% 0%, #23272e 0%, #16181d 60%, #0e1013 100%);
  }
  canvas {
    display: block;
    width: 100%;
    height: 100%;
    touch-action: none;
  }
  .hint {
    position: absolute;
    left: 50%;
    bottom: 14px;
    transform: translateX(-50%);
    display: flex;
    gap: 14px;
    padding: 7px 14px;
    border-radius: 10px;
    background: color-mix(in srgb, var(--panel) 82%, transparent);
    backdrop-filter: blur(10px);
    border: 1px solid var(--border);
    font-size: 11px;
    color: var(--text-dim);
    pointer-events: none;
    box-shadow: var(--shadow-sm);
  }
  .hint span { display: flex; align-items: center; gap: 5px; white-space: nowrap; }
  kbd {
    font-family: inherit;
    font-size: var(--fs-caption);
    background: var(--surface-2);
    border: 1px solid var(--border);
    border-radius: 4px;
    padding: 1px 5px;
    color: var(--text);
  }
  @media (max-width: 720px) { .hint { display: none; } }
</style>
