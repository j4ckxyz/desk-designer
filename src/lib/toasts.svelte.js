// Lightweight, non-blocking status messages. Used to confirm autosave,
// imports, exports, and to surface undoable destructive actions.

export const toasts = $state({ items: [] });

let tid = 0;

// toast(message, { tone, ttl, action })
//   tone:   'info' | 'success' | 'error'
//   ttl:    ms before auto-dismiss (0 keeps it until dismissed)
//   action: { label, run } — renders a button (e.g. Undo)
export function toast(message, opts = {}) {
  const id = ++tid;
  const item = {
    id,
    message,
    tone: opts.tone || 'info',
    action: opts.action || null
  };
  toasts.items.push(item);
  const ttl = opts.ttl ?? 3400;
  if (ttl) setTimeout(() => dismiss(id), ttl);
  return id;
}

export function dismiss(id) {
  const i = toasts.items.findIndex((t) => t.id === id);
  if (i !== -1) toasts.items.splice(i, 1);
}
