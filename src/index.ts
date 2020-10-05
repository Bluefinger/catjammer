import { readFileSync, createWriteStream } from "fs";
import { Client } from "discord.js";
import { commands } from "./commands";
import { Config, createMessageStream, handleCommand } from "./handler";
import { createCommandMatcher } from "./matcher/createMatcher";
import { Store, Logger, Scheduler } from "./services";

const config = JSON.parse(readFileSync("./config.json", "utf-8")) as Config;

const client = new Client();
const services = {
  store: new Store({
    uri: "sqlite://catjammer.sqlite",
    busyTimeout: 10000,
  }),
  log: new Logger({
    stdout: process.stdout,
    stderr: createWriteStream("./error.log"),
  }),
  scheduler: new Scheduler(client),
};

services.store.onError((err) => services.log.error(err));

const eventStream = createMessageStream(
  config,
  client,
  createCommandMatcher(config, commands, services)
);

client.once("ready", () => services.log.info("CatJammer is ready"));

const eventSubscription = eventStream.subscribe({
  next: handleCommand,
});

client.login(config.token).catch((err) => services.log.error(err));

process.on("SIGINT", () => {
  eventSubscription.unsubscribe();
  client.destroy();
  services.log.info("CatJammer closing cleanly");
});
