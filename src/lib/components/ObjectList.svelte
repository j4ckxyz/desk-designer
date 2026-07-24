<script>
  import Section from './Section.svelte';
  import { app, selectObject, removeObject, clearAll } from '../store.svelte.js';
</script>

<Section title="Scene ({app.objects.length})">
  {#snippet action()}
    {#if app.objects.length}
      <button class="btn ghost danger sm" onclick={clearAll} title="Remove all">Clear</button>
    {/if}
  {/snippet}

  {#if app.objects.length === 0}
    <p class="empty">No objects yet. Add items above to start planning your desk.</p>
  {:else}
    <div class="list">
      {#each app.objects as o (o.id)}
        <div class="li" class:active={app.selectedId === o.id} onclick={() => selectObject(o.id)} role="button" tabindex="0">
          <span class="dot" style="background:{o.color}"></span>
          <span class="nm">{o.name}</span>
          <span class="dm">{Math.round(o.w)}×{Math.round(o.d)}×{Math.round(o.h)}</span>
          <button class="del" onclick={(e) => { e.stopPropagation(); removeObject(o.id); }} title="Delete" aria-label="Delete">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/></svg>
          </button>
        </div>
      {/each}
    </div>
  {/if}
</Section>

<style>
  .sm { height: 24px; padding: 0 8px; font-size: 11px; }
  .empty { font-size: 12px; color: var(--text-faint); margin: 0; line-height: 1.5; }
  .list { display: flex; flex-direction: column; gap: 3px; }
  .li {
    display: flex; align-items: center; gap: 9px;
    padding: 7px 9px; border-radius: 8px; cursor: pointer;
    border: 1px solid transparent;
  }
  .li:hover { background: var(--surface); }
  .li.active { background: var(--accent-soft); border-color: color-mix(in srgb, var(--accent) 40%, transparent); }
  .dot { width: 13px; height: 13px; border-radius: 4px; flex-shrink: 0; border: 1px solid rgba(0,0,0,0.2); }
  .nm { flex: 1; font-size: 12.5px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .dm { font-size: 10px; color: var(--text-faint); font-variant-numeric: tabular-nums; }
  .del { color: var(--text-faint); opacity: 0; padding: 2px; border-radius: 5px; display: flex; }
  .li:hover .del { opacity: 1; }
  .del:hover { color: var(--danger); background: color-mix(in srgb, var(--danger) 12%, transparent); }
</style>
