import type { Command } from "./type";

export const ping: Command = {
  name: "ping",
  description: "Ping!",
  definition: "ping",
  async execute({ message }) {
    await message.channel.send("Pong");
  },
};
