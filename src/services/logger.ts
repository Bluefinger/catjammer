export class Logger {
  private logger: Console;
  constructor() {
    this.logger = console;
  }
  log<T extends unknown[]>(...args: T): void {
    this.logger.log(...args);
  }
  error<T extends unknown[]>(...args: T): void {
    this.logger.error(...args);
  }
}
