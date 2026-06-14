import { buildAudit, createReport } from "../backend/lib/auditEngine.js";
import { handleOptions, readJsonBody, rejectMethod, sendJson } from "./_utils.js";

export default async function handler(request, response) {
  if (handleOptions(request, response)) return;
  if (request.method !== "POST") {
    rejectMethod(response, ["POST", "OPTIONS"]);
    return;
  }

  try {
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
  } catch (error) {
    sendJson(response, 500, {
      error: "Report failed",
      detail: error instanceof Error ? error.message : String(error),
    });
  }
}
