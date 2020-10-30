import { expect } from "chai";
import { spy } from "sinon";
import { handleReactorRemove } from "../../src/handler";
import { GuildMessage, Services } from "../../src/index.types";

describe("handleReactorRemoval", () => {
  const error = new Error("a test error");
  const remove = spy((id: string) => id === "id1");
  const deleteSpy = spy((id: string) =>
    id === "reactor::fail" ? Promise.reject(error) : Promise.resolve(true)
  );
  const logSpy = spy();
  const services: unknown = {
    roleReactor: {
      remove,
    },
    store: {
      delete: deleteSpy,
    },
    log: {
      error: logSpy,
    },
  };
  const handler = handleReactorRemove(services as Services);
  beforeEach(() => {
    remove.resetHistory();
    deleteSpy.resetHistory();
    logSpy.resetHistory();
  });
  it("should ignore deleted messages that are not a reactor message", async () => {
    const event: unknown = {
      id: "id0",
      guild: {
        id: "guild0",
      },
    };
    await handler(event as GuildMessage);
    expect(remove.called).to.be.true;
    expect(remove.firstCall.returnValue).to.be.false;
  });
  it("should remove reactor messages from the store that have been deleted", async () => {
    const event: unknown = {
      id: "id1",
      guild: {
        id: "guild0",
      },
    };
    await handler(event as GuildMessage);
    expect(remove.called).to.be.true;
    expect(remove.firstCall.returnValue).to.be.true;
    expect(deleteSpy.called).to.be.true;
    expect(deleteSpy.firstCall.firstArg).to.equal("reactor::guild0");
  });
  it("should handle errors and log them", async () => {
    const event: unknown = {
      id: "id1",
      guild: {
        id: "fail",
      },
    };
    await handler(event as GuildMessage);
    expect(logSpy.called).to.be.true;
    expect(logSpy.firstCall.firstArg).to.equal(error);
  });
});
