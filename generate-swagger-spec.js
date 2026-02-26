// Run this file to generate swagger.json for uploading to SwaggerHub
const fs = require("fs");
const swaggerSpec = require("./src/config/swagger");

// Write to file
fs.writeFileSync(
	"./swagger.json",
	JSON.stringify(swaggerSpec, null, 2),
	"utf8",
);

console.log("✅ swagger.json generated successfully!");
console.log("📄 File location: ./swagger.json");
console.log("\nNext steps:");
console.log("1. Go to https://app.swaggerhub.com/");
console.log("2. Sign up/Login (free account available)");
console.log('3. Click "Create New" → "Import and Document API"');
console.log("4. Upload the swagger.json file");
console.log(
	"5. Your API docs will be hosted at: https://app.swaggerhub.com/apis/YOUR_USERNAME/share-a-meal/1.0.0",
);
