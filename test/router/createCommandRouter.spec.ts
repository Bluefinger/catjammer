import { expect } from "chai";
import type { Message } from "discord.js";
import type { Command } from "../../src/commands/type";
import type { Config } from "../../src/index.types";
import { createCommandRouter } from "../../src/router";

describe("Routers", () => {
  describe("createCommandRouter", () => {
    const config: unknown = { prefix: "!" };
    const commands: unknown[] = [{ name: "ping" }];
    const router = createCommandRouter(config as Config, commands as Command[]);
    const tests: [string, unknown, unknown][] = [
      [
        "returns a RoutedCommand object on a match",
        { content: "!ping" },
        {
          message: { content: "!ping" },
          command: { name: "ping" },
        },
      ],
      ["returns undefined with an invalid command", { content: "!poggers" }, undefined],
      ["returns undefined with a non-prefixed message", { content: "Get in!" }, undefined],
    ];

    for (const [description, message, result] of tests) {
      it(description, () => {
        expect(router(message as Message)).to.deep.equal(result);
      });
    }
  });
});
