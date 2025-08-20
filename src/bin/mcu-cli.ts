#!/usr/bin/env node

import { Command } from "commander";
import { promises as fs } from "fs";
import * as path from "path";
import { MaterialCli } from "../lib/material-cli";
import { OutputFormatter } from "../lib/format";
import { Logger } from "../lib/logger";
import { ThemeColor, Theme } from "../lib/types";
import { getDominantColorHex } from "../lib/material-cli";

const logger = new Logger();

const program = new Command();

program
  .name("mcu-cli")
  .description(
    "Material Color Utilities CLI - Generate and inspect Material 3 color themes"
  )
  .version("1.0.0");

program
  .command("generate")
  .description("Generate Material 3 theme from a color or image")
  .argument("[input]", "Hex color (#RRGGBB) or image file path")
  .option("-o, --out <file>", "Write output to file instead of stdout")
  .option(
    "-f, --format <fmt>",
    "Output format: json|table|yaml|css|scss",
    "json"
  )
  .option("-p, --prefix <prefix>", "Prefix for variable names", "")
  .option("-C, --case <style>", "Variable casing: camel|pascal|kebab", "kebab")
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
      }
      if (!seed) {
        logger.error("No input color or image provided.");
        process.exit(1);
      }
      logger.info("Generating theme...");
      const themeObj = await MaterialCli.generateTheme(seed, {
        hue: opts.hue,
        chroma: opts.chroma,
        tone: opts.tone,
        theme: opts.theme,
      });
      if (!themeObj) {
        logger.error("Failed to generate theme.");
        process.exit(1);
      }
      const formatted = OutputFormatter.format(
        themeObj as Theme | { light?: ThemeColor; dark?: ThemeColor },
        opts.format,
        opts.prefix,
        opts.case
      );
      if (opts.out) {
        await fs.writeFile(opts.out, formatted, "utf8");
        logger.success(`Theme written to ${opts.out}`);
      } else {
        logger.success("Theme output:");
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
  .action(async (input, opts) => {
    try {
      let colorSeed: string | Buffer | undefined = input;
      if (opts.image) {
        const imgPath = path.resolve(opts.image);
        logger.info(`Loading image: ${imgPath}`);
        const imageBuffer = await fs.readFile(imgPath);
        colorSeed = await getDominantColorHex(imageBuffer);
      }
      if (!colorSeed) {
        logger.error("No input color or image provided.");
        process.exit(1);
      }
      const info = await MaterialCli.colorInfo(colorSeed);
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
  .action(async (inputs: string[], opts) => {
    try {
      if (!inputs || inputs.length !== 2) {
        logger.error("Contrast requires two colors.");
        process.exit(1);
      }
      const ratio = MaterialCli.contrastRatio(inputs[0], inputs[1]);
      const formatted = OutputFormatter.formatContrast(ratio, opts.format);
      logger.success("Contrast output:");
      console.log(formatted);
    } catch (err: any) {
      logger.error(`Error: ${err.message}`);
      process.exit(1);
    }
  });

program.parseAsync(process.argv);
