import { expect } from "chai";
import { spy } from "sinon";
import { greeting } from "../../src/commands/greeting";
import { ExtractedCommand } from "../../src/matcher";

const testCases: [string, { id: string } | null, Record<string, string>, string][] = [
  [
    "can set a greeting message for a guild",
    { id: "1111" },
    { modifier: "set", message: "A welcome message" },
    "Greeting set",
  ],
  [
    "can remove a greeting message for a guild",
    { id: "1111" },
    { modifier: "remove", message: "" },
    "Greeting removed",
  ],
  [
    "cannot remove a greeting that doesn't exist",
    { id: "1112" },
    { modifier: "remove", message: "" },
    "No greeting to remove",
  ],
  [
    "only recognises set/remove as valid modifiers",
    { id: "1111" },
    { modifier: "assign", message: "An invalid modifier" },
    "Can only set or remove greetings",
  ],
];

describe("greeting", () => {
  describe("execute", () => {
    const reply = spy();
    const services: unknown = {
      store: {
        set: () => Promise.resolve(),
        delete: (key: string) => Promise.resolve(key === "greeting::1111"),
      },
    };
    beforeEach(() => reply.resetHistory());

    for (const [description, guild, args, result] of testCases) {
      it(description, async () => {
        const message: unknown = {
          channel: {
            send: reply,
          },
          guild,
        };
        await greeting.execute({ message, services, args } as ExtractedCommand);
        expect(reply.firstCall.args[0]).to.equal(result);
      });
    }
  });
});
