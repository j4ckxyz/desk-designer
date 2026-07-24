# Desk Designer — agent skill

Copy this whole file into your AI assistant (Claude, ChatGPT, etc.). Then
describe your desk in plain language. The assistant will reply with a single
JSON document. Paste it into the app via **Toolbar → JSON → Import → Load
design** to see your desk in 3D.

---

## Your task

You turn a natural-language description of a desk setup into **one JSON document**
that the Desk Designer app can render. Output **only** the JSON (no prose, no
code fence needed, no comments). Follow the schema and rules below exactly.

Ask at most one short round of clarifying questions only if the desk size or the
key items are truly unspecified. Otherwise, make sensible assumptions and produce
the JSON.

## Units & coordinates

- All lengths are **centimetres**.
- The origin is the **centre of the desk top**. `x` = left(−)/right(+),
  `z` = back(−)/front(+, toward the person sitting). Keep every object inside the
  desk: `|x| ≤ w/2 − itemWidth/2` and `|z| ≤ d/2 − itemDepth/2`.
- Put displays toward the back (`z` negative), keyboard/mouse toward the front
  (`z` positive), so it reads like a real desk. Don't overlap footprints.
- `rotation` is degrees of yaw (spin in place); `0` points a monitor's screen at
  the viewer. Speakers angled toward the seat look nice (e.g. `rotation: 20` and
  `-20` for a left/right pair).

## Schema

```jsonc
{
  "type": "desk-designer",
  "version": 1,
  "unit": "cm",
  "desk": { "w": 140, "d": 70, "thickness": 2.5, "height": 74,
            "color": "#5a3d2b", "finish": "wood", "legs": "four" },
  "objects": [
    { "name": "Monitor 27\"", "model": "monitor",
      "w": 61, "d": 20, "h": 44,
      "x": 0, "z": -22, "lift": 0, "rotation": 0,
      "color": "#161617", "finish": "satin" }
  ]
}
```

- `finish`: `matte` | `satin` | `gloss` | `metal` | `wood` | `glass`
- `legs`: `four` | `panel` | `none`
- `model`: `box` (default) | `monitor` (thin screen + stand) | `cylinder`
  (round: mugs, bottles, round speakers, mic bodies)
- `color` is any hex. `lift` (cm) raises an object to stack it on another.
- Omit `texture` unless you have a real image URL.

## Desk presets (pick or resize freely)

| Name | w | d | thickness | height |
|---|---|---|---|---|
| Compact | 100 | 50 | 2.5 | 74 |
| Standard | 120 | 60 | 2.5 | 74 |
| Wide | 140 | 70 | 2.5 | 74 |
| Executive XL | 160 | 80 | 3 | 75 |
| Ultrawide | 180 | 80 | 3 | 75 |
| Gaming | 160 | 75 | 2.5 | 73 |

Desk colour ideas: Oak `#c8a06a`, Walnut `#5a3d2b`, Bamboo `#d9c49a`,
White `#ececef`, Black `#1c1c1e`, Graphite `#3a3d42`, Concrete `#9a9a97`.

## Item library — use these real dimensions (w × d × h, cm)

Prefer these when the user names a known item. For anything else, invent a `box`
(or `cylinder`) with realistic real-world dimensions.

**Apple**
- Mac mini — 19.7 × 19.7 × 3.6 · `#d6d8da` · metal
- Mac Studio — 19.7 × 19.7 × 9.5 · `#d6d8da` · metal
- Mac Pro — 21.8 × 45 × 52.9 · `#c8cacc` · metal
- Studio Display 27" — 62.3 × 17 × 47.8 · `#3a3d42` · satin · **model monitor**
- iMac 24" — 54.7 × 14.7 × 46.1 · `#d6d8da` · satin · **model monitor**
- MacBook Pro 16" — 35.6 × 24.8 × 1.7 · `#4b4e52` · metal
- MacBook Air 13" — 30.4 × 21.5 × 1.1 · `#efe9dd` · metal
- Magic Keyboard — 27.9 × 11.5 × 1.1 · `#f5f5f7` · satin
- Magic Trackpad — 16 × 11.5 × 1.1 · `#f5f5f7` · satin
- Magic Mouse — 5.7 × 11.3 × 2.2 · `#f5f5f7` · gloss
- iPad Pro 13" — 28.1 × 21.5 × 0.6 · `#4b4e52` · metal
- iPhone — 7.2 × 14.8 × 0.8 · `#2e3641` · gloss
- HomePod mini — 9.8 × 9.8 × 8.4 · `#161617` · satin · **model cylinder**

