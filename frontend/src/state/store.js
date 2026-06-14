export const state = {
  audit: null,
  activeView: "overview",
  focus: "impact",
  routeVariant: 0,
  copyVariant: 0,
  workflowCycle: 0,
  animationFrame: 0,
  loading: false,
  pendingUrl: "",
  error: "",
};

export function updateState(patch) {
  Object.assign(state, patch);
}
