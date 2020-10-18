import { Services } from "../index.types";
import type { Command } from "./type";

const enum GreetingModifier {
  SET = "set",
  REMOVE = "remove",
}

const setGreeting = async ({ store }: Services, guildId: string, greetMsg: string) => {
  await store.set(`greeting::${guildId}`, greetMsg);
  return "Greeting set";
};

const removeGreeting = async ({ store }: Services, guildId: string) => {
  if (await store.delete(`greeting::${guildId}`)) {
    return "Greeting removed";
  } else {
    return "No greeting to remove";
  }
};

export const greeting: Command = {
  name: "greeting",
  description: "Set the greeting message for the bot to DM new guildies",
  definition: "greeting :modifier*",
  help: "!greeting <set/remove> message here",
  permission: 1,
  async execute({ message, services, args }) {
    const { modifier, message: greetMsg } = args;
    if (!message.guild) {
      throw new Error("Command must be used in a guild");
    }
    let msg: string;
    switch (modifier) {
      case GreetingModifier.SET:
        msg = await setGreeting(services, message.guild.id, greetMsg.trim());
        break;
      case GreetingModifier.REMOVE:
        msg = await removeGreeting(services, message.guild.id);
        break;
      default:
        msg = "Can only set or remove greetings";
    }
    await message.channel.send(msg);
  },
};
