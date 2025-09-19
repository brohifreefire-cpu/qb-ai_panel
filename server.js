// server.js
const express = require('express');
const axios = require('axios');
const path = require('path');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const cors = require('cors');

const app = express();
app.use(helmet());
app.use(cors());
app.use(bodyParser.json());

// Serve static frontend
app.use('/', express.static(path.join(__dirname, 'public')));

// Replace with your repo info
const GITHUB_REPO = "QadeerXTech/QADEER-AI"; 
const REPO_BRANCH = "main"; 

// Health check
app.get('/api/health', (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

// Deploy API
app.post('/api/deploy', async (req, res) => {
  try {
    const { sessionId, friendlyName } = req.body;

    if (!sessionId || typeof sessionId !== 'string' || sessionId.length < 10) {
      return res.status(400).json({ success: false, message: "Invalid sessionId" });
    }

    const renderApiKey = process.env.RENDER_API_KEY;
    if (!renderApiKey) {
      return res.status(500).json({ success: false, message: "Render API key not set on server." });
    }

    const serviceName = (friendlyName && friendlyName.trim())
      ? `qadeer-ai-${friendlyName.trim().replace(/[^a-z0-9-]/gi, '-').toLowerCase()}`
      : `qadeer-ai-${Date.now()}`;

    const body = {
      name: serviceName,
      env: "node",
      repo: {
        type: "github",
        name: GITHUB_REPO
      },
      branch: REPO_BRANCH,
      plan: "free",
      envVars: [
        { key: "SESSION_ID", value: sessionId },
        { key: "BOT_NAME", value: "QADEER-AI" }
      ],
      startCommand: "node write-session-from-env.js"
    };

    const url = "https://api.render.com/v1/services";

    const response = await axios.post(url, body, {
      headers: {
        "Authorization": `Bearer ${renderApiKey}`,
        "Content-Type": "application/json"
      },
      timeout: 60000
    });

    return res.json({ success: true, data: response.data, message: "Deploy created. It may take a few minutes to build." });
  } catch (err) {
    console.error("deploy error:", err.response ? err.response.data || err.response.statusText : err.message);
    const msg = err.response && err.response.data ? err.response.data : err.message;
    return res.status(500).json({ success: false, message: "Deployment failed", error: msg });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`QADEER Deploy Panel running on ${PORT}`));
