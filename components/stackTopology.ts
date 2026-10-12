/**
 * The LLM serving topology, defined once.
 *
 * Both the 2D diagram (Architecture.tsx) and the isometric WebGL scene
 * (StackScene.tsx) read from here, so the two views cannot drift apart.
 *
 * Three invariants, do not reintroduce what they correct:
 *  1. LiteLLM appears ONCE, as the gateway — it is also what calls the
 *     frontier providers, so a second "providers" node is a phantom hop.
 *  2. GPU appears ONCE, inside the private network, below the cluster.
 *  3. Model optimisation lives INSIDE the cluster behind the engines,
 *     never downstream of both branches — frontier calls never pass
 *     through local quantisation.
 */

export type Zone = 'edge' | 'gateway' | 'frontier' | 'cluster' | 'metal'

export type Tier = {
  id: string
  label: string
  lines: string[]
  zone: Zone
  /** one-line gloss shown when a node is selected in the 3D scene */
  detail: string
}

export const CLIENTS: Tier = {
  id: 'clients',
  label: 'CLIENTS',
  lines: ['web · mobile', 'API consumers · agents'],
  zone: 'edge',
  detail: 'Every caller of the platform: product surfaces, internal services and agents.',
}

export const EDGE: Tier = {
  id: 'edge',
  label: 'EDGE & SECURITY',
  lines: ['CDN · API gateway · WAF', 'rate limiting · auth'],
  zone: 'edge',
  detail: 'Terminates TLS, filters hostile traffic and enforces auth before anything reaches the model path.',
}

export const GATEWAY: Tier = {
  id: 'gateway',
  label: 'LLM GATEWAY — LiteLLM',
  lines: [
    'OpenAI-compatible API',
    'provider routing · load balancing',
    'retries · fallbacks',
    'rate limits · budgets · cost tracking',
  ],
  zone: 'gateway',
  detail: 'One API surface over every backend. Owns retries, fallbacks, spend caps and per-tenant cost attribution — and is what actually calls the frontier providers.',
}

export const ROUTER: Tier = {
  id: 'router',
  label: 'SEMANTIC ROUTER',
  lines: [
    'prompt / task classification',
    'model selection',
    'quality · cost · latency policy',
    'reasoning vs fast path',
  ],
  zone: 'gateway',
  detail: 'Decides which model class should answer. The gateway then executes that decision.',
}

export const FRONTIER: Tier = {
  id: 'frontier',
  label: 'FRONTIER MODELS',
  lines: ['OpenAI · Anthropic', 'Gemini · Bedrock · Azure', 'called through LiteLLM'],
  zone: 'frontier',
  detail: 'Hosted reasoning models for work that does not pay off on self-hosted weights. Reached through the gateway, so spend and fallbacks stay in one place.',
}

export const SELF_HOSTED: Tier[] = [
  {
    id: 'llmd',
    label: 'llm-d CONTROL PLANE',
    lines: ['request scheduling', 'KV-cache-aware routing', 'GPU-aware placement'],
    zone: 'cluster',
    detail: 'Places each request on a replica that already holds the relevant KV cache, and schedules against real GPU pressure rather than round-robin.',
  },
  {
    id: 'models',
    label: 'FAST / REASONING MODELS',
    lines: ['Qwen · Llama', 'DeepSeek · GPT-OSS'],
    zone: 'cluster',
    detail: 'Two self-hosted tiers: small models carry the volume, larger ones take the work that needs the reasoning.',
  },
  {
    id: 'engines',
    label: 'INFERENCE ENGINES',
    lines: ['vLLM · SGLang · Triton', 'prefix cache · PagedAttention', 'continuous batching', 'speculative decoding'],
    zone: 'cluster',
    detail: 'The serving runtime. PagedAttention keeps KV memory from fragmenting; continuous batching keeps the GPU fed between arrivals.',
  },
  {
    id: 'optimisation',
    label: 'MODEL OPTIMIZATION',
    lines: ['LoRA · QLoRA', 'AWQ · GPTQ', 'FP8 · INT4'],
    zone: 'cluster',
    detail: 'Adapters and quantisation applied to the weights the engines serve. Local only — frontier traffic never passes through it.',
  },
]

export const GPU: Tier = {
  id: 'gpu',
  label: 'GPU NODE POOLS',
  lines: ['H100 · H200 · B200 · A100', 'tensor · pipeline · expert parallelism'],
  zone: 'metal',
  detail: 'The metal underneath. Parallelism strategy is chosen per model shape — expert parallelism once the model is sparse.',
}

export const OBSERVABILITY = [
  ['metrics', 'Prometheus'],
  ['dashboards', 'Grafana'],
  ['logs', 'CloudWatch'],
  ['traces', 'OpenTelemetry'],
] as const

/** Flat ordering used by the isometric scene, top of stack to bottom. */
export const ALL_TIERS: Tier[] = [
  CLIENTS,
  EDGE,
  GATEWAY,
  ROUTER,
  FRONTIER,
  ...SELF_HOSTED,
  GPU,
]
