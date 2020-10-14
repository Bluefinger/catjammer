import { expect } from "chai";
import { validateDay, validateTime } from "../../src/commands/helpers/scheduleValidators";
import type { ExtractedCommand } from "../../src/matcher";
import { fake, spy } from "sinon";
import { Message, Collection, Snowflake, SnowflakeUtil, GuildChannel, Client } from "discord.js";
import { Store } from "../../src/services/store";
import { schedule } from "../../src/commands/schedule";
import { Scheduler, StorableJob } from "../../src/services";

describe("schedule command", () => {
  describe("init", () => {
    it("set jobs array if none already exists", async () => {
      const services = {
        store: new Store(),
        scheduler: new Scheduler(),
      };
      const setSpy = spy();
      services.store.set = setSpy;
      await schedule.init({} as Client, services as Services);
      expect(setSpy.called).to.be.true;
    });

    it("call scheduleFromStore for each job in array", async () => {
      const services = {
        store: new Store(),
        scheduler: new Scheduler(),
      };
      const scheduleFromStoreSpy = spy();
      services.scheduler.scheduleFromStore = scheduleFromStoreSpy;
      await services.store.set("jobs", [{} as StorableJob, {} as StorableJob]);
      await schedule.init({} as Client, services as Services);
      expect(scheduleFromStoreSpy.callCount).to.be.eql(2);
    });
  });
  describe("validation", () => {
    it("should reject bad day argument", () => {
      expect(validateDay("Wrong")).to.be.false;
    });

    it("should accept good day argument", () => {
      expect(validateDay("Thursday")).to.be.true;
    });

    it("should accept good time argument", () => {
      expect(validateTime("01:20")).to.be.true;
    });

    it("should reject bad time argument", () => {
      expect(validateTime("bad")).to.be.false;
    });
  });

  describe("execute", () => {
    const fakeChannel: unknown = {
      name: "test",
      type: "text",
      guild: {
        name: "test",
      },
    };
    const wrongChannel: unknown = {
      name: "wrong",
      type: "voice",
      guild: {
        name: "test",
      },
    };
    const channelCollection = new Collection<Snowflake, GuildChannel>();
    channelCollection.set(SnowflakeUtil.generate(), fakeChannel as GuildChannel);
    channelCollection.set(SnowflakeUtil.generate(), wrongChannel as GuildChannel);
    const replySpy = spy();
    const message: unknown = {
      reply: replySpy,
      channel: {
        type: "text",
        guild: {
          channels: {
            cache: channelCollection,
          },
        },
      },
    };
    const scheduleJobSpy = spy();

    const services = {
      scheduler: new Scheduler(),
      store: new Store(),
    };
    services.scheduler.has = fake.returns(false);
    services.scheduler.schedule = scheduleJobSpy;

    const resetSpies = () => {
      replySpy.resetHistory();
      scheduleJobSpy.resetHistory();
    };

    afterEach(() => resetSpies());

    it("should not allow incorrect day argument", async () => {
      const args: Record<string, string> = {
        name: "test",
        day: "Wrong",
        time: "01:20",
        channelStr: "test",
        message: "blah blah",
      };

      await schedule.execute({ message: message as Message, args, services } as ExtractedCommand);
      expect(replySpy.calledWith("Invalid day argument. Day must be spelt in full")).to.be.true;
    });

    it("should call scheduleJob with correct arguments", async () => {
      await services.store.set("jobs", []);
      const args: Record<string, string> = {
        name: "test",
        day: "Thursday",
        time: "01:20",
        channelStr: "test",
        message: "blah blah",
      };
      await schedule.execute({ message: message as Message, args, services } as ExtractedCommand);
      expect(scheduleJobSpy.firstCall.args[1]).to.be.eql({
        minute: "20",
        hour: "01",
        dayOfWeek: 4,
      });
    });

    it("should reject channel that doesn't exist in the guild", async () => {
      const args: Record<string, string> = {
        name: "test",
        day: "Thursday",
        time: "01:20",
        channelStr: "fake",
        message: "blah blah",
      };
      await schedule.execute({ message: message as Message, args, services } as ExtractedCommand);
      expect(replySpy.firstCall.args[0]).to.be.eql("Channel does not exist");
    });

    it("should reject guild channel that isn't a text channel", async () => {
      const args: Record<string, string> = {
        name: "test",
        day: "Thursday",
        time: "01:20",
        channelStr: "wrong",
        message: "blah blah",
      };
      await schedule.execute({ message: message as Message, args, services } as ExtractedCommand);
      expect(replySpy.firstCall.args[0]).to.be.eql("Not a text channel");
    });

    it("should reply when successful", async () => {
      await services.store.set("jobs", []);
      const args: Record<string, string> = {
        name: "test",
        day: "Thursday",
        time: "01:20",
        channelStr: "test",
        message: "blah blah",
      };
      await schedule.execute({ message: message as Message, args, services } as ExtractedCommand);
      expect(replySpy.firstCall.args[0]).to.be.eql("Schedule successful");
    });

    it("job array to be stored should contain new job generated", async () => {
      await services.store.set("jobs", []);
      const setSpy = spy();
      services.store.set = setSpy;
      const args: Record<string, string> = {
        name: "test",
        day: "Thursday",
        time: "01:20",
        channelStr: "test",
        message: "blah blah",
      };
      await schedule.execute({ message: message as Message, args, services } as MatchedCommand);
      const setArgs = setSpy.args[0];
      expect(setArgs).to.not.be.undefined;
      const setJobArray = setArgs[1] as StorableJob[];
      expect(!setJobArray.find((job) => job.name === "test" && job.message.content === "blah blah"))
        .to.be.false;
    });
  });
});
