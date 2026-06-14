import { App } from "./components/App.js";
import { requestAudit, requestReport } from "./services/api.js";
import { state, updateState } from "./state/store.js";
import { drawCharts, stopCharts } from "./utils/charts.js";

const appRoot = document.querySelector("#app");

async function bootstrap() {
  updateState({ loading: true });
  render(false);
  await loadAudit({ url: "openai.com/business", animate: true });
}

async function loadAudit({ url, animate = false } = {}) {
  const auditUrl = url || state.audit?.url || "openai.com/business";
  updateState({ loading: true, pendingUrl: auditUrl, error: "" });
  render(false);

  try {
    const audit = await requestAudit({
      url: auditUrl,
      routeVariant: state.routeVariant,
      workflowCycle: state.workflowCycle,
      copyVariant: state.copyVariant,
    });
    updateState({ audit, loading: false, pendingUrl: "", error: "" });
    render(animate);
  } catch (error) {
    updateState({
      loading: false,
      pendingUrl: "",
      error: error instanceof Error ? error.message : "Backend request failed",
    });
    render(false);
  }
}

function render(animateScore = false) {
  stopCharts();
  appRoot.innerHTML = App(state);
  bindEvents();
  drawCharts({ audit: state.audit, routeVariant: state.routeVariant, animateScore });
}

function bindEvents() {
  document.querySelectorAll(".nav-item").forEach((button) => {
    button.addEventListener("click", () => {
      updateState({ activeView: button.dataset.view });
      render(false);
    });
  });

  document.querySelector("#auditForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    await submitAuditFromInput();
  });

  document.querySelector("#auditForm button[type='submit']")?.addEventListener("click", async (event) => {
    event.preventDefault();
    await submitAuditFromInput();
  });

  document.querySelectorAll(".segmented button").forEach((button) => {
    button.addEventListener("click", () => {
      updateState({ focus: button.dataset.focus });
      render(false);
      flash("#opportunityGrid");
    });
  });

  document.querySelector("#themeToggle")?.addEventListener("click", () => {
    document.body.classList.toggle("contrast");
    drawCharts({ audit: state.audit, routeVariant: state.routeVariant, animateScore: false });
  });

  document.querySelector("#exportButton")?.addEventListener("click", downloadReport);

  document.querySelector("#rerouteButton")?.addEventListener("click", async () => {
    updateState({ routeVariant: state.routeVariant + 1 });
    await loadAudit({ animate: false });
    flash(".visual-panel");
  });

  document.querySelector("#advanceAgents")?.addEventListener("click", async () => {
    updateState({ workflowCycle: state.workflowCycle + 1 });
    await loadAudit({ animate: false });
    flash("#workflow");
  });

  document.querySelector("#refreshCopy")?.addEventListener("click", async () => {
    updateState({ copyVariant: state.copyVariant + 1 });
    await loadAudit({ animate: false });
    flash(".content-lab");
  });

  document.querySelector("#copySchema")?.addEventListener("click", copySchema);
}

async function submitAuditFromInput() {
  const input = document.querySelector("#urlInput");
  updateState({ routeVariant: 0, workflowCycle: 0, copyVariant: 0 });
  await loadAudit({ url: input.value, animate: true });
  flash(".score-band");
}

async function downloadReport() {
  if (!state.audit) return;
  try {
    const report = await requestReport({ audit: state.audit });
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const anchor = document.createElement("a");
    anchor.href = URL.createObjectURL(blob);
    anchor.download = `aeo-report-${state.audit.domain.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.json`;
    anchor.click();
    URL.revokeObjectURL(anchor.href);
  } catch (error) {
    updateState({ error: error instanceof Error ? error.message : "Could not export report" });
    render(false);
  }
}

async function copySchema() {
  const text = document.querySelector("#schemaCode")?.textContent || "";
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
  }

  const button = document.querySelector("#copySchema");
  if (!button) return;
  const original = button.textContent;
  button.textContent = "Copied";
  setTimeout(() => {
    button.textContent = original;
  }, 900);
}

function flash(selector) {
  const element = document.querySelector(selector);
  if (!element) return;
  element.classList.remove("is-flashing");
  window.requestAnimationFrame(() => {
    element.classList.add("is-flashing");
    setTimeout(() => element.classList.remove("is-flashing"), 520);
  });
}

let resizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    drawCharts({ audit: state.audit, routeVariant: state.routeVariant, animateScore: false });
  }, 120);
});

bootstrap();
