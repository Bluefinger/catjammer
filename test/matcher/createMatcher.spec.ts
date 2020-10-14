import { expect } from "chai";
import type { Command } from "../../src/commands/type";
import type { Config, Services } from "../../src/index.types";
import { createArgumentMatcher } from "../../src/matcher/createMatcher";
import type { RoutedCommand } from "../../src/router";

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
        services: Record<string, unknown>;
        args: Record<string, string>;
      }
    | {
        matched: false;
        message: FakeMessage;
        services: Record<string, unknown>;
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
    command: { name: "ping", definition: "ping" },
    expected: {
      matched: true,
      commands: [{ name: "ping", definition: "ping" }],
      message: { content: "!ping" },
      command: { name: "ping", definition: "ping" },
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
    command: { name: "ping", definition: "ping :id" },
    expected: {
      matched: true,
      message: { content: "!ping me" },
      command: { name: "ping", definition: "ping :id" },
      commands: [{ name: "ping", definition: "ping :id" }],
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
    command: { name: "ping", definition: "ping *" },
    expected: {
      matched: true,
      message: { content: "!ping me all the things!" },
      command: { name: "ping", definition: "ping *" },
      commands: [{ name: "ping", definition: "ping *" }],
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
    command: { name: "ping", definition: "ping @name" },
    expected: {
      matched: true,
      message: { content: "!ping <@!123456789>" },
      command: { name: "ping", definition: "ping @name" },
      commands: [{ name: "ping", definition: "ping @name" }],
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
    command: { name: "ping", definition: "ping @name" },
    expected: {
      matched: true,
      message: { content: "!ping <@&123456789>" },
      command: { name: "ping", definition: "ping @name" },
      commands: [{ name: "ping", definition: "ping @name" }],
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
    command: { name: "ping", definition: 'ping "name' },
    expected: {
      matched: true,
      message: { content: '!ping "A User#3434"' },
      command: { name: "ping", definition: 'ping "name' },
      commands: [{ name: "ping", definition: 'ping "name' }],
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
    command: { name: "ping", definition: 'ping :id "name *' },
    expected: {
      matched: true,
      message: { content: '!ping 89-() "A User#3434" \nA Message to\nsend' },
      command: { name: "ping", definition: 'ping :id "name *' },
      commands: [{ name: "ping", definition: 'ping :id "name *' }],
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
    command: { name: "ping", definition: 'ping :id "name' },
    expected: {
      matched: true,
      message: { content: '!ping \n aaaa  "A User#3434"' },
      command: { name: "ping", definition: 'ping :id "name' },
      commands: [{ name: "ping", definition: 'ping :id "name' }],
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
    command: { name: "ping", definition: 'ping :id "name' },
    expected: {
      matched: true,
      message: { content: '?!c ping \n aaaa  "A User#3434"' },
      command: { name: "ping", definition: 'ping :id "name' },
      commands: [{ name: "ping", definition: 'ping :id "name' }],
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
    command: { name: "ping", definition: 'ping "name' },
    expected: {
      matched: true,
      message: { content: "!ping <A User#3434>" },
      command: { name: "ping", definition: 'ping "name' },
      commands: [{ name: "ping", definition: 'ping "name' }],
      args: { name: "A User#3434" },
      services: {},
    },
  },
  {
    description: "does not match a badly formed command",
    config: {
      prefix: "!",
      parenthesis: ['"', '"'],
    },
    message: { content: "!ping" },
    command: { name: "ping", definition: "ping :me" },
    expected: {
      matched: false,
      message: { content: "!ping" },
      details: "Invalid !ping command. Please try again.",
      services: {},
    },
  },
];

describe("createMatcher.ts", () => {
  describe("createArgumentMatcher", () => {
    cases.forEach(({ description, config, message, command, expected }) => {
      it(description, () => {
        const matcher = createArgumentMatcher(
          config as Config,
          [command as Command],
          {} as Services
        );
        const result = matcher({ message, command } as RoutedCommand);
        expect(result).to.deep.equal(expected);
      });
    });
  });
});
