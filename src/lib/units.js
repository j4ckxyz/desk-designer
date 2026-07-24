// Unit handling.
// Internal 3D world unit = 1 metre. All app STATE is stored in centimetres (cm).
// The UI lets the user work in cm / mm / inches; we convert to/from cm.

export const UNITS = ['cm', 'mm', 'in'];

export const UNIT_LABELS = {
  cm: 'cm',
  mm: 'mm',
  in: 'in'
};

// centimetres -> metres (world units)
export const CM_TO_M = 0.01;
export const cmToWorld = (cm) => cm * CM_TO_M;
export const worldToCm = (m) => m / CM_TO_M;

// Convert a value expressed in `unit` into centimetres (canonical state unit).
export function toCm(value, unit) {
  const v = Number(value);
  if (!isFinite(v)) return 0;
  switch (unit) {
    case 'mm': return v / 10;
    case 'in': return v * 2.54;
    case 'cm':
    default: return v;
  }
}

// Convert centimetres into the requested display `unit`.
export function fromCm(cm, unit) {
  const v = Number(cm) || 0;
  switch (unit) {
    case 'mm': return v * 10;
    case 'in': return v / 2.54;
    case 'cm':
    default: return v;
  }
}

// Format a cm value for display in a unit, trimmed to sensible precision.
export function formatLength(cm, unit) {
  const v = fromCm(cm, unit);
  const decimals = unit === 'mm' ? 0 : unit === 'in' ? 2 : 1;
  return Number(v.toFixed(decimals));
}
