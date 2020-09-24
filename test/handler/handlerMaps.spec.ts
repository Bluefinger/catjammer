import { expect } from "chai";
import { Message } from "discord.js";
import { processMessageAsCommand } from "../../src/handler/handlerMaps";

describe("handler maps", () => {
  describe("processMessageAsCommand", () => {
    it("should separate a Message into its command and arguments components, combining it into a HandlerEvent", () => {
      const process = processMessageAsCommand("!");
      expect(process({ content: "!message arg0 arg1" } as Message)).to.deep.equal({
        command: "message",
        args: ["arg0", "arg1"],
        message: { content: "!message arg0 arg1" } as Message,
      });
    });
  });
});
