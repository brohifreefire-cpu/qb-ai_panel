const express = require("express");
const fetch = require("node-fetch");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Render repo info
const GITHUB_REPO = "qadeerTech/QADEER-AI";   // <-- apna repo name daalo
const REPO_BRANCH = "main";                   // <-- agar branch ka naam main hai

// Health check
app.get("/api/health", (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

// Deploy API
app.post("/api/deploy", async (req, res) => {
  try {
    const { sessionId, friendlyName } = req.body;

    if (!sessionId) {
      return res
        .status(400)
        .json({ success: false, message: "Session ID required" });
    }

    const renderApiKey = process.env.RENDER_API_KEY;
    if (!renderApiKey) {
      return res
        .status(500)
        .json({ success: false, message: "Render API key not set on server." });
    }

    // Service name
    const serviceName =
      (friendlyName &&
        friendlyName.trim().replace(/[^a-z0-9\-_.]/gi, "-").toLowerCase()) ||
      "qadeer-ai-" + Date.now();

    // Body for render
    const body = {
      serviceName,
      runtime: "node",
      type: "web_service",
      repo: GITHUB_REPO,
      branch: REPO_BRANCH,
      envVars: [
        { key: "SESSION_ID", value: sessionId },
        { key: "BOT_NAME", value: "QADEER-AI" },
      ],
      startCommand: "node write-session-from-env.js",
    };

    const response = await fetch("https://api.render.com/v1/services", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${renderApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      timeout: 60000,
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({
        success: false,
        message: "Deploy failed",
        error: data,
      });
    }

    res.json({
      success: true,
      message: "Deploy created. It may take a minute to start.",
      data,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
