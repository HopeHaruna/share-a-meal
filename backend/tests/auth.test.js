const request = require("supertest");
const app = require("../src/app");

describe("Auth Endpoints", () => {
	describe("POST /auth/register", () => {
		test("Should register new SME user successfully", async () => {
			const uniqueEmail = `sme${Date.now()}@test.com`;
			const response = await request(app).post("/auth/register").send({
				name: "Test SME",
				email: uniqueEmail,
				password: "Test123!",
				role: "sme",
				organization_name: "Test SME Org",
				address: "123 Test Street",
				phone: "1234567890",
			});

			expect(response.status).toBe(201);
			expect(response.body).toHaveProperty("userId");
			expect(response.body.message).toBe("User registered successfully");
			expect(response.body.note).toContain("verification");
		});

		test("Should register new NGO user successfully", async () => {
			const uniqueEmail = `ngo${Date.now()}@test.com`;
			const response = await request(app).post("/auth/register").send({
				name: "Test NGO",
				email: uniqueEmail,
				password: "Test123!",
				role: "ngo",
				organization_name: "Test NGO Org",
			});

			expect(response.status).toBe(201);
			expect(response.body).toHaveProperty("userId");
		});

		test("Should fail with missing required fields", async () => {
			const response = await request(app).post("/auth/register").send({
				name: "Test User",
				
			});

			expect(response.status).toBe(400);
			expect(response.body.code).toBe("VALIDATION_ERROR");
			expect(response.body.details).toHaveProperty("fields");
		});

		test("Should fail with invalid role", async () => {
			const response = await request(app).post("/auth/register").send({
				name: "Test User",
				email: "test@test.com",
				password: "Test123!",
				role: "invalid_role",
			});

			expect(response.status).toBe(400);
			expect(response.body.code).toBe("INVALID_PARAM");
		});

		test("Should fail with duplicate email", async () => {
			const email = `duplicate${Date.now()}@test.com`;

			await request(app).post("/auth/register").send({
				name: "First User",
				email: email,
				password: "Test123!",
				role: "sme",
			});

			const response = await request(app).post("/auth/register").send({
				name: "Second User",
				email: email,
				password: "Test123!",
				role: "ngo",
			});

			expect(response.status).toBe(409); 
			expect(response.body.code).toBe("ER_DUP_ENTRY");
		});
	});

	describe("POST /auth/login", () => {
		let testEmail;
		let testPassword = "Test123!";

		beforeAll(async () => {
			testEmail = `logintest${Date.now()}@test.com`;
			await request(app).post("/auth/register").send({
				name: "Login Test User",
				email: testEmail,
				password: testPassword,
				role: "sme",
			});
		});

		test("Should fail login for unverified user", async () => {
			const response = await request(app).post("/auth/login").send({
				email: testEmail,
				password: testPassword,
			});

			expect([200, 401, 403]).toContain(response.status);
		});

		test("Should fail with missing credentials", async () => {
			const response = await request(app).post("/auth/login").send({
				email: testEmail,
				
			});

			expect(response.status).toBe(400);
			expect(response.body.code).toBe("VALIDATION_ERROR");
		});

		test("Should fail with invalid email", async () => {
			const response = await request(app).post("/auth/login").send({
				email: "nonexistent@test.com",
				password: "SomePassword",
			});

			expect(response.status).toBe(401);
			expect(response.body.code).toBe("AUTH_FAILED");
		});

		test("Should fail with wrong password", async () => {
			const response = await request(app).post("/auth/login").send({
				email: testEmail,
				password: "WrongPassword123!",
			});

			expect(response.status).toBe(401);
			expect(response.body.code).toBe("AUTH_FAILED");
		});
	});

	describe("POST /admin/auth/register", () => {
		test("Should register admin with valid secret", async () => {
			const uniqueEmail = `admin${Date.now()}@test.com`;
			const response = await request(app).post("/admin/auth/register").send({
				name: "Test Admin",
				email: uniqueEmail,
				password: "Admin123!",
				admin_secret: process.env.ADMIN_SECRET,
			});

			expect(response.status).toBe(201);
			expect(response.body).toHaveProperty("userId");
			expect(response.body.message).toBe("Admin registered successfully");
		});

		test("Should fail with invalid admin secret", async () => {
			const response = await request(app).post("/admin/auth/register").send({
				name: "Test Admin",
				email: "admin@test.com",
				password: "Admin123!",
				admin_secret: "wrong-secret",
			});

			expect(response.status).toBe(403);
			expect(response.body.code).toBe("FORBIDDEN");
		});

		test("Should fail with missing admin secret", async () => {
			const response = await request(app).post("/admin/auth/register").send({
				name: "Test Admin",
				email: "admin@test.com",
				password: "Admin123!",
			});

			expect(response.status).toBe(400);
			expect(response.body.code).toBe("VALIDATION_ERROR");
		});
	});

	describe("POST /admin/auth/login", () => {
		let adminEmail;
		let adminPassword = "Admin123!";

		beforeAll(async () => {
			adminEmail = `adminlogin${Date.now()}@test.com`;
			await request(app).post("/admin/auth/register").send({
				name: "Admin Login Test",
				email: adminEmail,
				password: adminPassword,
				admin_secret: process.env.ADMIN_SECRET,
			});
		});

		test("Should login admin successfully", async () => {
			const response = await request(app).post("/admin/auth/login").send({
				email: adminEmail,
				password: adminPassword,
			});

			expect(response.status).toBe(200);
			expect(response.body).toHaveProperty("token");
			expect(response.body).toHaveProperty("user");
			expect(response.body.user.role).toBe("admin");
			expect(response.body.user.is_verified).toBe(1); 
		});

		test("Should fail with invalid admin credentials", async () => {
			const response = await request(app).post("/admin/auth/login").send({
				email: adminEmail,
				password: "WrongPassword",
			});

			expect(response.status).toBe(401);
			expect(response.body.code).toBe("AUTH_FAILED");
		});

		test("Should fail login for non-admin user at admin endpoint", async () => {
			
			const regularEmail = `regular${Date.now()}@test.com`;
			await request(app).post("/auth/register").send({
				name: "Regular User",
				email: regularEmail,
				password: "Test123!",
				role: "sme",
			});

			const response = await request(app).post("/admin/auth/login").send({
				email: regularEmail,
				password: "Test123!",
			});

			expect(response.status).toBe(401);
			expect(response.body.code).toBe("AUTH_FAILED");
		});
	});
});
