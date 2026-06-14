export function setApiHeaders(response) {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");
  response.setHeader("X-Content-Type-Options", "nosniff");
}

export function sendJson(response, statusCode, payload) {
  setApiHeaders(response);
  response.status(statusCode).json(payload);
}

export async function readJsonBody(request) {
  if (request.body && typeof request.body === "object") return request.body;
  if (typeof request.body === "string") return JSON.parse(request.body || "{}");

  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  const text = Buffer.concat(chunks).toString("utf8");
  return text ? JSON.parse(text) : {};
}

export function handleOptions(request, response) {
  if (request.method !== "OPTIONS") return false;
  setApiHeaders(response);
  response.status(204).end();
  return true;
}

export function rejectMethod(response, allowed) {
  response.setHeader("Allow", allowed.join(", "));
  sendJson(response, 405, { error: "Method not allowed" });
}
