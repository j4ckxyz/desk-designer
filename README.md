# Desk Designer

Plan and design your desk setup to scale, in 3D, right in your browser. Lay out
your desk, drop on monitors, keyboards, speakers, plants and more from a library
of real-world–sized items, and see exactly how it all fits before you buy or
rearrange anything.

**▶ Use it now: [planner.j4ck.xyz](https://planner.j4ck.xyz)**

Like [Excalidraw](https://excalidraw.com), Desk Designer is free to use on the
hosted site and fully open source — you can [self-host](#self-hosting) your own
copy in minutes.

---

## Features

- **True-to-scale 3D scene** — everything is modelled in real centimetres and
  rendered with [Three.js](https://threejs.org). Orbit, pan and zoom around your
  build.
- **Item library** — add monitors, laptops, keyboards, mice, speakers, mics,
  lamps, plants, mugs and more, each with sensible real-world dimensions.
- **Full property control** — size, position, rotation, colour, finish
  (matte / satin / gloss / metal / wood / glass) and stacking height for every
  object, plus desk width/depth/thickness/height, colour and leg style.
- **Work in your units** — switch the whole UI between **cm**, **mm** and
  **inches** at any time.
- **Paste dimensions** — grab a product's "60 × 40 × 12 cm" spec and paste it
  straight in to create a correctly sized object.
- **Undo / redo**, grid & snapping, light / dark theme, and multiple background
  modes (studio / light / dark).
- **Autosave** — your design is saved to your browser's `localStorage`
  automatically. Nothing leaves your machine.
- **Import / export JSON** — a design is a single portable JSON document. Share
  it, version it, or hand-edit it.
- **AI-assisted layouts** — describe your desk in plain language to an AI
  assistant and import the result. See [AI workflow](#ai-workflow) below.

## AI workflow

A whole desk can be generated from a sentence. Copy [`SKILL.md`](./SKILL.md)
into Claude, ChatGPT or any capable assistant, then describe your setup
(*"A 160×80 walnut desk, ultrawide monitor centred at the back, TKL keyboard and
gaming mouse in front, a mug on the left…"*). The assistant replies with a single
JSON document — paste it into the app via **Toolbar → JSON → Import → Load
design** to see it in 3D.

The full document format is documented in [`docs/JSON_SPEC.md`](./docs/JSON_SPEC.md).

## Tech stack

- [Svelte 5](https://svelte.dev) (runes)
- [Vite](https://vite.dev)
- [Three.js](https://threejs.org)

No backend, no accounts, no tracking — it's a static single-page app.

## Self-hosting

Requires [Node.js](https://nodejs.org) 18+.

```bash
git clone https://github.com/j4ckxyz/desk-designer.git
cd desk-designer
npm install

# Run locally with hot reload
npm run dev

# Or build a static bundle for production
npm run build      # outputs to dist/
npm run preview    # preview the production build
```

The `dist/` folder is a plain static site — host it anywhere (Cloudflare Pages,
Netlify, GitHub Pages, an S3 bucket, your own server). The hosted instance at
[planner.j4ck.xyz](https://planner.j4ck.xyz) is deployed from this repo via
Cloudflare Pages:

| Setting | Value |
|---|---|
| Build command | `npm run build` |
| Build output directory | `dist` |

## Contributing

Issues and pull requests are welcome. To hack on it, follow the self-hosting
steps above and run `npm run dev`.
