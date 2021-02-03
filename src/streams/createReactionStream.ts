import type { Client, MessageReaction, PartialUser, User } from "discord.js";
import { fromEventPattern, Observable } from "rxjs";
import type { NodeEventHandler } from "rxjs/internal/observable/fromEvent";
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
      return;
    }
  }
  if (!user.bot && services.roleReactor.has(reaction.message.id)) {
    const guild = reaction.message.guild;
    if (guild) {
      try {
        const member = await guild.members.fetch(user.id);
        handler({ reactorType: "group", type, reaction, member });
      } catch (e) {
        services.log.error(e);
      }
    }
  }
  if (!user.bot && services.colorReactor.has(reaction.message.id)) {
    const guild = reaction.message.guild;
    if (guild) {
      try {
        const member = await guild.members.fetch(user.id);
        handler({ reactorType: "color", type, reaction, member });
      } catch (e) {
        services.log.error(e);
      }
    }
  }

  if (!user.bot && type === "add" && services.pollManager.has(reaction.message.id)) {
    const guild = reaction.message.guild;
    if (guild) {
      try {
        const member = await guild.members.fetch(user.id);
        await services.pollManager.reactionHandler(reaction, member);
      } catch (e) {
        services.log.error(e);
      }
    }
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
  );
};
