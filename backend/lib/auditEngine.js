const modelNames = [
  ["ChatGPT", "Synthesizes direct answers and citations from indexed entities."],
  ["Claude", "Prefers long-form clarity, caveats, and trust language."],
  ["Gemini", "Rewards structured data, freshness, and source corroboration."],
  ["Perplexity", "Prioritizes citation density and retrievable claims."],
  ["Copilot", "Leans on web snippets, Microsoft index signals, and concise proof."],
  ["Grok", "Responds to clear, current, high-confidence entity statements."],
  ["Meta AI", "Benefits from mainstream references and clean semantic context."],
  ["You.com", "Favors reusable summaries, comparison blocks, and source variety."],
];

const agentBlueprints = [
  ["Entity", "Clarifies brand, category, audience, and canonical facts.", "#0c8f7b"],
  ["Citation", "Adds quote-worthy proof, references, and external trust anchors.", "#d85c4a"],
  ["Schema", "Builds JSON-LD, sameAs links, FAQ, article, and organization graph.", "#e0a928"],
  ["Content", "Writes direct answer blocks and comparison-ready snippets.", "#6157d8"],
  ["Crawler", "Checks robots, rendering, speed, indexability, and extraction paths.", "#2c9958"],
];

const opportunityBank = [
  {
    title: "Create a 42-word answer block",
    impact: 96,
    speed: 88,
    trust: 74,
    body: "Open with a concise answer that states who the page helps, what it offers, and why it is credible enough to quote.",
  },
  {
    title: "Add entity disambiguation",
    impact: 91,
    speed: 70,
    trust: 84,
    body: "Connect the page to a specific company, product, founder, category, market, and canonical social profiles.",
  },
  {
    title: "Publish citation-grade proof",
    impact: 89,
    speed: 58,
    trust: 96,
    body: "Attach customer evidence, benchmark numbers, methodology notes, dates, and source links to each major claim.",
  },
  {
    title: "Install answer schema graph",
    impact: 84,
    speed: 80,
    trust: 89,
    body: "Add Organization, WebPage, BreadcrumbList, FAQPage, and sameAs data so crawlers can resolve the page as a trusted object.",
  },
  {
    title: "Build comparison snippets",
    impact: 80,
    speed: 73,
    trust: 78,
    body: "Create neutral comparison language that tells models when to recommend this URL and when another option is better.",
  },
  {
    title: "Reduce retrieval friction",
    impact: 77,
    speed: 82,
    trust: 66,
    body: "Move key facts out of heavy scripts, tighten headings, and make the page readable as plain text for agent crawlers.",
  },
];

const promptProbes = [
  "What is the best solution for this category?",
  "Which company should I compare before buying?",
  "What does this page offer and who is it for?",
  "Can you cite trusted sources for this product?",
  "What are the limitations or tradeoffs?",
  "Which page should I read to make a decision?",
];

