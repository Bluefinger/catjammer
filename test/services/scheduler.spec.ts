import { expect } from "chai";
import { Scheduler } from "../../src/services";
import { spy, fake } from "sinon";
import { Client, TextChannel, GuildChannel } from "discord.js";

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
      scheduler.schedule(jobParams, { content: "hello" }, textChannel as TextChannel);
      expect(scheduleJobSpy.called).to.be.true;
    });
    it("should successfully resolve when not given a TextChannel", () => {
      const messageInfo = {
        guild: "guild",
        channel: "test",
        content: "hello",
      };
      scheduler.schedule(jobParams, messageInfo);
      expect(scheduleJobSpy.called).to.be.true;
    });
  });
});
