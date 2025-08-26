interface GenerateOptions {
  out?: string;
  palette: boolean;
  format:
    | "json"
    | "table"
    | "yaml"
    | "css"
    | "scss"
    | "less"
    | "styl"
    | "js"
    | "ts"
    | "xml";
  prefix: string;
  case: "camel" | "pascal" | "kebab";
  random: boolean;
  image?: string;
  theme: "light" | "dark" | "both";
  hue?: number;
  chroma?: number;
  tone?: number;
  log: boolean;
}

interface InfoOptions {
  format: "json" | "table" | "yaml";
  image?: string;
  extended: boolean;
  distance?: string;
  log: boolean;
}

interface ContrastOptions {
  format: "json" | "table" | "yaml";
  bg: string[];
  wcagOnly: boolean;
  log: boolean;
}

interface PreviewOptions {
  out?: string;
  image?: string;
  usage: boolean;
  log: boolean;
}

type ContrastInput = [string, string] | [string];
type PreviewInput = string | Buffer | null | undefined;
type InfoInput = string | null | undefined;
type GenerateInput = string | Buffer | null | undefined;

export { GenerateOptions, InfoOptions, ContrastOptions, PreviewOptions };
export { ContrastInput, PreviewInput, InfoInput, GenerateInput };
