import { expect } from "chai";
import { spy } from "sinon";
import { ExtractedCommand } from "../../src/matcher";
import { Store } from "../../src/services";
import { postGif } from "../../src/commands/postGif";

describe("g command", () => {
  const services = {
    store: new Store(),
  };
  const sendSpy = spy();
  const message: unknown = {
    channel: {
      send: sendSpy,
    },
    guild: {
      id: "1234",
    },
  };

  const args: unknown = {
    name: "catJAM",
  };

  beforeEach(() => sendSpy.resetHistory());

  it("return silently if no array in store", async () => {
    await postGif.execute({ message, args, services } as ExtractedCommand);
    expect(sendSpy.called).to.be.false;
  });

  it("return silently if gif not contained in store", async () => {
    await services.store.set("gifs::1234", []);
    await postGif.execute({ message, args, services } as ExtractedCommand);
    expect(sendSpy.called).to.be.false;
  });

  it("post link when gif found", async () => {
    await services.store.set("gifs::1234", [["catJAM", "link"]]);
    await postGif.execute({ message, args, services } as ExtractedCommand);
    expect(sendSpy.firstCall.args[0]).to.be.eql("link");
  });
});
