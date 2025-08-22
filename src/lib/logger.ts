import chalk from "chalk";

export class Logger {
  private _enableLogging: boolean = false;
  private _showTimestamp: boolean;

  constructor(showTimestamp = false) {
    this._showTimestamp = showTimestamp;
  }

  set enabled(value: boolean) {
    this._enableLogging = value;
  }

  get enabled(): boolean {
    return this._enableLogging;
  }

  private _log(
    type: "info" | "warn" | "error" | "success",
    msg: string,
    force = false
  ) {
    if (!this._enableLogging && !force) return;

    const prefixMap = {
      info: chalk.blueBright("[INFO]"),
      warn: chalk.yellowBright("[WARN]"),
      error: chalk.redBright("[ERROR]"),
      success: chalk.greenBright("[OK]"),
    };

    const timestamp = this._showTimestamp
      ? chalk.gray(`[${new Date().toLocaleTimeString()}]`)
      : "";
    const prefix = `${timestamp} ${prefixMap[type]}`;

    switch (type) {
      case "info":
      case "success":
        console.log(prefix, msg);
        break;
      case "warn":
        console.warn(prefix, msg);
        break;
      case "error":
        console.error(prefix, msg);
        break;
    }
  }

  info(msg: string, force = false) {
    this._log("info", msg, force);
  }

  warn(msg: string, force = false) {
    this._log("warn", msg, force);
  }

  error(msg: string, force = false) {
    this._log("error", msg, force);
  }

  success(msg: string, force = false) {
    this._log("success", msg, force);
  }
}
