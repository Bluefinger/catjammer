import type { Logger, Store, Scheduler, Permissions } from "./services";

export interface Config {
  readonly token: string;
  readonly prefix: string;
  readonly parenthesis: [string, string];
}

export interface Services {
  readonly store: Store;
  readonly log: Logger;
  readonly scheduler: Scheduler;
  readonly permissions: Permissions;
}
