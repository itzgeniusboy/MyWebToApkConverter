import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dns from "dns";
import jwt from "jsonwebtoken";

// Ensure IPv4 first for local connection stability
dns.setDefaultResultOrder("ipv4first");

/**
 * Generates a GitHub App JWT
 */
function generateAppJwt(): string {
  const appId = (process.env.GITHUB_APP_ID || "").trim();
  const privateKeyRaw = process.env.GITHUB_PRIVATE_KEY || "";

  if (!appId) {
    throw new Error("GITHUB_APP_ID is not configured in the environment.");
  }
  if (!privateKeyRaw) {
    throw new Error("GITHUB_PRIVATE_KEY is not configured in the environment.");
  }

  // Handle formatted/escaped newlines in environment variables
  const privateKey = privateKeyRaw.replace(/\\n/g, "\n");
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    // Issued at time (60s offset to avoid clock sync issues)
    iat: now - 60,
    // Expiration time (10m max allowed)
    exp: now + (10 * 60),
    iss: appId
  };

  return jwt.sign(payload, privateKey, { algorithm: "RS256" });
}

/**
 * Exchanges GitHub App JWT for a temporary Installation Access Token
 */
async function getInstallationToken(installationId: string, jwtToken: string): Promise<string> {
  const response = await fetch(`https://api.github.com/app/installations/${installationId}/access_tokens`, {
    method: "POST",
    headers: {
      "Accept": "application/vnd.github+json",
      "Authorization": `Bearer ${jwtToken}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "Web-to-App-SaaS-Converter"
    }
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`GitHub App Installation Token API returned status ${response.status}: ${text}`);
  }

  const data: any = await response.json();
  if (!data || !data.token) {
    throw new Error("Failed to retrieve installation token from GitHub App installation API.");
  }

  return data.token;
}

// In-Memory cache store for tracking dynamic builds without a persistent database
interface BuildState {
  build_id: string;
  app_name: string;
  website_url: string;
  package_name: string;
  status: "queued" | "in_progress" | "completed" | "failed";
  android_url: string | null;
  ios_url: string | null;
  created_at: string;
  updated_at: string;
}

const buildStore = new Map<string, BuildState>();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for body parsing
  app.use(express.json());

  // API Endpoints: Mount BEFORE Vite middleware to avoid being intercepted

  /**
   * 1. Convert Endpoint: Generates a unique build_id, triggers the GitHub repository dispatch API,
   * and caches the state. Authenticated securely using GitHub App installation tokens.
   */
  app.post("/api/convert", async (req: express.Request, res: express.Response) => {
    try {
      const { appName, websiteUrl, packageName, githubRepo } = req.body;

      // Validation
      if (!appName || typeof appName !== "string" || appName.trim().length === 0) {
        return res.status(400).json({ error: "App Name is required." });
      }
      if (!websiteUrl || typeof websiteUrl !== "string" || !websiteUrl.startsWith("http")) {
        return res.status(400).json({ error: "A valid website URL starting with http:// or https:// is required." });
      }

      // Resolve repository path
      const repoPath = (githubRepo || process.env.GITHUB_REPO || "").trim(); // expects "owner/repo"
      if (!repoPath || !repoPath.includes("/")) {
        return res.status(400).json({ 
          error: "GitHub Repository is required in 'owner/repo' format. Please set GITHUB_REPO on the server environment." 
        });
      }

      const [owner, repo] = repoPath.split("/");

      // Generate App JWT and Exchange for Installation Token dynamically
      const installationId = (process.env.GITHUB_INSTALLATION_ID || "").trim();
      if (!installationId) {
        return res.status(400).json({
          error: "GITHUB_INSTALLATION_ID environment variable is missing on the server configuration."
        });
      }

      let token: string;
      try {
        const jwtToken = generateAppJwt();
        token = await getInstallationToken(installationId, jwtToken);
      } catch (authError: any) {
        return res.status(401).json({
          error: `GitHub App Authentication failed: ${authError.message || authError}`
        });
      }

      // Generate a highly secure unique build ID
      const buildId = "build_" + Date.now().toString(36) + Math.random().toString(36).substring(2, 7);

      // Determine callback URL dynamically (using APP_URL env variable with fallback to host headers)
      let callbackBase = process.env.APP_URL || "";
      if (!callbackBase && req.headers.host) {
        const protocol = req.secure || req.headers["x-forwarded-proto"] === "https" ? "https" : "http";
        callbackBase = `${protocol}://${req.headers.host}`;
      }
      // Remove trailing slash if exists
      if (callbackBase.endsWith("/")) {
        callbackBase = callbackBase.slice(0, -1);
      }
      const callbackUrl = callbackBase ? `${callbackBase}/api/webhook-receiver` : "";

      console.log(`[CONVERTER API] Triggering Dispatch. BuildID: ${buildId}, CallbackURL: ${callbackUrl}`);

      // Dispatch payload to GHA Dispatch endpoint
      const githubResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/dispatches`, {
        method: "POST",
        headers: {
          "Accept": "application/vnd.github+json",
          "Authorization": `Bearer ${token}`,
          "X-GitHub-Api-Version": "2022-11-28",
          "Content-Type": "application/json",
          "User-Agent": "Web-to-App-SaaS-Converter"
        },
        body: JSON.stringify({
          event_type: "trigger-compiler",
          client_payload: {
            app_name: appName.trim(),
            website_url: websiteUrl.trim(),
            package_name: (packageName || "com.converter.app").trim(),
            build_id: buildId,
            callback_url: callbackUrl
          }
        })
      });

      if (githubResponse.status === 204) {
        // Initialize caching entry
        const newState: BuildState = {
          build_id: buildId,
          app_name: appName.trim(),
          website_url: websiteUrl.trim(),
          package_name: (packageName || "com.converter.app").trim(),
          status: "in_progress",
          android_url: null,
          ios_url: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        buildStore.set(buildId, newState);

        return res.json({
          success: true,
          build_id: buildId,
          message: "Successfully initiated compilation! Standard runner queue setup completes in 10-30s."
        });
      } else {
        const errorText = await githubResponse.text();
        let errorJson;
        try {
          errorJson = JSON.parse(errorText);
        } catch (_) {}
        
        const message = errorJson?.message || errorText || "Unknown GitHub API error";
        return res.status(githubResponse.status).json({
          error: `GitHub Dispatch Error (Status ${githubResponse.status}): ${message}`
        });
      }
    } catch (error: any) {
      console.error("[CONVERTER API] Convert Error:", error);
      return res.status(500).json({ error: `Internal Server Error: ${error.message || error}` });
    }
  });

  /**
   * 2. Webhook Receiver Endpoint: Received from GitHub Actions when compilation of a platform finishes.
   */
  app.post("/api/webhook-receiver", (req: express.Request, res: express.Response) => {
    try {
      const { build_id, platform, download_url, status } = req.body;

      console.log(`[WEBHOOK RECEIVED] BuildID: ${build_id}, Platform: ${platform}, URL: ${download_url}, Status: ${status}`);

      if (!build_id) {
        return res.status(400).json({ error: "Missing build_id parameter." });
      }

      const existing = buildStore.get(build_id);
      if (!existing) {
        // Create an entry in case callback is faster than database record propagation
        const mockState: BuildState = {
          build_id,
          app_name: "Web Application",
          website_url: "",
          package_name: "",
          status: "in_progress",
          android_url: platform === "android" ? download_url : null,
          ios_url: platform === "ios" ? download_url : null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        buildStore.set(build_id, mockState);
        return res.json({ status: "cached_new_entry" });
      }

      // Update existing record
      if (platform === "android") {
        existing.android_url = download_url;
      } else if (platform === "ios") {
        existing.ios_url = download_url;
      }

      // If both completed or if status reported failed
      if (status === "failed") {
        existing.status = "failed";
      } else if (existing.android_url && existing.ios_url) {
        existing.status = "completed";
      } else {
        existing.status = "completed"; // Even if only one is ready, we let client pull what is ready
      }

      existing.updated_at = new Date().toISOString();
      buildStore.set(build_id, existing);

      return res.json({ success: true, message: "Webhook processed successfully" });
    } catch (error: any) {
      console.error("[WEBHOOK ERROR]", error);
      return res.status(500).json({ error: error.message || error });
    }
  });

  /**
   * 3. Status Polling Endpoint: Allows frontend to check status & retrieve download links.
   */
  app.get("/api/status/:build_id", (req: express.Request, res: express.Response) => {
    const { build_id } = req.params;
    const build = buildStore.get(build_id);

    if (!build) {
      return res.status(404).json({ error: "Build ID not found. Verify if session has expired." });
    }

    return res.json(build);
  });

  // Serve static files / Vite Middleware based on environment
  if (process.env.NODE_ENV !== "production") {
    console.log("[SERVER] Starting Vite in middleware mode...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("[SERVER] Starting in PRODUCTION mode, serving static files...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[SERVER] Full-stack platform running on http://localhost:${PORT}`);
  });
}

startServer();
