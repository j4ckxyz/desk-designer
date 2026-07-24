<script>
  import Section from './Section.svelte';
  import LengthInput from './LengthInput.svelte';
  import DimensionPaste from './DimensionPaste.svelte';
  import { ITEM_LIBRARY, COLOR_SWATCHES, FINISHES } from '../presets.js';
  import { app, addItem, addCustom } from '../store.svelte.js';

  let activeCat = $state(ITEM_LIBRARY[0].category);
  const group = $derived(ITEM_LIBRARY.find((g) => g.category === activeCat));

  // custom block form
  let cw = $state(20), cd = $state(20), ch = $state(10);
  let cname = $state('');
  let ccolor = $state('#d6d8da');
  let cfinish = $state('satin');

  function addCustomBlock() {
    addCustom({ name: cname, w: cw, d: cd, h: ch, color: ccolor, finish: cfinish });
    cname = '';
  }
</script>

<Section title="Add objects">
  <div class="tabs">
    {#each ITEM_LIBRARY as g}
      <button class:active={activeCat === g.category} onclick={() => (activeCat = g.category)}>{g.category}</button>
    {/each}
  </div>

  <div class="items">
    {#each group.items as it}
      <button class="item" onclick={() => addItem(it.id)} title="Add {it.name}">
        <span class="dot" style="background:{it.color}"></span>
        <span class="in">
          <span class="iname">{it.name}</span>
          <span class="idim">{it.w}×{it.d}×{it.h} cm</span>
        </span>
        <svg class="plus" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
      </button>
    {/each}
  </div>
</Section>

<Section title="Custom block" open={false}>
  <div class="field">
    <label>Name</label>
    <input class="input" placeholder="e.g. Router" bind:value={cname} />
  </div>
  <div class="row">
    <LengthInput label="W" value={cw} unit={app.unit} onchange={(cm) => (cw = cm)} />
    <LengthInput label="D" value={cd} unit={app.unit} onchange={(cm) => (cd = cm)} />
    <LengthInput label="H" value={ch} unit={app.unit} onchange={(cm) => (ch = cm)} />
  </div>
  <DimensionPaste onApply={(d) => { if (d.w != null) cw = d.w; if (d.d != null) cd = d.d; if (d.h != null) ch = d.h; }} />
  <div class="field">
    <label>Colour</label>
    <div class="swatches">
      {#each COLOR_SWATCHES as s}
        <button class="swatch" class:active={ccolor.toLowerCase() === s.hex.toLowerCase()} style="background:{s.hex}" title={s.name} onclick={() => (ccolor = s.hex)} aria-label={s.name}></button>
      {/each}
      <label class="swatch pick" title="Custom colour">
        <input type="color" bind:value={ccolor} />
      </label>
    </div>
  </div>
  <div class="field">
    <label>Finish</label>
    <select class="input" bind:value={cfinish}>
      {#each Object.keys(FINISHES) as f}<option value={f}>{f[0].toUpperCase() + f.slice(1)}</option>{/each}
    </select>
  </div>
  <button class="btn primary" onclick={addCustomBlock}>
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
    Add block
  </button>
</Section>

<style>
  .tabs { display: flex; flex-wrap: wrap; gap: 5px; }
  .tabs button {
    padding: 5px 10px; border-radius: 20px; font-size: 11.5px; font-weight: 600;
    color: var(--text-dim); background: var(--surface); border: 1px solid var(--border);
  }
  .tabs button:hover { color: var(--text); }
  .tabs button.active { background: var(--accent); border-color: var(--accent); color: var(--accent-contrast); }

  .items { display: flex; flex-direction: column; gap: 5px; }
  .item {
    display: flex; align-items: center; gap: 10px;
    padding: 8px 10px; border-radius: 9px;
    background: var(--surface); border: 1px solid var(--border);
    transition: border-color 0.12s, background 0.12s;
  }
  .item:hover { border-color: var(--accent); background: var(--accent-soft); }
  .dot { width: 16px; height: 16px; border-radius: 5px; flex-shrink: 0; border: 1px solid rgba(0,0,0,0.2); }
  .in { flex: 1; display: flex; flex-direction: column; text-align: left; min-width: 0; }
  .iname { font-size: 12.5px; font-weight: 600; }
  .idim { font-size: var(--fs-caption); color: var(--text-faint); font-variant-numeric: tabular-nums; }
  .plus { color: var(--text-faint); flex-shrink: 0; }
  .item:hover .plus { color: var(--accent); }

  .row { display: flex; gap: 8px; }
  .swatches { display: flex; flex-wrap: wrap; gap: 7px; }
  .swatch {
    width: 24px; height: 24px; border-radius: 6px; position: relative; overflow: hidden;
    border: 1px solid rgba(0,0,0,0.15);
  }
  .swatch:hover { transform: scale(1.08); }
  .swatch.active { box-shadow: 0 0 0 2px var(--panel), 0 0 0 4px var(--accent); }
  .swatch.pick { background: conic-gradient(from 0deg, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00); }
  .swatch.pick input { position: absolute; inset: -4px; opacity: 0; cursor: pointer; }
</style>
