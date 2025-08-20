// Accepts ARGB int, returns sRGB [R,G,B] 0-1
function argbToRgb(argb: number): number[] {
  const r = ((argb >> 16) & 0xff) / 255;
  const g = ((argb >> 8) & 0xff) / 255;
  const b = (argb & 0xff) / 255;
  return [r, g, b];
}

// Calculates relative luminance
function luminance(rgb: number[]): number {
  return rgb
    .map((v) => {
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    })
    .reduce((acc, v, idx) => acc + v * [0.2126, 0.7152, 0.0722][idx], 0);
}

// WCAG contrast ratio
export function contrastRatio(argbA: number, argbB: number): number {
  const lumA = luminance(argbToRgb(argbA));
  const lumB = luminance(argbToRgb(argbB));
  const lighter = Math.max(lumA, lumB);
  const darker = Math.min(lumA, lumB);
  return (lighter + 0.05) / (darker + 0.05);
}
