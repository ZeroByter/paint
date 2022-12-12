export const clamp = (value: number, min: number, max: number) => {
  if (value < min) return min;
  if (value > max) return max;
  return value;
};

export const clamp01 = (value: number) => {
  return clamp(value, 0, 1);
};

export const lerp = (a: number, b: number, t: number) => {
  return a + (b - a) * clamp01(t);
};

export const ilerp = (a: number, b: number, t: number) => {
  if (a != b) {
    return clamp01((t - a) / (b - a));
  }

  return 0;
};
