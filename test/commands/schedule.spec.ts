import { expect } from "chai";
import { validate, Channel } from "../../src/commands/helpers/scheduleValidators";
import { spy }from "sinon";
import rewiremock from 'rewiremock';
import {
  Message,
  Collection,
  Snowflake,
  SnowflakeUtil,
  GuildChannel,
} from "discord.js";

const scheduleJobSpy = spy();

rewiremock('node-schedule').with({
  scheduleJob: scheduleJobSpy,
});
rewiremock.enable();

import { schedule } from "../../src/commands/schedule";

describe("schedule command", () => {
  describe("validation", () => {
    it("should reject bad day argument", () => {
      expect(validate.day("Wrong")).to.be.false;
    });

    it("should accept good day argument", () => {
      expect(validate.day("Thursday")).to.be.true;
    });

    it("should accept good time argument", () => {
      expect(validate.time("01:20")).to.be.true;
    });

    it("should reject bad time argument", () => {
      expect(validate.time("bad")).to.be.false;
    });

    it("should reject channel not of type text", () => {
      const channel: unknown = {
        type: "DM",
      };
      expect(validate.channel(channel as Channel, "text")).to.be.false;
    });

    it("should accept channel of type text", () => {
      const channel: unknown = {
        type: "text",
      };
      expect(validate.channel(channel as Channel, "text")).to.be.true;
    });
  });

  describe("execute", () => {
    const fakeChannel: unknown = {
      name: "test",
      type: "text",
    };
    const wrongChannel: unknown = {
      name: "wrong",
      type: "voice",
    }
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

    const resetSpies = () => {
      replySpy.resetHistory();
      scheduleJobSpy.resetHistory();
    };

    afterEach(() => resetSpies());

    it("should not allow incorrect day argument", async () => {
      const args: Record<string, string> = {
        day: "Wrong",
        time: "01:20",
        channelStr: "test",
        message: "blah blah",
      };
      await schedule.execute(message as Message, args);
      expect(replySpy.calledWith("Invalid day argument. Day must be spelt in full")).to.be.true;
    });

    it("should call scheduleJob with correct arguments", async () => {
      const args: Record<string, string> = {
        day: "Thursday",
        time: "01:20",
        channelStr: "test",
        message: "blah blah",
      };
      await schedule.execute(message as Message, args);
      expect(scheduleJobSpy.firstCall.args[0]).to.be.eql( {
        minute: "20",
        hour: "01",
        dayOfWeek: 4,
      });
    });

    it("should reject channel that doesn't exist in the guild", async () => {
      const args: Record<string, string> = {
        day: "Thursday",
        time: "01:20",
        channelStr: "fake",
        message: "blah blah",
      };
      await schedule.execute(message as Message, args);
      expect(replySpy.firstCall.args[0]).to.be.eql("Channel does not exist");
    });

    it("should reject guild channel that isn't a text channel", async () => {
      const args: Record<string, string> = {
        day: "Thursday",
        time: "01:20",
        channelStr: "wrong",
        message: "blah blah",
      };
      await schedule.execute(message as Message, args);
      expect(replySpy.firstCall.args[0]).to.be.eql("Not a text channel");
    });

    it("should reply when successful", async () => {
      const args: Record<string, string> = {
        day: "Thursday",
        time: "01:20",
        channelStr: "test",
        message: "blah blah",
      };
      await schedule.execute(message as Message, args);
      expect(replySpy.firstCall.args[0]).to.be.eql("Schedule successful");
    });

  });
});
