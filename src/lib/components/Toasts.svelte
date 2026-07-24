<script>
  import { toasts, dismiss } from '../toasts.svelte.js';
</script>

<div class="stack" role="status" aria-live="polite">
  {#each toasts.items as t (t.id)}
    <div class="toast {t.tone}">
      <span class="msg">{t.message}</span>
      {#if t.action}
        <button class="act" onclick={() => { t.action.run(); dismiss(t.id); }}>{t.action.label}</button>
      {/if}
      <button class="close" onclick={() => dismiss(t.id)} aria-label="Dismiss">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M18 6L6 18M6 6l12 12"/></svg>
      </button>
    </div>
  {/each}
</div>

<style>
  .stack {
    position: fixed;
    top: 62px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 200;
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: center;
    pointer-events: none;
  }
  .toast {
    pointer-events: auto;
    display: flex;
    align-items: center;
    gap: 12px;
    max-width: min(460px, 90vw);
    padding: 9px 10px 9px 14px;
    background: var(--panel);
    border: 1px solid var(--border);
    border-radius: 10px;
    box-shadow: var(--shadow-md);
    font-size: var(--fs-small);
    color: var(--text);
    animation: slide 0.22s cubic-bezier(0.22, 1, 0.36, 1);
  }
  @keyframes slide { from { transform: translateY(-8px); opacity: 0; } }
  .toast.success { border-color: color-mix(in oklch, var(--ok) 45%, var(--border)); }
  .toast.error { border-color: color-mix(in oklch, var(--danger) 45%, var(--border)); }
  .msg { flex: 1; line-height: 1.4; }
  .act {
    flex-shrink: 0;
    height: 26px;
    padding: 0 11px;
    border-radius: 7px;
    font-size: var(--fs-caption);
    font-weight: 700;
    color: var(--accent-contrast);
    background: var(--accent);
  }
  .act:hover { background: var(--accent-hover); }
  .close {
    flex-shrink: 0;
    display: grid;
    place-items: center;
    width: 24px;
    height: 24px;
    border-radius: 6px;
    color: var(--text-faint);
  }
  .close:hover { background: var(--surface-2); color: var(--text); }
</style>
