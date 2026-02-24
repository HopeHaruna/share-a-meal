import { apiRequest } from "./api";

describe("apiRequest integration", () => {
	it("should fetch data from the API endpoint", async () => {
		// This test assumes a running backend at VITE_API_URL and a /test endpoint
		const data = await apiRequest("/test");
		expect(data).toBeDefined();
		// Optionally, check for specific properties in the response
		// expect(data).toHaveProperty('key');
	});

	it("should throw on error response", async () => {
		await expect(apiRequest("/nonexistent-endpoint")).rejects.toHaveProperty(
			"status",
		);
	});
});
