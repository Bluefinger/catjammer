import type { CommandWithInit } from "./commands/type";
import type { Config, Services } from "./index.types";
import type { Subscription } from "rxjs";
import { readFileSync, createWriteStream } from "fs";
import { Client } from "discord.js";
import { commands } from "./commands";
import { handleCommand, handleGreeting, handleReactorRemove, handleRoleReaction } from "./handler";
import {
  createMessageRemovedStream,
  createMessageStream,
  createReactionStream,
  createWelcomeStream,
} from "./streams";
import { Store, Logger, Scheduler, Permissions, RoleReactor } from "./services";
import { groupRoles, colorRoles } from "./reactorRoleLists";

const isProduction = process.env.NODE_ENV === "production";

const config = JSON.parse(readFileSync("./config.json", "utf-8")) as Config;

const client = new Client({ partials: ["MESSAGE", "REACTION", "USER", "GUILD_MEMBER"] });
const services: Services = {
  store: new Store({
    uri: "sqlite://catjammer.sqlite",
    busyTimeout: 10000,
  }),
  log: new Logger({
    ignoreErrors: isProduction,
    stdout: process.stdout,
    stderr: isProduction ? process.stderr : createWriteStream("./error.log", { flags: "a" }),
  }),
  scheduler: new Scheduler(),
  permissions: new Permissions(),
  roleReactor: new RoleReactor(groupRoles),
  colorReactor: new RoleReactor(colorRoles),
};
const subscriptions: Subscription[] = [];

const cleanup = (msg = "CatJammer closing cleanly", code = 0) => {
  if (subscriptions.length) subscriptions.forEach((subscription) => subscription.unsubscribe());
  client.destroy();
  services.log.info(msg);
  process.exit(code);
};

const onError = (err: unknown) => {
  services.log.error("!!FATAL!!", err);
  cleanup("CatJammer is closing unexpectedly", 1);
};

services.store.onError(onError);

client.once("ready", async () => {
  try {
    await Promise.all(
      commands
        .filter((command): command is CommandWithInit => "init" in command)
        .map(async (command) => {
          await command.init(client, services);
          services.log.info(`${command.name} has initialised successfully.`);
        })
    );
    subscriptions.push(
      createMessageStream(config, client, commands, services).subscribe(handleCommand),
      createWelcomeStream(client).subscribe(handleGreeting(services)),
      createReactionStream(client, services).subscribe(handleRoleReaction(services)),
      createMessageRemovedStream(client).subscribe(handleReactorRemove(services))
    );
    services.log.info("CatJammer is ready!");
  } catch (e) {
    onError(e);
  }
});

client.login(config.token).catch(onError);

process.on("SIGINT", () => cleanup());
process.on("uncaughtException", onError);
process.on("unhandledRejection", onError);
