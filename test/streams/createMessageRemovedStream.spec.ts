import { expect } from "chai";
import type { Client } from "discord.js";
import { EventEmitter } from "events";
import { spy } from "sinon";
import { createMessageRemovedStream } from "../../src/streams";

describe("createMessageRemovedStream", () => {
  it("receives messageDelete events and filters out non-guild messages", () => {
    const client = new EventEmitter();
    const stream = createMessageRemovedStream(client as Client);
    const handler = spy();
    stream.subscribe(handler);
    client.emit("messageDelete", { guild: null });
    expect(handler.callCount).to.equal(0);
    client.emit("messageDelete", { guild: {} });
    expect(handler.callCount).to.equal(1);
  });
  it("cleans up event handlers when subscription is ended", () => {
    const client = new EventEmitter();
    const stream = createMessageRemovedStream(client as Client);
    const handler = spy();
    const subscription = stream.subscribe(handler);
    expect(client.listenerCount("messageDelete")).to.equal(1);
    subscription.unsubscribe();
    expect(client.listenerCount("messageDelete")).to.equal(0);
  });
});
