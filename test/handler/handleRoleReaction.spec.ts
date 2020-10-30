import { expect } from "chai";
import { spy } from "sinon";
import { handleRoleReaction } from "../../src/handler";
import type { RoleReaction, Services } from "../../src/index.types";

describe("handleRoleReaction", () => {
  const applySpy = spy();
  const removeSpy = spy();
  const services: unknown = {
    roleReactor: {
      applyRole: applySpy,
      removeRole: removeSpy,
    },
  };
  const handler = handleRoleReaction(services as Services);
  beforeEach(() => {
    applySpy.resetHistory();
    removeSpy.resetHistory();
  });
  it("should apply a role on a add type reaction", async () => {
    const event: unknown = {
      type: "add",
      reaction: {},
      member: {},
    };
    await handler(event as RoleReaction);
    expect(applySpy.callCount).to.equal(1);
  });
  it("should remove a role on a remove type reaction", async () => {
    const event: unknown = {
      type: "remove",
      reaction: {},
      member: {},
    };
    await handler(event as RoleReaction);
    expect(removeSpy.callCount).to.equal(1);
  });
  it("should catch errors and log them", async () => {
    const error = new Error("a test error");
    const logSpy = spy();
    const badServices: unknown = {
      roleReactor: {
        applyRole: () => Promise.reject(error),
      },
      log: {
        error: logSpy,
      },
    };
    const event: unknown = {
      type: "add",
      reaction: {},
      member: {},
    };
    const failHandler = handleRoleReaction(badServices as Services);
    await failHandler(event as RoleReaction);
    expect(logSpy.callCount).to.equal(1);
    expect(logSpy.firstCall.firstArg).to.equal(error);
  });
});