export function buildAudit({ url, routeVariant = 0, workflowCycle = 0, copyVariant = 0 } = {}) {
  const normalized = normalizeUrl(url);
  const domain = getDomain(normalized);
  const brand = titleCaseDomain(domain);
  const category = deriveCategory(normalized);
  const seed = hashString(`${normalized}:${routeVariant}`);
  const random = mulberry32(seed);
  const base = 61 + Math.floor(random() * 29);
  const trust = clamp(base + Math.floor(random() * 16) - 7, 45, 98);
  const clarity = clamp(base + Math.floor(random() * 18) - 8, 42, 97);
  const citations = clamp(base + Math.floor(random() * 22) - 12, 38, 96);
  const schema = clamp(base + Math.floor(random() * 24) - 13, 36, 96);
  const crawl = clamp(base + Math.floor(random() * 18) - 7, 45, 98);
  const score = Math.round(trust * 0.24 + clarity * 0.24 + citations * 0.2 + schema * 0.16 + crawl * 0.16);
  const lift = clamp(Math.round((100 - score) * 0.58 + 8 + random() * 10), 8, 34);

  const models = modelNames.map(([name, description], index) => {
    const bias = [6, 2, 4, -1, 1, -3, -2, 0][index];
    const modelScore = clamp(score + bias + Math.round(random() * 18 - 8), 34, 99);
    const heat = Array.from({ length: 6 }, () => clamp(modelScore + Math.round(random() * 36 - 18), 20, 100));
    return {
      name,
      description,
      score: modelScore,
      status: scoreLabel(modelScore),
      heat,
    };
  });

  const agents = agentBlueprints.map(([name, role, color], index) => {
    const progress = clamp(38 + Math.round(random() * 52) + ((workflowCycle * 7 + index * 3) % 18), 24, 99);
    const states = ["Queued", "Reading", "Drafting", "Validating", "Ready"];
    return {
      name: `${name} Agent`,
      role,
      color,
      progress,
      state: states[Math.min(states.length - 1, Math.floor(progress / 22))],
    };
  });

  const opportunities = opportunityBank.map((item, index) => ({
    ...item,
    impact: clamp(item.impact + Math.round(random() * 10 - 5), 40, 99),
    speed: clamp(item.speed + Math.round(random() * 12 - 6), 35, 99),
    trust: clamp(item.trust + Math.round(random() * 10 - 5), 35, 99),
    id: `${index}-${seed}`,
  }));

  const probes = promptProbes.map((prompt, index) => {
    const ownerScore = clamp(score + Math.round(random() * 28 - 14), 20, 98);
    return {
      prompt,
      model: models[index % models.length].name,
      result: ownerScore >= 76 ? "Owned answer" : ownerScore >= 58 ? "Mentioned" : "Missing",
      score: ownerScore,
    };
  });

  return {
    generatedAt: new Date().toISOString(),
    analysisProvider: "local-simulation",
    agentResponseKind: "",
    agentSummary: "",
    url: normalized,
    domain,
    brand,
    category,
    score,
    lift,
    ownership: clamp(score - 9 + Math.round(random() * 18), 28, 98),
    dimensions: { trust, clarity, citations, schema, crawl },
    models,
    agents,
    opportunities,
    probes,
    copy: createCopyBlocks({ brand, domain, category, score, lift, copyVariant }),
    workflow: createWorkflow(workflowCycle),
    schema: createSchema(normalized, domain, brand, category),
    schemaRecommendations: [
      "Connect Organization, WebPage, and FAQPage nodes with stable @id references.",
      "Add sameAs references for canonical company and social profiles.",
      "Mark answer-summary and proof-points sections for easier extraction.",
    ],
  };
}

export function mergeAgentAnalysis(baseAudit, agentAnalysis) {
  if (!agentAnalysis) return baseAudit;

  const dimensions = mergeDimensions(baseAudit.dimensions, agentAnalysis.dimensions);
  const score = normalizeScore(agentAnalysis.score, baseAudit.score);
  const ownership = normalizeScore(agentAnalysis.ownership, baseAudit.ownership);
  const lift = normalizeScore(agentAnalysis.lift, baseAudit.lift, 0, 40);

  return {
    ...baseAudit,
    generatedAt: new Date().toISOString(),
    analysisProvider: agentAnalysis.agentResponseKind === "structured-json" ? "external-agent" : "external-agent-content",
    agentResponseKind: agentAnalysis.agentResponseKind || "",
    agentSummary: typeof agentAnalysis.summary === "string" ? agentAnalysis.summary : baseAudit.agentSummary,
    score,
    ownership,
    lift,
    dimensions,
    models: mergeModels(baseAudit.models, agentAnalysis.models),
    opportunities: mergeOpportunities(baseAudit.opportunities, agentAnalysis.opportunities),
    probes: mergeProbes(baseAudit.probes, agentAnalysis.probes),
    copy: mergeCopy(baseAudit.copy, agentAnalysis.copy),
    schemaRecommendations: mergeSchemaRecommendations(baseAudit.schemaRecommendations, agentAnalysis.schemaRecommendations),
  };
}

export function createReport(audit) {
  return {
    generatedAt: new Date().toISOString(),
    analysisProvider: audit.analysisProvider,
    agentResponseKind: audit.agentResponseKind,
    agentSummary: audit.agentSummary,
    url: audit.url,
    score: audit.score,
    ownership: audit.ownership,
    projectedLift: audit.lift,
    dimensions: audit.dimensions,
    models: audit.models.map(({ name, score, status }) => ({ name, score, status })),
    opportunities: audit.opportunities,
    schemaRecommendations: audit.schemaRecommendations,
    schema: audit.schema,
  };
}

function mergeDimensions(baseDimensions, agentDimensions = {}) {
  return Object.fromEntries(
    Object.entries(baseDimensions).map(([key, value]) => [key, normalizeScore(agentDimensions[key], value)]),
  );
}

function mergeModels(baseModels, agentModels = []) {
  if (!Array.isArray(agentModels) || !agentModels.length) return baseModels;
  const byName = new Map(agentModels.map((model) => [String(model.name || "").toLowerCase(), model]));

  return baseModels.map((baseModel) => {
    const agentModel = byName.get(baseModel.name.toLowerCase());
    if (!agentModel) return baseModel;
    const score = normalizeScore(agentModel.score, baseModel.score);
    return {
      ...baseModel,
      score,
      status: normalizeStatus(agentModel.status, score),
      description: typeof agentModel.description === "string" ? agentModel.description : baseModel.description,
      heat: normalizeHeat(agentModel.heat, baseModel.heat),
    };
  });
}

