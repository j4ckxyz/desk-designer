<script>
  import { app, hist, undo, redo, persistence } from '../store.svelte.js';
  import { toast } from '../toasts.svelte.js';
  import { UNITS } from '../units.js';
  import { engineRef } from '../engine/engineRef.js';

  let { theme, ontoggletheme, onopenjson } = $props();
  let exporting = $state(false);

  const views = [
    ['iso', 'Iso'], ['front', 'Front'], ['top', 'Top'], ['side', 'Side']
  ];

  function setView(v) { engineRef.current?.frame(v); }

  function exportPNG() {
    const eng = engineRef.current;
    if (!eng) return;
    exporting = true;
    // let the button app paint before the (sync) render
    requestAnimationFrame(() => {
      try {
        const url = eng.exportPNG({ scale: 2 });
        const a = document.createElement('a');
        const stamp = new Date().toISOString().slice(0, 10);
        a.href = url;
        a.download = `desk-plan-${stamp}.png`;
        a.click();
        toast('PNG exported', { tone: 'success' });
      } finally {
        exporting = false;
      }
    });
  }
</script>

<header class="toolbar">
  <div class="brand">
    <div class="logo">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-5 9 5-9 5-9-5z"/><path d="M3 9v6l9 5 9-5V9"/></svg>
    </div>
    <div class="name">Desk<span>Designer</span></div>
  </div>

  <div class="group">
    {#each views as [v, label]}
      <button class="tb" onclick={() => setView(v)}>{label}</button>
    {/each}
  </div>

  <div class="sep"></div>

  <div class="group">
    <button class="tb icon" title="Undo (⌘Z)" disabled={!hist.canUndo} onclick={undo} aria-label="Undo">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 14L4 9l5-5"/><path d="M4 9h11a5 5 0 015 5v1"/></svg>
    </button>
    <button class="tb icon" title="Redo (⌘⇧Z)" disabled={!hist.canRedo} onclick={redo} aria-label="Redo">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 14l5-5-5-5"/><path d="M20 9H9a5 5 0 00-5 5v1"/></svg>
    </button>
  </div>

  <div class="sep"></div>

  <label class="toggle" title="Show grid">
    <input type="checkbox" bind:checked={app.settings.showGrid} />
    <span>Grid</span>
  </label>
  <label class="toggle" title="Show floor & shadow">
    <input type="checkbox" bind:checked={app.settings.showFloor} />
    <span>Floor</span>
  </label>
  <label class="toggle" title="Snap to grid">
    <input type="checkbox" bind:checked={app.settings.snap} />
    <span>Snap</span>
  </label>

  <div class="spacer"></div>

  <div class="group">
    <span class="mini">Scene</span>
    <select class="mini-select" bind:value={app.settings.background}>
      <option value="studio">Studio</option>
      <option value="light">Light</option>
      <option value="dark">Dark</option>
    </select>
  </div>

  <div class="group">
    <span class="mini">Units</span>
    <select class="mini-select" bind:value={app.unit}>
      {#each UNITS as u}<option value={u}>{u}</option>{/each}
    </select>
  </div>

  <button class="tb icon" title="Toggle theme" onclick={ontoggletheme} aria-label="Toggle theme">
    {#if theme === 'dark'}
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5"/></svg>
    {:else}
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z"/></svg>
    {/if}
  </button>

  <div class="save" class:err={persistence.status === 'error'}
       title={persistence.status === 'error' ? 'Autosave failed — storage full' : 'Saved to this browser'}>
    {#if persistence.status === 'error'}
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L14.4 3.9a2 2 0 00-3.4 0z"/></svg>
      <span>Not saved</span>
    {:else if persistence.status === 'saved'}
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M20 6L9 17l-5-5"/></svg>
      <span>Saved</span>
    {/if}
  </div>

  <button class="btn" title="Import / export JSON" onclick={onopenjson}>
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3H7a2 2 0 00-2 2v4a2 2 0 01-2 2 2 2 0 012 2v4a2 2 0 002 2h1M16 3h1a2 2 0 012 2v4a2 2 0 002 2 2 2 0 00-2 2v4a2 2 0 01-2 2h-1"/></svg>
    JSON
  </button>

  <button class="btn primary export" onclick={exportPNG} disabled={exporting}>
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v12M8 11l4 4 4-4"/><path d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2"/></svg>
    {exporting ? 'Exporting…' : 'Export PNG'}
  </button>
</header>

<style>
  .toolbar {
    display: flex;
    align-items: center;
    gap: 10px;
    height: 52px;
    padding: 0 14px;
    background: var(--topbar);
    border-bottom: 1px solid var(--border);
    flex-shrink: 0;
    z-index: 10;
  }
  .brand { display: flex; align-items: center; gap: 9px; padding-right: 6px; }
  .logo { width: 30px; height: 30px; border-radius: 8px; display: grid; place-items: center; color: var(--accent-contrast);
    background: linear-gradient(135deg, var(--accent), oklch(0.7 0.16 320)); box-shadow: var(--shadow-sm); }
  .name { font-weight: 700; font-size: 15px; letter-spacing: -0.01em; }
  .name span { color: var(--accent); }

  .group { display: flex; align-items: center; gap: 3px; }
  .sep { width: 1px; height: 22px; background: var(--border); margin: 0 3px; }
  .spacer { flex: 1; }

  .tb {
    height: 32px; padding: 0 11px; border-radius: 7px; font-size: 12.5px; font-weight: 600;
    color: var(--text-dim);
  }
  .tb:hover:not(:disabled) { background: var(--surface-2); color: var(--text); }
  .tb:disabled { opacity: 0.35; cursor: not-allowed; }
  .tb.icon { width: 32px; padding: 0; display: grid; place-items: center; }

  .toggle { display: flex; align-items: center; gap: 6px; padding: 0 4px; font-size: 12px; color: var(--text-dim); cursor: pointer; user-select: none; }
  .toggle input { accent-color: var(--accent); width: 15px; height: 15px; cursor: pointer; }
  .toggle:hover { color: var(--text); }

  .mini { font-size: 11px; color: var(--text-faint); font-weight: 600; }
  .mini-select {
    height: 30px; padding: 0 26px 0 9px; border-radius: 7px; font-size: 12px; font-weight: 600;
    background: var(--surface); border: 1px solid var(--border); color: var(--text);
    appearance: none; cursor: pointer;
    background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2.5'><path d='M6 9l6 6 6-6'/></svg>");
    background-repeat: no-repeat; background-position: right 8px center;
  }
  .export { margin-left: 2px; }

  .save {
    display: flex; align-items: center; gap: 5px;
    padding: 0 4px; font-size: var(--fs-caption); font-weight: 600;
    color: var(--text-faint); user-select: none;
    transition: color 0.15s;
  }
  .save.err { color: var(--danger); }

  @media (max-width: 1120px) {
    .save span { display: none; }
  }
  @media (max-width: 980px) {
    .toggle span, .mini { display: none; }
    .name span { display: none; }
  }
</style>
