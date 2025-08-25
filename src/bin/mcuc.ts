#!/usr/bin/env node

import { Command } from "commander";
import { promises as fs } from "fs";
import * as path from "path";
import { MaterialCli } from "../lib/material-cli";
import { OutputFormatter } from "../lib/format";
import { Logger } from "../lib/logger";
import { ThemeColor, Theme } from "../types/mcuc";
import { Utils } from "../lib/utils";

const logger = new Logger(true);

const program = new Command();

program
  .name("mcuc")
  .description(
    "Material Color Utilities CLI - Generate and inspect Material 3 color themes"
  )
  .version("1.1.0")
  .option("-l, --log", "Enable detailed logging for progress", false);

program.hook("preAction", (cmd) => {
  if (cmd.parent?.opts().log) {
    logger.enabled = true;
  }
});

program
  .command("generate")
  .description("Generate Material 3 theme from a color or image")
  .argument("[input]", "Hex color (#RRGGBB) or image file path")
  .option("-o, --out <file>", "Write output to file instead of stdout")
  .option(
    "-p, --palette",
    "Generate full tonal palette instead of theme",
    false
  )
  .option(
    "-f, --format <fmt>",
    "Output format: json|table|yaml|css|scss|less|styl|js|ts|xml",
    "json"
  )
  .option("-P, --prefix <prefix>", "Prefix for variable names", "")
  .option("-C, --case <style>", "Variable casing: camel|pascal|kebab", "kebab")
  .option("-r, --random", "Use random color instead of input", false)
  .option(
    "-i, --image <img>",
    "Extract dominant color from image, overrides input"
  )
  .option("-T, --theme <theme>", "Theme: light|dark|both", "dark")
  .option("--hue <val>", "Hue override (0-360)", (v) => Number(v))
  .option("--chroma <val>", "Chroma override (0-150)", (v) => Number(v))
  .option("--tone <val>", "Tone override (0-100)", (v) => Number(v))
  .action(async (input, opts) => {
    try {
      let seed: string | Buffer | undefined = input;

      if (opts.image) {
        const imgPath = path.resolve(opts.image);
        logger.info(`Loading image: ${imgPath}`);
        seed = await fs.readFile(imgPath);
      } else if (opts.random) {
        seed = Utils.randomHexColor();
        logger.info(`Generated random seed color: ${seed}`);
      }

      if (!seed) {
        logger.error("No input color or image provided.");
        process.exit(1);
      }

      logger.info(
        opts.palette ? "Generating palette..." : "Generating theme..."
      );

      const result = opts.palette
        ? await MaterialCli.generatePalette(seed, {
            hue: opts.hue,
            chroma: opts.chroma,
            tone: opts.tone,
            theme: opts.theme,
          })
        : await MaterialCli.generateTheme(seed, {
            hue: opts.hue,
            chroma: opts.chroma,
            tone: opts.tone,
            theme: opts.theme,
          });

      if (!result) {
        logger.error(
          `Failed to generate ${opts.palette ? "palette" : "theme"}.`
        );
        process.exit(1);
      }

      const formatted = OutputFormatter.format(
        result as Theme | { light?: ThemeColor; dark?: ThemeColor },
        opts.format,
        opts.prefix,
        opts.case
      );

      if (opts.out) {
        await fs.writeFile(opts.out, formatted, "utf8");
        logger.success(
          `${opts.palette ? "Palette" : "Theme"} written to ${opts.out}`
        );
      } else {
        logger.success(`${opts.palette ? "Palette" : "Theme"} output:`);
        console.log(formatted);
      }
    } catch (err: any) {
      logger.error(`Error: ${err.message}`);
      process.exit(1);
    }
  });

