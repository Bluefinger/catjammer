import type { Command } from "./type";
import { emojis } from "../services/pollManager";
import { extractId } from "./helpers/mentions";
import { isTextChannel } from "./helpers/channels";

const mutExclRegEx = /^(Y|y|N|n)$/;

export const poll: Command = {
  name: "poll",
  description: "Create a poll in a specified channel with given choices",
  definition: "poll :name :duration :mutExcl #channelArg *",
  help: "use !ping",
  permission: 1,
  async execute({ message: command, services, args }) {
    const { mutExcl, duration, message, channelArg, name } = args;
    if (!mutExclRegEx.test(mutExcl)) {
      await command.reply("Invalid mutExcl param");
      return;
    }

    const mutExclBool = mutExcl === "Y" || mutExcl === "y" ? true : false;

    const parsedDuration = parseInt(duration, 10);
    if (isNaN(parsedDuration)) {
      await command.reply("Invalid duration param");
      return;
    }

    const choices = message.split(",");
    if (choices.length <= 1) {
      await command.reply("Not enough choices given");
      return;
    }
    if (choices.length > emojis.length) {
      await command.reply(`Limit of ${emojis.length} choices`);
      return;
    }

    const channelId = extractId(channelArg);

    const channel = command.guild.channels.cache.find(({ id }) => id === channelId);

    if (!channel) {
      await command.reply("Channel does not exist");
      return;
    }

    if (!isTextChannel(channel)) {
      await command.reply("Channel is not a text channel");
      return;
    }
    await services.pollManager.createPoll(channel, name, choices, mutExclBool, parsedDuration);
  },
};
