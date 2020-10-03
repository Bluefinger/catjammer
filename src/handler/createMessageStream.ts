import { Client, Message } from "discord.js";
import { fromEventPattern, Observable } from "rxjs";
import { filter, map } from "rxjs/operators";
import { CommandMatcher, InvalidCommand, MatchedCommand } from "../matcher";
import { filterMessage } from "./handlerFilters";
import { Config } from "./types";

export const createMessageStream = (
  { prefix }: Config,
  client: Client,
  matcher: CommandMatcher
): Observable<MatchedCommand | InvalidCommand> =>
  fromEventPattern<Message>(
    (handler) => {
      client.on("message", handler);
    },
    (handler) => {
      client.off("message", handler);
    }
  ).pipe(filter(filterMessage(prefix)), map(matcher));
