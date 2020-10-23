import type { Command } from "./type";
import type { StoredGifs } from "./gif";

export const g: Command = {
  name: "g",
  description: "command to use gifs",
  definition: "g :name",
  help: "use !g <name>\n<name> name of gif stored",
  async execute({ message, args, services }): Promise<void> {
    const { name } = args;
    const gifs = await services.store.get<StoredGifs>(`gifs::${message.guild.id}`);
    if (!gifs) {
      //it is possible for a user to use this command with no commands having been set so this shouldn't be an error
      return;
    }
    const result = gifs.find(([gifName]) => gifName === name);
    if (result) {
      await message.channel.send(result[1]);
    }
    //bot will not respond to user if gif not found
  },
};
