import { expect } from "chai";
import { Scheduler } from "../../src/services";
import { spy, fake } from "sinon";
import { Client, TextChannel, GuildChannel } from "discord.js";
import { Job } from "node-schedule";

describe("scheduler service", () => {
  describe("schedule", () => {
    const channelFindFake = fake.returns({ type: "text" } as GuildChannel);
    const guildFake = { channels: { cache: { find: channelFindFake } } };
    const guildFindFake = fake.returns(guildFake);
    const client: unknown = { guilds: { cache: { find: guildFindFake } } };
    const scheduler = new Scheduler(client as Client);
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
      };
      scheduler.schedule("test", jobParams, { content: "hello" }, textChannel as TextChannel);
      expect(scheduleJobSpy.called).to.be.true;
    });
    it("should successfully resolve when not given a TextChannel", () => {
      const messageInfo = {
        guild: "guild",
        channel: "test",
        content: "hello",
      };
      scheduler.schedule("test", jobParams, messageInfo);
      expect(scheduleJobSpy.called).to.be.true;
    });
  });

  describe("cancel", () => {
    const scheduler = new Scheduler({} as Client);
    it("should return false if job doesn't exist", () => {
      expect(scheduler.cancel("test")).to.be.false;
    });
    it("should return true if job exists and call cancel", () => {
      const cancelSpy = spy();
      const job: unknown = { cancel: cancelSpy };
      scheduler.jobStore.set("test", job as Job);
      expect(scheduler.cancel("test") && cancelSpy.called).to.be.true;
    });
  });
  describe("has", () => {
    const scheduler = new Scheduler({} as Client);
    it("return false if no match", () => {
      expect(scheduler.has("tset")).to.be.false;
    });
    scheduler.jobStore.set("test", {} as Job);
    it("returns true when match found", () => {
      expect(scheduler.has("test")).to.be.true;
    });
  });
});