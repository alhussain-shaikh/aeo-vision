import { escapeHtml } from "../utils/html.js";

export function ContentPanel({ audit, active }) {
  return `
    <section class="view-panel ${active ? "is-visible" : ""}" data-panel="content">
      <section class="panel content-lab">
        <div class="panel-heading">
          <div>
            <span class="card-kicker">AI improvised AEO copy</span>
            <h2>Answer-ready content blocks generated from the audit</h2>
          </div>
          <button class="tiny-button" id="refreshCopy" type="button">Refresh</button>
        </div>
        <div class="copy-layout">
          <article>
            <span>Direct answer block</span>
            <p id="answerBlock">${escapeHtml(audit.copy.answer)}</p>
          </article>
          <article>
            <span>Entity clarity paragraph</span>
            <p id="entityBlock">${escapeHtml(audit.copy.entity)}</p>
          </article>
          <article>
            <span>Comparative proof snippet</span>
            <p id="proofBlock">${escapeHtml(audit.copy.proof)}</p>
          </article>
        </div>
      </section>
    </section>
  `;
}