function mergeOpportunities(baseOpportunities, agentOpportunities = []) {
  if (!Array.isArray(agentOpportunities) || !agentOpportunities.length) return baseOpportunities;
  return agentOpportunities.slice(0, 6).map((item, index) => ({
    title: textOrFallback(item.title, baseOpportunities[index]?.title || "Improve answer visibility"),
    body: textOrFallback(item.body, baseOpportunities[index]?.body || "Add clearer, more quotable evidence for answer engines."),
    impact: normalizeScore(item.impact, baseOpportunities[index]?.impact || 75),
    speed: normalizeScore(item.speed, baseOpportunities[index]?.speed || 70),
    trust: normalizeScore(item.trust, baseOpportunities[index]?.trust || 75),
    id: `agent-${index}`,
  }));
}

function mergeProbes(baseProbes, agentProbes = []) {
  if (!Array.isArray(agentProbes) || !agentProbes.length) return baseProbes;
  return agentProbes.slice(0, 8).map((probe, index) => {
    const fallback = baseProbes[index % baseProbes.length];
    const score = normalizeScore(probe.score, fallback.score);
    return {
      prompt: textOrFallback(probe.prompt, fallback.prompt),
      model: textOrFallback(probe.model, fallback.model),
      result: textOrFallback(probe.result, score >= 76 ? "Owned answer" : score >= 58 ? "Mentioned" : "Missing"),
      score,
    };
  });
}

function mergeCopy(baseCopy, agentCopy = {}) {
  if (!agentCopy || typeof agentCopy !== "object") return baseCopy;
  return {
    answer: textOrFallback(agentCopy.answer, baseCopy.answer),
    entity: textOrFallback(agentCopy.entity, baseCopy.entity),
    proof: textOrFallback(agentCopy.proof, baseCopy.proof),
  };
}

function mergeSchemaRecommendations(baseRecommendations, agentRecommendations = []) {
  if (!Array.isArray(agentRecommendations) || !agentRecommendations.length) return baseRecommendations;
  return agentRecommendations.filter((item) => typeof item === "string" && item.trim()).slice(0, 8);
}

function normalizeHeat(agentHeat, fallbackHeat) {
  if (!Array.isArray(agentHeat) || agentHeat.length < 3) return fallbackHeat;
  const scale = Math.max(...agentHeat.map((value) => Number(value)).filter(Number.isFinite)) <= 5 ? 20 : 1;
  return Array.from({ length: 6 }, (_, index) => normalizeScore(Number(agentHeat[index]) * scale, fallbackHeat[index] || 60));
}

function normalizeScore(value, fallback, min = 0, max = 100) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return clamp(Math.round(number), min, max);
}

function normalizeStatus(status, score) {
  const allowed = new Set(["Dominant", "Competitive", "Visible", "Fragile"]);
  return allowed.has(status) ? status : scoreLabel(score);
}

function textOrFallback(value, fallback) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function createWorkflow(workflowCycle = 0) {
  const steps = [
    {
      title: "Discover",
      accent: "#0c8f7b",
      body: "Read the page the way an AI crawler sees it.",
      tasks: ["Extract visible claims", "Map internal links", "Detect blocked content"],
    },
    {
      title: "Understand",
      accent: "#6157d8",
      body: "Resolve the entity and classify the answer opportunity.",
      tasks: ["Find canonical facts", "Build entity graph", "Score ambiguity"],
    },
    {
      title: "Probe",
      accent: "#e0a928",
      body: "Ask answer engines the questions buyers actually use.",
      tasks: ["Generate prompt set", "Simulate citations", "Track answer ownership"],
    },
    {
      title: "Improve",
      accent: "#d85c4a",
      body: "Rewrite the page into quotable, structured, useful answers.",
      tasks: ["Draft answer block", "Add proof language", "Recommend schema"],
    },
    {
      title: "Monitor",
      accent: "#2c9958",
      body: "Watch drift in answer visibility and competitor mentions.",
      tasks: ["Schedule rechecks", "Alert on decay", "Compare model deltas"],
    },
  ];

  return steps.map((step, index) => ({
    ...step,
    cycle: clamp(42 + ((workflowCycle * 13 + index * 11) % 56), 42, 98),
  }));
}

