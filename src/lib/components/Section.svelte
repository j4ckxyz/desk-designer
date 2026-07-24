<script>
  let { title, children, open = true, action } = $props();
  let isOpen = $state(open);
</script>

<section class="section">
  <header>
    <button class="head" onclick={() => (isOpen = !isOpen)}>
      <svg class="chev" class:closed={!isOpen} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 6l6 6-6 6"/></svg>
      <span>{title}</span>
    </button>
    {#if action}<div class="action">{@render action()}</div>{/if}
  </header>
  {#if isOpen}
    <div class="body">{@render children()}</div>
  {/if}
</section>

<style>
  .section { border-bottom: 1px solid var(--border); }
  header { display: flex; align-items: center; justify-content: space-between; padding-right: 10px; }
  .head {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 13px 14px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--text-dim);
  }
  .head:hover { color: var(--text); }
  .chev { transition: transform 0.15s; color: var(--text-faint); }
  .chev.closed { transform: rotate(0deg); }
  .chev:not(.closed) { transform: rotate(90deg); }
  .body { padding: 4px 14px 16px; display: flex; flex-direction: column; gap: 14px; }
</style>
