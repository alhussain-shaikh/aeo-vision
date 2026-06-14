# AEO Vision Agentic AEO

AEO Vision is a full-stack Answer Engine Optimization dashboard for analyzing any URL across AI answer engines and LLM interfaces. It combines a component-based frontend, a Node backend API, a deterministic local audit engine, and an optional external APlayer agent integration.

## Run Locally

```bash
npm run dev
```

Open:

```text
http://127.0.0.1:8787
```

## Optional Live Agent

Create a local `.env` file when you want live agent analysis:

```bash
APLAYER_AGENT_URL=https://your-agent-endpoint.example/send_message
APLAYER_AUTHENTICATION=api-key your-real-key
APLAYER_USER_ID=your.email@example.com
APLAYER_TIMEOUT_MS=55000
```

The app uses the live agent when configured. If the agent is slow, unavailable, or returns incomplete content, the backend safely falls back to the local analysis engine.

## Deploy To Vercel

This project is Vercel-ready. The static frontend builds to `dist/`, and the backend runs as serverless functions in `api/`.

Required Vercel environment variables:

```text
APLAYER_AGENT_URL
APLAYER_AUTHENTICATION
APLAYER_USER_ID
APLAYER_TIMEOUT_MS
```

Deploy:

```bash
npm run check
npm run build
npx vercel@latest deploy --prod
```

## Test Agent Scenarios

With the server running, run:

```bash
npm run test:agent
```

This checks live APlayer analysis across software, AI product, commerce/pricing, expert content, and local fallback scenarios.

## Documentation

See [docs/ARCHITECTURE.md](/Users/alhussainshaikh/Github/AI-AEO/docs/ARCHITECTURE.md) for the architecture, tech stack, build approach, and challenges encountered while building the app.