program
  .command("info")
  .description("Show color info for a hex color or image")
  .argument("[input]", "Hex color (#RRGGBB) or image file path")
  .option(
    "-i, --image <img>",
    "Extract dominant color from image, overrides input"
  )
  .option("-f, --format <fmt>", "Output format: json|table|yaml", "json")
  .option(
    "-e, --extended",
    "Show extended color info (LAB, LCH, OKLCH, luminance)",
    false
  )
  .option(
    "-d, --distance <color>",
    "Compare input color to another color and show ΔE (color difference)"
  )
  .action(async (input, opts) => {
    try {
      let colorSeed: string | Buffer | undefined = input;
      if (opts.image) {
        const imgPath = path.resolve(opts.image);
        logger.info(`Loading image: ${imgPath}`);
        const imageBuffer = await fs.readFile(imgPath);
        colorSeed = await Utils.getDominantColorHex(imageBuffer);
      }
      if (!colorSeed) {
        logger.error("No input color or image provided.");
        process.exit(1);
      }

      const info = await MaterialCli.colorInfo(colorSeed, {
        extended: opts.extended,
        distance: opts.distance,
      });

      const formatted = OutputFormatter.formatInfo(info, opts.format);
      logger.success("Color info output:");
      console.log(formatted);
    } catch (err: any) {
      logger.error(`Error: ${err.message}`);
      process.exit(1);
    }
  });

program
  .command("contrast")
  .description("Check contrast ratio between two hex colors")
  .argument("[input...]", "Two hex colors (#RRGGBB #RRGGBB)")
  .option("-f, --format <fmt>", "Output format: json|table|yaml", "json")
  .option("-b, --bg <color...>", "Background color(s) to test against")
  .option("-w, --wcag-only", "Output only WCAG compliance levels", false)
  .action(async (inputs: string[], opts) => {
    try {
      if (opts.bg && inputs.length === 1) {
        const fg = inputs[0];
        const results = opts.bg.map((bg: string) =>
          MaterialCli.contrastRatio(fg, bg)
        );

        const formatted = OutputFormatter.formatContrast(
          results,
          opts.format,
          opts.wcagOnly
        );
        logger.success("Contrast against backgrounds:");
        console.log(formatted);
        return;
      }

      if (!inputs || inputs.length !== 2) {
        logger.error("Contrast requires two colors or one color with --bg.");
        process.exit(1);
      }

      const result = MaterialCli.contrastRatio(inputs[0], inputs[1]);
      const formatted = OutputFormatter.formatContrast(
        result,
        opts.format,
        opts.wcagOnly
      );
      logger.success("Contrast output:");
      console.log(formatted);
    } catch (err: any) {
      logger.error(`Error: ${err.message}`);
      process.exit(1);
    }
  });

program
  .command("preview")
  .description("Generate an HTML preview of a theme from a color or image")
  .argument("[input]", "Hex color (#RRGGBB) or image file path")
  .option("-o, --out <file>", "Write preview HTML to file instead of stdout")
  .option(
    "-i, --image <img>",
    "Extract dominant color from image, overrides input"
  )
  .option(
    "-u, --usage",
    "Include example usage components (text, buttons, cards)"
  )
  .action(async (input, opts) => {
    try {
      let seed: string | Buffer | undefined = input;
      if (opts.image) {
        const imgPath = path.resolve(opts.image);
        logger.info(`Loading image: ${imgPath}`);
        seed = await fs.readFile(imgPath);
      }
      if (!seed) {
        logger.error("No input color or image provided.");
        process.exit(1);
      }

      logger.info("Generating theme for preview...");
      const themeObj = await MaterialCli.generateTheme(seed, {
        theme: "both",
      });

      const html = await OutputFormatter.formatPreview(
        themeObj as { light?: ThemeColor; dark?: ThemeColor },
        opts.usage
      );

      if (opts.out) {
        await fs.writeFile(opts.out, html, "utf8");
        logger.success(`Preview HTML written to ${opts.out}`);
      } else {
        logger.success("Preview HTML output:");
        console.log(html);
      }
    } catch (err: any) {
      logger.error(`Error: ${err.message}`);
      process.exit(1);
    }
  });

program.parse(process.argv);
