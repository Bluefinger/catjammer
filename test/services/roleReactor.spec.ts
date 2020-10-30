import { expect } from "chai";
import type { GuildMember, MessageReaction } from "discord.js";
import { spy } from "sinon";
import type { GuildMessage } from "../../src/index.types";
import { RoleReactor } from "../../src/services";

describe("RoleReactor", () => {
  describe("Role list formatting", () => {
    it("lists a formatted string of all roles available", () => {
      const reactor = new RoleReactor();
      expect(reactor.list("").trim()).to.equal(
        "List of roles available:\n⚔ - M+ DPS\n🛡 - M+ Tank\n🚑 - M+ Healer\n🔥 - BG DPS\n❤ - BG Healer\n🥇 - Arena DPS\n🥈 - Arena Healer"
      );
    });
  });
  describe("Reactor message cache", () => {
    it("implements a Set-like interface for checking for existing reactor messages", () => {
      const reactor = new RoleReactor();
      expect(reactor.has("id")).to.be.false;
      reactor.add("id");
      expect(reactor.has("id")).to.be.true;
      expect(reactor.remove("id")).to.be.true;
    });
  });
  describe("Reactor message setup", () => {
    it("adds a list of reactions to a message", async () => {
      const react = spy();
      const message: unknown = {
        react,
      };
      const reactor = new RoleReactor();
      await reactor.setup(message as GuildMessage);
      expect(react.callCount).to.equal(7);
      expect(react.firstCall.firstArg).to.equal("⚔");
    });
  });
  describe("Reactor role management", () => {
    const spies = {
      add: spy(),
      create: spy(),
      remove: spy(),
    };
    const member: unknown = {
      guild: {
        roles: {
          cache: [
            { id: "id1", name: "M+ DPS" },
            { id: "id2", name: "M+ Tank" },
          ],
          create: spies.create,
        },
      },
      roles: {
        cache: {
          has: (id: string) => id === "id2",
        },
        add: spies.add,
        remove: spies.remove,
      },
    };
    const reactor = new RoleReactor();

    beforeEach(() => {
      spies.add.resetHistory();
      spies.remove.resetHistory();
      spies.create.resetHistory();
    });

    const testCases: [
      string,
      "applyRole" | "removeRole",
      unknown,
      [keyof typeof spies, number][]
    ][] = [
      [
        "ignores applying reactions that are not linked to a role",
        "applyRole",
        {
          emoji: "✌",
        },
        [["add", 0]],
      ],
      [
        "ignores removing reactions that are not linked to a role",
        "removeRole",
        {
          emoji: "✌",
        },
        [["remove", 0]],
      ],
      [
        "adds reactions that are linked to a role",
        "applyRole",
        {
          emoji: "⚔",
        },
        [
          ["add", 1],
          ["create", 0],
        ],
      ],
      [
        "ignores reactions that are already applied to a member",
        "applyRole",
        {
          emoji: "🛡",
        },
        [
          ["add", 0],
          ["create", 0],
        ],
      ],
      [
        "creates reactions that are linked to a role",
        "applyRole",
        {
          emoji: "🚑",
        },
        [
          ["add", 1],
          ["create", 1],
        ],
      ],
      [
        "ignores removing roles that do not exist in the guild",
        "removeRole",
        {
          emoji: "🚑",
        },
        [["remove", 0]],
      ],
      [
        "removes roles that are applied to a member",
        "removeRole",
        {
          emoji: "🛡",
        },
        [["remove", 1]],
      ],
    ];
    for (const [description, reactMethod, reaction, tests] of testCases) {
      it(description, async () => {
        await reactor[reactMethod](reaction as MessageReaction, member as GuildMember);
        for (const [method, count] of tests) {
          expect(spies[method].callCount).to.equal(count);
        }
      });
    }
  });
});
