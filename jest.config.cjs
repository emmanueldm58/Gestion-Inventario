// jest.config.cjs
module.exports = {
    testEnvironment: "jsdom",
    transform: {
      "^.+\\.jsx?$": "babel-jest",
    },
    moduleNameMapper: {
      "\\.(css|less|scss)$": "identity-obj-proxy",
    },
    setupFilesAfterEnv: ["<rootDir>/setupTests.js"],
  };
  