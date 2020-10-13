import { expect } from "chai";
import { Scheduler } from "../../src/services";
import { spy, fake } from "sinon";
import { Client, TextChannel, GuildChannel } from "discord.js";
import { Job } from "node-schedule";

describe("scheduler service", () => {
  describe("schedule", () => {
    const scheduler = new Scheduler();
    const scheduleJobSpy = spy();
    scheduler.scheduleJob = scheduleJobSpy;
    const jobParams = {
      minute: "40",
      hour: "1",
      dayOfWeek: 1,
    };
    beforeEach(() => {
      scheduleJobSpy.resetHistory();
    });
    it("should succesfully call scheduleJob", () => {
      const textChannel: unknown = {
        send: fake(),
        guild: { name: "test" },
      };
      scheduler.schedule("test", jobParams, "hello", textChannel as TextChannel);
      expect(scheduleJobSpy.called).to.be.true;
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
      const channelFindFake = fake.returns({ type: "text" } as GuildChannel);
      const guildFake = { channels: { cache: { find: channelFindFake } } };
      const guildFindFake = fake.returns(guildFake);
      const client: unknown = { guilds: { cache: { find: guildFindFake } } };
      const scheduler = new Scheduler();
      const scheduleJobSpy = spy();
      const jobStoreSetSpy = spy();
      scheduler.jobStore.set = jobStoreSetSpy;
      scheduler.scheduleJob = scheduleJobSpy;
      scheduler.scheduleFromStore(storableJob, client as Client);
      expect(scheduleJobSpy.firstCall.args[0]).to.be.eql(storableJob.params);
      expect(jobStoreSetSpy.firstCall.args[0]).to.be.eql(
        storableJob.message.guild + storableJob.name
      );
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
