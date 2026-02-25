const request = require("supertest");
const app = require("../src/app");

describe("Claim Endpoints", () => {
	let smeToken;
	let ngoToken;
	let adminToken;
	let testMealId;

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

		const smeEmail = `sme${Date.now()}@test.com`;
		const smeRegister = await request(app).post("/auth/register").send({
			name: "Test SME",
			email: smeEmail,
			password: "Test123!",
			role: "sme",
		});

		await request(app)
			.patch(`/admin/verify/${smeRegister.body.userId}`)
			.set("Authorization", `Bearer ${adminToken}`);

		const smeLogin = await request(app).post("/auth/login").send({
			email: smeEmail,
			password: "Test123!",
		});
		smeToken = smeLogin.body.token;

		const ngoEmail = `ngo${Date.now()}@test.com`;
		const ngoRegister = await request(app).post("/auth/register").send({
			name: "Test NGO",
			email: ngoEmail,
			password: "Test123!",
			role: "ngo",
		});

		await request(app)
			.patch(`/admin/verify/${ngoRegister.body.userId}`)
			.set("Authorization", `Bearer ${adminToken}`);

		const ngoLogin = await request(app).post("/auth/login").send({
			email: ngoEmail,
			password: "Test123!",
		});
		ngoToken = ngoLogin.body.token;

		const mealResponse = await request(app)
			.post("/meals")
			.set("Authorization", `Bearer ${smeToken}`)
			.send({
				title: "Test Meal for Claims",
				quantity: 10,
				unit: "servings",
				prepared_at: "2026-02-22 10:00:00",
			});
		testMealId = mealResponse.body.meal.id;
	});

	describe("POST /claims/meal/:mealId", () => {
		test("Should claim meal as NGO", async () => {
			const response = await request(app)
				.post(`/claims/meal/${testMealId}`)
				.set("Authorization", `Bearer ${ngoToken}`);

			expect(response.status).toBe(201);
			expect(response.body).toHaveProperty("claimId");
			expect(response.body).toHaveProperty("mealId");
		});

		test("Should fail to claim without authentication", async () => {
			const response = await request(app).post(`/claims/meal/${testMealId}`);

			expect(response.status).toBe(401);
		});

		test("Should fail when SME tries to claim meal", async () => {
			
			const mealResponse = await request(app)
				.post("/meals")
				.set("Authorization", `Bearer ${smeToken}`)
				.send({
					title: "Another Test Meal",
					quantity: 5,
					unit: "servings",
					prepared_at: "2026-02-22 10:00:00",
				});

			const response = await request(app)
				.post(`/claims/meal/${mealResponse.body.meal.id}`)
				.set("Authorization", `Bearer ${smeToken}`);

			expect(response.status).toBe(403);
			expect(response.body.code).toBe("FORBIDDEN");
		});

		test("Should fail to claim already claimed meal", async () => {
			const response = await request(app)
				.post(`/claims/meal/${testMealId}`)
				.set("Authorization", `Bearer ${ngoToken}`);

			expect(response.status).toBe(400);
			expect(response.body.code).toBe("INVALID_STATE");
		});

		test("Should fail with invalid meal ID", async () => {
			const response = await request(app)
				.post("/claims/meal/99999")
				.set("Authorization", `Bearer ${ngoToken}`);

			expect(response.status).toBe(404);
			expect(response.body.code).toBe("NOT_FOUND");
		});

		test("Should fail with non-numeric meal ID", async () => {
			const response = await request(app)
				.post("/claims/meal/invalid")
				.set("Authorization", `Bearer ${ngoToken}`);

			expect(response.status).toBe(400);
			expect(response.body.code).toBe("INVALID_PARAM");
		});
	});

	describe("GET /claims/my", () => {
		test("Should get NGO's own claims", async () => {
			const response = await request(app)
				.get("/claims/my")
				.set("Authorization", `Bearer ${ngoToken}`);

			expect(response.status).toBe(200);
			expect(response.body).toHaveProperty("claims");
			expect(Array.isArray(response.body.claims)).toBe(true);
			expect(response.body.claims.length).toBeGreaterThan(0);
		});

		test("Should fail without authentication", async () => {
			const response = await request(app).get("/claims/my");

			expect(response.status).toBe(401);
		});

		test("Should forbid SME access to NGO claims", async () => {
			const response = await request(app)
				.get("/claims/my")
				.set("Authorization", `Bearer ${smeToken}`);

			expect(response.status).toBe(403);
			expect(response.body.code).toBe("FORBIDDEN");
		});
	});

	describe("PATCH /claims/meal/:mealId/ready", () => {
		test("Should mark meal as pickup ready by SME", async () => {
			const response = await request(app)
				.patch(`/claims/meal/${testMealId}/ready`)
				.set("Authorization", `Bearer ${smeToken}`);

			expect(response.status).toBe(200);
			expect(response.body.message).toContain("ready");
		});

		test("Should fail when NGO tries to mark ready", async () => {
			const response = await request(app)
				.patch(`/claims/meal/${testMealId}/ready`)
				.set("Authorization", `Bearer ${ngoToken}`);

			expect(response.status).toBe(403);
			expect(response.body.code).toBe("FORBIDDEN");
		});

		test("Should fail without authentication", async () => {
			const response = await request(app).patch(
				`/claims/meal/${testMealId}/ready`,
			);

			expect(response.status).toBe(401);
		});

		test("Should fail with invalid meal ID", async () => {
			const response = await request(app)
				.patch("/claims/meal/99999/ready")
				.set("Authorization", `Bearer ${smeToken}`);

			expect(response.status).toBe(404);
			expect(response.body.code).toBe("NOT_FOUND");
		});

		test("Should fail to mark already ready meal", async () => {
			const response = await request(app)
				.patch(`/claims/meal/${testMealId}/ready`)
				.set("Authorization", `Bearer ${smeToken}`);

			expect(response.status).toBe(400);
			expect(response.body.code).toBe("INVALID_STATE");
		});
	});

	describe("PATCH /claims/:claimId/pickup", () => {
		let pickupClaimId;

		beforeAll(async () => {
			const mealResponse = await request(app)
				.post("/meals")
				.set("Authorization", `Bearer ${smeToken}`)
				.send({
					title: "Pickup Test Meal",
					quantity: 5,
					unit: "servings",
					prepared_at: "2026-02-22 10:00:00",
				});

			const claimResponse = await request(app)
				.post(`/claims/meal/${mealResponse.body.meal.id}`)
				.set("Authorization", `Bearer ${ngoToken}`);

			pickupClaimId = claimResponse.body.claimId;

			await request(app)
				.patch(`/claims/meal/${mealResponse.body.meal.id}/ready`)
				.set("Authorization", `Bearer ${smeToken}`);
		});

		test("Should confirm pickup by NGO", async () => {
			const response = await request(app)
				.patch(`/claims/${pickupClaimId}/pickup`)
				.set("Authorization", `Bearer ${ngoToken}`);

			expect(response.status).toBe(200);
			expect(response.body.message).toContain("Pickup");
		});

		test("Should fail when SME tries to confirm pickup", async () => {
			const response = await request(app)
				.patch(`/claims/${pickupClaimId}/pickup`)
				.set("Authorization", `Bearer ${smeToken}`);

			expect(response.status).toBe(403);
			expect(response.body.code).toBe("FORBIDDEN");
		});

		test("Should fail without authentication", async () => {
			const response = await request(app).patch(
				`/claims/${pickupClaimId}/pickup`,
			);

			expect(response.status).toBe(401);
		});

		test("Should fail with invalid claim ID", async () => {
			const response = await request(app)
				.patch("/claims/99999/pickup")
				.set("Authorization", `Bearer ${ngoToken}`);

			expect(response.status).toBe(404);
			expect(response.body.code).toBe("NOT_FOUND");
		});

		test("Should fail with non-numeric claim ID", async () => {
			const response = await request(app)
				.patch("/claims/invalid/pickup")
				.set("Authorization", `Bearer ${ngoToken}`);

			expect(response.status).toBe(400);
			expect(response.body.code).toBe("INVALID_PARAM");
		});
	});

	describe("PATCH /claims/:claimId/complete", () => {
		let completeClaimId;

		beforeAll(async () => {
			const mealResponse = await request(app)
				.post("/meals")
				.set("Authorization", `Bearer ${smeToken}`)
				.send({
					title: "Completion Flow Meal",
					quantity: 5,
					unit: "servings",
					prepared_at: "2026-02-22 10:00:00",
				});

			const claimResponse = await request(app)
				.post(`/claims/meal/${mealResponse.body.meal.id}`)
				.set("Authorization", `Bearer ${ngoToken}`);

			completeClaimId = claimResponse.body.claimId;

			await request(app)
				.patch(`/claims/meal/${mealResponse.body.meal.id}/ready`)
				.set("Authorization", `Bearer ${smeToken}`);

			await request(app)
				.patch(`/claims/${completeClaimId}/pickup`)
				.set("Authorization", `Bearer ${ngoToken}`);
		});

		test("Should confirm completion by NGO", async () => {
			const response = await request(app)
				.patch(`/claims/${completeClaimId}/complete`)
				.set("Authorization", `Bearer ${ngoToken}`)
				.send({
					beneficiaries_count: 50,
				});

			expect(response.status).toBe(200);
			expect(response.body.message).toContain("completion");
		});

		test("Should fail when SME tries to complete", async () => {
			const response = await request(app)
				.patch(`/claims/${completeClaimId}/complete`)
				.set("Authorization", `Bearer ${smeToken}`)
				.send({
					beneficiaries_count: 50,
				});

			expect(response.status).toBe(403);
			expect(response.body.code).toBe("FORBIDDEN");
		});

		test("Should fail without authentication", async () => {
			const response = await request(app)
				.patch(`/claims/${completeClaimId}/complete`)
				.send({
					beneficiaries_count: 50,
				});

			expect(response.status).toBe(401);
		});

		test("Should fail with invalid claim ID", async () => {
			const response = await request(app)
				.patch("/claims/99999/complete")
				.set("Authorization", `Bearer ${ngoToken}`)
				.send({
					beneficiaries_count: 50,
				});

			expect(response.status).toBe(404);
			expect(response.body.code).toBe("NOT_FOUND");
		});

		test("Should fail with invalid beneficiaries count", async () => {
			const response = await request(app)
				.patch(`/claims/${completeClaimId}/complete`)
				.set("Authorization", `Bearer ${ngoToken}`)
				.send({
					beneficiaries_count: -10, 
				});

			expect(response.status).toBe(400);
			expect(response.body.code).toBe("INVALID_FORMAT");
		});
	});

	describe("PATCH /claims/:claimId/cancel", () => {
		let cancelableMealId;
		let cancelableClaimId;

		beforeAll(async () => {
			
			const mealResponse = await request(app)
				.post("/meals")
				.set("Authorization", `Bearer ${smeToken}`)
				.send({
					title: "Cancelable Meal",
					quantity: 5,
					unit: "servings",
					prepared_at: "2026-02-22 10:00:00",
				});
			cancelableMealId = mealResponse.body.meal.id;

			const claimResponse = await request(app)
				.post(`/claims/meal/${cancelableMealId}`)
				.set("Authorization", `Bearer ${ngoToken}`);
			cancelableClaimId = claimResponse.body.claimId;
		});

		test("Should cancel claim by NGO", async () => {
			const response = await request(app)
				.patch(`/claims/${cancelableClaimId}/cancel`)
				.set("Authorization", `Bearer ${ngoToken}`);

			expect(response.status).toBe(200);
			expect(response.body.message).toContain("cancelled");
		});

		test("Should fail when SME tries to cancel", async () => {
			
			const mealResponse = await request(app)
				.post("/meals")
				.set("Authorization", `Bearer ${smeToken}`)
				.send({
					title: "Another Cancelable Meal",
					quantity: 5,
					unit: "servings",
					prepared_at: "2026-02-22 10:00:00",
				});

			const claimResponse = await request(app)
				.post(`/claims/meal/${mealResponse.body.meal.id}`)
				.set("Authorization", `Bearer ${ngoToken}`);

			const response = await request(app)
				.patch(`/claims/${claimResponse.body.claimId}/cancel`)
				.set("Authorization", `Bearer ${smeToken}`);

			expect(response.status).toBe(403);
			expect(response.body.code).toBe("FORBIDDEN");
		});

		test("Should fail without authentication", async () => {
			const response = await request(app).patch(
				`/claims/${cancelableClaimId}/cancel`,
			);

			expect(response.status).toBe(401);
		});

		test("Should fail with invalid claim ID", async () => {
			const response = await request(app)
				.patch("/claims/99999/cancel")
				.set("Authorization", `Bearer ${ngoToken}`);

			expect(response.status).toBe(404);
			expect(response.body.code).toBe("NOT_FOUND");
		});
	});
});
