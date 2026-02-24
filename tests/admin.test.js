const request = require("supertest");
const app = require("../src/app");

describe("Admin Endpoints", () => {
	let adminToken;
	let regularUserToken;
	let pendingUserId;
	let verifiedUserId;

	beforeAll(async () => {
		
		const adminEmail = `admin${Date.now()}@test.com`;
		await request(app).post("/admin/auth/register").send({
			name: "Test Admin",
			email: adminEmail,
			password: "Admin123!",
			admin_secret: process.env.ADMIN_SECRET,
		});

		const adminLogin = await request(app).post("/admin/auth/login").send({
			email: adminEmail,
			password: "Admin123!",
		});
		adminToken = adminLogin.body.token;

		const pendingEmail = `pending${Date.now()}@test.com`;
		const pendingRegister = await request(app).post("/auth/register").send({
			name: "Pending User",
			email: pendingEmail,
			password: "Test123!",
			role: "sme",
		});
		pendingUserId = pendingRegister.body.userId;

		const regularEmail = `regular${Date.now()}@test.com`;
		const regularRegister = await request(app).post("/auth/register").send({
			name: "Regular User",
			email: regularEmail,
			password: "Test123!",
			role: "ngo",
		});
		verifiedUserId = regularRegister.body.userId;

		await request(app)
			.patch(`/admin/verify/${verifiedUserId}`)
			.set("Authorization", `Bearer ${adminToken}`);

		const regularLogin = await request(app).post("/auth/login").send({
			email: regularEmail,
			password: "Test123!",
		});
		regularUserToken = regularLogin.body.token;
	});

	describe("GET /admin/users/pending", () => {
		test("Should get pending users as admin", async () => {
			const response = await request(app)
				.get("/admin/users/pending")
				.set("Authorization", `Bearer ${adminToken}`);

			expect(response.status).toBe(200);
			expect(response.body).toHaveProperty("users");
			expect(Array.isArray(response.body.users)).toBe(true);
			expect(response.body.users.length).toBeGreaterThan(0);
		});

		test("Should fail without authentication", async () => {
			const response = await request(app).get("/admin/users/pending");

			expect(response.status).toBe(401);
		});

		test("Should fail with non-admin token", async () => {
			const response = await request(app)
				.get("/admin/users/pending")
				.set("Authorization", `Bearer ${regularUserToken}`);

			expect(response.status).toBe(403);
			expect(response.body.code).toBe("FORBIDDEN");
		});
	});

	describe("GET /admin/users", () => {
		test("Should get all users as admin", async () => {
			const response = await request(app)
				.get("/admin/users")
				.set("Authorization", `Bearer ${adminToken}`);

			expect(response.status).toBe(200);
			expect(response.body).toHaveProperty("users");
			expect(Array.isArray(response.body.users)).toBe(true);
			expect(response.body.users.length).toBeGreaterThan(0);
		});

		test("Should fail without authentication", async () => {
			const response = await request(app).get("/admin/users");

			expect(response.status).toBe(401);
		});

		test("Should fail with non-admin token", async () => {
			const response = await request(app)
				.get("/admin/users")
				.set("Authorization", `Bearer ${regularUserToken}`);

			expect(response.status).toBe(403);
			expect(response.body.code).toBe("FORBIDDEN");
		});
	});

	describe("PATCH /admin/verify/:userId", () => {
		test("Should verify pending user as admin", async () => {
			const response = await request(app)
				.patch(`/admin/verify/${pendingUserId}`)
				.set("Authorization", `Bearer ${adminToken}`);

			expect(response.status).toBe(200);
			expect(response.body.message).toContain("verified");
		});

		test("Should fail to verify already verified user", async () => {
			const response = await request(app)
				.patch(`/admin/verify/${verifiedUserId}`)
				.set("Authorization", `Bearer ${adminToken}`);

			expect(response.status).toBe(400);
			expect(response.body.code).toBe("INVALID_STATE");
		});

		test("Should fail without authentication", async () => {
			const response = await request(app).patch(
				`/admin/verify/${pendingUserId}`,
			);

			expect(response.status).toBe(401);
		});

		test("Should fail with non-admin token", async () => {
			const response = await request(app)
				.patch(`/admin/verify/${pendingUserId}`)
				.set("Authorization", `Bearer ${regularUserToken}`);

			expect(response.status).toBe(403);
			expect(response.body.code).toBe("FORBIDDEN");
		});

		test("Should fail with invalid user ID", async () => {
			const response = await request(app)
				.patch("/admin/verify/99999")
				.set("Authorization", `Bearer ${adminToken}`);

			expect(response.status).toBe(404);
			expect(response.body.code).toBe("NOT_FOUND");
		});

		test("Should fail with non-numeric user ID", async () => {
			const response = await request(app)
				.patch("/admin/verify/invalid")
				.set("Authorization", `Bearer ${adminToken}`);

			expect(response.status).toBe(400);
			expect(response.body.code).toBe("INVALID_PARAM");
		});
	});

	describe("PATCH /admin/revoke/:userId", () => {
		test("Should revoke verification as admin", async () => {
			const response = await request(app)
				.patch(`/admin/revoke/${verifiedUserId}`)
				.set("Authorization", `Bearer ${adminToken}`);

			expect(response.status).toBe(200);
			expect(response.body.message).toContain("revoked");
		});

		test("Should fail to revoke unverified user", async () => {
			
			const newPendingEmail = `newpending${Date.now()}@test.com`;
			const newPendingRegister = await request(app)
				.post("/auth/register")
				.send({
					name: "New Pending User",
					email: newPendingEmail,
					password: "Test123!",
					role: "sme",
				});

			const response = await request(app)
				.patch(`/admin/revoke/${newPendingRegister.body.userId}`)
				.set("Authorization", `Bearer ${adminToken}`);

			expect(response.status).toBe(400);
			expect(response.body.code).toBe("INVALID_STATE");
		});

		test("Should fail without authentication", async () => {
			const response = await request(app).patch(
				`/admin/revoke/${verifiedUserId}`,
			);

			expect(response.status).toBe(401);
		});

		test("Should fail with non-admin token", async () => {
			const response = await request(app)
				.patch(`/admin/revoke/${verifiedUserId}`)
				.set("Authorization", `Bearer ${regularUserToken}`);

			expect(response.status).toBe(403);
			expect(response.body.code).toBe("FORBIDDEN");
		});

		test("Should fail with invalid user ID", async () => {
			const response = await request(app)
				.patch("/admin/revoke/99999")
				.set("Authorization", `Bearer ${adminToken}`);

			expect(response.status).toBe(404);
			expect(response.body.code).toBe("NOT_FOUND");
		});

		test("Should fail with non-numeric user ID", async () => {
			const response = await request(app)
				.patch("/admin/revoke/invalid")
				.set("Authorization", `Bearer ${adminToken}`);

			expect(response.status).toBe(400);
			expect(response.body.code).toBe("INVALID_PARAM");
		});
	});

	describe("Admin Role Protection", () => {
		test("Should prevent regular user from accessing admin routes", async () => {
			const endpoints = [
				"/admin/users/pending",
				"/admin/users",
				`/admin/verify/${pendingUserId}`,
				`/admin/revoke/${verifiedUserId}`,
			];

			for (const endpoint of endpoints) {
				const method =
					endpoint.includes("verify") || endpoint.includes("revoke")
						? "patch"
						: "get";

				const response = await request(app)
					[method](endpoint)
					.set("Authorization", `Bearer ${regularUserToken}`);

				expect(response.status).toBe(403);
				expect(response.body.code).toBe("FORBIDDEN");
			}
		});

		test("Should prevent unauthenticated access to admin routes", async () => {
			const endpoints = [
				"/admin/users/pending",
				"/admin/users",
				`/admin/verify/${pendingUserId}`,
				`/admin/revoke/${verifiedUserId}`,
			];

			for (const endpoint of endpoints) {
				const method =
					endpoint.includes("verify") || endpoint.includes("revoke")
						? "patch"
						: "get";

				const response = await request(app)[method](endpoint);

				expect(response.status).toBe(401);
			}
		});
	});

	describe("Admin Verification Flow", () => {
		test("Should complete full verification flow", async () => {
			
			const email = `flowtest${Date.now()}@test.com`;
			const registerResponse = await request(app).post("/auth/register").send({
				name: "Flow Test User",
				email: email,
				password: "Test123!",
				role: "sme",
			});

			expect(registerResponse.status).toBe(201);
			const userId = registerResponse.body.userId;

			const pendingResponse = await request(app)
				.get("/admin/users/pending")
				.set("Authorization", `Bearer ${adminToken}`);

			expect(pendingResponse.status).toBe(200);
			const foundInPending = pendingResponse.body.users.some(
				(u) => u.id === userId,
			);
			expect(foundInPending).toBe(true);

			const verifyResponse = await request(app)
				.patch(`/admin/verify/${userId}`)
				.set("Authorization", `Bearer ${adminToken}`);

			expect(verifyResponse.status).toBe(200);

			const pendingAfterResponse = await request(app)
				.get("/admin/users/pending")
				.set("Authorization", `Bearer ${adminToken}`);

			const stillInPending = pendingAfterResponse.body.users.some(
				(u) => u.id === userId,
			);
			expect(stillInPending).toBe(false);

			const revokeResponse = await request(app)
				.patch(`/admin/revoke/${userId}`)
				.set("Authorization", `Bearer ${adminToken}`);

			expect(revokeResponse.status).toBe(200);

			const pendingFinalResponse = await request(app)
				.get("/admin/users/pending")
				.set("Authorization", `Bearer ${adminToken}`);

			const backInPending = pendingFinalResponse.body.users.some(
				(u) => u.id === userId,
			);
			expect(backInPending).toBe(true);
		});
	});
});
