import { expect } from "chai";
import { spy } from "sinon";
import { handleCommand } from "../../src/handler";
import { MatchedCommand } from "../../src/matcher";

describe("handlerCommand.ts", () => {
  describe("handleCommand", () => {
    it("takes a MatchedCommand response and tries to execute it", async () => {
      const spyExecute = spy<(command: MatchedCommand) => Promise<void>>(() => Promise.resolve());
      const matched = {
        matched: true,
        command: {
          execute: spyExecute,
        },
      } as unknown;
      await handleCommand(matched as MatchedCommand);
      expect(spyExecute.callCount).to.equal(1);
      expect(spyExecute.calledWith(matched as MatchedCommand)).to.be.true;
    });
    it("handles unexpected errors and returns a message", async () => {
      const error = new Error("a fail");
      const spyExecute = spy<(command: MatchedCommand) => Promise<void>>(() =>
        Promise.reject(error)
      );
      const spyMessage = spy<(message: string) => Promise<void>>(() => Promise.resolve());
      const spyErrorLog = spy();
      const matched = {
        matched: true,
        command: {
          execute: spyExecute,
        },
        message: {
          reply: spyMessage,
        },
        services: {
          log: {
            error: spyErrorLog,
          },
        },
      } as unknown;
      try {
        await handleCommand(matched as MatchedCommand);
        expect.fail("Should not resolve");
      } catch (e) {
        expect(spyExecute.callCount).to.equal(1);
        expect(spyExecute.calledWith(matched as MatchedCommand)).to.be.true;
        expect(spyMessage.callCount).to.equal(1);
        expect(spyMessage.calledWith("there was an error executing that command")).to.be.true;
        expect(spyErrorLog.callCount).to.equal(1);
        expect(spyErrorLog.calledWith(error)).to.be.true;
      }
    });
    it("takes an InvalidCommand response with details and returns a message", async () => {
      const spyMessage = spy<(message: string) => Promise<void>>(() => Promise.resolve());
      const matched = {
        matched: false,
        details: "A fail message",
        message: {
          reply: spyMessage,
        },
      } as unknown;
      await handleCommand(matched as MatchedCommand);
      expect(spyMessage.callCount).to.equal(1);
      expect(spyMessage.calledWith("A fail message")).to.be.true;
    });
    it("takes an InvalidCommand response with no details and ignores it", async () => {
      const spyMessage = spy<(message: string) => Promise<void>>(() => Promise.resolve());
      const matched = {
        matched: false,
        message: {
          reply: spyMessage,
        },
      } as unknown;
      await handleCommand(matched as MatchedCommand);
      expect(spyMessage.callCount).to.equal(0);
    });
  });
});
