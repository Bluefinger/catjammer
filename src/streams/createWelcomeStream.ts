import { Client, GuildMember } from "discord.js";
import { fromEventPattern, Observable } from "rxjs";

export const createWelcomeStream = (client: Client): Observable<GuildMember> =>
  fromEventPattern<GuildMember>(
    (handler) => client.on("guildMemberAdd", handler),
    (handler) => client.off("guildMemberAdd", handler)
  );
