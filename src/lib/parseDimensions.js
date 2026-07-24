// Loose dimension parser for pasted product specs.
// Handles things like:
//   "230 x 145 x 170 mm (H x W x D)"
//   "Dimensions with stand (mm): W: 615 x H: 452 x D: 193"
//   "24.5 × 9.5 × 30 cm"   "15.4\" x 9.8\" x 0.7\""
//
// Returns { unit: 'mm'|'cm'|'in'|null, dims: [{ value, axis }] }
// where axis is 'width' | 'depth' | 'height' | null. Up to 3 dims.

function normAxis(sRaw) {
  const s = sRaw.toLowerCase();
  if (s === 'ø' || s.startsWith('dia')) return 'width';   // diameter -> width
  if (s === 'w' || s.startsWith('wid')) return 'width';
  if (s === 'h' || s.startsWith('hei') || s.startsWith('tall')) return 'height';
  if (s === 'd' || s.startsWith('dep') || s.startsWith('thick')) return 'depth';
  if (s === 'l' || s.startsWith('len')) return 'depth';   // length -> depth (guess)
  return null;
}

function detectUnit(text) {
  if (/\bmm\b|millim/i.test(text)) return 'mm';
  if (/\bcm\b|centim/i.test(text)) return 'cm';
  if (/inch|inches|["”″]|\bin\b/i.test(text)) return 'in';
  return null;
}

export function parseDimensions(input) {
  const text = String(input || '').trim();
  if (!text) return { unit: null, dims: [] };

  const unit = detectUnit(text);

  const results = [];
  const re = /(\d+(?:[.,]\d+)?)/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    const start = m.index;
    const end = re.lastIndex;
    const after = text.slice(end, end + 10);
    const before = text.slice(Math.max(0, start - 16), start);

    // Skip numbers that are clearly not a length.
    if (/^\s*(kg|kgs|g|lbs?|oz|hz|mah|wh|w\b|v\b|%|°|:\s*\d|p\b|fps)/i.test(after)) continue;
    if (/\d[.,]?\s*[:]\s*$/.test(before)) continue; // right side of a ratio like 16:9

    let axis = null;
    const bl = before.match(/(?:^|[^a-z])(width|height|depth|length|thickness|diameter|w|h|d|l|ø)\s*[:=]?\s*$/i);
    if (bl) axis = normAxis(bl[1]);
    if (!axis) {
      const al =
        // a single axis that closes immediately, e.g. "615 (W)" — NOT a legend "(H x W x D)"
        after.match(/^\s*(?:mm|cm|in|inch|inches|["”″])?\s*[([]\s*(width|height|depth|length|w|h|d|l)\s*[)\]]/i) ||
        after.match(/^\s*(?:mm|cm|in|inch|inches|["”″])\s+(width|height|depth|length)\b/i);
      if (al) axis = normAxis(al[1]);
    }
    results.push({ value: parseFloat(m[1].replace(',', '.')), axis });
  }

  let dims = results.slice(0, 3);
  if (dims.length === 0) return { unit, dims: [] };

  // If nothing was labelled inline, try a legend like "(H x W x D)".
  if (!dims.some((d) => d.axis)) {
    const legend = text.match(
      /\(?\s*([whdlø])\s*(?:[x×*·]|by)\s*([whdlø])\s*(?:[x×*·]|by)\s*([whdlø])\s*\)?/i
    );
    if (legend) {
      const order = [legend[1], legend[2], legend[3]].map(normAxis);
      dims = dims.map((d, i) => ({ ...d, axis: order[i] || d.axis }));
    }
  }

  // Fill any still-unassigned axes in W, D, H order without duplicating.
  const order = ['width', 'depth', 'height'];
  const used = new Set(dims.filter((d) => d.axis).map((d) => d.axis));
  dims = dims.map((d) => {
    if (d.axis) return d;
    const next = order.find((a) => !used.has(a));
    if (next) used.add(next);
    return { ...d, axis: next || null };
  });

  return { unit, dims };
}
