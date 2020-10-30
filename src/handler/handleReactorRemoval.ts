import { GuildMessage, Services } from "../index.types";

export const handleReactorRemove = (services: Services) => async (
  message: GuildMessage
): Promise<void> => {
  if (services.roleReactor.remove(message.id)) {
    try {
      await services.store.delete(`reactor::${message.guild.id}`);
    } catch (e) {
      services.log.error(e);
    }
  }
};
