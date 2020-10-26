import type { RoleReaction, Services } from "../index.types";

export const handleRoleReaction = (services: Services) => async ({
  type,
  reaction,
  member,
}: RoleReaction): Promise<void> => {
  try {
    if (type === "add") {
      await services.roleReactor.applyRole(reaction, member);
    } else {
      await services.roleReactor.removeRole(reaction, member);
    }
  } catch (e) {
    services.log.error(e);
  }
};
