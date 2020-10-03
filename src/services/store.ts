export class Store {
  private store = new Map();
  constructor() {}
  get<T extends unknown>(key: string): T | undefined {
    return this.store.get(key) as T | undefined;
  }
  set<T extends unknown>(key: string, value: T): this {
    this.store.set(key, value);
    return this;
  }
  delete(key: string): boolean {
    return this.store.delete(key);
  }
  has(key: string): boolean {
    return this.store.has(key);
  }
}
