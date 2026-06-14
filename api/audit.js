import { analyzeWithConfiguredAgent } from "../backend/lib/agentClient.js";
import { buildAudit, mergeAgentAnalysis } from "../backend/lib/auditEngine.js";
import { handleOptions, readJsonBody, rejectMethod, sendJson } from "./_utils.js";

export default async function handler(request, response) {
  if (handleOptions(request, response)) return;
  if (request.method !== "POST") {
    rejectMethod(response, ["POST", "OPTIONS"]);
    return;
  }

  try {
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
  } catch (error) {
    sendJson(response, 500, {
      error: "Audit failed",
      detail: error instanceof Error ? error.message : String(error),
    });
  }
}
