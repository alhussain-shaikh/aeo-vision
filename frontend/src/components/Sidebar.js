import { escapeAttr, escapeHtml } from "../utils/html.js";

const navItems = [
  ["overview", "⌁", "Overview"],
  ["llm", "◈", "LLM Grid"],
  ["agents", "✦", "Agents"],
  ["content", "▤", "Content"],
  ["schema", "{}", "Schema"],
];

export function Sidebar({ activeView }) {
  return `
    <aside class="rail" aria-label="Primary navigation">
      <div class="brand-lockup">
        <div class="brand-mark" aria-hidden="true">
          <img src="./assets/aeo-vision-logo.svg" alt="" />
        </div>
        <div>
          <p>AEO Vision</p>
          <span>Answer intelligence</span>
        </div>
      </div>

      <nav class="nav-stack">
        ${navItems
          .map(
            ([view, icon, label]) => `
              <button class="nav-item ${activeView === view ? "is-active" : ""}" data-view="${escapeAttr(view)}" type="button">
                <span class="nav-icon" aria-hidden="true">${escapeHtml(icon)}</span>
                <span>${escapeHtml(label)}</span>
              </button>
            `,
          )
          .join("")}
      </nav>

      <div class="rail-footer">
        <span class="pulse-dot" aria-hidden="true"></span>
        <div>
          <strong>Backend connected</strong>
          <small>Agent API simulation</small>
        </div>
      </div>
    </aside>
  `;
}
