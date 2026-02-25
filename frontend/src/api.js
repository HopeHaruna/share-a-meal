// src/api.js
// Centralized API service for backend communication

const API_URL = import.meta.env.VITE_API_URL;

export async function apiRequest(endpoint, options = {}) {
	const url = `${API_URL}${endpoint}`;
	const defaultHeaders = {
		"Content-Type": "application/json",
		...options.headers,
	};
	const config = {
		...options,
		headers: defaultHeaders,
		credentials: "include", // for cookies/auth if needed
	};
	const response = await fetch(url, config);
	if (!response.ok) {
		const error = await response.json().catch(() => ({}));
		throw { status: response.status, ...error };
	}
	return response.json();
}
