<script>
  import Section from './Section.svelte';
  import LengthInput from './LengthInput.svelte';
  import { DESK_PRESETS, DESK_MATERIALS } from '../presets.js';
  import { app, applyDeskPreset, setDeskMaterial, updateObject, clampAllToDesk, commit } from '../store.svelte.js';

  const desk = $derived(app.desk);

  function setDim(key, cm) {
    app.desk[key] = cm;
    app.desk.presetId = 'custom';
    clampAllToDesk();
    commit();
  }
</script>

<Section title="Desk">
  <div class="field">
    <label>Preset</label>
    <div class="presets">
      {#each DESK_PRESETS as p}
        <button
          class="preset"
          class:active={desk.presetId === p.id}
          onclick={() => applyDeskPreset(p.id)}
        >
          <span class="pn">{p.name}</span>
          <span class="pd">{p.w}×{p.d}</span>
        </button>
      {/each}
    </div>
  </div>

  <div class="row">
    <LengthInput label="Width" value={desk.w} unit={app.unit} min={30} onchange={(cm) => setDim('w', cm)} />
    <LengthInput label="Depth" value={desk.d} unit={app.unit} min={30} onchange={(cm) => setDim('d', cm)} />
  </div>
  <div class="row">
    <LengthInput label="Top thickness" value={desk.thickness} unit={app.unit} min={0.5} onchange={(cm) => setDim('thickness', cm)} />
    <LengthInput label="Height" value={desk.height} unit={app.unit} min={30} onchange={(cm) => setDim('height', cm)} />
  </div>

  <div class="field">
    <label>Finish</label>
    <div class="swatches">
      {#each DESK_MATERIALS as m}
        <button
          class="swatch"
          class:active={desk.color.toLowerCase() === m.color.toLowerCase()}
          title={m.name}
          style="background:{m.color}"
          onclick={() => setDeskMaterial(m)}
          aria-label={m.name}
        ></button>
      {/each}
    </div>
  </div>

  <div class="field">
    <label>Legs</label>
    <div class="seg">
      {#each [['four','Four'],['panel','Panel'],['none','None']] as [val, lbl]}
        <button class:active={desk.legs === val} onclick={() => { app.desk.legs = val; commit(); }}>{lbl}</button>
      {/each}
    </div>
  </div>
</Section>

<style>
  .row { display: flex; gap: 10px; }
  .presets { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }
  .preset {
    display: flex; flex-direction: column; gap: 2px; align-items: flex-start;
    padding: 8px 9px;
    border: 1px solid var(--border);
    border-radius: 8px;
    background: var(--surface);
    transition: border-color 0.12s, background 0.12s;
  }
  .preset:hover { border-color: var(--border-strong); }
  .preset.active { border-color: var(--accent); background: var(--accent-soft); }
  .pn { font-size: 11.5px; font-weight: 600; }
  .pd { font-size: 10px; color: var(--text-faint); }

  .swatches { display: flex; flex-wrap: wrap; gap: 7px; }
  .swatch {
    width: 26px; height: 26px; border-radius: 7px;
    border: 1px solid rgba(0,0,0,0.15);
    box-shadow: inset 0 0 0 1px rgba(255,255,255,0.06);
    transition: transform 0.1s, box-shadow 0.1s;
  }
  .swatch:hover { transform: scale(1.08); }
  .swatch.active { box-shadow: 0 0 0 2px var(--panel), 0 0 0 4px var(--accent); }

  .seg { display: flex; background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 2px; gap: 2px; }
  .seg button { flex: 1; height: 28px; border-radius: 6px; font-size: 12px; font-weight: 600; color: var(--text-dim); }
  .seg button:hover { color: var(--text); }
  .seg button.active { background: var(--panel); color: var(--text); box-shadow: var(--shadow-sm); }
</style>
