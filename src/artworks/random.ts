// Mulberry32 by bryc, modified by the Stack Overflow community.
// https://stackoverflow.com/a/47593316 — CC BY-SA 4.0
export function createRandom(seed: number) {
  let state = seed >>> 0;

  return () => {
    let value = (state += 0x6d2b79f5);
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}
