import type { Client, Message } from "discord.js";
import type { Config, Services } from "../index.types";
import type { Command } from "../commands/type";
import { InvalidCommand, ExtractedCommand, createArgumentMatcher } from "../matcher";
import { createCommandRouter } from "../router";
import { fromEventPattern, Observable } from "rxjs";
import { filter, map } from "rxjs/operators";
import { routeGuard, messageGuard, permissionGuard } from "../guards";

export const createMessageStream = (
  config: Config,
  client: Client,
  commands: Command[],
  services: Services
): Observable<ExtractedCommand | InvalidCommand> =>
  fromEventPattern<Message>(
    (handler) => {
      client.on("message", handler);
    },
    (handler) => {
      client.off("message", handler);
    }
  ).pipe(
    filter(messageGuard(config)),
    map(createCommandRouter(config, commands)),
    filter(routeGuard),
    filter(permissionGuard(services)),
    map(createArgumentMatcher(config, commands, services))
  );
