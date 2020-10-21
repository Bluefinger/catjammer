import { help } from "../../src/commands/help";
import { spy } from "sinon";
import { expect } from "chai";
import type { ExtractedCommand } from "../../src/matcher";

describe("help command", () => {
  describe("execute", () => {
    const replySpy = spy();
    const message: unknown = {
      reply: replySpy,
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

    const helpCommand: unknown = {
      name: "ping",
      help: "help",
    };

    const services = {
      permissions: {
        getPermission: () => 0,
      },
    };

    it("should reject argument that does not match a command name", async () => {
      const ExtractedCommand: unknown = {
        message,
        commands: [helpCommand],
        services,
        args: {
          command: "wrong",
        },
      };
      await help.execute(ExtractedCommand as ExtractedCommand);
      expect(replySpy.lastCall.args[0]).to.be.eql(
        "Command does not exist or you do not have permission to use it"
      );
    });

    it("should reply with help property of command matched", async () => {
      const ExtractedCommand: unknown = {
        message,
        commands: [helpCommand],
        services,
        args: {
          command: "ping",
        },
      };
      await help.execute(ExtractedCommand as ExtractedCommand);
      expect(replySpy.lastCall.args[0]).to.be.eql("help");
    });
  });
});
