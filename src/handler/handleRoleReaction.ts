import type { RoleReaction, Services } from "../index.types";

export const handleRoleReaction = (services: Services) => async ({
  reactorType,
  type,
  reaction,
  member,
}: RoleReaction): Promise<void> => {
  try {
    const reactor = reactorType === "group" ? services.roleReactor : services.colorReactor;
    if (type === "add") {
      await reactor.applyRole(reaction, member);
    } else {
      await reactor.removeRole(reaction, member);
    }
  } catch (e) {
    services.log.error(e);
  }
};
