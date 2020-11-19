import type { RoleReaction, Services } from "../index.types";

export const handleRoleReaction = (services: Services) => async ({
  reactorType,
  type,
  reaction,
  member,
}: RoleReaction): Promise<void> => {
  try {
    if (reactorType === "group") {
      if (type === "add") {
        await services.roleReactor.applyRole(reaction, member);
      } else {
        await services.roleReactor.removeRole(reaction, member);
      }
    } else {
      if (type === "add") {
        await services.colorReactor.applyRole(reaction, member);
      } else {
        await services.colorReactor.removeRole(reaction, member);
      }
    }
  } catch (e) {
    services.log.error(e);
  }
};
