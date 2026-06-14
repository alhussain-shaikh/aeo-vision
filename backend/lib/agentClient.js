import { AEO_SYSTEM_PROMPT, buildAgentUserPrompt } from "./systemPrompt.js";

const defaultAgentUrl = "https://jbqljzsfl5o72rqhgxfrmlkcj40qmpzw.lambda-url.us-east-1.on.aws/agent/APlayer/send_message";
const defaultTimeoutMs = 30000;

export function getAgentConfig() {
  const authentication = process.env.APLAYER_AUTHENTICATION || formatApiKey(process.env.APLAYER_API_KEY);
  const userId = process.env.APLAYER_USER_ID;
  const url = process.env.APLAYER_AGENT_URL || defaultAgentUrl;

  return {
    configured: Boolean(authentication && userId),
    authentication,
    userId,
    url,
    timeoutMs: normalizeTimeout(process.env.APLAYER_TIMEOUT_MS),
  };
}

export async function analyzeWithConfiguredAgent({ url, baselineAudit }) {
  const config = getAgentConfig();
  if (!config.configured) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.timeoutMs);

  try {
    const response = await fetch(config.url, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "x-authentication": config.authentication,
        "x-user-id": config.userId,
        "content-type": "application/json",
      },
      body: JSON.stringify(buildAgentPayload({ url, baselineAudit })),
    });

    const responseText = await response.text();
    if (!response.ok) {
      throw new Error(`Agent responded with HTTP ${response.status}: ${responseText.slice(0, 180)}`);
    }

    return parseAgentResponse(responseText);
  } finally {
    clearTimeout(timeout);
  }
}

function buildAgentPayload({ url, baselineAudit }) {
  return {
    input: {
      persistent: false,
      expyId: "",
      source: "aeo-vision-dashboard",
      conversationId: "",
      messages: [
        {
          role: "user",
          payload: {
            content: `SYSTEM PROMPT:\n${AEO_SYSTEM_PROMPT}\n\nUSER TASK:\n${buildAgentUserPrompt({ url, baselineAudit })}`,
          },
          context: {
            selectedDocuments: [],
            hiddenFilters: {},
          },
        },
      ],
    },
  };
}

function formatApiKey(apiKey) {
  if (!apiKey) return "";
  return apiKey.startsWith("api-key ") ? apiKey : `api-key ${apiKey}`;
}

function normalizeTimeout(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return defaultTimeoutMs;
  return Math.max(3000, Math.min(60000, Math.round(parsed)));
}

export function parseAgentResponse(responseText) {
  const parsedEnvelope = tryParseJson(responseText);
  const aplayerContent = extractAPlayerContent(parsedEnvelope);
  const candidates = uniqueCandidates([
    ...collectTextCandidates(aplayerContent),
    ...collectTextCandidates(parsedEnvelope ?? responseText),
  ]);

  for (const candidate of candidates) {
    const parsed = parseJsonCandidate(candidate);
    const normalized = normalizeAnalysisObject(parsed);
    if (normalized) return { ...normalized, agentResponseKind: "structured-json" };
  }

  const summary = candidates.find((candidate) => candidate.trim().length > 20);
  return summary ? { summary: summary.trim(), agentResponseKind: "content-only" } : null;
}

function extractAPlayerContent(envelope) {
  if (!envelope || typeof envelope !== "object") return null;
  return envelope.output?.payload?.content ?? null;
}

function normalizeAnalysisObject(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  if (value.audit && typeof value.audit === "object") return normalizeAnalysisObject(value.audit);
  if (value.analysis && typeof value.analysis === "object") return normalizeAnalysisObject(value.analysis);
  if (value.result && typeof value.result === "object") return normalizeAnalysisObject(value.result);

  const usefulKeys = ["summary", "score", "dimensions", "models", "opportunities", "copy", "schemaRecommendations"];
  return usefulKeys.some((key) => Object.prototype.hasOwnProperty.call(value, key)) ? value : null;
}

function parseJsonCandidate(text) {
  if (!text || typeof text !== "string") return null;

  const direct = tryParseLooseJson(text);
  if (direct) return direct;

  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced) {
    const parsedFence = tryParseLooseJson(fenced[1]);
    if (parsedFence) return parsedFence;
  }

  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    return tryParseLooseJson(text.slice(firstBrace, lastBrace + 1));
  }

  return null;
}

function tryParseLooseJson(text) {
  const direct = tryParseJson(text);
  if (direct) return direct;

  const repaired = repairCommonAgentJsonIssues(text);
  if (repaired !== text) return tryParseJson(repaired);

  return null;
}

function repairCommonAgentJsonIssues(text) {
  return text
    .replace(/,\s*([}\]])/g, "$1")
    .replace(/""([^"\n{}[\]:,]+)""/g, "'$1'");
}

function tryParseJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function collectTextCandidates(value, depth = 0) {
  if (depth > 8 || value == null) return [];
  if (typeof value === "string") return [value];
  if (typeof value !== "object") return [];
  if (Array.isArray(value)) return value.flatMap((item) => collectTextCandidates(item, depth + 1));

  const priorityKeys = ["content", "text", "message", "output", "response", "result", "payload", "data", "messages"];
  const priority = priorityKeys.flatMap((key) => collectTextCandidates(value[key], depth + 1));
  const rest = Object.entries(value)
    .filter(([key]) => !priorityKeys.includes(key))
    .flatMap(([, child]) => collectTextCandidates(child, depth + 1));

  return [...priority, ...rest];
}

function uniqueCandidates(candidates) {
  return [...new Set(candidates.filter((candidate) => typeof candidate === "string" && candidate.trim()))];
}
