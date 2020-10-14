import type { CommandWithInit } from "./commands/type";
import type { Config, Services } from "./index.types";
import { readFileSync, createWriteStream } from "fs";
import { Client } from "discord.js";
import { commands } from "./commands";
import { handleCommand } from "./handler";
import { createMessageStream } from "./streams";
import { Store, Logger, Scheduler, Permissions } from "./services";

const config = JSON.parse(readFileSync("./config.json", "utf-8")) as Config;

const client = new Client();
const services: Services = {
  store: new Store({
    uri: "sqlite://catjammer.sqlite",
    busyTimeout: 10000,
  }),
  log: new Logger({
    stdout: process.stdout,
    stderr: createWriteStream("./error.log", { flags: "a" }),
  }),
  scheduler: new Scheduler(),
  permissions: new Permissions(),

};

const eventStream = createMessageStream(config, client, commands, services);

const eventSubscription = eventStream.subscribe({
  next: handleCommand,
});

const cleanup = (msg = "CatJammer closing cleanly", code = 0) => {
  eventSubscription.unsubscribe();
  client.destroy();
  services.log.info(msg);
  process.exit(code);
};

const onError = (err: unknown) => {
  services.log.error("!!FATAL!!", err);
  cleanup("CatJammer is closing unexpectedly", 1);
};

services.store.onError(onError);

client.once("ready", () => {
  Promise.all(
    commands
      .filter((command): command is CommandWithInit => "init" in command)
      .map((command) => command.init(client, services))
  )
    .then(() => services.log.info("CatJammer is ready"))
    .catch(onError);
});

client.login(config.token).catch(onError);

process.on("SIGINT", () => cleanup());
process.on("uncaughtException", onError);
process.on("unhandledRejection", onError);
