# Desk Designer — JSON document spec (v1)

A design is fully described by a single JSON document. The app reads and writes
this exact shape via **Toolbar → JSON → Export / Import**, and autosaves it to
`localStorage` under the key `desk-designer:autosave`.

All lengths are in **centimetres**, regardless of the display unit. The parser is
tolerant: unknown fields are ignored, missing fields fall back to defaults, and
out-of-range values are clamped (objects are kept inside the desk footprint).

## Top level

```jsonc
{
  "type": "desk-designer",   // identifier, informational
  "version": 1,              // schema version
  "unit": "cm",              // display unit only: "cm" | "mm" | "in"
  "desk": { … },             // the desk (see below)
  "settings": { … },         // optional view settings
  "objects": [ … ]           // everything sitting on the desk
}
```

Only `desk` and `objects` really matter for reconstructing a scene. Everything
else is optional.

## `desk`

```jsonc
{
  "w": 120,          // width  (X, left–right), cm
  "d": 60,           // depth  (Z, front–back), cm
  "thickness": 2.5,  // desktop slab thickness, cm
  "height": 74,      // floor-to-top height, cm
  "color": "#c8a06a",// hex
  "finish": "wood",  // matte | satin | gloss | metal | wood | glass
  "legs": "four"     // four | panel | none
}
```

## `settings` (optional)

```jsonc
{
  "showGrid": true,
  "showFloor": true,
  "snap": false,
  "snapSize": 1,             // cm
  "background": "studio"     // studio | light | dark
}
```

## `objects[]`

Each object is an axis-aligned block or a simple built model.

```jsonc
{
  "name": "Monitor 27\"",
  "model": "monitor",   // box | monitor | cylinder   (default "box")
  "w": 61,              // width  (X), cm
  "d": 20,              // depth  (Z), cm  — for a monitor this is the STAND base depth
  "h": 44,              // height (Y), cm  — total incl. stand for a monitor
  "x": 0,               // position from desk CENTRE along X (−left / +right), cm
  "z": -18,             // position from desk CENTRE along Z (−back / +front), cm
  "lift": 0,            // raise above the desk surface (for stacking), cm
  "rotation": 0,        // yaw in degrees, clockwise seen from above
  "color": "#161617",
  "finish": "satin",
  "texture": null       // optional, see below
}
```

### Coordinate system

- Origin is the **centre of the desk top surface**.
- `x` grows to the **right**, `z` grows toward the **front** (viewer / where you sit).
- So the back-left corner is `x = -w/2, z = -d/2`; front-right is `x = +w/2, z = +d/2`.
- Objects rest **on** the surface; their base is placed automatically. `lift`
  pushes them up (e.g. to stack a laptop on a stand).
- `rotation` is yaw only (spin in place). `0` faces a monitor's screen toward the front (+Z).

### `model`

- `box` — a rectangular block sized exactly `w × d × h`.
- `monitor` — a thin screen panel on a neck + weighted base. `w`/`h` are the
  panel span (incl. stand height in `h`), `d` is the base depth. Screen faces +Z.
- `cylinder` — a vertical cylinder, diameter = `min(w, d)`, height `h`
  (mugs, bottles, round speakers, mic bodies).

### `texture` (optional)

```jsonc
{
  "url": "data:image/png;base64,…",  // or any image URL the browser can load
  "face": "top",                     // top | front | all   (box) — monitors always map to the screen
  "fit": "contain"                   // contain | cover
}
```

Large embedded data-URIs bloat the JSON. For agent-authored documents, leave
`texture` out unless you have a real image.

## Minimal example

```json
{
  "type": "desk-designer",
  "version": 1,
  "unit": "cm",
  "desk": { "w": 140, "d": 70, "thickness": 2.5, "height": 74, "color": "#5a3d2b", "finish": "wood", "legs": "four" },
  "objects": [
    { "name": "Monitor 27\"", "model": "monitor", "w": 61, "d": 20, "h": 44, "x": 0,   "z": -22, "rotation": 0, "color": "#161617", "finish": "satin" },
    { "name": "Keyboard",     "model": "box",     "w": 36, "d": 13.5, "h": 3.8, "x": 0,  "z": 8,  "rotation": 0, "color": "#2b2b2e", "finish": "matte" },
    { "name": "Mouse",        "model": "box",     "w": 6.5, "d": 12.5, "h": 4,  "x": 26, "z": 8,  "rotation": 0, "color": "#161617", "finish": "matte" },
    { "name": "Coffee Mug",   "model": "cylinder","w": 8.5, "d": 8.5, "h": 9.5, "x": -50,"z": -10,"rotation": 0, "color": "#ececef", "finish": "gloss" }
  ]
}
```

See [`../SKILL.md`](../SKILL.md) for a ready-to-paste brief that turns a plain
description of a desk into one of these documents.
