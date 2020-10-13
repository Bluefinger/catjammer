import { readFileSync, createWriteStream } from "fs";
import { Client } from "discord.js";
import { commands } from "./commands";
import { Config, createMessageStream, handleCommand } from "./handler";
import { createArgumentMatcher } from "./matcher/createMatcher";
import { Store, Logger, Scheduler, Permissions } from "./services";
import type { CommandWithInit } from "./commands/type";
import { createCommandRouter } from "./matcher/createCommandRouter";
import { createPermissionGuard } from "./matcher/permissionGuard";

const config = JSON.parse(readFileSync("./config.json", "utf-8")) as Config;

const client = new Client();
const services = {
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

const eventStream = createMessageStream(
  config,
  client,
  createCommandRouter(config, commands),
  createPermissionGuard(services),
  createArgumentMatcher(config, commands, services)
);

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
