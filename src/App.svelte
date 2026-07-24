<script>
  import Toolbar from './lib/components/Toolbar.svelte';
  import Viewport from './lib/components/Viewport.svelte';
  import DeskPanel from './lib/components/DeskPanel.svelte';
  import AddPanel from './lib/components/AddPanel.svelte';
  import ObjectList from './lib/components/ObjectList.svelte';
  import PropertiesPanel from './lib/components/PropertiesPanel.svelte';
  import JsonDialog from './lib/components/JsonDialog.svelte';
  import { app, saveLocal } from './lib/store.svelte.js';

  let theme = $state(localStorage.getItem('dd-theme') || 'light');
  let jsonOpen = $state(false);

  $effect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('dd-theme', theme);
  });

  // Autosave the whole design to the browser, debounced. Reading a deep
  // snapshot subscribes this effect to every change in the design.
  let saveTimer;
  $effect(() => {
    $state.snapshot(app);
    clearTimeout(saveTimer);
    saveTimer = setTimeout(saveLocal, 400);
  });

  function toggleTheme() {
    theme = theme === 'dark' ? 'light' : 'dark';
  }
</script>

<div class="app">
  <Toolbar {theme} ontoggletheme={toggleTheme} onopenjson={() => (jsonOpen = true)} />

  <div class="workspace">
    <aside class="sidebar left">
      <DeskPanel />
      <AddPanel />
      <ObjectList />
    </aside>

    <main class="stage">
      <Viewport />
    </main>

    <aside class="sidebar right">
      <div class="inspector-head">Inspector</div>
      <div class="inspector-scroll">
        <PropertiesPanel />
      </div>
    </aside>
  </div>
</div>

{#if jsonOpen}
  <JsonDialog onclose={() => (jsonOpen = false)} />
{/if}

<style>
  .app { display: flex; flex-direction: column; height: 100vh; }
  .workspace { flex: 1; display: flex; min-height: 0; }

  .sidebar {
    width: 296px;
    flex-shrink: 0;
    background: var(--panel);
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    overflow-x: hidden;
  }
  .sidebar.left { border-right: 1px solid var(--border); }
  .sidebar.right { border-left: 1px solid var(--border); width: 312px; }

  .inspector-head {
    padding: 13px 14px;
    font-size: 11px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase;
    color: var(--text-dim);
    border-bottom: 1px solid var(--border);
    flex-shrink: 0;
  }
  .inspector-scroll { flex: 1; overflow-y: auto; }

  .stage { flex: 1; min-width: 0; position: relative; }

  @media (max-width: 1080px) {
    .sidebar { width: 260px; }
    .sidebar.right { width: 268px; }
  }
</style>
