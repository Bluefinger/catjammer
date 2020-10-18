import { expect } from "chai";
import { jobs } from "../../src/commands/jobs";
import { fake, spy } from "sinon";
import { Store } from "../../src/services";
import { ExtractedCommand } from "../../src/matcher";

describe("jobs command", () => {
  describe("execute", () => {
    const replySpy = spy();
    beforeEach(() => replySpy.resetHistory());
    it("throw an error if store doesn't return an array", async () => {
      const message: unknown = { reply: replySpy, guild: { id: "1" } };
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
      const message: unknown = { reply: replySpy, guild: { id: "1" } };
      const storeGetFake = fake.returns([
        { name: "test", message: { guild: "1" } },
        { name: "passed", message: { guild: "1" } },
      ]);
      const services = {
        store: new Store(),
      };
      services.store.get = storeGetFake;
      await jobs.execute({ message, services } as ExtractedCommand);
      expect(replySpy.firstCall.args[0]).to.be.eql("\ntest\npassed");
    });
    it("can't be used outside a guild", async () => {
      const message: unknown = { reply: replySpy };
      const services = {
        store: new Store(),
      };
      await jobs.execute({ message, services } as ExtractedCommand);
      expect(replySpy.firstCall.args[0]).to.be.eql("must be used in a guild");
    });
    it("when no jobs, reply reporting so", async () => {
      const message: unknown = { reply: replySpy, guild: { id: "1" } };
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
