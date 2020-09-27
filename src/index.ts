import { Client } from "discord.js";
import * as commands from "./commands";
import { Config, createMessageStream, handleCommand } from "./handler";
import { createCommandMatcher } from "./matcher/createMatcher";

/* eslint-disable-next-line */
const config = require("../config.json") as Config;

const client = new Client();
const commandMatcher = createCommandMatcher(config.prefix, commands);

const eventStream = createMessageStream(config, client, commandMatcher);

eventStream.subscribe({
  next: handleCommand,
});

client.login(config.token).catch(console.error);

process.on("beforeExit", () => client.destroy());
