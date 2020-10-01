import { help } from "../../src/commands/help";
import { spy } from "sinon";
import { expect } from "chai";
import { MatchedCommand } from "../../src/matcher/types";
import { Command } from "../../src/commands/type";
import { Message } from "discord.js";

describe("help command", () => {
  describe("execute", () => {
    const replySpy = spy();
    const message: unknown = {
      reply: replySpy,
    };

    const helpCommand: unknown = {
      name: "ping",
      help: "help",
    };

    it("should reject argument that does not match a command name", async () => {
      const matchedCommand: unknown = {
        message: message as Message,
        commands: [helpCommand as Command],
        args: {
          command: "wrong",
        },
      };
      await help.execute(matchedCommand as MatchedCommand);
      expect(replySpy.lastCall.args[0]).to.be.eql("Command does not exist");
    });

    it("should reply with help property of command matched", async () => {
      const matchedCommand: unknown = {
        message: message as Message,
        commands: [helpCommand as Command],
        args: {
          command: "ping",
        },
      };
      await help.execute(matchedCommand as MatchedCommand);
      expect(replySpy.lastCall.args[0]).to.be.eql("help");
    });
  });
});
