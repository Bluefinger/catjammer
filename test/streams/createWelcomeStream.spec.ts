import { expect } from "chai";
import type { Client } from "discord.js";
import { EventEmitter } from "events";
import { spy } from "sinon";
import { createWelcomeStream } from "../../src/streams";

describe("createWelcomeStream", () => {
  it("returns an Observable that can be subscribed to", () => {
    const fakeClient = new EventEmitter();
    const observable = createWelcomeStream(fakeClient as Client);
    expect("subscribe" in observable).to.be.true;
    const handler = spy();
    const subscription = observable.subscribe(handler);
    expect("unsubscribe" in subscription).to.be.true;
    fakeClient.emit("guildMemberAdd", {});
    expect(handler.called).to.be.true;
  });
  it("cleans up event handlers when subscription is ended", () => {
    const fakeClient = new EventEmitter();
    const subscription = createWelcomeStream(fakeClient as Client).subscribe(() => {});
    expect(fakeClient.listenerCount("guildMemberAdd")).to.equal(1);
    subscription.unsubscribe();
    expect(fakeClient.listenerCount("guildMemberAdd")).to.equal(0);
  });
});
