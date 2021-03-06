import { color, isValidHex, removePreviousColor } from "../../src/commands/color";
import { assert, expect } from "chai";
import { spy, fake } from "sinon";
import { Message, Collection, SnowflakeUtil, GuildMember, Snowflake, Role } from "discord.js";
import { ExtractedCommand } from "../../src/matcher";
import { GuildMessage } from "../../src/index.types";

describe("color commands", () => {
  describe("validation", () => {
    it("should reject invalid hex color value", () => {
      expect(isValidHex("#0ghh7i")).to.be.false;
    });

    it("should accept valid hex color value", () => {
      expect(isValidHex("#000000")).to.be.true;
    });
  });

  describe("removePreviousColor function", () => {
    const hexRegex = /^#[0-9a-f]{6}$/;
    const removeSpy = spy();
    const deleteSpy = spy();
    beforeEach(() => {
      removeSpy.resetHistory();
      deleteSpy.resetHistory();
    });
    it("should return true after removing role", async () => {
      const cache = new Collection();
      const members = {
        size: 0,
      };
      cache.set(SnowflakeUtil.generate(), { name: "#0f0f0f", delete: deleteSpy, members: members });
      const user: unknown = {
        roles: {
          cache: cache,
          remove: removeSpy,
        },
      };
      const result = await removePreviousColor(user as GuildMember, hexRegex);
      expect(result && removeSpy.called).to.be.true;
    });

    it("should not delete role if size is greater than 0", async () => {
      const cache = new Collection();
      const members = {
        size: 2,
      };
      cache.set(SnowflakeUtil.generate(), { name: "#0f0f0f", delete: deleteSpy, members: members });
      const user: unknown = {
        roles: {
          cache: cache,
          remove: removeSpy,
        },
      };
      const result = await removePreviousColor(user as GuildMember, hexRegex);
      expect(result && !deleteSpy.called).to.be.true;
    });

    it("should return false when no color role exists", async () => {
      const cache = new Collection();
      const removeSpy = spy();
      cache.set(SnowflakeUtil.generate(), { name: "happy" });
      const user: unknown = {
        roles: {
          cache: cache,
          remove: removeSpy,
        },
      };
      const result = await removePreviousColor(user as GuildMember, hexRegex);
      expect(result).to.be.false;
    });

    it("should call delete if role has 0 members on it", async () => {
      const cache = new Collection();
      const members = {
        size: 0,
      };
      cache.set(SnowflakeUtil.generate(), { name: "#0f0f0f", delete: deleteSpy, members: members });
      const user: unknown = {
        roles: {
          cache: cache,
          remove: removeSpy,
        },
      };
      await removePreviousColor(user as GuildMember, hexRegex);
      expect(deleteSpy.called).to.be.true;
    });
  });

  describe("execute", () => {
    const replySpy = spy();
    const addSpy = spy();
    const createSpy = spy();

    beforeEach(() => {
      replySpy.resetHistory();
      addSpy.resetHistory();
      createSpy.resetHistory();
    });
    it("should reject invalid hex argument", async () => {
      const args: Record<string, string> = { colorHex: "#0g0g0g" };
      const message: unknown = { reply: replySpy };
      await color.execute({
        message: message as Message,
        args,
      } as ExtractedCommand);
      expect(replySpy.firstCall.args[0]).to.be.eql("Invalid hex value");
    });

    const cache = new Collection<Snowflake, Role>();
    cache.set(SnowflakeUtil.generate(), { name: "ehawjkhejkhe" } as Role);
    cache.set(SnowflakeUtil.generate(), { name: "#ffffff" } as Role);
    const fetchFake = fake.returns({ cache: cache });

    const membersCache = new Collection<Snowflake, GuildMember>();
    membersCache.set(SnowflakeUtil.generate(), { user: { id: "fake" } } as GuildMember);
    const memberSpy: unknown = {
      user: {
        id: "author",
      },
      roles: {
        add: addSpy,
        cache: {
          find: fake(),
        },
      },
    };
    membersCache.set(SnowflakeUtil.generate(), memberSpy as GuildMember);

    const guild: unknown = {
      roles: {
        fetch: fetchFake,
        create: createSpy,
      },
      members: {
        cache: membersCache,
      },
    };

    it("should throw an error if role.fetch fails", async () => {
      const args: Record<string, string> = {
        colorHex: "#000000",
      };
      const altGuild: unknown = {
        roles: {
          fetch: fake.returns(undefined),
          create: createSpy,
        },
      };
      const message: unknown = {
        guild: altGuild,
        reply: replySpy,
        author: {
          id: "author",
        },
      };

      try {
        await color.execute({ message: message as GuildMessage, args: args } as ExtractedCommand);
        assert.fail("No error thrown");
      } catch (err) {
        const error = err as Error;
        expect(error.message).to.be.eql("Role fetch failed");
      }
    });

    it("throws an error if no GuildMember is found in the guild", async () => {
      const args: Record<string, string> = {
        colorHex: "#000000",
      };
      const memberlessGuild: unknown = {
        roles: {
          fetch: fetchFake,
          create: createSpy,
        },
        members: {
          cache: {
            find: fake.returns(undefined),
          },
        },
      };
      const message: unknown = {
        guild: memberlessGuild,
        reply: replySpy,
        author: {
          id: "author",
        },
      };
      try {
        await color.execute({ message: message as GuildMessage, args: args } as ExtractedCommand);
        assert.fail("No error thrown");
      } catch (err) {
        const error = err as Error;
        expect(error.message).to.be.eql("GuildMember find failed");
      }
    });

    const message: unknown = {
      guild: guild,
      reply: replySpy,
      author: {
        id: "author",
      },
    };

    it("should call be successful when given good hex value", async () => {
      const args: Record<string, string> = {
        colorHex: "#000000",
      };

      await color.execute({ message: message as GuildMessage, args: args } as ExtractedCommand);
      expect(replySpy.firstCall.args[0]).to.be.eql("New color set");
    });

    it("should call be successful when given hex value in upper case", async () => {
      const args: Record<string, string> = {
        colorHex: "#AAAAAA",
      };

      await color.execute({ message: message as GuildMessage, args: args } as ExtractedCommand);
      expect(replySpy.firstCall.args[0]).to.be.eql("New color set");
    });

    it("should call add role function when given good values", async () => {
      const args: Record<string, string> = {
        colorHex: "#0f0f0f",
      };
      await color.execute({ message: message as GuildMessage, args: args } as ExtractedCommand);
      expect(addSpy.called).to.be.true;
    });
    it("call add role without creating new role", async () => {
      const args: Record<string, string> = {
        colorHex: "#ffffff",
      };
      await color.execute({ message: message as GuildMessage, args: args } as ExtractedCommand);
      expect(addSpy.called && !createSpy.called).to.be.true;
    });
  });
});
