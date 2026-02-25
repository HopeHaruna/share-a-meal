const request = require("supertest");
const app = require("../src/app");

describe("Meal Endpoints", () => {
	let smeToken;
	let smeUserId;
	let ngoToken;
	let adminToken;
	let testMealId;

	beforeAll(async () => {
		
		const smeEmail = `sme${Date.now()}@test.com`;
		const smeRegister = await request(app).post("/auth/register").send({
			name: "Test SME",
			email: smeEmail,
			password: "Test123!",
			role: "sme",
			organization_name: "Test SME",
		});
		smeUserId = smeRegister.body.userId;

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

		await request(app)
			.patch(`/admin/verify/${smeUserId}`)
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
	});

	describe("POST /meals", () => {
		test("Should create meal with valid data", async () => {
			const response = await request(app)
				.post("/meals")
				.set("Authorization", `Bearer ${smeToken}`)
				.send({
					title: "Fresh Bread Loaves",
					description: "Whole wheat bread",
					quantity: 20,
					unit: "loaves",
					storage_type: "Room Temperature",
					food_type: "Bread",
					food_status: "Fresh",
					prepared_at: "2026-02-22 10:00:00",
				});

			expect(response.status).toBe(201);
			expect(response.body).toHaveProperty("meal");
			expect(response.body.meal).toHaveProperty("id");
			testMealId = response.body.meal.id; 
		});

		test("Should fail without authentication", async () => {
			const response = await request(app).post("/meals").send({
				title: "Test Meal",
				quantity: 10,
				unit: "servings",
				prepared_at: "2026-02-22 10:00:00",
			});

			expect(response.status).toBe(401);
		});

		test("Should fail with missing required fields", async () => {
			const response = await request(app)
				.post("/meals")
				.set("Authorization", `Bearer ${smeToken}`)
				.send({
					title: "Test Meal",
					
				});

			expect(response.status).toBe(400);
			expect(response.body.code).toBe("VALIDATION_ERROR");
		});

		test("Should fail with invalid quantity", async () => {
			const response = await request(app)
				.post("/meals")
				.set("Authorization", `Bearer ${smeToken}`)
				.send({
					title: "Test Meal",
					quantity: -5, 
					unit: "servings",
					prepared_at: "2026-02-22 10:00:00",
				});

			expect(response.status).toBe(400);
			expect(response.body.code).toBe("VALIDATION_ERROR");
		});

		test("Should fail when NGO tries to create meal", async () => {
			const response = await request(app)
				.post("/meals")
				.set("Authorization", `Bearer ${ngoToken}`)
				.send({
					title: "Test Meal",
					quantity: 10,
					unit: "servings",
					prepared_at: "2026-02-22 10:00:00",
				});

			expect(response.status).toBe(403);
			expect(response.body.code).toBe("FORBIDDEN");
		});
	});

	describe("GET /meals", () => {
		test("Should get all available meals", async () => {
			const response = await request(app).get("/meals");

			expect(response.status).toBe(200);
			expect(response.body).toHaveProperty("meals");
			expect(Array.isArray(response.body.meals)).toBe(true);
		});

		test("Should work without authentication", async () => {
			const response = await request(app).get("/meals");

			expect(response.status).toBe(200);
		});
	});

	describe("GET /meals/:mealId", () => {
		test("Should get specific meal by ID", async () => {
			const response = await request(app).get(`/meals/${testMealId}`);

			expect(response.status).toBe(200);
			expect(response.body).toHaveProperty("meal");
			expect(response.body.meal.id).toBe(testMealId);
		});

		test("Should fail with invalid meal ID", async () => {
			const response = await request(app).get("/meals/99999");

			expect(response.status).toBe(404);
			expect(response.body.code).toBe("NOT_FOUND");
		});

		test("Should fail with non-numeric meal ID", async () => {
			const response = await request(app).get("/meals/invalid");

			expect(response.status).toBe(400);
			expect(response.body.code).toBe("INVALID_PARAM");
		});
	});

	describe("GET /meals/status/:status", () => {
		test("Should get meals by AVAILABLE status", async () => {
			const response = await request(app).get("/meals/status/AVAILABLE");

			expect(response.status).toBe(200);
			expect(response.body).toHaveProperty("meals");
			expect(Array.isArray(response.body.meals)).toBe(true);
		});

		test("Should fail with invalid status", async () => {
			const response = await request(app).get("/meals/status/INVALID_STATUS");

			expect(response.status).toBe(400);
			expect(response.body.code).toBe("INVALID_PARAM");
		});
	});

	describe("GET /meals/my/list", () => {
		test("Should get SME's own meals", async () => {
			const response = await request(app)
				.get("/meals/my/list")
				.set("Authorization", `Bearer ${smeToken}`);

			expect(response.status).toBe(200);
			expect(response.body).toHaveProperty("meals");
			expect(Array.isArray(response.body.meals)).toBe(true);
			
			expect(response.body.meals.length).toBeGreaterThan(0);
		});

		test("Should fail without authentication", async () => {
			const response = await request(app).get("/meals/my/list");

			expect(response.status).toBe(401);
		});

		test("Should forbid NGO access to SME meal list", async () => {
			const response = await request(app)
				.get("/meals/my/list")
				.set("Authorization", `Bearer ${ngoToken}`);

			expect(response.status).toBe(403);
			expect(response.body.code).toBe("FORBIDDEN");
		});
	});

	describe("PATCH /meals/:mealId", () => {
		test("Should update own meal", async () => {
			const response = await request(app)
				.patch(`/meals/${testMealId}`)
				.set("Authorization", `Bearer ${smeToken}`)
				.send({
					quantity: 15,
					description: "Updated description",
				});

			expect(response.status).toBe(200);
			expect(response.body.message).toContain("updated");
		});

		test("Should fail to update another user's meal", async () => {
			
			const response = await request(app)
				.patch(`/meals/${testMealId}`)
				.set("Authorization", `Bearer ${ngoToken}`)
				.send({
					quantity: 15,
				});

			expect(response.status).toBe(403);
			expect(response.body.code).toBe("FORBIDDEN");
		});

		test("Should fail without authentication", async () => {
			const response = await request(app).patch(`/meals/${testMealId}`).send({
				quantity: 15,
			});

			expect(response.status).toBe(401);
		});

		test("Should fail with invalid meal ID", async () => {
			const response = await request(app)
				.patch("/meals/99999")
				.set("Authorization", `Bearer ${smeToken}`)
				.send({
					quantity: 15,
				});

			expect(response.status).toBe(404);
			expect(response.body.code).toBe("NOT_FOUND");
		});
	});

	describe("DELETE /meals/:mealId", () => {
		let deletableMealId;

		beforeAll(async () => {
			
			const response = await request(app)
				.post("/meals")
				.set("Authorization", `Bearer ${smeToken}`)
				.send({
					title: "Meal to Delete",
					quantity: 5,
					unit: "servings",
					prepared_at: "2026-02-22 10:00:00",
				});
			deletableMealId = response.body.meal.id;
		});

		test("Should delete own meal", async () => {
			const response = await request(app)
				.delete(`/meals/${deletableMealId}`)
				.set("Authorization", `Bearer ${smeToken}`);

			expect(response.status).toBe(200);
			expect(response.body.message).toContain("deleted");
		});

		test("Should fail to delete another user's meal", async () => {
			const response = await request(app)
				.delete(`/meals/${testMealId}`)
				.set("Authorization", `Bearer ${ngoToken}`);

			expect(response.status).toBe(403);
			expect(response.body.code).toBe("FORBIDDEN");
		});

		test("Should fail without authentication", async () => {
			const response = await request(app).delete(`/meals/${testMealId}`);

			expect(response.status).toBe(401);
		});

		test("Should fail with invalid meal ID", async () => {
			const response = await request(app)
				.delete("/meals/99999")
				.set("Authorization", `Bearer ${smeToken}`);

			expect(response.status).toBe(404);
			expect(response.body.code).toBe("NOT_FOUND");
		});
	});
});
