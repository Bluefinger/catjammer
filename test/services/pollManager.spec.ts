import { PollManager, emojis } from "../../src/services/pollManager";
import { expect } from "chai";
import { spy, fake, stub, useFakeTimers } from "sinon";
import { TextChannel } from "discord.js";

describe("PollManager", () => {
  describe("createPoll", () => {
    const pollManager = new PollManager();
    const reactSpy = spy();
    const messageFake: unknown = { react: reactSpy };
    const channel: unknown = { send: fake.returns(messageFake) };
    const finishPollStub = stub(pollManager, "finishPoll");

    const clock = useFakeTimers();
    beforeEach(() => {});
    it("calls finishPoll successfully", async () => {
      const pollOptions = ["one", "two", "three"];
      await pollManager.createPoll(channel as TextChannel, "test", pollOptions, true, 1000);
      const ms = clock.runAll();
      console.log(ms);
      const reactCalls = reactSpy.getCalls();
      expect(reactCalls.length).to.eql(pollOptions.length);
      for (let i = 0; i < pollOptions.length; i++) {
        expect(reactCalls[i].firstArg === emojis[i]).to.be.true;
      }
      expect(finishPollStub.called).to.be.true;
    });
  });
});
