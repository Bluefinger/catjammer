import { expect } from "chai";
import type { Command } from "../../src/commands/type";
import type { Config } from "../../src/index.types";
import { createCommandNameDefinition, createArgumentDefinition } from "../../src/matcher";

describe("createDefinitions.ts", () => {
  const config = {
    prefix: "!",
    parenthesis: ['"', '"'],
  } as Config;
  describe("createCommandDefinition", () => {
    it("should create a working regex match", () => {
      const definition = createArgumentDefinition(config, {
        definition: 'ping :id @name #room "paren *',
      } as Command);
      expect(definition.match.toString()).to.equal(
        '/^!ping\\s+(\\S+)\\s+(<@(?:!|&)?\\d+>)\\s+(<#\\d+>)\\s+"([^""\\n]+)"\\s+([\\s\\S]*)\\s*$/'
      );
    });
    it("should provide all the arguments in a definition", () => {
      const definition = createArgumentDefinition(config, {
        definition: 'ping :id @name #room "paren *',
      } as Command);
      expect(definition.args).to.deep.equal(["id", "name", "room", "paren", "message"]);
    });
  });
  describe("createCommandNameDefinition", () => {
    it("matches just the first part of a command string", () => {
      const definition = createCommandNameDefinition("!");
      expect(definition.exec("!ping me")?.[1]).to.equal("ping");
    });
    it("doesn't match a string that isn't really a command", () => {
      const definition = createCommandNameDefinition("!");
      expect(definition.exec("!!!!")).to.be.null;
    });
  });
});
