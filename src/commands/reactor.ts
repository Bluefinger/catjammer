import { GuildMessage } from "../index.types";
import type { ExtractedCommand } from "../matcher";
import { getTextChannel } from "./helpers/channels";
import { extractId } from "./helpers/mentions";
import type { CommandWithInit } from "./type";

const enum ReactorActions {
  SET = "set",
  UPDATE = "update",
  CLEAR = "clear",
}

type ReactorRecord = [string, string];

const actions: Record<ReactorActions, (payload: ExtractedCommand) => Promise<void>> = {
  set: async ({ message, services, args }) => {
    const key = `reactor::${message.guild.id}`;
    const reactorMsg = await services.store.get<ReactorRecord>(key);
    if (!reactorMsg) {
      const channelId = extractId(args.channel);
      try {
        const room = getTextChannel(message, channelId);
        const reply = await room.send(services.roleReactor.list(args.message).trimLeft());
        await services.store.set<ReactorRecord>(key, [channelId, reply.id]);
        await services.roleReactor.setup(reply as GuildMessage);
        services.roleReactor.add(reply.id);
        await message.channel.send("Reactor message set");
      } catch (e) {
        services.log.error(e);
        await message.reply("Invalid set");
      }
      return;
    }
    await message.reply("A reactor message already exists, try doing an `update` instead.");
  },

  update: async ({ message, services, args }) => {
    const key = `reactor::${message.guild.id}`;
    const reactorMsg = await services.store.get<ReactorRecord>(key);
    if (reactorMsg) {
      const [channelId, replyId] = reactorMsg;
      try {
        const room = getTextChannel(message, channelId);
        const messages = await room.messages.fetch();
        const msg = messages.get(replyId);
        if (msg) {
          await msg.edit(services.roleReactor.list(args.message).trimLeft());
          await message.channel.send("Reactor message updated");
        } else {
          throw new Error("Reactor/Store desync. An id is stored, but no message exists");
        }
      } catch (e) {
        services.log.error(e);
        await message.reply("Invalid update");
      }
      return;
    }
    await message.reply("There is no reactor message to edit");
  },

  clear: async ({ message, services }) => {
    const key = `reactor::${message.guild.id}`;
    const reactorMsg = await services.store.get<ReactorRecord>(key);
    if (reactorMsg) {
      const [channelId, replyId] = reactorMsg;
      try {
        const room = getTextChannel(message, channelId);
        const messages = await room.messages.fetch();
        const msg = messages.get(replyId);
        if (msg) {
          await room.messages.delete(msg);
          await services.store.delete(key);
          services.roleReactor.remove(replyId);
          await message.channel.send("Reactor message deleted");
        } else {
          throw new Error("Reactor/Store desync. An id is stored, but no message exists");
        }
      } catch (e) {
        services.log.error(e);
        await message.reply("Invalid clear");
      }
      return;
    }
    await message.reply("There is no reactor message to delete");
  },
};

const invalidAction = async ({ message }: ExtractedCommand) => {
  await message.reply("Invalid action");
};

export const reactor: CommandWithInit = {
  name: "reactor",
  description:
    "Creates a message that assigns roles automatically to users by listening to reactions on that message",
  definition: "reactor :action #channel*",
  help:
    "use !reactor set/update/clear #channel <post message here> to set the reactor message in the desired text channel",
  permission: 0,
  async init(client, services) {
    const loading = client.guilds.cache.map(async ({ id }) => {
      const msg = await services.store.get<ReactorRecord>(`reactor::${id}`);
      if (msg) {
        services.roleReactor.add(msg[1]);
      }
    });
    await Promise.all(loading);
  },
  execute(payload) {
    const action = actions[payload.args.action as ReactorActions] ?? invalidAction;
    return action(payload);
  },
};
