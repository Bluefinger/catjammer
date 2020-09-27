import { expect } from "chai";
import { Message } from "discord.js";
import { filterMessage } from "../../src/handler/handlerFilters";

describe("handlerFilters.ts", () => {
  describe("filterMessage", () => {
    const filter = filterMessage("!");
    it("should filter out messages by bots", () => {
      expect(filter({ author: { bot: true }, content: "a message" } as Message)).to.be.false;
    });
    it("should filter out messages that don't start with a prefix", () => {
      expect(filter({ author: { bot: false }, content: "a message" } as Message)).to.be.false;
    });
    it("should not filter out messages that start with a prefix", () => {
      expect(filter({ author: { bot: false }, content: "!message" } as Message)).to.be.true;
    });
  });
});
