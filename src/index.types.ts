import type { Guild, GuildMember, Message, MessageReaction, Presence, User } from "discord.js";
import type { Logger, Store, Scheduler, Permissions, RoleReactor, PollManager } from "./services";

export type ReadonlyList<T> = ReadonlyArray<Readonly<T>>;

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
  readonly roleReactor: RoleReactor;
  readonly colorReactor: RoleReactor;
  readonly pollManager: PollManager;
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

export interface RoleReaction {
  reactorType: "group" | "color" | "poll";
  type: "add" | "remove";
  reaction: MessageReaction;
  member: GuildMember;
}
