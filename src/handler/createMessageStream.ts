import { Client, Message } from "discord.js";
import { fromEventPattern, Observable } from "rxjs";
import { filter, map } from "rxjs/operators";
import {
  ArgumentExtractor,
  InvalidCommand,
  ExtractedCommand,
  PermissionGuard,
  CommandRouter,
} from "../matcher";
import { filterMessage, filterRouted } from "./handlerFilters";
import { Config } from "./types";

export const createMessageStream = (
  { prefix }: Config,
  client: Client,
  router: CommandRouter,
  permissions: PermissionGuard,
  extractor: ArgumentExtractor
): Observable<ExtractedCommand | InvalidCommand> =>
  fromEventPattern<Message>(
    (handler) => {
      client.on("message", handler);
    },
    (handler) => {
      client.off("message", handler);
    }
  ).pipe(
    filter(filterMessage(prefix)),
    map(router),
    filter(filterRouted),
    filter(permissions),
    map(extractor)
  );
