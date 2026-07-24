<script>
  import { toJSONString, fromJSON, commit, clearLocal, clearAll } from '../store.svelte.js';
  import skillPrompt from '../../../SKILL.md?raw';

  let { onclose } = $props();

  let tab = $state('export');
  let importText = $state('');
  let error = $state('');
  let copied = $state('');

  const exportText = $derived(toJSONString());

  async function copy(text, tag) {
    try {
      await navigator.clipboard.writeText(text);
      copied = tag;
      setTimeout(() => (copied = ''), 1400);
    } catch { /* clipboard blocked */ }
  }

  function download() {
    const blob = new Blob([exportText], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `desk-plan-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function load() {
    error = '';
    try {
      fromJSON(importText);
      commit();
      onclose?.();
    } catch (e) {
      error = e?.message || 'Could not parse that JSON.';
    }
  }

  function onFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { importText = String(reader.result); tab = 'import'; };
    reader.readAsText(file);
    e.target.value = '';
  }

  function onKey(e) { if (e.key === 'Escape') onclose?.(); }
</script>

<svelte:window on:keydown={onKey} />

<div class="scrim" onclick={() => onclose?.()} role="presentation">
  <div class="dialog" onclick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Import and export design">
    <header>
      <div class="tabs">
        <button class:active={tab === 'export'} onclick={() => (tab = 'export')}>Export</button>
        <button class:active={tab === 'import'} onclick={() => (tab = 'import')}>Import</button>
        <button class:active={tab === 'agent'} onclick={() => (tab = 'agent')}>Agent prompt</button>
      </div>
      <button class="x" onclick={() => onclose?.()} aria-label="Close">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
      </button>
    </header>

    {#if tab === 'export'}
      <p class="lead">Your whole design as JSON. Copy it, download a file, or hand it to an agent.</p>
      <textarea class="code" readonly spellcheck="false" value={exportText}></textarea>
      <div class="actions">
        <button class="btn" onclick={() => copy(exportText, 'json')}>
          {#if copied === 'json'}Copied{:else}Copy JSON{/if}
        </button>
        <button class="btn primary" onclick={download}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v12M8 11l4 4 4-4"/><path d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2"/></svg>
          Download .json
        </button>
      </div>
    {:else if tab === 'agent'}
      <p class="lead">Copy this prompt into your AI assistant, describe your desk, and paste the JSON it returns into the <button class="link" onclick={() => (tab = 'import')}>Import</button> tab.</p>
      <textarea class="code" readonly spellcheck="false" value={skillPrompt}></textarea>
      <div class="actions">
        <button class="btn primary" onclick={() => copy(skillPrompt, 'skill')}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 012-2h10"/></svg>
          {#if copied === 'skill'}Copied to clipboard{:else}Copy agent prompt{/if}
        </button>
      </div>
    {:else}
      <p class="lead">Paste a Desk Designer JSON document (or load a file) and replace the current design.</p>
      <textarea class="code" spellcheck="false" placeholder={'{\n  "type": "desk-designer",\n  "desk": { ... },\n  "objects": [ ... ]\n}'} bind:value={importText}></textarea>
      {#if error}<p class="err">{error}</p>{/if}
      <div class="actions">
        <label class="btn">
          <input type="file" accept="application/json,.json" onchange={onFile} hidden />
          Load file…
        </label>
        <span class="spacer"></span>
        <button class="btn danger" onclick={() => { clearAll(); clearLocal(); }}>Clear scene</button>
        <button class="btn primary" onclick={load} disabled={!importText.trim()}>Load design</button>
      </div>
    {/if}
  </div>
</div>

<style>
  .scrim {
    position: fixed; inset: 0; z-index: 100;
    background: color-mix(in srgb, #0b0d10 55%, transparent);
    backdrop-filter: blur(3px);
    display: grid; place-items: center; padding: 24px;
    animation: fade 0.14s ease-out;
  }
  @keyframes fade { from { opacity: 0; } }
  .dialog {
    width: min(680px, 100%);
    max-height: min(80vh, 720px);
    display: flex; flex-direction: column;
    background: var(--panel);
    border: 1px solid var(--border);
    border-radius: 14px;
    box-shadow: var(--shadow-md);
    padding: 16px;
    animation: pop 0.16s cubic-bezier(0.22, 1, 0.36, 1);
  }
  @keyframes pop { from { transform: translateY(8px) scale(0.99); opacity: 0; } }
  header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
  .tabs { display: flex; gap: 3px; background: var(--surface); border: 1px solid var(--border); border-radius: 9px; padding: 3px; }
  .tabs button { padding: 6px 16px; border-radius: 6px; font-weight: 600; font-size: 12.5px; color: var(--text-dim); }
  .tabs button:hover { color: var(--text); }
  .tabs button.active { background: var(--panel); color: var(--text); box-shadow: var(--shadow-sm); }
  .x { width: 30px; height: 30px; display: grid; place-items: center; border-radius: 7px; color: var(--text-dim); }
  .x:hover { background: var(--surface-2); color: var(--text); }

  .lead { margin: 0 0 12px; font-size: 12.5px; color: var(--text-dim); line-height: 1.5; }
  .link { color: var(--accent); font-weight: 600; text-decoration: underline; text-underline-offset: 2px; }
  .link:hover { color: var(--accent-hover); }
  .code {
    flex: 1; min-height: 260px; resize: none;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 12px; line-height: 1.55;
    padding: 12px 14px;
    background: var(--surface); color: var(--text);
    border: 1px solid var(--border); border-radius: 10px;
    white-space: pre; overflow: auto;
    tab-size: 2;
  }
  .code:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-soft); }
  .err { margin: 8px 0 0; font-size: 12px; color: var(--danger); }
  .actions { display: flex; align-items: center; gap: 8px; margin-top: 14px; }
  .actions .spacer { flex: 1; }
  .btn input { display: none; }
</style>
