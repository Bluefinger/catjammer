import { color, isValidHex } from "../../src/commands/color";
import { expect } from "chai";
import { spy } from "sinon";
import { Message } from "discord.js";
import { MatchedCommand } from "../../src/matcher/types";

describe("color commands", () => {
  describe("validation", () => {
    it("should reject invalid hex color value", () => {
      expect(isValidHex("#0ghh7i")).to.be.false;
    });

    it("should accept valid hex color value", () => {
      expect(isValidHex("#000000")).to.be.true;
    });
  });

  describe("execute", () => {
    const replySpy = spy();
    beforeEach(() => replySpy.resetHistory());
    it("should reject invalid hex argument", async () => {
      const args: Record<string, string> = { colorHex: "#0g0g0g" };
      const message: unknown = { reply: replySpy };
      await color.execute({
        message: message as Message,
        args,
      } as MatchedCommand);
      expect(replySpy.firstCall.args[0]).to.be.eql("Invalid hex value");
    });

    it("should reject message not posted in a guild channel", async () => {
      const args: Record<string, string> = { colorHex: "#000000" };
      const message: unknown = { reply: replySpy, guild: null };
      await color.execute({
        message: message as Message,
        args,
      } as MatchedCommand);
      expect(replySpy.firstCall.args[0]).to.be.eql("Must be used in a guild channel");
    });
  });
});
