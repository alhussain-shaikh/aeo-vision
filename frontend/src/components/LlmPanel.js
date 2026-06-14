import { escapeHtml } from "../utils/html.js";

export function LlmPanel({ audit, active }) {
  return `
    <section class="view-panel ${active ? "is-visible" : ""}" data-panel="llm">
      <section class="panel">
        <div class="panel-heading">
          <div>
            <span class="card-kicker">LLM answer engine matrix</span>
            <h2>Visibility across ChatGPT, Claude, Gemini, Perplexity, Copilot, Grok, Meta AI, and You.com</h2>
          </div>
        </div>
        <div class="model-matrix" id="modelMatrix">${renderModels(audit.models)}</div>
      </section>

      <section class="panel">
        <div class="panel-heading">
          <div>
            <span class="card-kicker">Prompt probes</span>
            <h2>Questions the agent uses to test answer ownership</h2>
          </div>
        </div>
        <div class="probe-table" id="probeTable">${renderProbes(audit.probes)}</div>
      </section>
    </section>
  `;
}

function renderModels(models) {
  return models
    .map(
      (model) => `
        <article class="model-card">
          <header>
            <div>
              <h3>${escapeHtml(model.name)}</h3>
              <p>${escapeHtml(model.description)}</p>
            </div>
            <span class="model-score">${model.score}</span>
          </header>
          <div class="heat-row" aria-label="${escapeHtml(model.name)} signal heatmap">
            ${model.heat
              .map((value) => `<span class="heat-cell ${value > 76 ? "high" : value > 56 ? "mid" : "low"}"></span>`)
              .join("")}
          </div>
          <p>${escapeHtml(model.status)}: strongest signals are ${model.heat.filter((value) => value > 76).length} of 6 probe dimensions.</p>
        </article>
      `,
    )
    .join("");
}

function renderProbes(probes) {
  return probes
    .map(
      (probe) => `
        <article class="probe-row">
          <strong>${escapeHtml(probe.prompt)}</strong>
          <span>${escapeHtml(probe.model)}</span>
          <small>${escapeHtml(probe.result)} ${probe.score}</small>
        </article>
      `,
    )
    .join("");
}
