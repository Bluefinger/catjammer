import { assert, expect } from "chai";
import { validateDay, validateTime } from "../../src/commands/helpers/scheduleValidators";
import type { ExtractedCommand } from "../../src/matcher";
import type { Services, GuildMessage } from "../../src/index.types";
import { Job } from "node-schedule";
import { spy } from "sinon";
import {
  Message,
  Collection,
  Snowflake,
  SnowflakeUtil,
  GuildChannel,
  Client,
  Guild,
} from "discord.js";
import { Store } from "../../src/services/store";
import { schedule } from "../../src/commands/schedule";
import { Scheduler, StorableJob } from "../../src/services";

describe("schedule command", () => {
  describe("init", () => {
    const cache = new Collection<Snowflake, Guild>();
    cache.set(SnowflakeUtil.generate(), { id: "id" } as Guild);
    cache.set(SnowflakeUtil.generate(), { id: "1111" } as Guild);
    const client: unknown = {
      guilds: {
        cache: cache,
      },
    };
    it("set jobs array if none already exists", async () => {
      const services = {
        store: new Store(),
        scheduler: new Scheduler(),
      };
      const setSpy = spy();
      services.store.set = setSpy;
      await schedule.init(client as Client, services as Services);
      expect(setSpy.called).to.be.true;
    });

    it("call scheduleFromStore for each job in array", async () => {
      const services = {
        store: new Store(),
        scheduler: new Scheduler(),
      };
      const scheduleFromStoreSpy = spy();
      services.scheduler.scheduleFromStore = scheduleFromStoreSpy;
      await services.store.set("jobs::id", [{} as StorableJob, {} as StorableJob]);
      await schedule.init(client as Client, services as Services);
      expect(scheduleFromStoreSpy.callCount).to.be.eql(2);
    });

    it("call scheduleFromStore for each job in array", async () => {
      const services = {
        store: new Store(),
        scheduler: new Scheduler(),
      };
      const scheduleFromStoreSpy = spy();
      services.scheduler.scheduleFromStore = scheduleFromStoreSpy;
      await services.store.set("jobs::id", [{} as StorableJob, {} as StorableJob]);
      await services.store.set("jobs::1111", [{} as StorableJob]);
      await schedule.init(client as Client, services as Services);
      expect(scheduleFromStoreSpy.callCount).to.be.eql(3);
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
      id: "1234",
      guild: {
        id: "1111",
      },
    };
    const wrongChannel: unknown = {
      name: "wrong",
      type: "voice",
      id: "1235",
      guild: {
        id: "1111",
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
          id: "1111",
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
        channel: "<#1234>",
        message: "blah blah",
      };

      await schedule.execute({
        message: message as GuildMessage,
        args,
        services,
      } as ExtractedCommand);
      expect(replySpy.calledWith("Invalid day argument. Day must be spelt in full")).to.be.true;
    });

    it("reject invalid time argument", async () => {
      const args: Record<string, string> = {
        name: "test",
        day: "Monday",
        time: "wrong",
        channel: "<#1234>",
        message: "blah blah",
      };
      await schedule.execute({
        message: message as GuildMessage,
        args,
        services,
      } as ExtractedCommand);
      expect(replySpy.calledWith("Invalid time argument. Must use 24 hour time seperated by :")).to
        .be.true;
    });

    it("reject when used in channel outside a guild", async () => {
      const args: Record<string, string> = {
        name: "test",
        day: "Monday",
        time: "00:02",
        channel: "<#1234>",
        message: "blah blah",
      };
      const dmMessage: unknown = {
        reply: replySpy,
        channel: {
          type: "DM",
        },
      };
      await schedule.execute({
        message: dmMessage as GuildMessage,
        args,
        services,
      } as ExtractedCommand);
      expect(replySpy.calledWith("Can only be used in a guild channel")).to.be.true;
    });

    it("rejects if name is taken", async () => {
      const args: Record<string, string> = {
        name: "taken",
        day: "Monday",
        time: "00:11",
        channel: "<#1234>",
        message: "blah blah",
      };
      services.scheduler.jobStore.set("1111taken", {} as Job);
      await schedule.execute({
        message: message as GuildMessage,
        args,
        services,
      } as ExtractedCommand);
      expect(replySpy.calledWith("name already in use")).to.be.true;
    });

    it("should call scheduleJob with correct arguments", async () => {
      await services.store.set("jobs::1111", []);
      const args: Record<string, string> = {
        name: "test",
        day: "Thursday",
        time: "01:20",
        channel: "<#1234>",
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
        channel: "<#1233>",
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
        channel: "<#1235>",
        message: "blah blah",
      };
      await schedule.execute({ message: message as Message, args, services } as ExtractedCommand);
      expect(replySpy.firstCall.args[0]).to.be.eql("Not a text channel");
    });

    it("throw error when no StorableJob array in store", async () => {
      await services.store.delete("jobs::1111");
      const args: Record<string, string> = {
        name: "test",
        day: "Thursday",
        time: "01:20",
        channel: "<#1234>",
        message: "blah blah",
      };
      try {
        await schedule.execute({ message: message as Message, args, services } as ExtractedCommand);
        assert.fail("Error not thrown");
      } catch (err) {
        const error = err as Error;
        expect(error.message).to.be.eql("Failed to load jobs from store");
      }
    });

    it("should reply when successful", async () => {
      await services.store.set("jobs::1111", []);
      const args: Record<string, string> = {
        name: "test",
        day: "Thursday",
        time: "01:20",
        channel: "<#1234>",
        message: "blah blah",
      };
      await schedule.execute({ message: message as Message, args, services } as ExtractedCommand);
      expect(replySpy.firstCall.args[0]).to.be.eql("Schedule successful");
    });

    it("job array to be stored should contain new job generated", async () => {
      await services.store.set("jobs::1111", []);
      const setSpy = spy();
      services.store.set = setSpy;
      const args: Record<string, string> = {
        name: "test",
        day: "Thursday",
        time: "01:20",
        channel: "<#1234>",
        message: "blah blah",
      };
      await schedule.execute({ message: message as Message, args, services } as ExtractedCommand);
      const setArgs = setSpy.args[0];
      expect(setArgs).to.not.be.undefined;
      const setJobArray = setArgs[1] as StorableJob[];
      expect(!setJobArray.find((job) => job.name === "test" && job.message.content === "blah blah"))
        .to.be.false;
    });
  });
});
