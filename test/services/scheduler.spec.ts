import { assert, expect } from "chai";
import { Scheduler } from "../../src/services";
import { spy, fake, stub, useFakeTimers } from "sinon";
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
      deleteTime: 10,
    };
    const clock = useFakeTimers();
    beforeEach(() => {
      scheduleJobStub.resetHistory();
    });
    it("should succesfully call scheduleJob", () => {
      const textChannel: unknown = {
        send: fake(),
        guild: { name: "test" },
      };
      scheduler.schedule("test", jobParams, "hello", textChannel as TextChannel, 0);
      expect(scheduleJobStub.called).to.be.true;
    });
    it("callback should send message correctly and delete", async () => {
      const deleteFake = fake();
      const message = {
        delete: deleteFake,
      };
      const sendSpy = fake.returns(message);
      const textChannel: unknown = {
        send: sendSpy,
        guild: { name: "test" },
      };
      scheduler.schedule("test", jobParams, "hello", textChannel as TextChannel, 10);
      if (!scheduleJobStub.firstCall) {
        assert.fail("Did not call scheduleJob");
      } else {
        const anonCallback = scheduleJobStub.firstCall.args[1] as () => Promise<void>;
        await anonCallback();
        clock.runAll();
        expect(sendSpy.firstCall.args[0]).to.be.eql("hello");
        expect(deleteFake.called).to.be.true;
        clock.uninstall();
      }
    });
    it("callback should send message correctly and not delete", async () => {
      const deleteFake = fake();
      const message = {
        delete: deleteFake,
      };
      const sendSpy = fake.returns(message);
      const textChannel: unknown = {
        send: sendSpy,
        guild: { name: "test" },
      };
      scheduler.schedule("test", jobParams, "hello", textChannel as TextChannel, 0);
      if (!scheduleJobStub.firstCall) {
        assert.fail("Did not call scheduleJob");
      } else {
        const anonCallback = scheduleJobStub.firstCall.args[1] as () => Promise<void>;
        await anonCallback();
        clock.runAll();
        expect(sendSpy.firstCall.args[0]).to.be.eql("hello");
        expect(deleteFake.called).to.be.false;
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
      deleteTime: 10,
      message: {
        guild: "testGuild",
        channel: "testChannel",
        content: "hello world",
      },
    };

    it("schedules the message and stores the job with correct args and delete message", async () => {
      const channelCache = new Collection<Snowflake, GuildChannel>();
      const deleteSpy = fake();
      const message = {
        delete: deleteSpy,
      };
      const sendSpy = fake.returns(message);
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

      const clock = useFakeTimers();

      scheduler.scheduleFromStore(storableJob, client as Client);

      expect(scheduleJobStub.firstCall.args[0]).to.be.eql(storableJob.params);
      expect(jobStoreSetStub.firstCall.args[0]).to.be.eql(
        storableJob.message.guild + storableJob.name
      );
      const callback = scheduleJobStub.firstCall.args[1] as () => Promise<void>;
      await callback();
      clock.runAll();
      expect(sendSpy.firstCall.args[0]).to.be.eql("hello world");
      expect(deleteSpy.called).to.be.true;
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

    it("schedules the message and stores the job with correct args and not delete message", async () => {
      const storableJobNoDel = {
        name: "test",
        params: {
          minute: "40",
          hour: "1",
          dayOfWeek: 1,
        },
        deleteTime: 0,
        message: {
          guild: "testGuild",
          channel: "testChannel",
          content: "hello world",
        },
      };
      const channelCache = new Collection<Snowflake, GuildChannel>();
      const deleteSpy = fake();
      const message = {
        delete: deleteSpy,
      };
      const sendSpy = fake.returns(message);
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

      const clock = useFakeTimers();

      scheduler.scheduleFromStore(storableJobNoDel, client as Client);

      expect(scheduleJobStub.firstCall.args[0]).to.be.eql(storableJob.params);
      expect(jobStoreSetStub.firstCall.args[0]).to.be.eql(
        storableJob.message.guild + storableJob.name
      );
      const callback = scheduleJobStub.firstCall.args[1] as () => Promise<void>;
      await callback();
      clock.runAll();
      expect(sendSpy.firstCall.args[0]).to.be.eql("hello world");
      expect(deleteSpy.called).to.be.false;
    });
  });
});
