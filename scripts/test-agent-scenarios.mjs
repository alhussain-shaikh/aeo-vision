const scenarios = [
  { name: "Software / enterprise page", payload: { url: "openai.com/business" } },
  { name: "AI product page", payload: { url: "anthropic.com/claude" } },
  { name: "Commerce/pricing page", payload: { url: "shopify.com/pricing" } },
  { name: "Expert content page", payload: { url: "hubspot.com/blog/marketing" } },
  { name: "Local fallback disabled agent", payload: { url: "openai.com/business", useAgent: false } },
];

async function auditScenario(scenario) {
  const started = Date.now();
  const response = await fetch("http://127.0.0.1:8787/api/audit", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(scenario.payload),
  });
  const data = await response.json();
  const audit = data.audit || {};
  const elapsedMs = Date.now() - started;

  return {
    scenario: scenario.name,
    ok: response.ok,
    elapsedMs,
    provider: audit.analysisProvider,
    agentStatus: audit.agentStatus,
    responseKind: audit.agentResponseKind || "",
    score: audit.score,
    ownership: audit.ownership,
    lift: audit.lift,
    models: audit.models?.length || 0,
    opportunities: audit.opportunities?.length || 0,
    probes: audit.probes?.length || 0,
    summary: compact(audit.agentSummary, 170),
    firstOpportunity: audit.opportunities?.[0]?.title || "",
    firstCopy: compact(audit.copy?.answer, 140),
    error: compact(audit.agentError, 120),
  };
}

function compact(value, maxLength) {
  if (!value) return "";
  return String(value).replace(/\s+/g, " ").trim().slice(0, maxLength);
}

const results = [];
for (const scenario of scenarios) {
  try {
    results.push(await auditScenario(scenario));
  } catch (error) {
    results.push({
      scenario: scenario.name,
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

console.log(JSON.stringify(results, null, 2));
