import Keyv from "keyv";

interface StoreOpts {
  uri?: string;
  busyTimeout?: number;
}

export class Store {
  private store: Keyv;
  constructor(opts?: StoreOpts) {
    this.store = new Keyv({
      uri: opts?.uri,
      busyTimeout: opts?.busyTimeout,
      namespace: "bot-store",
    });
  }
  get<T extends unknown>(key: string): Promise<T | undefined> {
    return this.store.get(key) as Promise<T | undefined>;
  }
  set<T extends unknown>(key: string, value: T): Promise<boolean> {
    return this.store.set(key, value);
  }
  delete(key: string): Promise<boolean> {
    return this.store.delete(key);
  }
  onError(fn: (arg: unknown) => void): void {
    this.store.on("error", fn);
  }
}
