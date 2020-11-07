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
      member: {
        id: "1234",
        guild: {
          id: "1111",
        },
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
        { permissions: { resolvePermissionLevel: () => PermissionLevels.OFFICER } },
        2,
      ],
      [
        "should show a reduced list for normal permission",
        { permissions: { resolvePermissionLevel: () => PermissionLevels.NORMAL } },
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
