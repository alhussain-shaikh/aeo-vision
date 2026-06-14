import { escapeAttr, escapeHtml } from "../utils/html.js";

export function AgentsPanel({ audit, active }) {
  return `
    <section class="view-panel ${active ? "is-visible" : ""}" data-panel="agents">
      <section class="panel">
        <div class="panel-heading">
          <div>
            <span class="card-kicker">Agentic workflow</span>
            <h2>Specialist agents working as one AEO team</h2>
          </div>
          <button class="tiny-button" id="advanceAgents" type="button">Advance cycle</button>
        </div>
        <div class="workflow" id="workflow">${renderWorkflow(audit.workflow)}</div>
      </section>
    </section>
  `;
}

function renderWorkflow(steps) {
  return steps
    .map(
      (step) => `
        <article class="workflow-step" style="--accent:${escapeAttr(step.accent)}">
          <h3>${escapeHtml(step.title)}</h3>
          <p>${escapeHtml(step.body)}</p>
          <ul>
            ${step.tasks.map((task) => `<li>${escapeHtml(task)}</li>`).join("")}
          </ul>
          <div class="cycle-meter">
            <div class="progress-track"><span style="width:${step.cycle}%;background:${escapeAttr(step.accent)}"></span></div>
            <strong>${step.cycle}%</strong>
          </div>
        </article>
      `,
    )
    .join("");
}
