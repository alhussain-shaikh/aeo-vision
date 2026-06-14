import { escapeAttr, escapeHtml } from "../utils/html.js";

export function OverviewPanel({ audit, focus, active }) {
  return `
    <section class="view-panel ${active ? "is-visible" : ""}" data-panel="overview">
      <div class="score-band">
        <article class="score-card primary-card">
          <div class="score-copy">
            <span class="card-kicker">AEO readiness</span>
            <strong id="aeoScore">${audit.score}</strong>
            <p id="scoreNarrative">${escapeHtml(audit.agentSummary || scoreNarrative(audit.score))}</p>
          </div>
          <canvas id="scoreCanvas" width="220" height="220" aria-label="AEO readiness gauge"></canvas>
        </article>

        <article class="score-card">
          <span class="card-kicker">Answer ownership</span>
          <strong id="ownershipScore">${audit.ownership}%</strong>
          <p>How often the brand should become the cited answer, not just a supporting mention.</p>
        </article>

        <article class="score-card">
          <span class="card-kicker">Improvement velocity</span>
          <strong id="velocityScore">+${audit.lift}</strong>
          <p>Projected lift after the AI agent executes the top six changes.</p>
        </article>
      </div>

      <div class="analysis-grid">
        <section class="panel visual-panel">
          <div class="panel-heading">
            <div>
              <span class="card-kicker">Model interpretation map</span>
              <h2>Where the URL is understood, quoted, or skipped</h2>
            </div>
            <button class="tiny-button" id="rerouteButton" type="button">Re-route</button>
          </div>
          <canvas id="constellationCanvas" width="920" height="430" aria-label="LLM interpretation constellation"></canvas>
        </section>

        <section class="panel">
          <div class="panel-heading">
            <div>
              <span class="card-kicker">Agent queue</span>
              <h2>Autonomous AEO improvers</h2>
            </div>
          </div>
          <div class="agent-list" id="agentList">${renderAgents(audit.agents)}</div>
        </section>
      </div>

      <section class="panel">
        <div class="panel-heading">
          <div>
            <span class="card-kicker">Opportunity surface</span>
            <h2>What AI would improve first</h2>
          </div>
          <div class="segmented" role="tablist" aria-label="Opportunity focus">
            ${["impact", "speed", "trust"]
              .map(
                (item) => `
                  <button class="${focus === item ? "is-selected" : ""}" data-focus="${escapeAttr(item)}" type="button">
                    ${escapeHtml(item.charAt(0).toUpperCase() + item.slice(1))}
                  </button>
                `,
              )
              .join("")}
          </div>
        </div>
        <div class="opportunity-grid" id="opportunityGrid">${renderOpportunities(audit.opportunities, focus)}</div>
      </section>
    </section>
  `;
}

function renderAgents(agents) {
  return agents
    .map(
      (agent) => `
        <article class="agent-item">
          <div class="agent-avatar" style="background:${escapeAttr(agent.color)}33;color:${escapeAttr(agent.color)}">${escapeHtml(agent.name.charAt(0))}</div>
          <div>
            <h3>${escapeHtml(agent.name)}</h3>
            <p>${escapeHtml(agent.role)}</p>
            <div class="progress-track" aria-hidden="true"><span style="width:${agent.progress}%;background:${escapeAttr(agent.color)}"></span></div>
          </div>
          <span class="agent-state">${escapeHtml(agent.state)}</span>
        </article>
      `,
    )
    .join("");
}

function renderOpportunities(opportunities, focus) {
  return [...opportunities]
    .sort((a, b) => b[focus] - a[focus])
    .slice(0, 6)
    .map(
      (item) => `
        <article class="opportunity-card">
          <header>
            <h3>${escapeHtml(item.title)}</h3>
            <span class="impact-pill">${item[focus]}</span>
          </header>
          <p>${escapeHtml(item.body)}</p>
          <div class="progress-track" aria-label="${escapeAttr(focus)} score ${item[focus]}">
            <span style="width:${item[focus]}%"></span>
          </div>
        </article>
      `,
    )
    .join("");
}

function scoreNarrative(score) {
  if (score >= 84) return "High answer visibility. The next gains come from making evidence easier for AI systems to quote.";
  if (score >= 68) return "Promising AEO base. The agent should sharpen entities, proof, schema, and answer-first content.";
  return "The page needs stronger machine-readable context before models can safely cite it.";
}
