import { escapeAttr, escapeHtml } from "../utils/html.js";

export function AuditConsole({ audit, loading, pendingUrl, error }) {
  const sourceValue = loading && pendingUrl ? pendingUrl : audit?.url;
  const value = sourceValue?.replace(/^https?:\/\//i, "") || "openai.com/business";
  const providerLabel =
    audit?.analysisProvider === "external-agent"
      ? "Live agent"
      : audit?.analysisProvider === "external-agent-content"
        ? "Agent note + local engine"
        : "Local engine";
  const phase = loading ? "Running agent audit" : error ? "Audit failed" : `${providerLabel} audit complete`;
  const detail = loading
      ? "The backend is scoring entity clarity, citations, schema, crawler access, and LLM retrievability."
      : error
        ? error
        : audit?.agentSummary ||
          `${audit.domain} is mapped across ${audit.models.length} LLM answer engines with ${audit.opportunities.length} ranked improvements.`;

  return `
    <section class="audit-console" aria-label="URL audit console">
      <form class="url-form" id="auditForm">
        <label for="urlInput">URL to analyze</label>
        <div class="url-control">
          <span aria-hidden="true">https://</span>
          <input
            id="urlInput"
            name="url"
            type="text"
            autocomplete="url"
            value="${escapeAttr(value)}"
            placeholder="example.com/page"
          />
          <button type="submit" ${loading ? "disabled" : ""}>${loading ? "Auditing..." : "Run agent audit"}</button>
        </div>
      </form>
      <div class="audit-status ${loading ? "is-running" : ""}" aria-live="polite">
        <span class="status-ring" aria-hidden="true"></span>
        <div>
          <strong id="auditPhase">${escapeHtml(phase)}</strong>
          <small id="auditDetail">${escapeHtml(detail)}</small>
        </div>
      </div>
    </section>
  `;
}
