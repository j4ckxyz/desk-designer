<script>
  import LengthInput from './LengthInput.svelte';
  import DimensionPaste from './DimensionPaste.svelte';
  import { COLOR_SWATCHES, FINISHES } from '../presets.js';
  import { app, selected, updateObject, removeObject, duplicateObject } from '../store.svelte.js';

  const o = $derived(selected());

  const set = (patch, hist = true) => updateObject(o.id, patch, { history: hist });

  function onTexture(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => set({ texture: { url: reader.result, face: o.texture?.face || 'top', fit: o.texture?.fit || 'contain' } });
    reader.readAsDataURL(file);
    e.target.value = '';
  }
</script>

{#if !o}
  <div class="empty">
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 3l9 5v8l-9 5-9-5V8z"/><path d="M3 8l9 5 9-5M12 13v8"/></svg>
    <p>Select an object to edit its size, position, colour and texture.</p>
  </div>
{:else}
  <div class="inspector">
    <div class="head">
      <input class="title" bind:value={o.name} onchange={() => set({ name: o.name })} />
      <div class="acts">
        <button class="btn icon ghost" title="Duplicate (⌘D)" onclick={() => duplicateObject(o.id)} aria-label="Duplicate">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 012-2h10"/></svg>
        </button>
        <button class="btn icon ghost danger" title="Delete (⌫)" onclick={() => removeObject(o.id)} aria-label="Delete">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/></svg>
        </button>
      </div>
    </div>

    <div class="grp">
      <span class="glabel">Dimensions</span>
      <div class="row">
        <LengthInput label="Width" value={o.w} unit={app.unit} onchange={(cm) => set({ w: cm })} />
        <LengthInput label="Depth" value={o.d} unit={app.unit} onchange={(cm) => set({ d: cm })} />
        <LengthInput label="Height" value={o.h} unit={app.unit} onchange={(cm) => set({ h: cm })} />
      </div>
      <DimensionPaste onApply={(dims) => set(dims)} />
    </div>

    <div class="grp">
      <span class="glabel">Position <small>from desk centre</small></span>
      <div class="row">
        <LengthInput label="X ↔" value={o.x} unit={app.unit} min={-999} onchange={(cm) => set({ x: cm })} />
        <LengthInput label="Z ↕" value={o.z} unit={app.unit} min={-999} onchange={(cm) => set({ z: cm })} />
        <LengthInput label="Lift" value={o.lift} unit={app.unit} min={0} onchange={(cm) => set({ lift: cm })} />
      </div>
    </div>

    <div class="grp">
      <span class="glabel">Rotation <small>{Math.round(o.rotation)}°</small></span>
      <div class="rot">
        <input class="slider" type="range" min="0" max="360" step="1" value={o.rotation}
          oninput={(e) => set({ rotation: +e.target.value }, false)}
          onchange={(e) => set({ rotation: +e.target.value })} />
        <div class="seg quarters">
          {#each [0, 90, 180, 270] as a}
            <button class:active={Math.round(o.rotation) === a} onclick={() => set({ rotation: a })}>{a}°</button>
          {/each}
        </div>
      </div>
    </div>

    <div class="grp">
      <span class="glabel">Colour</span>
      <div class="swatches">
        {#each COLOR_SWATCHES as s}
          <button class="swatch" class:active={o.color.toLowerCase() === s.hex.toLowerCase()} style="background:{s.hex}" title={s.name} onclick={() => set({ color: s.hex })} aria-label={s.name}></button>
        {/each}
        <label class="swatch pick" title="Custom colour">
          <input type="color" value={o.color} oninput={(e) => set({ color: e.target.value }, false)} onchange={(e) => set({ color: e.target.value })} />
        </label>
      </div>
    </div>

    <div class="grp">
      <span class="glabel">Finish</span>
      <div class="finishes">
        {#each Object.keys(FINISHES) as f}
          <button class="fin" class:active={o.finish === f} onclick={() => set({ finish: f })}>{f[0].toUpperCase() + f.slice(1)}</button>
        {/each}
      </div>
    </div>

    <div class="grp">
      <span class="glabel">Texture</span>
      {#if o.texture}
        <div class="tex">
          <img src={o.texture.url} alt="texture" />
          <div class="texctl">
            <div class="seg">
              {#each [['top','Top'],['front','Front'],['all','All']] as [v, l]}
                <button class:active={o.texture.face === v} onclick={() => set({ texture: { ...o.texture, face: v } })}>{l}</button>
              {/each}
            </div>
            <div class="seg">
              {#each [['contain','Contain'],['cover','Cover']] as [v, l]}
                <button class:active={o.texture.fit === v} onclick={() => set({ texture: { ...o.texture, fit: v } })}>{l}</button>
              {/each}
            </div>
          </div>
          <button class="btn ghost icon danger" onclick={() => set({ texture: null })} title="Remove texture" aria-label="Remove texture">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
      {:else}
        <label class="upload">
          <input type="file" accept="image/*" onchange={onTexture} />
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 16V4M6 10l6-6 6 6"/><path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2"/></svg>
          <span>Upload image <small>(logo, grille, artwork…)</small></span>
        </label>
      {/if}
    </div>
  </div>
{/if}

<style>
  .empty { padding: 40px 24px; text-align: center; color: var(--text-faint); display: flex; flex-direction: column; align-items: center; gap: 12px; }
  .empty p { margin: 0; font-size: 12.5px; line-height: 1.5; max-width: 220px; }

  .inspector { padding: 14px; display: flex; flex-direction: column; gap: 18px; }
  .head { display: flex; align-items: center; gap: 8px; }
  .title { flex: 1; height: 34px; padding: 0 10px; font-weight: 700; font-size: 14px; background: var(--surface); border: 1px solid transparent; border-radius: 8px; }
  .title:hover { border-color: var(--border); }
  .title:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-soft); }
  .acts { display: flex; gap: 4px; }

  .grp { display: flex; flex-direction: column; gap: 9px; }
  .glabel { font-size: 11px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; color: var(--text-faint); display: flex; justify-content: space-between; align-items: baseline; }
  .glabel small { font-size: 10px; font-weight: 500; letter-spacing: 0; text-transform: none; color: var(--text-faint); font-variant-numeric: tabular-nums; }
  .row { display: flex; gap: 8px; }

  .rot { display: flex; flex-direction: column; gap: 10px; }
  .slider { width: 100%; -webkit-appearance: none; appearance: none; height: 4px; border-radius: 3px; background: var(--surface-2); }
  .slider::-webkit-slider-thumb { -webkit-appearance: none; width: 16px; height: 16px; border-radius: 50%; background: var(--accent); border: 2px solid var(--panel); box-shadow: var(--shadow-sm); cursor: pointer; }
  .slider::-moz-range-thumb { width: 16px; height: 16px; border-radius: 50%; background: var(--accent); border: 2px solid var(--panel); cursor: pointer; }

  .seg { display: flex; background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 2px; gap: 2px; }
  .seg button { flex: 1; height: 26px; border-radius: 6px; font-size: 11.5px; font-weight: 600; color: var(--text-dim); }
  .seg button:hover { color: var(--text); }
  .seg button.active { background: var(--panel); color: var(--text); box-shadow: var(--shadow-sm); }

  .swatches { display: flex; flex-wrap: wrap; gap: 7px; }
  .swatch { width: 26px; height: 26px; border-radius: 7px; position: relative; overflow: hidden; border: 1px solid rgba(0,0,0,0.15); transition: transform 0.1s; }
  .swatch:hover { transform: scale(1.08); }
  .swatch.active { box-shadow: 0 0 0 2px var(--panel), 0 0 0 4px var(--accent); }
  .swatch.pick { background: conic-gradient(from 0deg, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00); }
  .swatch.pick input { position: absolute; inset: -4px; opacity: 0; cursor: pointer; }

  .finishes { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }
  .fin { height: 30px; border-radius: 7px; font-size: 11.5px; font-weight: 600; background: var(--surface); border: 1px solid var(--border); color: var(--text-dim); }
  .fin:hover { color: var(--text); border-color: var(--border-strong); }
  .fin.active { background: var(--accent-soft); border-color: var(--accent); color: var(--text); }

  .upload { display: flex; align-items: center; gap: 10px; padding: 14px; border: 1.5px dashed var(--border-strong); border-radius: 10px; cursor: pointer; color: var(--text-dim); transition: border-color 0.12s, color 0.12s; }
  .upload:hover { border-color: var(--accent); color: var(--text); }
  .upload input { display: none; }
  .upload small { color: var(--text-faint); }

  .tex { display: flex; gap: 10px; align-items: flex-start; }
  .tex img { width: 52px; height: 52px; object-fit: cover; border-radius: 8px; border: 1px solid var(--border); background: var(--surface-2); }
  .texctl { flex: 1; display: flex; flex-direction: column; gap: 6px; }
</style>
