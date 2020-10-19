import type { CommandWithInit } from "./type";
import type { StorableJob } from "../services/schedule";
import { validateDay, validateTime, days, isTextChannel } from "./helpers/scheduleValidators";
import { extractId } from "./helpers/mentions";

export const schedule: CommandWithInit = {
  init: async (client, services) => {
    const guildPromises = client.guilds.cache.array().map(async ({ id }) => {
      const jobs = await services.store.get<StorableJob[]>(`jobs::${id}`);
      if (!jobs) {
        await services.store.set(`jobs::${id}`, []);
      } else {
        jobs.forEach((job) => {
          services.scheduler.scheduleFromStore(job, client);
        });
      }
    });
    await Promise.all(guildPromises);
  },
  name: "schedule",
  permission: 1,
  description: "Schedule reoccuring messages",
  definition: "schedule :name :day :time #channel *",
  help:
    "use !schedule <name> <day> <time> <#channel> <message>\n<name> is used for cancelling the message, must not have spaces in it\n<day> should be spelt with full name and capital first letter\n<time> ##:## 24 hour format\n<channel>name as appears of channel\n<message>rest of command should just be your message",
  async execute({ message: command, args, services }): Promise<void> {
    const { name, day, time, channel, message } = args;
    if (!validateDay(day)) {
      await command.reply("Invalid day argument. Day must be spelt in full");
      return;
    }

    if (!validateTime(time)) {
      await command.reply("Invalid time argument. Must use 24 hour time seperated by :");
      return;
    }

    if (!isTextChannel(command.channel)) {
      await command.reply("Can only be used in a guild channel");
      return;
    }

    const channelId = extractId(channel);

    const { guild } = command.channel;
    const targetChannel = guild.channels.cache.find(({ id }) => id === channelId);

    if (!targetChannel) {
      await command.reply(`Channel does not exist`);
      return;
    }

    if (!isTextChannel(targetChannel)) {
      await command.reply(`Not a text channel`);
      return;
    }

    if (services.scheduler.has(name, targetChannel.guild.id)) {
      await command.reply("name already in use");
      return;
    }

    const [hour, minute] = time.split(":");

    const params = { minute, hour, dayOfWeek: days[day] };

    services.scheduler.schedule(name, params, message, targetChannel);

    const jobs = await services.store.get<StorableJob[]>(`jobs::${guild.id}`);
    if (!jobs) {
      throw new Error("Failed to load jobs from store");
    }
    const storableJob: StorableJob = {
      name,
      params,
      message: { guild: targetChannel.guild.id, channel: targetChannel.id, content: message },
    };
    jobs.push(storableJob);
    await services.store.set(`jobs::${guild.id}`, jobs);
    await command.reply("Schedule successful");
  },
};
