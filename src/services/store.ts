export class Store {
  private store = Promise.resolve(new Map());
  async get<T extends unknown>(key: string): Promise<T | undefined> {
    const store = await this.store;
    return store.get(key) as T | undefined;
  }
  async set<T extends unknown>(key: string, value: T): Promise<boolean> {
    const store = await this.store;
    store.set(key, value);
    return true;
  }
  async delete(key: string): Promise<boolean> {
    const store = await this.store;
    return store.delete(key);
  }
  async has(key: string): Promise<boolean> {
    const store = await this.store;
    return store.has(key);
  }
}
