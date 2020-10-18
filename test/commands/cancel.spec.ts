import { expect } from "chai";
import { cancel } from "../../src/commands/cancel";
import { Scheduler } from "../../src/services";
import { ExtractedCommand } from "../../src/matcher";
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
    beforeEach(() => {
      replySpy.resetHistory();
      cancelSpy.resetHistory();
    });

    it("rejects message with no guild", async () => {
      const message: unknown = {
        reply: replySpy,
        guild: null,
      };
      await cancel.execute({ message: message as Message, args } as ExtractedCommand);
      expect(replySpy.calledWith("Must be used in a guild channel")).to.be.true;
    });

    it("rejects argument of command that doesnt exist", async () => {
      const message: unknown = {
        reply: replySpy,
        guild: { name: "test" },
      };
      await cancel.execute({ message: message as Message, args, services } as ExtractedCommand);
      expect(replySpy.calledWith("Job does not exist")).to.be.true;
    });
    it("successfully call cancel with correct arguments", async () => {
      const storableJob: unknown = { name: "test", message: { guild: "guild" } };
      await services.store.set("jobs", [storableJob]);
      const message: unknown = {
        reply: replySpy,
        guild: { id: "guild" },
      };
      const job: unknown = { cancel: fake() };
      services.scheduler.jobStore.set("guildtest", job as Job);
      await cancel.execute({ message: message as Message, args, services } as ExtractedCommand);
      expect(cancelSpy.calledWith("test", "guild") && replySpy.calledWith("Job removed")).to.be
        .true;
    });
  });
});
