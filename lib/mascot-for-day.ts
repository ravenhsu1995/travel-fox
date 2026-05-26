const MASCOT_COUNT = 6;

function hashSeed(seed: string): number {
  let s = 0;
  for (let i = 0; i < seed.length; i++) {
    s = (s * 31 + seed.charCodeAt(i)) | 0;
  }
  return Math.abs(s);
}

function mulberry32(seed: number) {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function mascotPermutation(tripId: string): number[] {
  const out = [1, 2, 3, 4, 5, 6];
  const rand = mulberry32(hashSeed(tripId));
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function mascotIndexForDay(tripId: string, dayIndex: number): number {
  return mascotPermutation(tripId)[dayIndex % MASCOT_COUNT];
}
