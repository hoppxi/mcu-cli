export class Contrast {
  static ratio(colorA: number | string, colorB: number | string): number {
    const argbA = typeof colorA === "string" ? this._hexToArgb(colorA) : colorA;
    const argbB = typeof colorB === "string" ? this._hexToArgb(colorB) : colorB;

    const lumA = this._luminance(this._argbToRgb(argbA));
    const lumB = this._luminance(this._argbToRgb(argbB));

    const lighter = Math.max(lumA, lumB);
    const darker = Math.min(lumA, lumB);

    return (lighter + 0.05) / (darker + 0.05);
  }

  // Accepts ARGB int, returns sRGB [R,G,B] 0-1
  private static _argbToRgb(argb: number): number[] {
    const r = ((argb >> 16) & 0xff) / 255;
    const g = ((argb >> 8) & 0xff) / 255;
    const b = (argb & 0xff) / 255;
    return [r, g, b];
  }

  // Accepts RGB 0-1, returns relative luminance
  private static _luminance(rgb: number[]): number {
    return rgb
      .map((v) =>
        v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
      )
      .reduce((acc, v, idx) => acc + v * [0.2126, 0.7152, 0.0722][idx], 0);
  }

  // Converts hex string "#RRGGBB" to ARGB integer, full opaque
  private static _hexToArgb(hex: string): number {
    hex = hex.replace(/^#/, "");
    if (hex.length !== 6) throw new Error("Invalid hex color");
    const intVal = parseInt(hex, 16);
    return 0xff000000 | intVal; // Add full alpha
  }
}
