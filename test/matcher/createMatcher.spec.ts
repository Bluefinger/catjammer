import { expect } from "chai";
import { Message } from "discord.js";
import { Command } from "../../src/commands/type";
import { createCommandMatcher } from "../../src/matcher/createMatcher";

interface FakeMessage {
  content: string;
}

type TestCase = {
  description: string;
  prefix: string;
  message: FakeMessage;
  command: Partial<Command>;
  expected:
    | {
        matched: true;
        command: Partial<Command>;
        message: FakeMessage;
        args: Record<string, string>;
      }
    | {
        matched: false;
        message: FakeMessage;
        details: string | null;
      };
};

const cases: TestCase[] = [
  {
    description: "matches a simple command with no arguments",
    prefix: "!",
    message: { content: "!ping" },
    command: { definition: "ping" },
    expected: {
      matched: true,
      message: { content: "!ping" },
      command: { definition: "ping" },
      args: {},
    },
  },
  {
    description: "matches a command with one argument",
    prefix: "!",
    message: { content: "!ping me" },
    command: { definition: "ping :id" },
    expected: {
      matched: true,
      message: { content: "!ping me" },
      command: { definition: "ping :id" },
      args: { id: "me" },
    },
  },
  {
    description: "matches a command with a catch-all",
    prefix: "!",
    message: { content: "!ping me all the things!" },
    command: { definition: "ping *" },
    expected: {
      matched: true,
      message: { content: "!ping me all the things!" },
      command: { definition: "ping *" },
      args: { message: "me all the things!" },
    },
  },
  {
    description: "matches a command with a name value",
    prefix: "!",
    message: { content: '!ping "A User#3434"' },
    command: { definition: "ping @name" },
    expected: {
      matched: true,
      message: { content: '!ping "A User#3434"' },
      command: { definition: "ping @name" },
      args: { name: "A User#3434" },
    },
  },
  {
    description: "matches a command with multiple argument types",
    prefix: "!",
    message: { content: '!ping 89-() "A User#3434" \nA Message to\nsend' },
    command: { definition: "ping :id @name *" },
    expected: {
      matched: true,
      message: { content: '!ping 89-() "A User#3434" \nA Message to\nsend' },
      command: { definition: "ping :id @name *" },
      args: { id: "89-()", name: "A User#3434", message: "A Message to\nsend" },
    },
  },
  {
    description: "matches a command with extra whitespaces between arguments",
    prefix: "!",
    message: { content: '!ping \n aaaa  "A User#3434"' },
    command: { definition: "ping :id @name" },
    expected: {
      matched: true,
      message: { content: '!ping \n aaaa  "A User#3434"' },
      command: { definition: "ping :id @name" },
      args: { id: "aaaa", name: "A User#3434" },
    },
  },
  {
    description: "matches a command with a bigger prefix",
    prefix: "?!c ",
    message: { content: '?!c ping \n aaaa  "A User#3434"' },
    command: { definition: "ping :id @name" },
    expected: {
      matched: true,
      message: { content: '?!c ping \n aaaa  "A User#3434"' },
      command: { definition: "ping :id @name" },
      args: { id: "aaaa", name: "A User#3434" },
    },
  },
  {
    description: "does not match a non-existant command",
    prefix: "!",
    message: { content: "!pingu me all the things!" },
    command: { definition: "ping *" },
    expected: {
      matched: false,
      message: { content: "!pingu me all the things!" },
      details: "Invalid !pingu command. Please try again.",
    },
  },
  {
    description: "does not match a badly formed command or non command messages",
    prefix: "!",
    message: { content: "!!!!" },
    command: { definition: "ping *" },
    expected: {
      matched: false,
      message: { content: "!!!!" },
      details: null,
    },
  },
  {
    description: "does not partially match an invalid command",
    prefix: "!",
    message: { content: "!pingu" },
    command: { definition: "ping" },
    expected: {
      matched: false,
      message: { content: "!pingu" },
      details: "Invalid !pingu command. Please try again.",
    },
  },
];

describe("createMatcher.ts", () => {
  describe("createCommandMatcher", () => {
    cases.forEach(({ description, prefix, message, command, expected }) => {
      it(description, () => {
        const matcher = createCommandMatcher(prefix, { command: command as Command });
        const result = matcher(message as Message);
        expect(result).to.deep.equal(expected);
      });
    });
  });
});
