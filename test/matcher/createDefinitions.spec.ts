import { expect } from "chai";
import type { Command } from "../../src/commands/type";
import { Config } from "../../src/handler";
import {
  createCommandDefinition,
  createErrorDefinition,
} from "../../src/matcher/createDefinitions";

describe("createDefinitions.ts", () => {
  const config = {
    prefix: "!",
    parenthesis: ['"', '"'],
  } as Config;
  describe("createCommandDefinition", () => {
    it("should create a working regex match", () => {
      const definition = createCommandDefinition(config, {
        definition: 'ping :id @name "paren *',
      } as Command);
      expect(definition.match.toString()).to.equal(
        '/^!ping\\s+(\\S+)\\s+(<@(?:!|&)\\d+>)\\s+"([^""\\n]+)"\\s+([\\s\\S]*)\\s*$/'
      );
    });
    it("should provide all the arguments in a definition", () => {
      const definition = createCommandDefinition(config, {
        definition: 'ping :id @name "paren *',
      } as Command);
      expect(definition.args).to.deep.equal(["id", "name", "paren", "message"]);
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
