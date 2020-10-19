import type { Services } from "../index.types";
import type { CommandWithInit } from "./type";
import { PermissionLevels, PermissionType, SetPermission } from "../constants";
import { extractId } from "./helpers/mentions";

const isRole = /<@&\d+>/g;

const enum Modifiers {
  GIVE = "give",
  REMOVE = "remove",
  BAN = "ban",
}

type StoredPermissions = [string, SetPermission, PermissionType][];

const grantPermission = async (
  { store, permissions }: Services,
  guildId: string,
  id: string,
  level: SetPermission,
  type: PermissionType
) => {
  const key = `${guildId}::${id}`;
  const storedKey = `permissions::${guildId}`;
  const storedPermissions = (await store.get<StoredPermissions>(storedKey)) || [];
  if (!storedPermissions.some(([storedKey]) => storedKey === key)) {
    await store.set<StoredPermissions>(storedKey, [...storedPermissions, [key, level, type]]);
    permissions.assignPermission(key, level, type);
    return level === PermissionLevels.BANNED ? "BANNED from using the bot" : "Permission granted";
  }
  return "Permission already granted";
};

const removePermission = async (
  { store, permissions }: Services,
  guildId: string,
  id: string,
  type: PermissionType
) => {
  const key = `${guildId}::${id}`;
  const storedKey = `permissions::${guildId}`;
  const storedPermissions = (await store.get<StoredPermissions>(storedKey)) || [];
  if (storedPermissions.length) {
    const assignedPermissions = storedPermissions.filter(([storedRole]) => storedRole !== key);
    if (assignedPermissions.length !== storedPermissions.length) {
      await store.set(storedKey, assignedPermissions);
      permissions.removePermission(key, type);
      return "Permission removed";
    }
  }
  return "No permissions to remove";
};

export const permission: CommandWithInit = {
  name: "permission",
  description: "Grants permissions to roles so that they can use certain commands",
  definition: "permission :modifier @role",
  permission: 1,
  help:
    "use !permission give/remove/ban @<Role/Person>.\nYou can grant or remove roles/people from being able to use certain commands, or ban people from using the bot entirely",
  async init(client, { store, permissions }) {
    const loading = client.guilds.cache.map(async ({ id, ownerID }) => {
      permissions.assignPermission(
        `${id}::${ownerID}`,
        PermissionLevels.OFFICER,
        PermissionType.USER
      );
      const storedPermissions = await store.get<StoredPermissions>(`permissions::${id}`);
      if (storedPermissions) {
        for (const [key, level, type] of storedPermissions) {
          permissions.assignPermission(key, level, type);
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
    const id = extractId(role);
    if (id === message.guild.ownerID) {
      await message.reply("You cannot change the permissions of a Guild owner");
      return;
    }
    const type = isRole.test(role) ? PermissionType.ROLE : PermissionType.USER;
    let msg: string;
    switch (modifier) {
      case Modifiers.GIVE:
        msg = await grantPermission(services, message.guild.id, id, PermissionLevels.OFFICER, type);
        break;
      case Modifiers.BAN:
        msg = await grantPermission(services, message.guild.id, id, PermissionLevels.BANNED, type);
        break;
      case Modifiers.REMOVE:
        msg = await removePermission(services, message.guild.id, id, type);
        break;
      default:
        msg = "Invalid permission modifier. You can either `give`, `remove`, or `ban`.";
    }
    await message.channel.send(msg);
  },
};
