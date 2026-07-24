<script>
  import { fromCm, toCm, formatLength } from '../units.js';

  // value is always in cm; we display/edit in the active unit.
  let { value, unit = 'cm', label = '', min = 0.1, step = 0.5, onchange } = $props();

  let text = $state('');
  let focused = $state(false);

  // keep the field in sync when the underlying cm value changes externally
  $effect(() => {
    if (!focused) text = String(formatLength(value, unit));
  });

  function commit(raw) {
    const num = parseFloat(String(raw).replace(',', '.'));
    if (!isFinite(num)) return;
    const cm = Math.max(min, toCm(num, unit));
    onchange?.(cm);
  }
</script>

<div class="field len">
  {#if label}<label>{label}</label>{/if}
  <div class="wrap">
    <input
      class="input"
      type="text"
      inputmode="decimal"
      bind:value={text}
      onfocus={() => (focused = true)}
      onblur={(e) => { focused = false; commit(e.target.value); text = String(formatLength(value, unit)); }}
      onkeydown={(e) => { if (e.key === 'Enter') e.target.blur(); }}
    />
    <span class="unit">{unit}</span>
  </div>
</div>

<style>
  .len { flex: 1; min-width: 0; }
  .wrap { position: relative; }
  .wrap .input { padding-right: 30px; }
  .unit {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 11px;
    color: var(--text-faint);
    pointer-events: none;
  }
</style>
