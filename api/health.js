import { getAgentConfig } from "../backend/lib/agentClient.js";
import { handleOptions, rejectMethod, sendJson } from "./_utils.js";

export default function handler(request, response) {
  if (handleOptions(request, response)) return;
  if (request.method !== "GET") {
    rejectMethod(response, ["GET", "OPTIONS"]);
    return;
  }

  sendJson(response, 200, {
    ok: true,
    service: "AEO Vision Agentic AEO API",
    agentConfigured: getAgentConfig().configured,
    time: new Date().toISOString(),
  });
}
