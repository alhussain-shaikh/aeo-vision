const jsonHeaders = {
  "Content-Type": "application/json",
};

export async function requestAudit(payload) {
  const response = await fetch("/api/audit", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify(payload),
  });
  const data = await readJson(response);
  return data.audit;
}

export async function requestReport(payload) {
  const response = await fetch("/api/report", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify(payload),
  });
  const data = await readJson(response);
  return data.report;
}

async function readJson(response) {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "API request failed");
  }
  return data;
}
