<<<<<<< HEAD
import { Client, Collection } from "discord.js";
=======
import { Collection, Client } from "discord.js";
>>>>>>> regex fix
import * as commands from "./commands";
import { createClientStream, handleCommand } from "./handler";

/* eslint-disable-next-line */
const config = require("../config.json") as { token: string; prefix: string };

const client = new Client();
const commandCollection = new Collection(Object.entries(commands));

const eventStream = createClientStream(config, client, commandCollection);

eventStream.subscribe({
  next: handleCommand(commandCollection),
});

client.login(config.token).then(console.log).catch(console.error);
