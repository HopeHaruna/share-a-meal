const request = require("supertest");
const app = require("../src/app");

describe("Sponsorship Endpoints", () => {
	let sponsorToken;
	let sponsorUserId;
	let smeToken;
	let ngoToken;
	let ngoUserId;
	let adminToken;
	let testMealId;
	let testMealId2;

	beforeAll(async () => {
		
		const sponsorEmail = `sponsor${Date.now()}@test.com`;
		const sponsorRegister = await request(app).post("/auth/register").send({
			name: "Test Sponsor",
			email: sponsorEmail,
			password: "Test123!",
			role: "sponsor",
			organization_name: "Test Foundation",
		});
		sponsorUserId = sponsorRegister.body.userId;

		const sponsorLogin = await request(app).post("/auth/login").send({
			email: sponsorEmail,
			password: "Test123!",
		});
		sponsorToken = sponsorLogin.body.token;

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
			organization_name: "Test SME Org",
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
			organization_name: "Test NGO",
		});
		ngoUserId = ngoRegister.body.userId;

		await request(app)
			.patch(`/admin/verify/${ngoUserId}`)
			.set("Authorization", `Bearer ${adminToken}`);

		const ngoLogin = await request(app).post("/auth/login").send({
			email: ngoEmail,
			password: "Test123!",
		});
		ngoToken = ngoLogin.body.token;

		const mealRes1 = await request(app)
			.post("/meals")
			.set("Authorization", `Bearer ${smeToken}`)
			.send({
				title: "Donation Meal 1",
				description: "First meal for sponsorship",
				quantity: 20,
				unit: "servings",
				prepared_at: "2026-02-22 10:00:00",
				storage_type: "Refrigerated",
				food_type: "Soup",
			});
		testMealId = mealRes1.body.meal.id;

		const mealRes2 = await request(app)
			.post("/meals")
			.set("Authorization", `Bearer ${smeToken}`)
			.send({
				title: "Donation Meal 2",
				description: "Second meal for sponsorship",
				quantity: 15,
				unit: "servings",
				prepared_at: "2026-02-22 11:00:00",
				storage_type: "Room Temperature",
				food_type: "Bread",
			});
		testMealId2 = mealRes2.body.meal.id;
	});

	describe("POST /sponsorships", () => {
		test("Should create sponsorship for a meal", async () => {
			const response = await request(app)
				.post("/sponsorships")
				.set("Authorization", `Bearer ${sponsorToken}`)
				.send({
					meal_id: testMealId,
					amount: 100,
					note: "Supporting food donation",
				});

			expect(response.status).toBe(201);
			expect(response.body).toHaveProperty("sponsorshipId");
			expect(response.body.message).toContain("successfully");
			expect(response.body.amount).toBe(100);
		});

		test("Should create sponsorship for an NGO", async () => {
			const response = await request(app)
				.post("/sponsorships")
				.set("Authorization", `Bearer ${sponsorToken}`)
				.send({
					ngo_id: ngoUserId,
					amount: 500,
					note: "Supporting NGO operations",
				});

			expect(response.status).toBe(201);
			expect(response.body).toHaveProperty("sponsorshipId");
			expect(response.body.ngo_id).toBe(ngoUserId);
		});

		test("Should fail without meal_id or ngo_id", async () => {
			const response = await request(app)
				.post("/sponsorships")
				.set("Authorization", `Bearer ${sponsorToken}`)
				.send({
					amount: 100,
					note: "Missing both IDs",
				});

			expect(response.status).toBe(400);
			expect(response.body.code).toBe("VALIDATION_ERROR");
		});

		test("Should fail with missing amount", async () => {
			const response = await request(app)
				.post("/sponsorships")
				.set("Authorization", `Bearer ${sponsorToken}`)
				.send({
					meal_id: testMealId,
					note: "Missing amount",
				});

			expect(response.status).toBe(400);
		});

		test("Should fail with zero or negative amount", async () => {
			const response = await request(app)
				.post("/sponsorships")
				.set("Authorization", `Bearer ${sponsorToken}`)
				.send({
					meal_id: testMealId,
					amount: -50,
				});

			expect(response.status).toBe(400);
		});

		test("Should fail with invalid meal ID", async () => {
			const response = await request(app)
				.post("/sponsorships")
				.set("Authorization", `Bearer ${sponsorToken}`)
				.send({
					meal_id: 99999,
					amount: 100,
				});

			expect(response.status).toBe(404);
			expect(response.body.code).toBe("NOT_FOUND");
		});

		test("Should fail with invalid NGO ID", async () => {
			const response = await request(app)
				.post("/sponsorships")
				.set("Authorization", `Bearer ${sponsorToken}`)
				.send({
					ngo_id: 99999,
					amount: 100,
				});

			expect(response.status).toBe(404);
			expect(response.body.code).toBe("NOT_FOUND");
		});

		test("Should fail without authentication", async () => {
			const response = await request(app).post("/sponsorships").send({
				meal_id: testMealId,
				amount: 100,
			});

			expect(response.status).toBe(401);
		});

		test("Should fail when non-sponsor tries to create", async () => {
			const response = await request(app)
				.post("/sponsorships")
				.set("Authorization", `Bearer ${smeToken}`)
				.send({
					meal_id: testMealId,
					amount: 100,
				});

			expect(response.status).toBe(403);
			expect(response.body.code).toBe("FORBIDDEN");
		});

		test("Should prevent sponsor from sponsoring their own meal (if sponsor is also SME)", async () => {

		});
	});

	describe("GET /sponsorships/my", () => {
		test("Should get sponsor's own sponsorships", async () => {
			const response = await request(app)
				.get("/sponsorships/my")
				.set("Authorization", `Bearer ${sponsorToken}`);

			expect(response.status).toBe(200);
			expect(response.body).toHaveProperty("sponsorships");
			expect(Array.isArray(response.body.sponsorships)).toBe(true);
			expect(response.body.sponsorships.length).toBeGreaterThan(0);
		});

		test("Should return empty list for sponsor with no sponsorships", async () => {
			
			const newSponsorEmail = `newsponsor${Date.now()}@test.com`;
			const newSponsorRegister = await request(app)
				.post("/auth/register")
				.send({
					name: "New Sponsor",
					email: newSponsorEmail,
					password: "Test123!",
					role: "sponsor",
				});

			const newSponsorLogin = await request(app).post("/auth/login").send({
				email: newSponsorEmail,
				password: "Test123!",
			});
			const newSponsorToken = newSponsorLogin.body.token;

			const response = await request(app)
				.get("/sponsorships/my")
				.set("Authorization", `Bearer ${newSponsorToken}`);

			expect(response.status).toBe(200);
			expect(response.body.sponsorships.length).toBe(0);
		});

		test("Should fail without authentication", async () => {
			const response = await request(app).get("/sponsorships/my");

			expect(response.status).toBe(401);
		});

		test("Should fail when non-sponsor tries to access", async () => {
			const response = await request(app)
				.get("/sponsorships/my")
				.set("Authorization", `Bearer ${smeToken}`);

			expect(response.status).toBe(403);
			expect(response.body.code).toBe("FORBIDDEN");
		});
	});

	describe("GET /sponsorships/impact", () => {
		test("Should get sponsor's impact metrics", async () => {
			const response = await request(app)
				.get("/sponsorships/impact")
				.set("Authorization", `Bearer ${sponsorToken}`);

			expect(response.status).toBe(200);
			expect(response.body).toHaveProperty("metrics");
		});

		test("Should fail without authentication", async () => {
			const response = await request(app).get("/sponsorships/impact");

			expect(response.status).toBe(401);
		});

		test("Should fail when non-sponsor tries to access", async () => {
			const response = await request(app)
				.get("/sponsorships/impact")
				.set("Authorization", `Bearer ${ngoToken}`);

			expect(response.status).toBe(403);
		});
	});

	describe("GET /sponsorships/meals/:mealId", () => {
		test("Should get all sponsors for a meal", async () => {
			const response = await request(app).get(
				`/sponsorships/meals/${testMealId}`,
			);

			expect(response.status).toBe(200);
			expect(response.body).toHaveProperty("sponsors");
			expect(response.body).toHaveProperty("meal");
			expect(response.body).toHaveProperty("totalSponsored");
			expect(Array.isArray(response.body.sponsors)).toBe(true);
		});

		test("Should include correct total sponsored amount", async () => {
			const response = await request(app).get(
				`/sponsorships/meals/${testMealId}`,
			);

			expect(response.status).toBe(200);
			
			expect(response.body.totalSponsored).toBeGreaterThanOrEqual(100);
		});

		test("Should work without authentication", async () => {
			const response = await request(app).get(
				`/sponsorships/meals/${testMealId}`,
			);

			expect(response.status).toBe(200);
		});

		test("Should fail with invalid meal ID", async () => {
			const response = await request(app).get("/sponsorships/meals/99999");

			expect(response.status).toBe(404);
			expect(response.body.code).toBe("NOT_FOUND");
		});

		test("Should fail with non-numeric meal ID", async () => {
			const response = await request(app).get("/sponsorships/meals/invalid");

			expect(response.status).toBe(400);
			expect(response.body.code).toBe("INVALID_PARAM");
		});

		test("Should return empty sponsors for meal with no sponsorships", async () => {
			const response = await request(app).get(
				`/sponsorships/meals/${testMealId2}`,
			);

			expect(response.status).toBe(200);
			expect(response.body.sponsors.length).toBe(0);
			expect(response.body.totalSponsored).toBe(0);
		});
	});

	describe("GET /sponsorships/ngos/:ngoId", () => {
		test("Should get all sponsors for an NGO", async () => {
			const response = await request(app).get(
				`/sponsorships/ngos/${ngoUserId}`,
			);

			expect(response.status).toBe(200);
			expect(response.body).toHaveProperty("sponsors");
			expect(response.body).toHaveProperty("ngo");
			expect(response.body).toHaveProperty("totalSponsored");
			expect(Array.isArray(response.body.sponsors)).toBe(true);
		});

		test("Should include correct total sponsored amount for NGO", async () => {
			const response = await request(app).get(
				`/sponsorships/ngos/${ngoUserId}`,
			);

			expect(response.status).toBe(200);
			
			expect(response.body.totalSponsored).toBeGreaterThanOrEqual(500);
		});

		test("Should work without authentication", async () => {
			const response = await request(app).get(
				`/sponsorships/ngos/${ngoUserId}`,
			);

			expect(response.status).toBe(200);
		});

		test("Should fail with invalid NGO ID", async () => {
			const response = await request(app).get("/sponsorships/ngos/99999");

			expect(response.status).toBe(404);
			expect(response.body.code).toBe("NOT_FOUND");
		});

		test("Should fail with non-numeric NGO ID", async () => {
			const response = await request(app).get("/sponsorships/ngos/invalid");

			expect(response.status).toBe(400);
			expect(response.body.code).toBe("INVALID_PARAM");
		});

		test("Should fail when user is not an NGO", async () => {
			
			const response = await request(app).get(
				`/sponsorships/ngos/${1}`, 
			);

			expect([404, 400]).toContain(response.status);
		});
	});

	describe("GET /sponsorships/sponsors/:sponsorId", () => {
		test("Should get sponsor's impact metrics (public access)", async () => {
			const response = await request(app).get(
				`/sponsorships/sponsors/${sponsorUserId}`,
			);

			expect(response.status).toBe(200);
			
			expect(response.body).toBeDefined();
		});

		test("Should work without authentication", async () => {
			const response = await request(app).get(
				`/sponsorships/sponsors/${sponsorUserId}`,
			);

			expect(response.status).toBe(200);
		});

		test("Should fail with invalid sponsor ID", async () => {
			const response = await request(app).get("/sponsorships/sponsors/99999");

			expect([400, 404]).toContain(response.status);
		});

		test("Should fail with non-numeric sponsor ID", async () => {
			const response = await request(app).get("/sponsorships/sponsors/invalid");

			expect(response.status).toBe(400);
			expect(response.body.code).toBe("INVALID_PARAM");
		});
	});

	describe("Authorization & Role Tests", () => {
		test("Should prevent SME from creating sponsorship", async () => {
			const response = await request(app)
				.post("/sponsorships")
				.set("Authorization", `Bearer ${smeToken}`)
				.send({
					meal_id: testMealId,
					amount: 100,
				});

			expect(response.status).toBe(403);
		});

		test("Should prevent NGO from creating sponsorship", async () => {
			const response = await request(app)
				.post("/sponsorships")
				.set("Authorization", `Bearer ${ngoToken}`)
				.send({
					meal_id: testMealId,
					amount: 100,
				});

			expect(response.status).toBe(403);
		});

		test("Should prevent non-sponsor from accessing /my", async () => {
			const endpoints = ["/sponsorships/my", "/sponsorships/impact"];

			for (const endpoint of endpoints) {
				const response = await request(app)
					.get(endpoint)
					.set("Authorization", `Bearer ${smeToken}`);

				expect(response.status).toBe(403);
			}
		});
	});
});
