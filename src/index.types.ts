import type { Guild, GuildMember, Message, Presence, User } from "discord.js";
import type { Logger, Store, Scheduler, Permissions } from "./services";

export interface Config {
  readonly token: string;
  readonly prefix: string;
  readonly parenthesis: [string, string];
}

export interface Services {
  readonly store: Store;
  readonly log: Logger;
  readonly scheduler: Scheduler;
  readonly permissions: Permissions;
}

export interface GuildPresence extends Presence {
  member: GuildMember;
}

export interface GuildAuthor extends User {
  presence: GuildPresence;
}

export interface GuildMessage extends Message {
  guild: Guild;
  member: GuildMember;
  author: GuildAuthor;
}
