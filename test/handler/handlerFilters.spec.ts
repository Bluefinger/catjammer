import { expect } from "chai";
import { Collection, Message } from "discord.js";
import { Command } from "../../src/commands/type";
import { filterCommand, filterMessage } from "../../src/handler/handlerFilters";
import { HandlerEvent } from "../../src/handler";

describe("handler filters", () => {
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
  describe("filterCommand", () => {
    const filter = filterCommand(
      new Collection<string, Command>([["message", {} as Command]])
    );
    it("should filter commands that don't exist", () => {
      expect(filter({ command: "unknown" } as HandlerEvent)).to.be.false;
    });
    it("should not filter commands that exist", () => {
      expect(filter({ command: "message" } as HandlerEvent)).to.be.true;
    });
  });
});
