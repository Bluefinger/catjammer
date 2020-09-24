import Discord from "discord.js";
import * as commands from "./commands";

/* eslint-disable-next-line */
const { token, prefix } = require("../config.json") as { token: string; prefix: string };

const client = new Discord.Client();
const commandCollection = new Discord.Collection(Object.entries(commands));

client.once("ready", () => {
  console.log("ready");
});

client.on("message", (message) => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const arg = args.shift();
  if (arg) {
    const command = arg.toLowerCase();

    if (!commandCollection.has(command)) return;

    try {
      commandCollection.get(command)?.execute(message, args);
    } catch (error) {
      console.error(error);
      void message.reply("there was an error executing that command");
    }
  }
});

void client.login(token);
