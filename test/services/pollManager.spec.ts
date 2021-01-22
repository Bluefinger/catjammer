import { PollManager, emojis } from "../../src/services/pollManager";
import { expect } from "chai";
import { spy, fake, stub, useFakeTimers } from "sinon";
import { TextChannel } from "discord.js";

describe("PollManager", () => {
  describe("createPoll", () => {
    const pollManager = new PollManager();
    const reactSpy = spy();
    const messageFake: unknown = { react: reactSpy };
    const channel: unknown = { send: fake.resolves(messageFake) };
    const finishPollStub = stub(pollManager, "finishPoll");
    const timeoutStub = stub(pollManager, "fuckMe");

    beforeEach(() => {});
    it("calls finishPoll successfully", async () => {
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
      const clock = useFakeTimers();
      const spyCallback = spy();
      pollManager.fuckMe(() => {
        spyCallback();
      }, 100);
      clock.runAll();
      expect(spyCallback.called).to.be.true;
      clock.uninstall();
    });
  });
});
