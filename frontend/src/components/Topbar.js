export function Topbar() {
  return `
    <header class="topbar">
      <div>
        <p class="eyebrow">Answer Engine Optimization OS</p>
        <h1>Audit, improve, and monitor any URL across AI answer engines.</h1>
      </div>
      <div class="topbar-actions">
        <button class="icon-button" id="themeToggle" type="button" aria-label="Toggle contrast" title="Toggle contrast">
          ◐
        </button>
        <button class="icon-button" id="exportButton" type="button" aria-label="Export report" title="Export report">
          ⇩
        </button>
      </div>
    </header>
  `;
}
