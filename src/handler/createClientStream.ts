import { Client, Collection, Message } from "discord.js";
import { fromEventPattern, Observable } from "rxjs";
import { filter, map } from "rxjs/operators";
import { Command } from "../commands/type";
import { filterCommand, filterMessage } from "./handlerFilters";
import { processMessageAsCommand } from "./handlerMaps";
import { Config, HandlerEvent } from "./types";

export const createClientStream = (
  { prefix }: Config,
  client: Client,
  collection: Collection<string, Command>
): Observable<HandlerEvent> =>
  fromEventPattern<Message>(
    (handler) => {
      client.once("ready", () => console.log("CatJammer is ready"));
      client.on("message", handler);
    },
    (handler) => {
      client.off("message", handler);
    }
  ).pipe(
    filter(filterMessage(prefix)),
    map(processMessageAsCommand(prefix)),
    filter(filterCommand(collection))
  );
