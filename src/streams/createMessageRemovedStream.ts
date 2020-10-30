import { Client, Message } from "discord.js";
import { fromEventPattern, Observable } from "rxjs";
import { filter } from "rxjs/operators";
import { GuildMessage } from "../index.types";

export const createMessageRemovedStream = (client: Client): Observable<GuildMessage> =>
  fromEventPattern<Message>(
    (handler) => client.on("messageDelete", handler),
    (handler) => client.off("messageDelete", handler)
  ).pipe(filter((message): message is GuildMessage => !!message.guild));
