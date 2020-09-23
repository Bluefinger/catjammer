module.exports = {
  checkLeaks: false,
  diff: true,
  color: true,
  extension: ["ts"],
  growl: false,
  reporter: "spec",
  recursive: false,
  require: ["ts-node/register"],
  spec: "test/**/*.spec.ts",
  slow: 500,
  // parallel: !process.env.CI,
};
