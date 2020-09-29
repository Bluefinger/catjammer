import { commandsList } from "../../src/commands/commandsList";
import type { Command } from "../../src/commands/type";
import { expect } from "chai";
import { spy } from "sinon";
import { Message } from "discord.js";
import { MatchedCommand } from "../../src/matcher/types";

describe("commands command", () => {
  describe("execute", () => {
    const replySpy = spy();
    const message: unknown = {
      reply: replySpy,
    };

    const command: unknown = {
      message: message as Message,
      commands: [
        { name: "ping", description: "Ping!" } as Command,
        { name: "commands", description: "Lists the available commands to the user" } as Command,
      ],
    };
    afterEach(() => replySpy.resetHistory());
    it("should fire reply after building the string", async () => {
      await commandsList.execute(command as MatchedCommand);
      expect(replySpy.called).to.be.true;
    });

    it("should reply with ping name and description", async () => {
      await commandsList.execute(command as MatchedCommand);
      expect(replySpy.firstCall.args[0]).to.be.a("string").that.includes("ping - Ping!");
    });

    it("should contain itself in the command list", async () => {
      await commandsList.execute(command as MatchedCommand);
      expect(replySpy.firstCall.args[0])
        .to.be.a("string")
        .that.includes("commands - Lists the available commands to the user");
    });
  });
});
