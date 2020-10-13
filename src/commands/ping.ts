import type { Command } from "./type";

export const ping: Command = {
  name: "ping",
  description: "Ping!",
  definition: "ping",
  help: "use !ping",
  permission: 1,
  async execute({ message }) {
    await message.channel.send("Pong");
  },
};
