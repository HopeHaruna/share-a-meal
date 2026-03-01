module.exports = {
	testEnvironment: "node",
	setupFilesAfterEnv: ["./tests/setup.js"],
	testTimeout: 30000,
	verbose: true,
};
// jest.setup.js
require('dotenv').config({ path: '.env.test' });
const { execSync } = require('child_process');

beforeAll(() => {
  // Optional: run migrations on test DB before tests
  execSync('npm run migrate:test', { stdio: 'inherit' });
});

afterAll(() => {
  // Optional: clean up
});

jest.setTimeout(30000);