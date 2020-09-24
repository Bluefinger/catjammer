import Discord from "discord.js";
import type { Command } from "./type";

export const ping: Command = {
  name: "ping",
  description: "Ping!",
  execute(message: Discord.Message): void {
    void message.channel.send("Pong");
  },
};
