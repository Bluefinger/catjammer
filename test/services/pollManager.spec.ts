import { PollManager, emojis, PollMessage } from "../../src/services/pollManager";
import { expect } from "chai";
import { spy, fake, stub, useFakeTimers, SinonFakeTimers, assert } from "sinon";
import { TextChannel, GuildMember, MessageReaction } from "discord.js";

const errorTest = async (func: () => Promise<void>, expectedError: string): Promise<void> => {
  try {
    await func();
    assert.fail("Error not thrown");
  } catch (err) {
    const error = err as Error;
    expect(error.message).to.be.eql(expectedError);
  }
};

describe("PollManager", () => {
  let clock: SinonFakeTimers;
  beforeEach(function () {
    clock = useFakeTimers();
  });
  afterEach(function () {
    clock?.restore();
  });
  describe("createPoll", () => {
    const reactSpy = spy();
    const messageFake: unknown = { react: reactSpy };
    const channel: unknown = { send: fake.resolves(messageFake) };

    beforeEach(() => {});
    it("calls finishPoll successfully", async () => {
      const pollManager = new PollManager();
      const finishPollStub = stub(pollManager, "finishPoll");
      const timeoutStub = stub(pollManager, "fuckMe");
      const pollOptions = ["one", "two", "three"];
      const duration = 100;
      await pollManager.createPoll(channel as TextChannel, "test", pollOptions, true, duration);
      expect(timeoutStub.called).to.be.true;
      const callBack = timeoutStub.firstCall.args[0] as () => void;
      callBack();
      const reactCalls = reactSpy.getCalls();
      expect(reactCalls.length).to.eql(pollOptions.length);
      for (let i = 0; i < pollOptions.length; i++) {
        expect(reactCalls[i].firstArg === emojis[i]).to.be.true;
      }
      expect(finishPollStub.called).to.be.true;
    });
    it("fuckMe works", () => {
      const pollManager = new PollManager();
      const spyCallback = spy();
      pollManager.fuckMe(() => {
        spyCallback();
      }, 100);
      expect(clock.countTimers()).to.equal(1);
      console.log(clock.runAll());
      expect(spyCallback.called).to.be.true;
    });
  });

  describe("finish poll", () => {
    const id = "1";
    it("finish poll runs successfully", async () => {
      const pollManager = new PollManager();

      const sendSpy = spy();
      const deleteSpy = spy();
      const choices = new Map<string, string>();
      const reactionArray = [
        { emoji: emojis[0], count: 2 },
        { emoji: emojis[1], count: 3 },
        { emoji: emojis[2], count: 4 },
      ];
      choices.set(emojis[0], "one");
      choices.set(emojis[1], "two");
      choices.set(emojis[2], "three");
      const poll: unknown = {
        choices: choices,
        message: {
          channel: { send: sendSpy, delete: deleteSpy },
          reactions: { cache: { array: fake.returns(reactionArray) } },
          delete: deleteSpy,
        },
      };
      pollManager.add(id, poll as PollMessage);
      await pollManager.finishPoll(id);
      expect(deleteSpy.called).to.be.true;
      expect(sendSpy.called).to.be.true;
    });
    it("throws error on null message", async () => {
      const nullMessagePoll = new PollManager();
      const testFunc = async () => {
        await nullMessagePoll.finishPoll(id);
      };
      await errorTest(testFunc, "Message does not exist in cache");
    });
    it("throws error on null array from reactions", async () => {
      const pollManager = new PollManager();
      const poll: unknown = {
        message: { reactions: { cache: { array: fake.returns(undefined) } } },
      };
      pollManager.add("1", poll as PollMessage);
      const testFunc = async () => {
        await pollManager.finishPoll(id);
      };
      await errorTest(testFunc, "Reactions array is null");
    });
    it("throws error on null counts", async () => {
      const pollManager = new PollManager();
      const choices = new Map<string, string>();
      const reactionArray = [
        { emoji: emojis[0], count: null },
        { emoji: emojis[1], count: null },
        { emoji: emojis[2], count: null },
      ];
      choices.set(emojis[0], "one");
      choices.set(emojis[1], "two");
      choices.set(emojis[2], "three");
      const poll: unknown = {
        choices: choices,
        message: {
          reactions: { cache: { array: fake.returns(reactionArray) } },
        },
      };
      pollManager.add(id, poll as PollMessage);
      const testFunc = async () => {
        await pollManager.finishPoll(id);
      };
      await errorTest(testFunc, "Reaction has a null count");
    });
    it("throws error when reaction does not exist in choices", async () => {
      const pollManager = new PollManager();
      const choices = new Map<string, string>();
      const reactionArray = [
        { emoji: emojis[0], count: 1 },
        { emoji: emojis[1], count: 2 },
        { emoji: emojis[2], count: 3 },
      ];
      const poll: unknown = {
        choices: choices,
        message: {
          reactions: { cache: { array: fake.returns(reactionArray) } },
        },
      };
      pollManager.add(id, poll as PollMessage);
      const testFunc = async () => {
        await pollManager.finishPoll(id);
      };
      await errorTest(testFunc, "Poll choice does not exist in cache");
    });
  });
  describe("has", () => {
    it("successfully returns true", () => {
      const pollManager = new PollManager();
      pollManager.add("1", {} as PollMessage);
      expect(pollManager.has("1")).to.be.true;
    });
    it("return false when no poll", () => {
      const pollManager = new PollManager();
      pollManager.add("1", {} as PollMessage);
      expect(pollManager.has("2")).to.be.false;
    });
  });

  describe("delete", () => {
    it("successfully deletes poll", () => {
      const pollManager = new PollManager();
      pollManager.add("1", {} as PollMessage);
      pollManager.remove("1");
      expect(pollManager.has("1")).to.be.false;
    });
  });

  describe("reactionHandler", () => {
    const removeSpy = spy();
    const id = "1";
    // const reaction: unknown = { remove: removeSpy, message: { id: id } };
    const pollManager = new PollManager();

    const pollMessage: unknown = {
      choices: { keys: fake.returns([emojis[0], emojis[1], emojis[2]]) },
      mutExcl: true,
    };
    const nonExclPollMessage: unknown = {
      choices: { keys: fake.returns([emojis[0], emojis[1], emojis[2]]) },
      mutExcl: false,
    };
    pollManager.add(id, pollMessage as PollMessage);
    pollManager.add("2", nonExclPollMessage as PollMessage);
    const removeReactionStub = stub(pollManager, "removePreviousReaction");
    beforeEach(() => {
      removeSpy.resetHistory();
      removeReactionStub.resetHistory();
    });
    it("remove reaction if emoji is not included in choices", async () => {
      const emoji: unknown = {
        toString: fake.returns(emojis[6]),
      };
      const reaction: unknown = {
        remove: removeSpy,
        message: { id: id },
        emoji: emoji,
      };
      await pollManager.reactionHandler(reaction as MessageReaction, {} as GuildMember);
      expect(removeSpy.called).to.be.true;
    });
    it("call removeProviousReaction if mutually exclusive", async () => {
      const emoji: unknown = {
        toString: fake.returns(emojis[0]),
      };
      const reaction: unknown = {
        remove: removeSpy,
        message: { id: id },
        emoji: emoji,
      };
      await pollManager.reactionHandler(reaction as MessageReaction, {} as GuildMember);
      expect(removeReactionStub.called).to.be.true;
    });
    it("do not call removePreviosReaction if not mutually exlusive", async () => {
      const emoji: unknown = {
        toString: fake.returns(emojis[0]),
      };
      const reaction: unknown = {
        remove: removeSpy,
        message: { id: "2" },
        emoji: emoji,
      };
      await pollManager.reactionHandler(reaction as MessageReaction, {} as GuildMember);
      expect(removeReactionStub.called).to.be.false;
    });
    it("throws error when message id is missing in cache", async () => {
      const reaction: unknown = {
        remove: removeSpy,
        message: { id: "9" },
      };
      await errorTest(
        async () =>
          await pollManager.reactionHandler(reaction as MessageReaction, {} as GuildMember),
        "Message ID does not exist in poll cache"
      );
    });
  });
  describe("removePreviousReaction", () => {
    const pollManager = new PollManager();
    const removeSpy = spy();
    const reactionArray = [
      { emoji: { toString: fake.returns(emojis[0]) }, users: { remove: removeSpy } },
      { emoji: { toString: fake.returns(emojis[1]) }, users: { remove: removeSpy } },
    ];
    const reaction: unknown = {
      emoji: { toString: fake.returns(emojis[0]) },
      message: { reactions: { cache: { array: fake.returns(reactionArray) } } },
    };
    it("removes previous reaction", async () => {
      await pollManager.removePreviousReaction(reaction as MessageReaction, {} as GuildMember);
      expect(removeSpy.called).to.be.true;
    });
  });
});
