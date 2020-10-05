import { Console } from "console";

const toPaddedValue = (value: number, size: number): string => {
  const str = value.toString();
  return "0".repeat(size - str.length) + str;
};

const getTimestamp = (type: string): string => {
  const date = new Date();
  const year = date.getUTCFullYear();
  const month = toPaddedValue(date.getUTCMonth() + 1, 2);
  const day = toPaddedValue(date.getUTCDate(), 2);
  const hours = toPaddedValue(date.getUTCHours(), 2);
  const minutes = toPaddedValue(date.getUTCMinutes(), 2);
  const seconds = toPaddedValue(date.getUTCSeconds(), 2);
  const milliseconds = toPaddedValue(date.getUTCMilliseconds(), 3);
  return `[${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds} UTC]: ${type}`;
};

interface LoggerOpts {
  stdout: NodeJS.WritableStream;
  stderr: NodeJS.WritableStream;
}

export class Logger {
  private logger: Console;
  constructor(opts: LoggerOpts) {
    this.logger = new Console(opts);
  }
  info<T extends unknown[]>(...args: T): void {
    this.logger.log(getTimestamp("<INFO>"), ...args);
  }
  error<T extends unknown[]>(...args: T): void {
    this.logger.error(getTimestamp("<ERROR>"), ...args);
  }
}
