import { assert, expect } from "chai";
import { Scheduler } from "../../src/services";
import { spy, fake, stub } from "sinon";
import {
  Client,
  TextChannel,
  GuildChannel,
  SnowflakeUtil,
  Collection,
  Snowflake,
  Guild,
} from "discord.js";
import { Job } from "node-schedule";

describe("scheduler service", () => {
  describe("schedule", () => {
    const scheduler = new Scheduler();
    const scheduleJobStub = stub(scheduler, "scheduleJob");
    const jobParams = {
      minute: "40",
      hour: "1",
      dayOfWeek: 1,
    };
    beforeEach(() => {
      scheduleJobStub.resetHistory();
    });
    it("should succesfully call scheduleJob", () => {
      const textChannel: unknown = {
        send: fake(),
        guild: { name: "test" },
      };
      scheduler.schedule("test", jobParams, "hello", textChannel as TextChannel);
      expect(scheduleJobStub.called).to.be.true;
    });
    it("callback should send message correctly", () => {
      const sendSpy = spy();
      const textChannel: unknown = {
        send: sendSpy,
        guild: { name: "test" },
      };
      scheduler.schedule("test", jobParams, "hello", textChannel as TextChannel);
      if (!scheduleJobStub.firstCall) {
        assert.fail("Did not call scheduleJob");
      } else {
        const anonCallback = scheduleJobStub.firstCall.args[1] as () => void;
        anonCallback();
        expect(sendSpy.firstCall.args[0]).to.be.eql("hello");
      }
    });
  });

  describe("cancel", () => {
    const scheduler = new Scheduler();
    it("should return false if job doesn't exist", () => {
      expect(scheduler.cancel("test", "test")).to.be.false;
    });
    it("should return true if job exists and call cancel", () => {
      const cancelSpy = spy();
      const job: unknown = { cancel: cancelSpy };
      scheduler.jobStore.set("testtest", job as Job);
      expect(scheduler.cancel("test", "test") && cancelSpy.called).to.be.true;
    });
  });
  describe("has", () => {
    const scheduler = new Scheduler();
    it("return false if no match", () => {
      expect(scheduler.has("test", "wrong")).to.be.false;
    });
    scheduler.jobStore.set("testtest", {} as Job);
    it("returns true when match found", () => {
      expect(scheduler.has("test", "test")).to.be.true;
    });
  });

  describe("scheduleFromStore", () => {
    const storableJob = {
      name: "test",
      params: {
        minute: "40",
        hour: "1",
        dayOfWeek: 1,
      },
      message: {
        guild: "testGuild",
        channel: "testChannel",
        content: "hello world",
      },
    };

    it("schedules the message and stores the job with correct args", () => {
      const channelCache = new Collection<Snowflake, GuildChannel>();
      const sendSpy = spy();
      const channel: unknown = {
        type: "text",
        id: "testChannel",
        send: sendSpy,
      };
      channelCache.set(SnowflakeUtil.generate(), channel as GuildChannel);

      const guildCache = new Collection<Snowflake, Guild>();
      guildCache.set(SnowflakeUtil.generate(), {
        channels: { cache: channelCache },
        id: "testGuild",
      } as Guild);
      const client: unknown = { guilds: { cache: guildCache } };

      const scheduler = new Scheduler();
      const scheduleJobStub = stub(scheduler, "scheduleJob");
      const jobStoreSetStub = stub(scheduler.jobStore, "set");
      scheduler.scheduleFromStore(storableJob, client as Client);

      expect(scheduleJobStub.firstCall.args[0]).to.be.eql(storableJob.params);
      expect(jobStoreSetStub.firstCall.args[0]).to.be.eql(
        storableJob.message.guild + storableJob.name
      );
      const callback = scheduleJobStub.firstCall.args[1] as () => void;
      callback();
      expect(sendSpy.firstCall.args[0]).to.be.eql("hello world");
    });

    it("throws error if no guild found", () => {
      const client: unknown = { guilds: { cache: { find: fake.returns(undefined) } } };
      const scheduler = new Scheduler();
      expect(() => scheduler.scheduleFromStore(storableJob, client as Client)).to.throw(
        "Guild not found"
      );
    });

    it("throws error if no channel found", () => {
      const guildFake = { channels: { cache: { find: fake.returns(undefined) } } };
      const guildFindFake = fake.returns(guildFake);
      const client: unknown = { guilds: { cache: { find: guildFindFake } } };
      const scheduler = new Scheduler();
      expect(() => scheduler.scheduleFromStore(storableJob, client as Client)).to.throw(
        "Channel not found"
      );
    });

    it("throws error if channel is not a text channel", () => {
      const channelFindFake = fake.returns({ type: "voice" } as GuildChannel);
      const guildFake = { channels: { cache: { find: channelFindFake } } };
      const guildFindFake = fake.returns(guildFake);
      const client: unknown = { guilds: { cache: { find: guildFindFake } } };
      const scheduler = new Scheduler();
      expect(() => scheduler.scheduleFromStore(storableJob, client as Client)).to.throw(
        "Channel found is not a text channel"
      );
    });
  });
});
