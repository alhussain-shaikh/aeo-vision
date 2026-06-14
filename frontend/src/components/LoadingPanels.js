export function LoadingPanels({ activeView, focus }) {
  return `
    ${OverviewLoadingPanel({ active: activeView === "overview", focus })}
    ${LlmLoadingPanel({ active: activeView === "llm" })}
    ${AgentsLoadingPanel({ active: activeView === "agents" })}
    ${ContentLoadingPanel({ active: activeView === "content" })}
    ${SchemaLoadingPanel({ active: activeView === "schema" })}
  `;
}

function OverviewLoadingPanel({ active, focus }) {
  return `
    <section class="view-panel ${active ? "is-visible" : ""}" data-panel="overview" aria-busy="true">
      <div class="score-band">
        <article class="score-card primary-card skeleton-card">
          <div class="score-copy">
            <span class="skeleton skeleton-kicker"></span>
            <span class="skeleton skeleton-score"></span>
            <span class="skeleton skeleton-line wide"></span>
            <span class="skeleton skeleton-line medium"></span>
          </div>
          <div class="skeleton skeleton-gauge"></div>
        </article>
        ${Array.from({ length: 2 }, () => MetricSkeleton()).join("")}
      </div>

      <div class="analysis-grid">
        <section class="panel visual-panel skeleton-card">
          ${PanelTitleSkeleton()}
          <div class="skeleton skeleton-constellation">
            ${Array.from({ length: 8 }, (_, index) => `<span class="skeleton skeleton-node node-${index + 1}"></span>`).join("")}
          </div>
        </section>

        <section class="panel skeleton-card">
          ${PanelTitleSkeleton()}
          <div class="agent-list">
            ${Array.from({ length: 5 }, () => AgentSkeleton()).join("")}
          </div>
        </section>
      </div>

      <section class="panel skeleton-card">
        <div class="panel-heading">
          ${PanelTitleSkeleton()}
          <div class="segmented skeleton-segmented" role="presentation">
            ${["impact", "speed", "trust"]
              .map((item) => `<button class="${focus === item ? "is-selected" : ""}" type="button" disabled>${item}</button>`)
              .join("")}
          </div>
        </div>
        <div class="opportunity-grid">
          ${Array.from({ length: 6 }, () => OpportunitySkeleton()).join("")}
        </div>
      </section>
    </section>
  `;
}

function LlmLoadingPanel({ active }) {
  return `
    <section class="view-panel ${active ? "is-visible" : ""}" data-panel="llm" aria-busy="true">
      <section class="panel skeleton-card">
        ${PanelTitleSkeleton()}
        <div class="model-matrix">
          ${Array.from({ length: 8 }, () => ModelSkeleton()).join("")}
        </div>
      </section>
      <section class="panel skeleton-card">
        ${PanelTitleSkeleton()}
        <div class="probe-table">
          ${Array.from({ length: 6 }, () => ProbeSkeleton()).join("")}
        </div>
      </section>
    </section>
  `;
}

function AgentsLoadingPanel({ active }) {
  return `
    <section class="view-panel ${active ? "is-visible" : ""}" data-panel="agents" aria-busy="true">
      <section class="panel skeleton-card">
        <div class="panel-heading">
          ${PanelTitleSkeleton()}
          <span class="skeleton skeleton-button"></span>
        </div>
        <div class="workflow">
          ${Array.from({ length: 5 }, () => WorkflowSkeleton()).join("")}
        </div>
      </section>
    </section>
  `;
}

function ContentLoadingPanel({ active }) {
  return `
    <section class="view-panel ${active ? "is-visible" : ""}" data-panel="content" aria-busy="true">
      <section class="panel content-lab skeleton-card">
        <div class="panel-heading">
          ${PanelTitleSkeleton()}
          <span class="skeleton skeleton-button"></span>
        </div>
        <div class="copy-layout">
          ${Array.from({ length: 3 }, () => CopySkeleton()).join("")}
        </div>
      </section>
    </section>
  `;
}

