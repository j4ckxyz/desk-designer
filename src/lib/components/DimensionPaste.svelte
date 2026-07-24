<script>
  import { parseDimensions } from '../parseDimensions.js';
  import { toCm } from '../units.js';
  import { app } from '../store.svelte.js';

  // onApply receives an object with any of { w, d, h } in centimetres.
  let { onApply } = $props();

  let open = $state(false);
  let text = $state('');
  let unit = $state('mm');
  let rows = $state([]); // [{ value, axis }]  axis: 'width'|'depth'|'height'|''

  const AXES = [
    ['width', 'Width'],
    ['depth', 'Depth'],
    ['height', 'Height'],
    ['', 'Skip']
  ];

  function reparse(v) {
    text = v;
    const p = parseDimensions(v);
    unit = p.unit || app.unit || 'cm';
    rows = p.dims.map((d) => ({ value: d.value, axis: d.axis || '' }));
  }

  function apply() {
    const out = {};
    const key = { width: 'w', depth: 'd', height: 'h' };
    for (const r of rows) {
      if (!r.axis) continue;
      out[key[r.axis]] = Math.round(toCm(r.value, unit) * 10) / 10;
    }
    if (Object.keys(out).length) onApply?.(out);
    text = '';
    rows = [];
    open = false;
  }
</script>

<div class="dp">
  <button class="toggle" onclick={() => (open = !open)}>
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/></svg>
    Paste dimensions
    <svg class="chev" class:up={open} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 9l6 6 6-6"/></svg>
  </button>

  {#if open}
    <div class="body">
      <input
        class="input"
        placeholder="e.g. 615 x 452 x 193 mm (W x H x D)"
        bind:value={text}
        oninput={(e) => reparse(e.target.value)}
      />

      {#if rows.length}
        <div class="parsed">
          {#each rows as row}
            <div class="prow">
              <span class="val">{row.value}</span>
              <select class="axsel" bind:value={row.axis}>
                {#each AXES as [v, l]}<option value={v}>{l}</option>{/each}
              </select>
            </div>
          {/each}
          <div class="foot">
            <select class="unitsel" bind:value={unit}>
              <option value="mm">mm</option>
              <option value="cm">cm</option>
              <option value="in">in</option>
            </select>
            <button class="btn primary sm" onclick={apply}>Apply</button>
          </div>
        </div>
      {:else if text.trim()}
        <p class="hint">No numbers found. Try pasting something like <em>230 × 145 × 170 mm</em>.</p>
      {:else}
        <p class="hint">Paste from any product page. Detects units and lets you map each value.</p>
      {/if}
    </div>
  {/if}
</div>

<style>
  .dp { border: 1px solid var(--border); border-radius: 9px; background: var(--surface); overflow: hidden; }
  .toggle {
    width: 100%; display: flex; align-items: center; gap: 7px;
    padding: 8px 10px; font-size: 12px; font-weight: 600; color: var(--text-dim);
  }
  .toggle:hover { color: var(--text); }
  .toggle .chev { margin-left: auto; transition: transform 0.15s; color: var(--text-faint); }
  .toggle .chev.up { transform: rotate(180deg); }

  .body { padding: 0 10px 10px; display: flex; flex-direction: column; gap: 9px; }
  .body .input { background: var(--panel); }

  .parsed { display: flex; flex-direction: column; gap: 6px; }
  .prow { display: flex; align-items: center; gap: 8px; }
  .val {
    min-width: 62px; height: 30px; display: flex; align-items: center; padding: 0 10px;
    background: var(--panel); border: 1px solid var(--border); border-radius: 7px;
    font-variant-numeric: tabular-nums; font-weight: 600; font-size: 12.5px;
  }
  .axsel { flex: 1; height: 30px; }
  .foot { display: flex; gap: 8px; align-items: center; margin-top: 2px; }
  .unitsel { width: 72px; height: 30px; }
  .axsel, .unitsel {
    padding: 0 8px; border-radius: 7px; background: var(--panel);
    border: 1px solid var(--border); font-size: 12px; font-weight: 600; color: var(--text);
    appearance: none; cursor: pointer;
    background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2.5'><path d='M6 9l6 6 6-6'/></svg>");
    background-repeat: no-repeat; background-position: right 7px center; padding-right: 24px;
  }
  .foot .unitsel { margin-right: auto; }
  .btn.sm { height: 30px; padding: 0 16px; }
  .hint { margin: 0; font-size: 11.5px; color: var(--text-faint); line-height: 1.5; }
  .hint em { font-style: normal; color: var(--text-dim); }
</style>
