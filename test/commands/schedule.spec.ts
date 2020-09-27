import { expect } from "chai";
import * as scheduler from "node-schedule";
import { schedule } from "../../src/commands/schedule";
import { validate, Channel } from "../../src/commands/helpers/scheduleValidators";
import { fake, stub, spy } from "sinon";
import { Message, Collection, Snowflake, SnowflakeUtil, GuildChannel } from "discord.js";

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
    const channelCollection = new Collection<Snowflake, GuildChannel>();
    channelCollection.set(SnowflakeUtil.generate(), fakeChannel as GuildChannel);
    const fakeReply = spy();
    const message: unknown = {
      reply: fakeReply,
      channel: {
        guild: {
          channels: {
            cache: channelCollection,
          },
        },
      },
    };
    const scheduleJobFake = fake();

    stub(scheduler, "scheduleJob").callsFake(scheduleJobFake);

    it("should not allow incorrect day argument", async () => {
      const args: Record<string, string> = {
        day: "Wrong",
        time: "01:20",
        channelStr: "test",
        message: "blah blah",
      };
      await schedule.execute(message as Message, args);
      expect(fakeReply.calledWith("Invalid day argument. Day must be spelt in full")).to.be.true;
    });

    it("should call schedule with correct arguments", async () => {
      const args: Record<string, string> = {
        day: "Thursday",
        time: "01:20",
        channelStr: "test",
        message: "blah blah",
      };
      await schedule.execute(message as Message, args);
      expect(scheduleJobFake.called).to.be.true;
    });

    it("should reply when successful", async () => {
      const args: Record<string, string> = {
        day: "Thursday",
        time: "01:20",
        channelStr: "test",
        message: "blah blah",
      };
      await schedule.execute(message as Message, args);
      expect(fakeReply.calledWith("Schedule successful")).to.be.true;
    });
  });
});
