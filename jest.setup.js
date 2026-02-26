// Set test environment variables
process.env.NODE_ENV = "test";
process.env.DB_NAME = "sharemeal_test"; // Separate test database
process.env.JWT_SECRET = "test-secret-key-12345";
process.env.JWT_EXPIRES_IN = "24h";
process.env.ADMIN_SECRET = "test-admin-secret";
process.env.SERVICE_TOKEN = "test-service-token";

// Increase timeout for database operations
jest.setTimeout(10000);
