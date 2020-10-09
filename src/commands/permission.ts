import { PermissionLevels, SetPermission } from "../constants";
import type { Services } from "../matcher";
import type { CommandWithInit } from "./type";

const enum Modifiers {
  GIVE = "give",
  REMOVE = "remove",
  BAN = "ban",
}

type StoredPermissions = [string, SetPermission][];

const grantPermission = async (
  { store, permissions }: Services,
  guildId: string,
  id: string,
  level: SetPermission
) => {
  const key = `${guildId}::${id}`;
  const storedKey = `permissions::${guildId}`;
  const storedPermissions = (await store.get<StoredPermissions>(storedKey)) || [];
  await store.set<StoredPermissions>(storedKey, [...storedPermissions, [key, level]]);
  permissions.assignPermission(key, level);
  return level === PermissionLevels.BANNED ? "BANNED from using the bot" : "Permission granted";
};

const removePermission = async ({ store, permissions }: Services, guildId: string, id: string) => {
  const key = `${guildId}::${id}`;
  const storedKey = `permissions::${guildId}`;
  const storedPermissions = (await store.get<StoredPermissions>(storedKey)) || [];
  if (storedPermissions.length) {
    const assignedPermissions = storedPermissions.filter(([storedRole]) => storedRole !== key);
    if (assignedPermissions.length !== storedPermissions.length) {
      await store.set(storedKey, assignedPermissions);
      permissions.removePermission(key);
      return "Permission removed";
    }
  }
  return "No permissions to remove";
};

export const permission: CommandWithInit = {
  name: "permission",
  description: "Grants permissions to roles so that they can use certain commands",
  definition: "permission :modifier @role",
  help:
    "use !permission give/remove/ban @<Role/Person>.\nYou can grant or remove roles/people from being able to use certain commands, or ban people from using the bot entirely",
  async init(client, { store, permissions }) {
    const loading = client.guilds.cache.map(async ({ id, ownerID }) => {
      permissions.assignPermission(`${id}::${ownerID}`, PermissionLevels.OFFICER);
      const storedPermissions = await store.get<StoredPermissions>(`permissions::${id}`);
      if (storedPermissions) {
        for (const [key, level] of storedPermissions) {
          permissions.assignPermission(key, level);
        }
      }
    });
    await Promise.all(loading);
  },
  async execute({ message, services, args }) {
    if (!message.guild) {
      await message.reply("Must be used in a guild channel");
      return;
    }
    const { modifier, role } = args;
    const id = role.slice(3, -1);
    if (id === message.guild.ownerID) {
      await message.reply("You cannot change the permissions of a Guild owner");
      return;
    }
    let msg: string;
    switch (modifier) {
      case Modifiers.GIVE:
        msg = await grantPermission(services, message.guild.id, id, PermissionLevels.OFFICER);
        break;
      case Modifiers.BAN:
        msg = await grantPermission(services, message.guild.id, id, PermissionLevels.BANNED);
        break;
      case Modifiers.REMOVE:
        msg = await removePermission(services, message.guild.id, id);
        break;
      default:
        msg = "Invalid permission modifier. You can either `give`, `remove`, or `ban`.";
    }
    await message.channel.send(msg);
  },
};
