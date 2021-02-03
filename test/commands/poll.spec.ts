import { expect } from "chai";
import { poll } from "../../src/commands/poll";
import { spy } from "sinon";
import { emojis } from "../../src/services";
import { ExtractedCommand } from "../../src/matcher/types";
import { GuildChannel, SnowflakeUtil, Collection, Snowflake } from "discord.js";

const replySpy = spy();
const createSpy = spy();

const guild: unknown = { type: "text" };

const services: unknown = { pollManager: { createPoll: createSpy } };

const testCases: {
  args: Record<string, string>;
  desc: string;
  reply: [boolean, string | null];
  guild: GuildChannel | null;
  createCall: boolean;
}[] = [
  {
    args: {
      mutExcl: "x",
      duration: "10",
      message: "hi",
      channelArg: "#test",
      name: "test",
    },
    desc: "rejects invalid mutExcl param",
    reply: [true, "Invalid mutExcl param"],
    guild: guild as GuildChannel,
    createCall: false,
  },
  {
    args: {
      mutExcl: "y",
      duration: "wrong",
      message: "hi",
      channelArg: "#test",
      name: "test",
    },
    desc: "rejects invalid duration param",
    reply: [true, "Invalid duration param"],
    guild: guild as GuildChannel,
    createCall: false,
  },
  {
    args: {
      mutExcl: "y",
      duration: "10",
      message: "hi",
      channelArg: "#test",
      name: "test",
    },
    desc: "rejects too few choices given",
    reply: [true, "Not enough choices given"],
    guild: guild as GuildChannel,
    createCall: false,
  },
  {
    args: {
      mutExcl: "y",
      duration: "10",
      message: "1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16",
      channelArg: "#test",
      name: "test",
    },
    desc: "rejects too many choices given",
    reply: [true, `Limit of ${emojis.length} choices`],
    guild: guild as GuildChannel,
    createCall: false,
  },
  {
    args: {
      mutExcl: "y",
      duration: "10",
      message: "1,2,3,4,5,6",
      channelArg: "#test",
      name: "test",
    },
    desc: "rejects null guild",
    reply: [true, "Channel does not exist"],
    guild: null,
    createCall: false,
  },
  {
    args: {
      mutExcl: "y",
      duration: "10",
      message: "1,2,3,4,5,6",
      channelArg: "<#1234>",
      name: "test",
    },
    desc: "successfully calls createPoll when good args provided",
    reply: [false, null],
    guild: guild as GuildChannel,
    createCall: true,
  },
  {
    args: {
      mutExcl: "n",
      duration: "10",
      message: "1,2,3,4,5,6",
      channelArg: "#test",
      name: "test",
    },
    desc: "successfully calls createPoll when good args provided and not mutExcl",
    reply: [false, null],
    guild: guild as GuildChannel,
    createCall: true,
  },
  {
    args: {
      mutExcl: "y",
      duration: "10",
      message: "1,2,3,4,5,6",
      channelArg: "#test",
      name: "test",
    },
    desc: "rejects not text channel",
    reply: [true, "Channel is not a text channel"],
    guild: { type: "voice" } as GuildChannel,
    createCall: false,
  },
];

describe("poll command", () => {
  beforeEach(() => {
    replySpy.resetHistory();
    createSpy.resetHistory();
  });
  for (const testCase of testCases) {
    const { args, desc, reply, guild, createCall } = testCase;
    it(desc, async () => {
      const find = () => guild;
      const message: unknown = { reply: replySpy, guild: { channels: { cache: { find: find } } } };
      await poll.execute({ args, services, message } as ExtractedCommand);
      expect(replySpy.called).to.eql(reply[0]);
      if (reply[0]) {
        expect(replySpy.calledWith(reply[1])).to.be.true;
      }
      expect(createSpy.called).to.eql(createCall);
    });
  }
  it("test find function", async () => {
    const { args } = testCases[5];
    const cache = new Collection<Snowflake, GuildChannel>();
    cache.set(SnowflakeUtil.generate(), { id: "1234", type: "text" } as GuildChannel);
    const message: unknown = { reply: replySpy, guild: { channels: { cache } } };
    await poll.execute({ args, services, message } as ExtractedCommand);
    expect(createSpy.called).to.be.true;
  });
});