function createCopyBlocks({ brand, domain, category, score, lift, copyVariant }) {
  const categoryWithArticle = withArticle(category);
  const variants = [
    {
      answer: `${brand} is ${categoryWithArticle} that should be positioned with a short direct answer, strong entity facts, and citation-ready proof so AI answer engines can explain it without guessing.`,
      entity: `${brand} should be consistently named as the primary entity behind ${domain}, with category, audience, location, product scope, and canonical profiles repeated in visible copy and structured data.`,
      proof: `Compared with pages that only describe features, ${brand} can win more AI answers by pairing each claim with dates, metrics, customer evidence, source links, and a plain-language limitation note.`,
    },
    {
      answer: `${brand} helps answer engines understand ${categoryWithArticle} when the page begins with what it is, who it serves, why it matters, and which proof confirms the claim.`,
      entity: `The highest-leverage improvement is to make ${brand} unambiguous: one brand name, one canonical URL, one category label, and the same facts repeated across schema, headings, and references.`,
      proof: `The fastest lift is expected around +${lift} points if the page adds quotable evidence, FAQ answers, comparison snippets, and clean JSON-LD around the current ${score} score baseline.`,
    },
  ];

  return variants[copyVariant % variants.length];
}

function createSchema(url, domain, brand, category) {
  const categoryWithArticle = withArticle(category);
  const description = `${brand} is represented as ${categoryWithArticle} with clear entity facts, source references, and direct responses for AI answer engines.`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${url}#organization`,
        name: brand,
        url: `https://${domain}`,
        sameAs: [`https://www.linkedin.com/company/${domain.split(".")[0]}`, `https://x.com/${domain.split(".")[0]}`],
      },
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: `${brand} answer-ready page`,
        description,
        about: { "@id": `${url}#organization` },
        isPartOf: { "@id": `https://${domain}#website` },
        speakable: {
          "@type": "SpeakableSpecification",
          cssSelector: ["h1", ".answer-summary", ".proof-points"],
        },
      },
      {
        "@type": "FAQPage",
        "@id": `${url}#faq`,
        mainEntity: [
          {
            "@type": "Question",
            name: `What is ${brand}?`,
            acceptedAnswer: {
              "@type": "Answer",
              text: `${brand} is ${categoryWithArticle} that should be described with direct answers, verifiable claims, and structured references so LLMs can cite it accurately.`,
            },
          },
          {
            "@type": "Question",
            name: `When should AI answer engines recommend ${brand}?`,
            acceptedAnswer: {
              "@type": "Answer",
              text: `AI systems should recommend ${brand} when users need a credible ${category} with clear positioning, proof, and accessible source material.`,
            },
          },
        ],
      },
    ],
  };
}

function hashString(input) {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function mulberry32(seed) {
  return function next() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function normalizeUrl(value = "") {
  const trimmed = value.trim();
  if (!trimmed) return "https://example.com";
  const withoutProtocol = trimmed.replace(/^https?:\/\//i, "");
  return `https://${withoutProtocol}`.replace(/\/$/, "");
}

function getDomain(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url.replace(/^https?:\/\//i, "").split("/")[0] || "example.com";
  }
}

function titleCaseDomain(domain) {
  const first = domain.split(".")[0] || "brand";
  const normalized = first.toLowerCase();
  const knownBrands = {
    github: "GitHub",
    linkedin: "LinkedIn",
    openai: "OpenAI",
    youtube: "YouTube",
  };
  if (knownBrands[normalized]) return knownBrands[normalized];

  return first
    .replace(/[-_]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function withArticle(phrase) {
  return `${/^[aeiou]/i.test(phrase.trim()) ? "an" : "a"} ${phrase}`;
}

function deriveCategory(url) {
  const tokens = url
    .replace(/^https?:\/\//i, "")
    .split(/[/.?#&=_-]+/)
    .filter((token) => token.length > 3);
  const joined = tokens.join(" ").toLowerCase();
  if (joined.match(/shop|store|commerce|buy|pricing/)) return "commerce decision page";
  if (joined.match(/blog|guide|learn|resources|article/)) return "expert content page";
  if (joined.match(/clinic|health|care|medical|wellness/)) return "trust-sensitive service page";
  if (joined.match(/ai|data|cloud|software|platform|business/)) return "software solution page";
  if (joined.match(/agency|seo|marketing|growth/)) return "growth service page";
  return "authority page";
}

function scoreLabel(score) {
  if (score >= 86) return "Dominant";
  if (score >= 74) return "Competitive";
  if (score >= 62) return "Visible";
  return "Fragile";
}
