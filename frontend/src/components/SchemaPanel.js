import { escapeHtml } from "../utils/html.js";

const checks = [
  ["Entity graph", "Organization, WebPage, and FAQ nodes are connected through stable @id references."],
  ["Speakable selectors", "The schema marks direct answer areas for voice and answer extraction workflows."],
  ["sameAs coverage", "Canonical social and company references help LLMs disambiguate the brand."],
  ["FAQ intent", "Questions match conversational prompts that answer engines commonly synthesize."],
];

export function SchemaPanel({ audit, active }) {
  return `
    <section class="view-panel ${active ? "is-visible" : ""}" data-panel="schema">
      <section class="panel schema-panel">
        <div class="panel-heading">
          <div>
            <span class="card-kicker">Machine-readable trust layer</span>
            <h2>Schema, citations, and crawler directives</h2>
          </div>
          <button class="tiny-button" id="copySchema" type="button">Copy JSON-LD</button>
        </div>
        <div class="schema-layout">
          <pre id="schemaCode">${escapeHtml(JSON.stringify(audit.schema, null, 2))}</pre>
          <div class="schema-checks" id="schemaChecks">
            ${checks
              .map(
                ([title, body]) => `
                  <article>
                    <strong>${escapeHtml(title)}</strong>
                    <p>${escapeHtml(body)}</p>
                  </article>
                `,
              )
              .join("")}
          </div>
        </div>
      </section>
    </section>
  `;
}
