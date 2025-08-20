import chalk from "chalk";

export class Logger {
  info(msg: string) {
    console.log(chalk.blueBright("[INFO]"), msg);
  }
  warn(msg: string) {
    console.warn(chalk.yellowBright("[WARN]"), msg);
  }
  error(msg: string) {
    console.error(chalk.redBright("[ERROR]"), msg);
  }
  success(msg: string) {
    console.log(chalk.greenBright("[OK]"), msg);
  }
}
