<script>
  import Section from './Section.svelte';
  import { app, selectObject, removeObject, clearAll, undo } from '../store.svelte.js';
  import { toast } from '../toasts.svelte.js';

  let confirming = $state(false);
  let confirmTimer;

  function askClear() {
    confirming = true;
    clearTimeout(confirmTimer);
    confirmTimer = setTimeout(() => (confirming = false), 4000);
  }

  function doClear() {
    clearTimeout(confirmTimer);
    confirming = false;
    const n = app.objects.length;
    clearAll();
    toast(`Cleared ${n} ${n === 1 ? 'object' : 'objects'}`, {
      action: { label: 'Undo', run: undo }
    });
  }

  function onRowKey(e, id) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      selectObject(id);
    }
  }
</script>

<Section title="Scene ({app.objects.length})">
  {#snippet action()}
    {#if app.objects.length}
      {#if confirming}
        <div class="confirm">
          <button class="btn ghost sm" onclick={() => (confirming = false)}>Cancel</button>
          <button class="btn danger sm" onclick={doClear}>Clear all</button>
        </div>
      {:else}
        <button class="btn ghost danger sm" onclick={askClear} title="Remove all">Clear</button>
      {/if}
    {/if}
  {/snippet}

  {#if app.objects.length === 0}
    <p class="empty">No objects yet. Add items above to start planning your desk.</p>
  {:else}
    <div class="list">
      {#each app.objects as o (o.id)}
        <div class="li" class:active={app.selectedId === o.id}
             onclick={() => selectObject(o.id)}
             onkeydown={(e) => onRowKey(e, o.id)}
             role="button" tabindex="0" aria-pressed={app.selectedId === o.id}>
          <span class="dot" style="background:{o.color}"></span>
          <span class="nm">{o.name}</span>
          <span class="dm">{Math.round(o.w)}×{Math.round(o.d)}×{Math.round(o.h)}</span>
          <button class="del" onclick={(e) => { e.stopPropagation(); removeObject(o.id); }} title="Delete" aria-label="Delete {o.name}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/></svg>
          </button>
        </div>
      {/each}
    </div>
  {/if}
</Section>

<style>
  .confirm { display: flex; gap: 5px; }
  .sm { height: 24px; padding: 0 8px; font-size: var(--fs-caption); }
  .empty { font-size: var(--fs-small); color: var(--text-faint); margin: 0; line-height: 1.5; }
  .list { display: flex; flex-direction: column; gap: 3px; }
  .li {
    display: flex; align-items: center; gap: 9px;
    padding: 7px 9px; border-radius: 8px; cursor: pointer;
    border: 1px solid transparent;
  }
  .li:hover { background: var(--surface); }
  .li.active { background: var(--accent-soft); border-color: color-mix(in oklch, var(--accent) 40%, transparent); }
  .dot { width: 13px; height: 13px; border-radius: 4px; flex-shrink: 0; border: 1px solid oklch(0 0 0 / 0.2); }
  .nm { flex: 1; font-size: var(--fs-small); font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .dm { font-size: var(--fs-caption); color: var(--text-faint); font-variant-numeric: tabular-nums; }
  .del { color: var(--text-faint); opacity: 0; padding: 2px; border-radius: 5px; display: flex; }
  .li:hover .del, .li:focus-visible .del { opacity: 1; }
  .del:hover { color: var(--danger); background: var(--danger-soft); }
</style>
