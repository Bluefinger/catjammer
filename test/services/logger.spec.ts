import { expect } from "chai";
import { Logger } from "../../src/services";
import { PassThrough } from "stream";
import { spy, useFakeTimers, SinonFakeTimers } from "sinon";

describe("logger.ts", () => {
  let clock: SinonFakeTimers;
  beforeEach(function () {
    clock = useFakeTimers();
  });
  afterEach(function () {
    clock?.restore();
  });
  describe("Logging Service", () => {
    it("logs info messages", () => {
      const stdout = new PassThrough({ encoding: "utf-8" });
      const stderr = new PassThrough({ encoding: "utf-8" });
      const handler = spy();

      stdout.on("data", handler);

      const logger = new Logger({ stdout, stderr });

      logger.info("An info message");

      expect(handler.callCount).to.equal(1);
      expect(handler.firstCall.firstArg).to.equal(
        "[1970-01-01 00:00:00.000 UTC]: <INFO> An info message\n"
      );
    });
    it("logs error messages", () => {
      const stdout = new PassThrough({ encoding: "utf-8" });
      const stderr = new PassThrough({ encoding: "utf-8" });
      const handler = spy();

      stderr.on("data", handler);

      const logger = new Logger({ stdout, stderr });

      logger.error("An error message");

      expect(handler.callCount).to.equal(1);
      expect(handler.firstCall.firstArg).to.equal(
        "[1970-01-01 00:00:00.000 UTC]: <ERROR> An error message\n"
      );
    });
  });
});
