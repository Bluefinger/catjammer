import { readFileSync } from "fs";
import { Client } from "discord.js";
import { commands } from "./commands";
import { Config, createMessageStream, handleCommand } from "./handler";
import { createCommandMatcher } from "./matcher/createMatcher";

const config = JSON.parse(readFileSync("./config.json", "utf-8")) as Config;
const client = new Client();
const eventStream = createMessageStream(config, client, createCommandMatcher(config, commands));

eventStream.subscribe({
  next: handleCommand,
});

client.login(config.token).catch(console.error);

process.on("beforeExit", () => client.destroy());
