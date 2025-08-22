import * as yaml from "js-yaml";
import { Theme, ThemeColor } from "../types/mcuc";

export class OutputFormatter {
  static format(
    theme: Theme | { light?: ThemeColor; dark?: ThemeColor },
    fmt: string,
    prefix: string,
    casing: string
  ): string {
    const processedTheme = this._transformThemeKeys(theme, prefix, casing);

    switch (fmt) {
      case "scss":
        return this._formatScss(processedTheme);
      case "less":
        return this._formatLess(processedTheme);
      case "styl":
        return this._formatStyl(processedTheme);
      case "css":
        return this._formatCss(processedTheme);
      case "html":
        return this._formatHtml(processedTheme);
      case "json":
        return JSON.stringify(processedTheme, null, 2);
      case "ts":
        return `export const theme = ${JSON.stringify(
          processedTheme,
          null,
          2
        )};`;
      case "js":
        return `const theme = ${JSON.stringify(
          processedTheme,
          null,
          2
        )};\nexport { theme }`;
      case "xml":
        return this._formatXml(processedTheme);
      case "yaml":
        return yaml.dump(processedTheme);
      case "table":
        return this._formatTable(processedTheme);
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

  private static _transformThemeKeys(
    theme: any,
    prefix: string,
    casing: string
  ): any {
    const out: any = {};
    for (const scheme in theme) {
      out[scheme] = {};
      const colors = theme[scheme];
      for (const key in colors) {
        out[scheme][`${prefix}${this._toCase(key, casing)}`] = colors[key];
      }
    }
    return out;
  }

  private static _toCase(str: string, caseFormat: string): string {
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

  private static _formatScss(theme: any): string {
    let out = "";
    for (const scheme in theme) {
      const colors = theme[scheme];
      for (const key in colors) {
        out += `$${key}: ${colors[key]};\n`;
      }
    }
    return out.trim();
  }

  private static _formatLess(theme: any): string {
    let out = "";
    for (const scheme in theme) {
      const colors = theme[scheme];
      for (const key in colors) {
        out += `@${key}: ${colors[key]};\n`;
      }
    }
    return out.trim();
  }

  private static _formatStyl(theme: any): string {
    let out = "";
    for (const scheme in theme) {
      const colors = theme[scheme];
      for (const key in colors) {
        out += `${key} = ${colors[key]}\n`;
      }
    }
    return out.trim();
  }

  private static _formatCss(theme: any): string {
    let out = "";
    for (const scheme in theme) {
      const colors = theme[scheme];
      out += `.${scheme} {\n`;
      for (const key in colors) {
        out += `  --${key}: ${colors[key]};\n`;
      }
      out += "}\n";
    }
    return out.trim();
  }

  private static _formatHtml(theme: any): string {
    let out = `<html><head>
<style>
body { font-family: sans-serif; }
.swatch-container { display: flex; flex-wrap: wrap; gap: 10px; }
.swatch { width: 300px; height: 300px; display: flex; flex-direction: column; justify-content: center; align-items: center; color: #fff; font-weight: bold; text-shadow: 0 0 5px rgba(0,0,0,0.5); }
.swatch span { background: rgba(0,0,0,0.3); padding: 5px 10px; border-radius: 5px; }
</style>
</head><body>\n`;

    for (const scheme in theme) {
      const colors = theme[scheme];
      out += `<h2>${scheme} theme</h2><div class="swatch-container">\n`;
      for (const key in colors) {
        out += `<div class="swatch" style="background:${colors[key]}">
<span>${key}</span><br/>
<span>${colors[key]}</span>
</div>\n`;
      }
      out += `</div>\n`;
    }

    out += `</body></html>`;
    return out;
  }

  private static _formatXml(theme: any): string {
    let out = `<theme>\n`;
    for (const scheme in theme) {
      out += `  <${scheme}>\n`;
      const colors = theme[scheme];
      for (const key in colors) {
        out += `    <color name="${key}">${colors[key]}</color>\n`;
      }
      out += `  </${scheme}>\n`;
    }
    out += `</theme>`;
    return out;
  }

  private static _formatTable(theme: any): string {
    for (const scheme in theme) {
      console.log(`Scheme: ${scheme}`);
      console.table(theme[scheme]);
    }
    return "";
  }
}
