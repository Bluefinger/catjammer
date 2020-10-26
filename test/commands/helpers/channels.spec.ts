import { expect } from "chai";
import type { TextChannel } from "discord.js";
import { getTextChannel, isTextChannel } from "../../../src/commands/helpers/channels";
import type { GuildMessage } from "../../../src/index.types";

describe("channel helpers", () => {
  describe("isTextChannel", () => {
    it("checks a channel to see if it is a TextChannel type", () => {
      expect(isTextChannel({ type: "text" } as TextChannel)).to.be.true;
    });
  });
  describe("getTextChannel", () => {
    const message: unknown = {
      guild: {
        channels: {
          cache: [
            { id: "general", type: "text" },
            { id: "invalid", type: "bad" },
          ],
        },
      },
    };
    it("returns a TextChannel from a valid id", () => {
      expect(getTextChannel(message as GuildMessage, "general")).to.deep.equal({
        id: "general",
        type: "text",
      });
    });
    it("should throw an error if it can't find a channel", () => {
      expect(() => getTextChannel(message as GuildMessage, "missing")).to.throw(
        "Not a text channel"
      );
    });
    it("should throw an error if the channel isn't a TextChannel", () => {
      expect(() => getTextChannel(message as GuildMessage, "invalid")).to.throw(
        "Not a text channel"
      );
    });
  });
});
