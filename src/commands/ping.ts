import { Message } from "discord.js";
import type { Command } from "./type";

export const ping: Command = {
  name: "ping",
  description: "Ping!",
  definition: "ping",
  async execute(message: Message): Promise<void> {
    await message.channel.send("Pong");
  },
};
