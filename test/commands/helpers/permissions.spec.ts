import { expect } from "chai";
import { getCommandsByPermission } from "../../../src/commands/helpers/permissions";
import { Command } from "../../../src/commands/type";
import { PermissionLevels } from "../../../src/constants";
import { ExtractedCommand } from "../../../src/matcher";

describe("permission helpers", () => {
  describe("getCommandsByPermission", () => {
    const commands: Command[] = [
      { name: "one", permission: PermissionLevels.OFFICER } as Command,
      { name: "two" } as Command,
    ];

    const message: unknown = {
      guild: {
        id: "1111",
      },
      author: {
        id: "1234",
      },
      member: {
        roles: {
          highest: {
            id: "2222",
          },
        },
      },
    };

    const testCases: [string, unknown, number][] = [
      [
        "should filter by user permission",
        { permissions: { getPermission: () => PermissionLevels.OFFICER } },
        2,
      ],
      [
        "should filter by role permission",
        {
          permissions: {
            getPermission: (key: string) =>
              key === "1111::2222" ? PermissionLevels.OFFICER : PermissionLevels.NORMAL,
          },
        },
        2,
      ],
      [
        "should show a reduced list for normal permission",
        { permissions: { getPermission: () => PermissionLevels.NORMAL } },
        1,
      ],
    ];

    for (const [description, services, expectedLength] of testCases) {
      it(description, () => {
        const payload: unknown = { commands, services, message };
        expect(getCommandsByPermission(payload as ExtractedCommand)).to.have.lengthOf(
          expectedLength
        );
      });
    }
  });
});
