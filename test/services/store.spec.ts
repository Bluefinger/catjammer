import { expect } from "chai";
import { Store } from "../../src/services";

describe("store.ts", () => {
  describe("Store Service", () => {
    it("implements a promise-based Map-like API", async () => {
      const store = new Store();

      expect(await store.set("data", "a value")).to.be.true;
      expect(await store.get<string>("data")).to.equal("a value");
      expect(await store.delete("data")).to.be.true;
      expect(await store.get("data")).to.be.undefined;
    });
    it("accepts a config object", () => {
      const store = new Store({});
      expect(store instanceof Store).to.be.true;
    });
    it("exposes an event listener for logging errors", () => {
      const store = new Store();
      // eslint-disable-next-line
      expect(store.onError).to.be.a("function");
      try {
        store.onError(() => {});
      } catch (e) {
        expect.fail("should not fail to register an event handler");
      }
    });
  });
});