function SchemaLoadingPanel({ active }) {
  return `
    <section class="view-panel ${active ? "is-visible" : ""}" data-panel="schema" aria-busy="true">
      <section class="panel schema-panel skeleton-card">
        <div class="panel-heading">
          ${PanelTitleSkeleton()}
          <span class="skeleton skeleton-button"></span>
        </div>
        <div class="schema-layout">
          <div class="skeleton-code">
            ${Array.from({ length: 17 }, (_, index) => `<span class="skeleton skeleton-code-line line-${(index % 5) + 1}"></span>`).join("")}
          </div>
          <div class="schema-checks">
            ${Array.from({ length: 4 }, () => SchemaCheckSkeleton()).join("")}
          </div>
        </div>
      </section>
    </section>
  `;
}

function MetricSkeleton() {
  return `
    <article class="score-card skeleton-card">
      <span class="skeleton skeleton-kicker"></span>
      <span class="skeleton skeleton-metric"></span>
      <span class="skeleton skeleton-line wide"></span>
      <span class="skeleton skeleton-line short"></span>
    </article>
  `;
}

function PanelTitleSkeleton() {
  return `
    <div class="skeleton-heading">
      <span class="skeleton skeleton-kicker"></span>
      <span class="skeleton skeleton-title"></span>
    </div>
  `;
}

function AgentSkeleton() {
  return `
    <article class="agent-item skeleton-item">
      <span class="skeleton skeleton-avatar"></span>
      <div>
        <span class="skeleton skeleton-line medium"></span>
        <span class="skeleton skeleton-line wide"></span>
        <span class="skeleton skeleton-track"></span>
      </div>
      <span class="skeleton skeleton-pill"></span>
    </article>
  `;
}

function OpportunitySkeleton() {
  return `
    <article class="opportunity-card skeleton-item">
      <header>
        <span class="skeleton skeleton-title small"></span>
        <span class="skeleton skeleton-chip"></span>
      </header>
      <span class="skeleton skeleton-line wide"></span>
      <span class="skeleton skeleton-line medium"></span>
      <span class="skeleton skeleton-track"></span>
    </article>
  `;
}

function ModelSkeleton() {
  return `
    <article class="model-card skeleton-item">
      <header>
        <div>
          <span class="skeleton skeleton-title small"></span>
          <span class="skeleton skeleton-line wide"></span>
        </div>
        <span class="skeleton skeleton-chip"></span>
      </header>
      <div class="heat-row">
        ${Array.from({ length: 6 }, () => `<span class="skeleton skeleton-heat"></span>`).join("")}
      </div>
      <span class="skeleton skeleton-line medium"></span>
    </article>
  `;
}

function ProbeSkeleton() {
  return `
    <article class="probe-row skeleton-item">
      <span class="skeleton skeleton-line wide"></span>
      <span class="skeleton skeleton-line medium"></span>
      <span class="skeleton skeleton-pill"></span>
    </article>
  `;
}

function WorkflowSkeleton() {
  return `
    <article class="workflow-step skeleton-item">
      <span class="skeleton skeleton-title small"></span>
      <span class="skeleton skeleton-line wide"></span>
      <ul>
        <li><span class="skeleton skeleton-line wide"></span></li>
        <li><span class="skeleton skeleton-line medium"></span></li>
        <li><span class="skeleton skeleton-line short"></span></li>
      </ul>
      <div class="cycle-meter">
        <span class="skeleton skeleton-track"></span>
        <span class="skeleton skeleton-chip"></span>
      </div>
    </article>
  `;
}

function CopySkeleton() {
  return `
    <article class="skeleton-item">
      <span class="skeleton skeleton-kicker"></span>
      <span class="skeleton skeleton-line wide"></span>
      <span class="skeleton skeleton-line wide"></span>
      <span class="skeleton skeleton-line medium"></span>
    </article>
  `;
}

function SchemaCheckSkeleton() {
  return `
    <article class="skeleton-item">
      <span class="skeleton skeleton-title small"></span>
      <span class="skeleton skeleton-line wide"></span>
      <span class="skeleton skeleton-line medium"></span>
    </article>
  `;
}
