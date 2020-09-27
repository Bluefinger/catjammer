import { expect } from "chai";
import type { Command } from "../../src/commands/type";
import {
  createCommandDefinition,
  createErrorDefinition,
} from "../../src/matcher/createDefinitions";

describe("createDefinitions.ts", () => {
  describe("createCommandDefinition", () => {
    it("should create a working regex match", () => {
      const definition = createCommandDefinition("!", {
        definition: "ping :id @name *",
      } as Command);
      expect(definition.match.toString()).to.equal(
        '/^!ping\\s+(\\S+)\\s+"(.+)"\\s+([\\s\\S]*)\\s*$/'
      );
    });
    it("should provide all the arguments in a definition", () => {
      const definition = createCommandDefinition("!", {
        definition: "ping :id @name *",
      } as Command);
      expect(definition.args).to.deep.equal(["id", "name", "message"]);
    });
  });
  describe("createErrorDefinition", () => {
    it("matches just the first part of a command string", () => {
      const definition = createErrorDefinition("!");
      expect(definition.exec("!ping me")?.[1]).to.equal("!ping");
    });
    it("doesn't match a string that isn't really a command", () => {
      const definition = createErrorDefinition("!");
      expect(definition.exec("!!!!")).to.be.null;
    });
  });
});
