import { expect } from "chai";
import { Message } from "discord.js";
import { Command } from "../../src/commands/type";
import { Config } from "../../src/handler";
import { createCommandMatcher } from "../../src/matcher/createMatcher";
import type { Services } from "../../src/matcher";

interface FakeMessage {
  content: string;
}

type TestCase = {
  description: string;
  config: Partial<Config>;
  message: FakeMessage;
  command: Partial<Command>;
  expected:
    | {
        matched: true;
        commands: Partial<Command>[];
        command: Partial<Command>;
        message: FakeMessage;
        services: Record<string, any>;
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
    config: {
      prefix: "!",
      parenthesis: ['"', '"'],
    },
    message: { content: "!ping" },
    command: { definition: "ping" },
    expected: {
      matched: true,
      commands: [{ definition: "ping" }],
      message: { content: "!ping" },
      command: { definition: "ping" },
      args: {},
      services: {},
    },
  },
  {
    description: "matches a command with one argument",
    config: {
      prefix: "!",
      parenthesis: ['"', '"'],
    },
    message: { content: "!ping me" },
    command: { definition: "ping :id" },
    expected: {
      matched: true,
      message: { content: "!ping me" },
      command: { definition: "ping :id" },
      commands: [{ definition: "ping :id" }],
      args: { id: "me" },
      services: {},
    },
  },
  {
    description: "matches a command with a catch-all",
    config: {
      prefix: "!",
      parenthesis: ['"', '"'],
    },
    message: { content: "!ping me all the things!" },
    command: { definition: "ping *" },
    expected: {
      matched: true,
      message: { content: "!ping me all the things!" },
      command: { definition: "ping *" },
      commands: [{ definition: "ping *" }],
      args: { message: "me all the things!" },
      services: {},
    },
  },
  {
    description: "matches a command with a username value",
    config: {
      prefix: "!",
      parenthesis: ['"', '"'],
    },
    message: { content: "!ping <@!123456789>" },
    command: { definition: "ping @name" },
    expected: {
      matched: true,
      message: { content: "!ping <@!123456789>" },
      command: { definition: "ping @name" },
      commands: [{ definition: "ping @name" }],
      args: { name: "<@!123456789>" },
      services: {},
    },
  },
  {
    description: "matches a command with a role value",
    config: {
      prefix: "!",
      parenthesis: ['"', '"'],
    },
    message: { content: "!ping <@&123456789>" },
    command: { definition: "ping @name" },
    expected: {
      matched: true,
      message: { content: "!ping <@&123456789>" },
      command: { definition: "ping @name" },
      commands: [{ definition: "ping @name" }],
      args: { name: "<@&123456789>" },
      services: {},
    },
  },
  {
    description: "matches a command with a parenthesis value",
    config: {
      prefix: "!",
      parenthesis: ['"', '"'],
    },
    message: { content: '!ping "A User#3434"' },
    command: { definition: 'ping "name' },
    expected: {
      matched: true,
      message: { content: '!ping "A User#3434"' },
      command: { definition: 'ping "name' },
      commands: [{ definition: 'ping "name' }],
      args: { name: "A User#3434" },
      services: {},
    },
  },
  {
    description: "matches a command with multiple argument types",
    config: {
      prefix: "!",
      parenthesis: ['"', '"'],
    },
    message: { content: '!ping 89-() "A User#3434" \nA Message to\nsend' },
    command: { definition: 'ping :id "name *' },
    expected: {
      matched: true,
      message: { content: '!ping 89-() "A User#3434" \nA Message to\nsend' },
      command: { definition: 'ping :id "name *' },
      commands: [{ definition: 'ping :id "name *' }],
      args: { id: "89-()", name: "A User#3434", message: "A Message to\nsend" },
      services: {},
    },
  },
  {
    description: "matches a command with extra whitespaces between arguments",
    config: {
      prefix: "!",
      parenthesis: ['"', '"'],
    },
    message: { content: '!ping \n aaaa  "A User#3434"' },
    command: { definition: 'ping :id "name' },
    expected: {
      matched: true,
      message: { content: '!ping \n aaaa  "A User#3434"' },
      command: { definition: 'ping :id "name' },
      commands: [{ definition: 'ping :id "name' }],
      args: { id: "aaaa", name: "A User#3434" },
      services: {},
    },
  },
  {
    description: "matches a command with a bigger prefix",
    config: {
      prefix: "?!c ",
      parenthesis: ['"', '"'],
    },
    message: { content: '?!c ping \n aaaa  "A User#3434"' },
    command: { definition: 'ping :id "name' },
    expected: {
      matched: true,
      message: { content: '?!c ping \n aaaa  "A User#3434"' },
      command: { definition: 'ping :id "name' },
      commands: [{ definition: 'ping :id "name' }],
      args: { id: "aaaa", name: "A User#3434" },
      services: {},
    },
  },
  {
    description: "matches a command with different parentheses defined",
    config: {
      prefix: "!",
      parenthesis: ["<", ">"],
    },
    message: { content: "!ping <A User#3434>" },
    command: { definition: 'ping "name' },
    expected: {
      matched: true,
      message: { content: "!ping <A User#3434>" },
      command: { definition: 'ping "name' },
      commands: [{ definition: 'ping "name' }],
      args: { name: "A User#3434" },
      services: {},
    },
  },
  {
    description: "does not match a non-existant command",
    config: {
      prefix: "!",
      parenthesis: ['"', '"'],
    },
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
    config: {
      prefix: "!",
      parenthesis: ['"', '"'],
    },
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
    config: {
      prefix: "!",
      parenthesis: ['"', '"'],
    },
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
    cases.forEach(({ description, config, message, command, expected }) => {
      it(description, () => {
        const matcher = createCommandMatcher(
          config as Config,
          [command as Command],
          {} as Services
        );
        const result = matcher(message as Message);
        expect(result).to.deep.equal(expected);
      });
    });
  });
});
