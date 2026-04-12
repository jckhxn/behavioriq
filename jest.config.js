module.exports = {
  testEnvironment: "jsdom",
  testMatch: [
    "**/__tests__/**/*.jest.(ts|tsx|js|jsx)",
    "**/?(*.)+(spec|test).jest.(ts|tsx|js|jsx)",
  ],
  moduleFileExtensions: ["js", "jsx", "ts", "tsx"],
  setupFilesAfterEnv: ["<rootDir>/setupTests.js"],
};
