import { expect } from "chai";
import { jobs } from "../../src/commands/jobs";
import { fake, spy } from "sinon";
import { Store } from "../../src/services";
import { ExtractedCommand } from "../../src/matcher";

describe("list command", () => {
  describe("execute", () => {
    const replySpy = spy();
    const message: unknown = { reply: replySpy };
    beforeEach(() => replySpy.resetHistory());
    it("throw an error if store doesn't return an array", async () => {
      const storeGetFake = fake.returns(null);
      const services = {
        store: new Store(),
      };
      services.store.get = storeGetFake;
      try {
        await jobs.execute({ message, services } as ExtractedCommand);
        expect.fail("No error thrown");
      } catch (err) {
        const error = err as Error;
        expect(error.message).to.be.eql("StorableJob array missing from store service");
      }
    });
    it("reply with names of jobs", async () => {
      const storeGetFake = fake.returns([{ name: "test" }, { name: "passed" }]);
      const services = {
        store: new Store(),
      };
      services.store.get = storeGetFake;
      await jobs.execute({ message, services } as ExtractedCommand);
      expect(replySpy.firstCall.args[0]).to.be.eql("\ntest\npassed");
    });
    it("when no jobs, reply reporting so", async () => {
      const storeGetFake = fake.returns([]);
      const services = {
        store: new Store(),
      };
      services.store.get = storeGetFake;
      await jobs.execute({ message, services } as ExtractedCommand);
      expect(replySpy.firstCall.args[0]).to.be.eql("no current jobs");
    });
  });
});
