const fs = require("fs");

const sessionId = process.env.SESSION_ID;

if (!sessionId) {
  console.error("❌ ERROR: SESSION_ID not found in environment variables.");
  process.exit(1);
}

// Agar .env file hai to usme likh dega
const envFile = ".env";
let envContent = "";

if (fs.existsSync(envFile)) {
  envContent = fs.readFileSync(envFile, "utf-8");
}

// Purana SESSION_ID delete karo agar exist kare
envContent = envContent
  .split("\n")
  .filter((line) => !line.startsWith("SESSION_ID="))
  .join("\n");

// Naya SESSION_ID add karo
envContent += `\nSESSION_ID=${sessionId}\n`;

fs.writeFileSync(envFile, envContent, "utf-8");

console.log("✅ SESSION_ID saved successfully to .env file!");
