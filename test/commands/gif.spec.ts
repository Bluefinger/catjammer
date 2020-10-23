import { expect } from "chai";
import { gif } from "../../src/commands/gif";
import { spy } from "sinon";
import { Store } from "../../src/services";
import { ExtractedCommand } from "../../src/matcher/types";

describe("gif command", () => {
  const replySpy = spy();
  const message: unknown = {
    reply: replySpy,
    guild: {
      id: "1234",
    },
  };
  const services = {
    store: new Store(),
  };

  beforeEach(() => {
    replySpy.resetHistory();
    services.store = new Store();
  });
  it("reject add without gif argument", async () => {
    const args: unknown = {
      action: "add",
      message: "test",
    };
    await gif.execute({ message, args, services } as ExtractedCommand);
    expect(replySpy.firstCall.args[0]).to.be.eql("No gif argument");
  });

  it("reject incorrect action", async () => {
    const args: unknown = {
      action: "bad",
      message: "test",
    };
    await gif.execute({ message, args, services } as ExtractedCommand);
    expect(replySpy.firstCall.args[0]).to.be.eql("Invalid action");
  });

  it("successfully add with no map in store", async () => {
    const args: unknown = {
      action: "add",
      message: "catJAM giflink",
    };

    await gif.execute({ message, args, services } as ExtractedCommand);
    expect(replySpy.firstCall.args[0]).to.be.eql("Gif successfully set");
  });

  it("successfully add with map already in store", async () => {
    const args: unknown = {
      action: "add",
      message: "catJAM giflink",
    };
    await services.store.set("gifs::1234", []);

    await gif.execute({ message, args, services } as ExtractedCommand);
    expect(replySpy.firstCall.args[0]).to.be.eql("Gif successfully set");
  });

  it("reject name that is already is use", async () => {
    const args: unknown = {
      action: "add",
      message: "catJAM giflink",
    };

    await services.store.set("gifs::1234", [["catJAM", "giflink"]]);

    await gif.execute({ message, args, services } as ExtractedCommand);
    expect(replySpy.firstCall.args[0]).to.be.eql("Name already in use");
  });

  it("reject remove where gif array doesn't exist", async () => {
    const args: unknown = {
      action: "remove",
      message: "catJAM giflink",
    };

    await gif.execute({ message, args, services } as ExtractedCommand);
    expect(replySpy.firstCall.args[0]).to.be.eql("No gifs set");
  });

  it("reject remove where gif isn't in store", async () => {
    const args: unknown = {
      action: "remove",
      message: "catJAM blah",
    };

    await services.store.set("gifs::1234", []);

    await gif.execute({ message, args, services } as ExtractedCommand);
    expect(replySpy.firstCall.args[0]).to.be.eql("Gif not found");
  });

  it("successfully remove gif", async () => {
    const args: unknown = {
      action: "remove",
      message: "catJAM blah",
    };

    await services.store.set("gifs::1234", [["catJAM", "test"]]);

    await gif.execute({ message, args, services } as ExtractedCommand);
    expect(replySpy.firstCall.args[0]).to.be.eql("catJAM has been removed.");
  });
});
