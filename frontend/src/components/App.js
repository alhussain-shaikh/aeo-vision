import { AgentsPanel } from "./AgentsPanel.js";
import { AuditConsole } from "./AuditConsole.js";
import { ContentPanel } from "./ContentPanel.js";
import { LoadingPanels } from "./LoadingPanels.js";
import { LlmPanel } from "./LlmPanel.js";
import { OverviewPanel } from "./OverviewPanel.js";
import { SchemaPanel } from "./SchemaPanel.js";
import { Sidebar } from "./Sidebar.js";
import { Topbar } from "./Topbar.js";
import { escapeHtml } from "../utils/html.js";

export function App(viewState) {
  const { audit, activeView, focus, loading, pendingUrl, error } = viewState;

  return `
    <div class="app-shell">
      ${Sidebar({ activeView })}
      <main class="workspace">
        ${Topbar()}
        ${
          audit
            ? `
              ${AuditConsole({ audit, loading, pendingUrl, error })}
              ${
                loading
                  ? LoadingPanels({ activeView, focus })
                  : `
                    ${OverviewPanel({ audit, focus, active: activeView === "overview" })}
                    ${LlmPanel({ audit, active: activeView === "llm" })}
                    ${AgentsPanel({ audit, active: activeView === "agents" })}
                    ${ContentPanel({ audit, active: activeView === "content" })}
                    ${SchemaPanel({ audit, active: activeView === "schema" })}
                  `
              }
            `
            : `
              ${AuditConsole({ audit: null, loading: !error, pendingUrl: pendingUrl || "openai.com/business", error })}
              ${error ? "" : LoadingPanels({ activeView, focus })}
              ${error ? LoadingState({ error }) : ""}
            `
        }
      </main>
    </div>
  `;
}

function LoadingState({ error }) {
  return `
    <section class="panel">
      <div class="panel-heading">
        <div>
          <span class="card-kicker">${error ? "Backend unavailable" : "Connecting backend"}</span>
          <h2>${escapeHtml(error || "Loading the agentic AEO command center...")}</h2>
        </div>
      </div>
    </section>
  `;
}
