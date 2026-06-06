module.exports = {
  testEnvironment: "node",
  testMatch: ["<rootDir>/src/**/*.test.ts"],
  setupFiles: ["<rootDir>/src/test/setupEnv.ts"],
  setupFilesAfterEnv: ["<rootDir>/src/test/setupDb.ts"],
  transform: {
    "^.+\\.ts$": ["ts-jest", { tsconfig: "tsconfig.test.json" }],
  },
  clearMocks: true,
  restoreMocks: true,
};
