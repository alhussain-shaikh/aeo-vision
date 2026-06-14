import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { createReadStream } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { analyzeWithConfiguredAgent, getAgentConfig } from "./lib/agentClient.js";
import { buildAudit, createReport, mergeAgentAnalysis } from "./lib/auditEngine.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const frontendDir = path.join(rootDir, "frontend");

await loadLocalEnv(path.join(rootDir, ".env"));

const host = process.env.HOST || "127.0.0.1";
const port = Number(process.env.PORT || 8787);

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

const server = createServer(async (request, response) => {
  setBaseHeaders(response);

  if (request.method === "OPTIONS") {
    response.writeHead(204);
    response.end();
    return;
  }

  try {
    const url = new URL(request.url || "/", `http://${request.headers.host}`);

    if (url.pathname === "/api/health") {
      sendJson(response, 200, {
        ok: true,
        service: "AEO Vision Agentic AEO API",
        agentConfigured: getAgentConfig().configured,
        time: new Date().toISOString(),
      });
      return;
    }

    if (url.pathname === "/api/audit" && request.method === "POST") {
      const payload = await readJsonBody(request);
      const baselineAudit = buildAudit({
        url: payload.url,
        routeVariant: Number(payload.routeVariant || 0),
        workflowCycle: Number(payload.workflowCycle || 0),
        copyVariant: Number(payload.copyVariant || 0),
      });
      let audit = baselineAudit;

      if (payload.useAgent !== false) {
        try {
          const agentAnalysis = await analyzeWithConfiguredAgent({
            url: baselineAudit.url,
            baselineAudit,
          });
          audit = mergeAgentAnalysis(baselineAudit, agentAnalysis);
          audit.agentStatus =
            agentAnalysis?.agentResponseKind === "structured-json" ? "agent-complete" : "agent-content-only";
          if (!agentAnalysis) audit.agentStatus = "agent-not-configured";
        } catch (error) {
          audit = {
            ...baselineAudit,
            agentStatus: "agent-fallback",
            agentSummary: "The live agent was unavailable, so AEO Vision used the local analysis engine.",
            agentError: error instanceof Error ? error.message : String(error),
          };
        }
      } else {
        audit.agentStatus = "agent-disabled";
      }

      sendJson(response, 200, { audit });
      return;
    }

    if (url.pathname === "/api/report" && request.method === "POST") {
      const payload = await readJsonBody(request);
      const audit =
        payload.audit ||
        buildAudit({
          url: payload.url,
          routeVariant: Number(payload.routeVariant || 0),
          workflowCycle: Number(payload.workflowCycle || 0),
          copyVariant: Number(payload.copyVariant || 0),
        });
      sendJson(response, 200, { report: createReport(audit) });
      return;
    }

    await serveStatic(url.pathname, response);
  } catch (error) {
    sendJson(response, 500, {
      error: "Internal server error",
      detail: error instanceof Error ? error.message : String(error),
    });
  }
});

server.listen(port, host, () => {
  console.log(`AEO Vision running at http://${host}:${port}`);
});

function setBaseHeaders(response) {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");
  response.setHeader("X-Content-Type-Options", "nosniff");
}

async function loadLocalEnv(envPath) {
  try {
    const text = await readFile(envPath, "utf8");
    for (const line of text.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const separatorIndex = trimmed.indexOf("=");
      if (separatorIndex === -1) continue;

      const key = trimmed.slice(0, separatorIndex).trim();
      const rawValue = trimmed.slice(separatorIndex + 1).trim();
      if (!key || process.env[key] != null) continue;

      process.env[key] = unquoteEnvValue(rawValue);
    }
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }
}

function unquoteEnvValue(value) {
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }
  return value;
}

async function readJsonBody(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  if (!chunks.length) return {};
  const text = Buffer.concat(chunks).toString("utf8");
  return JSON.parse(text || "{}");
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload, null, 2));
}

async function serveStatic(pathname, response) {
  const safePath = normalizeRequestPath(pathname);
  const requestedPath = path.join(frontendDir, safePath);
  const extension = path.extname(requestedPath);
  const filePath = extension ? requestedPath : path.join(frontendDir, "index.html");

  if (!filePath.startsWith(frontendDir)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  try {
    await readFile(filePath);
    response.writeHead(200, { "Content-Type": mimeTypes[path.extname(filePath)] || "application/octet-stream" });
    createReadStream(filePath).pipe(response);
  } catch {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
  }
}

function normalizeRequestPath(pathname) {
  const decoded = decodeURIComponent(pathname);
  if (decoded === "/") return "index.html";
  return decoded.replace(/^\/+/, "");
}
