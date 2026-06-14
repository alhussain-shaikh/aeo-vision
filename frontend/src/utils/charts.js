const palette = ["#0c8f7b", "#d85c4a", "#e0a928", "#6157d8", "#2c9958"];
let constellationFrame = 0;

export function drawCharts({ audit, routeVariant, animateScore = true }) {
  if (!audit) return;
  drawScoreGauge(audit.score, animateScore);
  drawConstellation(audit, routeVariant);
}

export function stopCharts() {
  cancelAnimationFrame(constellationFrame);
}

function drawScoreGauge(score, animate = true) {
  const canvas = document.querySelector("#scoreCanvas");
  if (!canvas) return;
  const { ctx, width, height } = setupCanvas(canvas);
  const target = score / 100;
  const startTime = performance.now();
  const duration = animate ? 800 : 1;

  function draw(now) {
    const progress = clamp((now - startTime) / duration, 0, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = target * eased;
    ctx.clearRect(0, 0, width, height);
    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.min(width, height) * 0.38;

    ctx.lineWidth = 16;
    ctx.strokeStyle = cssVar("--bg-strong");
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();

    const gradient = ctx.createLinearGradient(cx - radius, cy - radius, cx + radius, cy + radius);
    gradient.addColorStop(0, "#0c8f7b");
    gradient.addColorStop(0.52, "#e0a928");
    gradient.addColorStop(1, "#d85c4a");
    ctx.strokeStyle = gradient;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.arc(cx, cy, radius, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * current);
    ctx.stroke();

    ctx.fillStyle = cssVar("--ink");
    ctx.font = "700 28px IBM Plex Sans, system-ui";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`${Math.round(score * eased)}`, cx, cy - 5);
    ctx.fillStyle = cssVar("--muted");
    ctx.font = "700 11px IBM Plex Sans, system-ui";
    ctx.fillText("AEO", cx, cy + 25);

    if (progress < 1) requestAnimationFrame(draw);
  }

  requestAnimationFrame(draw);
}

function drawConstellation(audit, routeVariant) {
  cancelAnimationFrame(constellationFrame);
  const canvas = document.querySelector("#constellationCanvas");
  if (!canvas) return;
  const nodes = audit.models.map((model, index) => ({
    ...model,
    angle: (Math.PI * 2 * index) / audit.models.length + routeVariant * 0.08,
    color: palette[index % palette.length],
  }));

  function frame(time) {
    const { ctx, width, height } = setupCanvas(canvas);
    const centerX = width / 2;
    const centerY = height / 2;
    const radiusX = Math.max(120, width * 0.35);
    const radiusY = Math.max(90, height * 0.29);

    ctx.clearRect(0, 0, width, height);
    ctx.lineWidth = 1;
    ctx.strokeStyle = document.body.classList.contains("contrast") ? "rgba(247,240,228,0.12)" : "rgba(25,24,22,0.11)";

    for (let ring = 1; ring <= 3; ring += 1) {
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, (radiusX * ring) / 3, (radiusY * ring) / 3, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    const corePulse = 1 + Math.sin(time / 520) * 0.04;
    ctx.fillStyle = cssVar("--charcoal");
    ctx.beginPath();
    ctx.arc(centerX, centerY, 32 * corePulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = document.body.classList.contains("contrast") ? "#171511" : cssVar("--bg");
    ctx.font = "700 12px IBM Plex Sans, system-ui";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("URL", centerX, centerY);

    nodes.forEach((node, index) => {
      const wobble = Math.sin(time / 700 + index) * 8;
      const x = centerX + Math.cos(node.angle) * (radiusX + wobble);
      const y = centerY + Math.sin(node.angle) * (radiusY + wobble * 0.6);
      const strength = node.score / 100;

      ctx.strokeStyle = node.score > 76 ? "rgba(12,143,123,0.58)" : node.score > 58 ? "rgba(224,169,40,0.58)" : "rgba(216,92,74,0.58)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(x, y);
      ctx.stroke();

      ctx.fillStyle = node.color;
      ctx.beginPath();
      ctx.arc(x, y, 15 + strength * 11, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = document.body.classList.contains("contrast") ? "#171511" : "#fffdf8";
      ctx.font = "700 11px IBM Plex Sans, system-ui";
      ctx.textAlign = "center";
      ctx.fillText(String(node.score), x, y + 1);

      const alignLeft = x < centerX;
      ctx.fillStyle = cssVar("--ink");
      ctx.font = "700 12px IBM Plex Sans, system-ui";
      ctx.textAlign = alignLeft ? "right" : "left";
      ctx.fillText(node.name, x + (alignLeft ? -24 : 24), y - 3);
      ctx.fillStyle = cssVar("--muted");
      ctx.font = "600 10px IBM Plex Sans, system-ui";
      ctx.fillText(node.status, x + (alignLeft ? -24 : 24), y + 13);
    });

    constellationFrame = requestAnimationFrame(frame);
  }

  constellationFrame = requestAnimationFrame(frame);
}

function setupCanvas(canvas) {
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.max(1, Math.floor(rect.width * dpr));
  canvas.height = Math.max(1, Math.floor(rect.height * dpr));
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, width: rect.width, height: rect.height };
}

function cssVar(name) {
  return getComputedStyle(document.body).getPropertyValue(name).trim();
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
