import * as yaml from "js-yaml";
import { Theme, ThemeColor } from "./types";

function transformThemeKeys(theme: any, prefix: string, casing: string): any {
  const out: any = {};
  for (const scheme in theme) {
    out[scheme] = {};
    const colors = theme[scheme];
    for (const key in colors) {
      out[scheme][`${prefix}${toCase(key, casing)}`] = colors[key];
    }
  }
  return out;
}

function toCase(str: string, caseFormat: string): string {
  const parts = str
    .replace(/([A-Z])/g, " $1")
    .trim()
    .split(/[\s_-]+/);

  switch (caseFormat) {
    case "camel":
      return parts
        .map((p, i) =>
          i === 0
            ? p.charAt(0).toLowerCase() + p.slice(1)
            : p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()
        )
        .join("");
    case "pascal":
      return parts
        .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
        .join("");
    case "kebab":
    default:
      return parts.map((p) => p.toLowerCase()).join("-");
  }
}

export class OutputFormatter {
  static format(
    theme: Theme | { light?: ThemeColor; dark?: ThemeColor },
    fmt: string,
    prefix: string,
    casing: string
  ): string {
    const processedTheme = transformThemeKeys(theme, prefix, casing);

    switch (fmt) {
      case "scss": {
        let out = "";
        for (const scheme in processedTheme) {
          const colors = processedTheme[scheme];
          for (const key in colors) {
            out += `$${key}: ${colors[key]};\n`;
          }
        }
        return out.trim();
      }
      case "css": {
        let out = "";
        for (const scheme in processedTheme) {
          const colors = processedTheme[scheme];
          out += `.${scheme} {\n`;
          for (const key in colors) {
            out += `  --${key}: ${colors[key]};\n`;
          }
          out += "}\n";
        }
        return out.trim();
      }
      case "json":
        return JSON.stringify(processedTheme, null, 2);
      case "yaml":
        return yaml.dump(processedTheme);
      case "table":
        for (const scheme in processedTheme) {
          console.log(`Scheme: ${scheme}`);
          console.table(processedTheme[scheme]);
        }
        return "";
      default:
        return `Unsupported format: ${fmt}`;
    }
  }

  static formatInfo(
    info: { hex: string; hct: { hue: number; chroma: number; tone: number } },
    fmt: string
  ): string {
    switch (fmt) {
      case "json":
        return JSON.stringify(info, null, 2);
      case "yaml":
        return yaml.dump(info);
      case "table":
        console.table(info);
        return "";
      default:
        return `Unsupported format: ${fmt}`;
    }
  }

  static formatContrast(
    data: { ratio: number; colorA: string; colorB: string },
    fmt: string
  ): string {
    switch (fmt) {
      case "json":
        return JSON.stringify(data, null, 2);
      case "yaml":
        return yaml.dump(data);
      case "table":
        console.table(data);
        return "";
      default:
        return `Unsupported format: ${fmt}`;
    }
  }
}
