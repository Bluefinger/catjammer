import type { Client, MessageReaction, PartialUser, User } from "discord.js";
import { fromEventPattern, Observable } from "rxjs";
import type { NodeEventHandler } from "rxjs/internal/observable/fromEvent";
import { filter } from "rxjs/operators";
import type { RoleReaction, Services } from "../index.types";

const reactionHandler = (
  type: "add" | "remove",
  handler: NodeEventHandler,
  services: Services
) => async (reaction: MessageReaction, user: User | PartialUser) => {
  if (reaction.partial) {
    try {
      await reaction.fetch();
    } catch (e) {
      services.log.error(e);
    }
  }
  if (!user.bot && user.presence && user.presence.member) {
    handler({ type, reaction, member: user.presence.member });
  }
};

export const createReactionStream = (
  client: Client,
  services: Services
): Observable<RoleReaction> => {
  let reactionAddHandler: (reaction: MessageReaction, user: User | PartialUser) => void;
  let reactionRemoveHandler: (reaction: MessageReaction, user: User | PartialUser) => void;
  return fromEventPattern<RoleReaction>(
    (handler) => {
      client.on(
        "messageReactionAdd",
        (reactionAddHandler = reactionHandler("add", handler, services))
      );
      client.on(
        "messageReactionRemove",
        (reactionRemoveHandler = reactionHandler("remove", handler, services))
      );
    },
    () => {
      client.off("messageReactionAdd", reactionAddHandler);
      client.off("messageReactionRemove", reactionRemoveHandler);
    }
  ).pipe(filter(({ reaction }) => services.roleReactor.has(reaction.message.id)));
};
