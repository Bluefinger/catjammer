import { expect } from "chai";
import { extractId } from "../../../src/commands/helpers/mentions";

const testCases: [string, string, string][] = [
  ["extracts an id from a user mention", "<@1234>", "1234"],
  ["extracts an id from a nickname mention", "<@!1234>", "1234"],
  ["extracts an id from a role mention", "<@&1234>", "1234"],
  ["extracts an id from a room mention", "<#1234>", "1234"],
  ["does not extract an invalid mention", "<~1234>", ""],
  ["does not extract a normal message", "Hello guys!", ""],
];

describe("mention helpers", () => {
  describe("extractId", () => {
    for (const [description, mention, expected] of testCases) {
      it(description, () => {
        expect(extractId(mention)).to.equal(expected);
      });
    }
  });
});