**Displays** (all **model monitor**; `d` is the stand-base depth)
- Monitor 24" — 54 × 18 × 40 · `#161617` · satin
- Monitor 27" — 61 × 20 × 44 · `#161617` · satin
- Monitor 32" — 71.5 × 22 × 50 · `#161617` · satin
- Ultrawide 34" — 81 × 24 × 46 · `#161617` · satin
- Laptop Stand — 26 × 22 × 15 · `#d6d8da` · metal (model box)

**Audio**
- Bookshelf Speaker — 16 × 22 × 26 · `#1c1c1e` · satin
- Studio Monitor — 18 × 23 × 30 · `#161617` · matte
- Soundbar — 60 × 9 × 6 · `#1c1c1e` · satin
- Headphone Stand — 12 × 12 × 28 · `#3a3d42` · metal

**Peripherals**
- Full Keyboard — 44 × 13 × 3.5 · `#2b2b2e` · matte
- TKL Keyboard — 36 × 13.5 × 3.8 · `#2b2b2e` · matte
- Gaming Mouse — 6.5 × 12.5 × 4 · `#161617` · matte
- Deskmat — 90 × 40 × 0.3 · `#2e3641` · matte
- Webcam — 9 × 5 × 3 · `#161617` · satin
- Microphone — 6 × 6 × 16 · `#161617` · metal · **model cylinder**
- USB Hub — 11 × 4 × 1.2 · `#3a3d42` · satin

**Decor**
- Small Plant — 12 × 12 × 22 · `#4c9a68` · matte
- Large Plant — 22 × 22 × 45 · `#4c9a68` · matte
- Coffee Mug — 8.5 × 8.5 × 9.5 · `#ececef` · gloss · **model cylinder**
- Water Bottle — 7 × 7 × 26 · `#3f74c4` · metal · **model cylinder**
- Desk Lamp — 15 × 40 × 45 · `#161617` · matte
- Book Stack — 15 × 22 × 8 · `#7a5cc0` · matte
- Notebook — 15 × 21 × 1.5 · `#2e3641` · matte

## Layout tips

- Centre the primary monitor on the back edge (`x: 0`, `z: −(d/2 − monitorDepth/2)`).
- Keyboard centred and forward (`z` ~ `+8` to `+12`), mouse ~26 cm to its right.
- Dual monitors: place at `x: −(w/4)` and `x: +(w/4)`, angle them in  (`rotation: 12` and `-12`).
- Speakers flank the monitor near the back corners, angled toward the seat.
- Leave the front-centre strip clear (that's where hands go).

## Worked example

User: *"A 160×80 walnut desk. Ultrawide monitor centred at the back, TKL keyboard
and a gaming mouse in front, a mug on the left, a small plant back-right, and a
mic on the right."*

Assistant output:

```json
{
  "type": "desk-designer",
  "version": 1,
  "unit": "cm",
  "desk": { "w": 160, "d": 80, "thickness": 3, "height": 75, "color": "#5a3d2b", "finish": "wood", "legs": "four" },
  "objects": [
    { "name": "Ultrawide 34\"", "model": "monitor", "w": 81, "d": 24, "h": 46, "x": 0, "z": -28, "rotation": 0, "color": "#161617", "finish": "satin" },
    { "name": "TKL Keyboard", "model": "box", "w": 36, "d": 13.5, "h": 3.8, "x": 0, "z": 14, "rotation": 0, "color": "#2b2b2e", "finish": "matte" },
    { "name": "Gaming Mouse", "model": "box", "w": 6.5, "d": 12.5, "h": 4, "x": 28, "z": 14, "rotation": 0, "color": "#161617", "finish": "matte" },
    { "name": "Coffee Mug", "model": "cylinder", "w": 8.5, "d": 8.5, "h": 9.5, "x": -58, "z": 4, "rotation": 0, "color": "#ececef", "finish": "gloss" },
    { "name": "Small Plant", "model": "cylinder", "w": 12, "d": 12, "h": 22, "x": 60, "z": -30, "rotation": 0, "color": "#4c9a68", "finish": "matte" },
    { "name": "Microphone", "model": "cylinder", "w": 6, "d": 6, "h": 16, "x": 52, "z": 6, "rotation": 0, "color": "#161617", "finish": "metal" }
  ]
}
```

Remember: reply with the JSON document only.
