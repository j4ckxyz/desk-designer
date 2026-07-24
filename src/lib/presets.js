// Real-world presets. All dimensions in centimetres.
// w = width (X, left-right), d = depth (Z, front-back), h = height (Y, up).

export const DESK_PRESETS = [
  { id: 'compact',  name: 'Compact',        w: 100, d: 50, thickness: 2.5, height: 74 },
  { id: 'standard', name: 'Standard',       w: 120, d: 60, thickness: 2.5, height: 74 },
  { id: 'wide',     name: 'Wide',           w: 140, d: 70, thickness: 2.5, height: 74 },
  { id: 'xl',       name: 'Executive XL',   w: 160, d: 80, thickness: 3.0, height: 75 },
  { id: 'ultrawide',name: 'Ultrawide',      w: 180, d: 80, thickness: 3.0, height: 75 },
  { id: 'gaming',   name: 'Gaming',         w: 160, d: 75, thickness: 2.5, height: 73 }
];

// Surface finishes drive the PBR material look.
export const FINISHES = {
  matte:  { roughness: 0.85, metalness: 0.0 },
  satin:  { roughness: 0.5,  metalness: 0.05 },
  gloss:  { roughness: 0.15, metalness: 0.1 },
  metal:  { roughness: 0.35, metalness: 0.9 },
  wood:   { roughness: 0.7,  metalness: 0.0 },
  glass:  { roughness: 0.05, metalness: 0.0 }
};

export const DESK_MATERIALS = [
  { id: 'oak',        name: 'Oak',          color: '#c8a06a', finish: 'wood' },
  { id: 'walnut',     name: 'Walnut',       color: '#5a3d2b', finish: 'wood' },
  { id: 'bamboo',     name: 'Bamboo',       color: '#d9c49a', finish: 'wood' },
  { id: 'white',      name: 'White',        color: '#ececef', finish: 'satin' },
  { id: 'black',      name: 'Black',        color: '#1c1c1e', finish: 'satin' },
  { id: 'graphite',   name: 'Graphite',     color: '#3a3d42', finish: 'matte' },
  { id: 'concrete',   name: 'Concrete',     color: '#9a9a97', finish: 'matte' }
];

// Standard swatches offered for objects.
export const COLOR_SWATCHES = [
  { name: 'White',       hex: '#f5f5f7' },
  { name: 'Silver',      hex: '#d6d8da' },
  { name: 'Space Gray',  hex: '#4b4e52' },
  { name: 'Black',       hex: '#161617' },
  { name: 'Midnight',    hex: '#2e3641' },
  { name: 'Starlight',   hex: '#efe9dd' },
  { name: 'Red',         hex: '#d64541' },
  { name: 'Orange',      hex: '#e08a3c' },
  { name: 'Yellow',      hex: '#e7c14b' },
  { name: 'Green',       hex: '#4c9a68' },
  { name: 'Blue',        hex: '#3f74c4' },
  { name: 'Purple',      hex: '#7a5cc0' }
];

