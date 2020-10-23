import { Command } from "./type";
import { GuildMessage, Services } from "../index.types";

export type StoredGifs = [string, string][];

const addGif = async (name: string, gif: string, { store }: Services, command: GuildMessage) => {
  const storeKey = `gifs::${command.guild.id}`;
  const gifs = (await store.get<StoredGifs>(storeKey)) || [];
  if (gifs.some(([gifName]) => gifName === name)) {
    await command.reply("Name already in use");
  } else {
    await store.set(storeKey, [...gifs, [name, gif]]);
    await command.reply("Gif successfully set");
  }
};

const removeGif = async (name: string, { store }: Services, command: GuildMessage) => {
  const storeKey = `gifs::${command.guild.id}`;
  const gifs = await store.get<StoredGifs>(storeKey);

  if (!gifs) {
    await command.reply("No gifs set");
    return;
  }

  const newGifs = gifs.filter(([gifName]) => name !== gifName);

  if (newGifs.length === gifs.length) {
    await command.reply("Gif not found");
    return;
  }

  await store.set(storeKey, newGifs);

  await command.reply(`${name} has been removed.`);
};

export const gif: Command = {
  name: "gif",
  permission: 1,
  description: "Add or remove gifs or images to be used with g command",
  definition: "gif :action *",
  help: "",
  async execute({ message: command, args, services }): Promise<void> {
    const { action, message } = args;
    //this is done to hack an optional argument to avoid two seperate commands for add/remove
    const [name, gif] = message.split(" ");

    switch (action) {
      case "add":
        if (!gif) {
          await command.reply("No gif argument");
          return;
        }
        await addGif(name, gif, services, command);
        break;
      case "remove":
        await removeGif(name, services, command);
        break;
      default:
        await command.reply("Invalid action");
    }
  },
};
