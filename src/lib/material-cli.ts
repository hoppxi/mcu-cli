import {
  themeFromSourceColor,
  themeFromImage,
  argbFromHex,
  hexFromArgb,
  Theme,
  Hct,
} from "@material/material-color-utilities";
import sharp from "sharp";
import { contrastRatio } from "./contrast";

import { Theme as Themed, ThemeColor } from "../types/mcuc";

export async function getDominantColorHex(
  imageBuffer: Buffer
): Promise<string> {
  // Downscale to a small image for analysis
  const { data, info } = await sharp(imageBuffer)
    .resize(16, 16, { fit: "fill" })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const colorCounts = new Map<string, number>();
  for (let i = 0; i < data.length; i += info.channels) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const hex = `#${r.toString(16).padStart(2, "0")}${g
      .toString(16)
      .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
    colorCounts.set(hex, (colorCounts.get(hex) || 0) + 1);
  }

  let dominantColor = "#000000";
  let maxCount = 0;
  for (const [hex, count] of colorCounts.entries()) {
    if (count > maxCount) {
      dominantColor = hex;
      maxCount = count;
    }
  }
  return dominantColor;
}

export class MaterialCli {
  static async generateTheme(
    source: string | Buffer,
    opts: {
      hue?: number;
      chroma?: number;
      tone?: number;
      theme?: "light" | "dark" | "both";
    } = {}
  ): Promise<Theme | { light?: ThemeColor; dark?: ThemeColor } | null> {
    let theme: Theme;
    let seed: number;
    if (typeof source === "string") {
      seed = argbFromHex(source);
      if (opts.hue || opts.chroma || opts.tone) {
        const hct = Hct.fromInt(seed);
        if (opts.hue !== undefined) hct.hue = opts.hue;
        if (opts.chroma !== undefined) hct.chroma = opts.chroma;
        if (opts.tone !== undefined) hct.tone = opts.tone;
        seed = hct.toInt();
      }
      theme = themeFromSourceColor(seed);
    } else {
      // Image buffer: extract dominant color, then make theme
      const hex = await getDominantColorHex(source);
      seed = argbFromHex(hex);
      theme = themeFromSourceColor(seed);
    }
    const mapped = MaterialCli.mapTheme(theme);
    if (opts.theme === "light") return { light: mapped.light };
    if (opts.theme === "dark") return { dark: mapped.dark };
    return mapped;
  }

  static async colorInfo(source: string | Buffer): Promise<{
    hex: string;
    hct: { hue: number; chroma: number; tone: number };
  }> {
    let color: number;
    if (typeof source === "string") {
      color = argbFromHex(source);
    } else {
      const theme = await themeFromImage(new Uint8Array(source));
      color = theme.source;
    }
    const hct = Hct.fromInt(color);
    return {
      hex: hexFromArgb(color),
      hct: {
        hue: Number(hct.hue.toFixed(2)),
        chroma: Number(hct.chroma.toFixed(2)),
        tone: Number(hct.tone.toFixed(2)),
      },
    };
  }

  static contrastRatio(
    colorA: string,
    colorB: string
  ): { ratio: number; colorA: string; colorB: string } {
    const a = argbFromHex(colorA);
    const b = argbFromHex(colorB);
    return {
      ratio: Number(contrastRatio(a, b).toFixed(3)),
      colorA: colorA,
      colorB: colorB,
    };
  }

  static mapTheme(theme: Theme): Themed {
    const map = (scheme: any, palettes: any, light: boolean): ThemeColor => ({
      primary: hexFromArgb(scheme.primary),
      onPrimary: hexFromArgb(scheme.onPrimary),
      primaryContainer: hexFromArgb(scheme.primaryContainer),
      onPrimaryContainer: hexFromArgb(scheme.onPrimaryContainer),
      secondary: hexFromArgb(scheme.secondary),
      onSecondary: hexFromArgb(scheme.onSecondary),
      secondaryContainer: hexFromArgb(scheme.secondaryContainer),
      onSecondaryContainer: hexFromArgb(scheme.onSecondaryContainer),
      tertiary: hexFromArgb(scheme.tertiary),
      onTertiary: hexFromArgb(scheme.onTertiary),
      tertiaryContainer: hexFromArgb(scheme.tertiaryContainer),
      onTertiaryContainer: hexFromArgb(scheme.onTertiaryContainer),
      error: hexFromArgb(scheme.error),
      onError: hexFromArgb(scheme.onError),
      errorContainer: hexFromArgb(scheme.errorContainer),
      onErrorContainer: hexFromArgb(scheme.onErrorContainer),
      background: hexFromArgb(scheme.background),
      onBackground: hexFromArgb(scheme.onBackground),
      surface: hexFromArgb(scheme.surface),
      onSurface: hexFromArgb(scheme.onSurface),
      surfaceVariant: hexFromArgb(scheme.surfaceVariant),
      onSurfaceVariant: hexFromArgb(scheme.onSurfaceVariant),
      outline: hexFromArgb(scheme.outline),
      outlineVariant: hexFromArgb(
        light
          ? palettes.neutralVariant.tone(80)
          : palettes.neutralVariant.tone(30)
      ),
      shadow: hexFromArgb(scheme.shadow),
      scrim: hexFromArgb(scheme.scrim),
      inverseSurface: hexFromArgb(scheme.inverseSurface),
      inverseOnSurface: hexFromArgb(scheme.inverseOnSurface),
      inversePrimary: hexFromArgb(scheme.inversePrimary),
      surfaceTint: hexFromArgb(
        light ? palettes.a1.tone(40) : palettes.a1.tone(80)
      ),
      surfaceDim: hexFromArgb(
        light ? palettes.neutral.tone(87) : palettes.neutral.tone(6)
      ),
      surfaceBright: hexFromArgb(
        light ? palettes.neutral.tone(98) : palettes.neutral.tone(24)
      ),
      surfaceContainerLowest: hexFromArgb(
        light ? palettes.neutral.tone(100) : palettes.neutral.tone(4)
      ),
      surfaceContainerLow: hexFromArgb(
        light ? palettes.neutral.tone(96) : palettes.neutral.tone(10)
      ),
      surfaceContainer: hexFromArgb(
        light ? palettes.neutral.tone(94) : palettes.neutral.tone(12)
      ),
      surfaceContainerHigh: hexFromArgb(
        light ? palettes.neutral.tone(92) : palettes.neutral.tone(17)
      ),
      surfaceContainerHighest: hexFromArgb(
        light ? palettes.neutral.tone(90) : palettes.neutral.tone(22)
      ),
    });

    return {
      light: map(theme.schemes.light, theme.palettes, true),
      dark: map(theme.schemes.dark, theme.palettes, false),
    };
  }
}