// Object library. Each item: real dimensions + default look.
// `finish` and `color` give a sensible starting appearance.
export const ITEM_LIBRARY = [
  {
    category: 'Apple',
    items: [
      { id: 'mac-mini',      name: 'Mac mini',          w: 19.7, d: 19.7, h: 3.6,  color: '#d6d8da', finish: 'metal' },
      { id: 'mac-studio',    name: 'Mac Studio',        w: 19.7, d: 19.7, h: 9.5,  color: '#d6d8da', finish: 'metal' },
      { id: 'mac-pro',       name: 'Mac Pro',           w: 21.8, d: 45.0, h: 52.9, color: '#c8cacc', finish: 'metal' },
      { id: 'studio-display',name: 'Studio Display 27"',w: 62.3, d: 17.0, h: 47.8, color: '#3a3d42', finish: 'satin', model: 'monitor' },
      { id: 'imac-24',       name: 'iMac 24"',          w: 54.7, d: 14.7, h: 46.1, color: '#d6d8da', finish: 'satin', model: 'monitor' },
      { id: 'macbook-pro-16',name: 'MacBook Pro 16"',   w: 35.6, d: 24.8, h: 1.7,  color: '#4b4e52', finish: 'metal' },
      { id: 'macbook-air',   name: 'MacBook Air 13"',   w: 30.4, d: 21.5, h: 1.1,  color: '#efe9dd', finish: 'metal' },
      { id: 'magic-keyboard',name: 'Magic Keyboard',    w: 27.9, d: 11.5, h: 1.1,  color: '#f5f5f7', finish: 'satin' },
      { id: 'magic-trackpad',name: 'Magic Trackpad',    w: 16.0, d: 11.5, h: 1.1,  color: '#f5f5f7', finish: 'satin' },
      { id: 'magic-mouse',   name: 'Magic Mouse',       w: 5.7,  d: 11.3, h: 2.2,  color: '#f5f5f7', finish: 'gloss' },
      { id: 'ipad-pro',      name: 'iPad Pro 13"',      w: 28.1, d: 21.5, h: 0.6,  color: '#4b4e52', finish: 'metal' },
      { id: 'iphone',        name: 'iPhone',            w: 7.2,  d: 14.8, h: 0.8,  color: '#2e3641', finish: 'gloss' },
      { id: 'homepod-mini',  name: 'HomePod mini',      w: 9.8,  d: 9.8,  h: 8.4,  color: '#161617', finish: 'satin', model: 'cylinder' }
    ]
  },
  {
    category: 'Displays',
    items: [
      { id: 'monitor-24',    name: 'Monitor 24"',       w: 54.0, d: 18.0, h: 40.0, color: '#161617', finish: 'satin', model: 'monitor' },
      { id: 'monitor-27',    name: 'Monitor 27"',       w: 61.0, d: 20.0, h: 44.0, color: '#161617', finish: 'satin', model: 'monitor' },
      { id: 'monitor-32',    name: 'Monitor 32"',       w: 71.5, d: 22.0, h: 50.0, color: '#161617', finish: 'satin', model: 'monitor' },
      { id: 'ultrawide-34',  name: 'Ultrawide 34"',     w: 81.0, d: 24.0, h: 46.0, color: '#161617', finish: 'satin', model: 'monitor' },
      { id: 'laptop-stand',  name: 'Laptop Stand',      w: 26.0, d: 22.0, h: 15.0, color: '#d6d8da', finish: 'metal' }
    ]
  },
  {
    category: 'Audio',
    items: [
      { id: 'bookshelf-spk', name: 'Bookshelf Speaker', w: 16.0, d: 22.0, h: 26.0, color: '#1c1c1e', finish: 'satin' },
      { id: 'studio-monitor',name: 'Studio Monitor',    w: 18.0, d: 23.0, h: 30.0, color: '#161617', finish: 'matte' },
      { id: 'soundbar',      name: 'Soundbar',          w: 60.0, d: 9.0,  h: 6.0,  color: '#1c1c1e', finish: 'satin' },
      { id: 'headphone-std', name: 'Headphone Stand',   w: 12.0, d: 12.0, h: 28.0, color: '#3a3d42', finish: 'metal' }
    ]
  },
  {
    category: 'Peripherals',
    items: [
      { id: 'keyboard-full', name: 'Full Keyboard',     w: 44.0, d: 13.0, h: 3.5,  color: '#2b2b2e', finish: 'matte' },
      { id: 'keyboard-tkl',  name: 'TKL Keyboard',      w: 36.0, d: 13.5, h: 3.8,  color: '#2b2b2e', finish: 'matte' },
      { id: 'mouse',         name: 'Gaming Mouse',      w: 6.5,  d: 12.5, h: 4.0,  color: '#161617', finish: 'matte' },
      { id: 'mousepad',      name: 'Deskmat',           w: 90.0, d: 40.0, h: 0.3,  color: '#2e3641', finish: 'matte' },
      { id: 'webcam',        name: 'Webcam',            w: 9.0,  d: 5.0,  h: 3.0,  color: '#161617', finish: 'satin' },
      { id: 'mic-arm',       name: 'Microphone',        w: 6.0,  d: 6.0,  h: 16.0, color: '#161617', finish: 'metal', model: 'cylinder' },
      { id: 'usb-hub',       name: 'USB Hub',           w: 11.0, d: 4.0,  h: 1.2,  color: '#3a3d42', finish: 'satin' }
    ]
  },
  {
    category: 'Decor',
    items: [
      { id: 'plant-small',   name: 'Small Plant',       w: 12.0, d: 12.0, h: 22.0, color: '#4c9a68', finish: 'matte' },
      { id: 'plant-large',   name: 'Large Plant',       w: 22.0, d: 22.0, h: 45.0, color: '#4c9a68', finish: 'matte' },
      { id: 'mug',           name: 'Coffee Mug',        w: 8.5,  d: 8.5,  h: 9.5,  color: '#ececef', finish: 'gloss', model: 'cylinder' },
      { id: 'water-bottle',  name: 'Water Bottle',      w: 7.0,  d: 7.0,  h: 26.0, color: '#3f74c4', finish: 'metal', model: 'cylinder' },
      { id: 'desk-lamp',     name: 'Desk Lamp',         w: 15.0, d: 40.0, h: 45.0, color: '#161617', finish: 'matte' },
      { id: 'book-stack',    name: 'Book Stack',        w: 15.0, d: 22.0, h: 8.0,  color: '#7a5cc0', finish: 'matte' },
      { id: 'notebook',      name: 'Notebook',          w: 15.0, d: 21.0, h: 1.5,  color: '#2e3641', finish: 'matte' }
    ]
  }
];

// Flat lookup by id (used when spawning from the library).
export const ITEM_BY_ID = Object.fromEntries(
  ITEM_LIBRARY.flatMap((g) => g.items.map((it) => [it.id, it]))
);
