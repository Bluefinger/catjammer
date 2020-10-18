import { expect } from "chai";
import { GuildMember } from "discord.js";
import { spy } from "sinon";
import { handleGreeting } from "../../src/handler";
import { Services } from "../../src/index.types";

describe("handleGreeting", () => {
  const fakeLogger = {
    error: spy(),
  };
  const fakeSend = spy();
  const services: unknown = {
    store: {
      get: (key: string) =>
        Promise.resolve(key === "greeting::1111" ? "A welcome message" : undefined),
    },
    log: fakeLogger,
  };
  const handler = handleGreeting(services as Services);

  beforeEach(() => {
    fakeLogger.error.resetHistory();
    fakeSend.resetHistory();
  });

  it("should DM the new guild member with a welcome message", async () => {
    const payload: unknown = { send: fakeSend, guild: { id: "1111" } };
    await handler(payload as GuildMember);
    expect(fakeSend.firstCall.args[0]).to.equal("A welcome message");
  });
  it("should not DM the new guild member if there's no welcome message", async () => {
    const payload: unknown = { send: fakeSend, guild: { id: "1112" } };
    await handler(payload as GuildMember);
    expect(fakeSend.called).to.be.false;
  });
  it("should log the error if something goes wrong with handling the event", async () => {
    const error = new Error("Something went wrong");
    const payload: unknown = {
      send: () => Promise.reject(error),
      guild: { id: "1111" },
    };
    try {
      await handler(payload as GuildMember);
      expect(fakeLogger.error.firstCall.args[0]).to.equal(error);
    } catch (error) {
      expect.fail("Should have been handled successfully");
    }
  });
});
