import { expect } from "chai";
import { cancel } from "../../src/commands/cancel";
import { Scheduler } from "../../src/services";
import { ExtractedCommand } from "../../src/matcher";
import { GuildMessage } from "../../src/index.types";
import { fake, spy } from "sinon";
import { Message } from "discord.js";
import { Job } from "node-schedule";
import { Store } from "../../src/services";

describe("cancel command", () => {
  describe("execute", () => {
    const replySpy = spy();
    const cancelSpy = spy();
    const services = {
      scheduler: new Scheduler(),
      store: new Store(),
    };
    services.scheduler.cancel = cancelSpy;
    const args: Record<string, string> = {
      name: "test",
    };
    const message: unknown = {
      reply: replySpy,
      guild: { id: "guild" },
    };
    beforeEach(() => {
      replySpy.resetHistory();
      cancelSpy.resetHistory();
    });

    it("rejects argument of command that doesnt exist", async () => {
      await cancel.execute({
        message,
        args,
        services,
      } as ExtractedCommand);
      expect(replySpy.calledWith("Job does not exist")).to.be.true;
    });
    it("should throw an error when store returns no array", async () => {
      const job: unknown = { cancel: fake() };
      services.scheduler.jobStore.set("guildtest", job as Job);

      try {
        await cancel.execute({
          message: message as GuildMessage,
          args,
          services,
        } as ExtractedCommand);
        expect.fail("No error thrown");
      } catch (err) {
        const error = err as Error;
        expect(error.message).to.be.eql("Failed to get jobs from store");
      }
    });
    it("successfully call cancel with correct arguments", async () => {
      const storableJob: unknown = { name: "test", message: { guild: "guild" } };
      const dummyJob: unknown = { name: "dummy", message: { guild: "guild" } };
      await services.store.set("jobs::guild", [dummyJob, storableJob]);
      await cancel.execute({ message: message as Message, args, services } as ExtractedCommand);
      expect(cancelSpy.calledWith("test", "guild") && replySpy.calledWith("Job removed")).to.be
        .true;
    });
    it("should throw an error when jobs does not exist in store", async () => {
      await services.store.set("jobs::guild", []);
      try {
        await cancel.execute({
          message: message as GuildMessage,
          args,
          services,
        } as ExtractedCommand);
        expect.fail("No error thrown");
      } catch (err) {
        const error = err as Error;
        expect(error.message).to.be.eql("Job was found in memory but does not exist in the store");
      }
    });
  });
});
