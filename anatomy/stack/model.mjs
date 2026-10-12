/**
 * The model behind the figure.
 *
 * Every number the drawing shows comes from here: which way the diverter
 * throws, how long a request spends in each station, what the gauges read.
 * The stations map one-to-one onto the real serving topology.
 */

export const STATIONS = [
  {
    id: 'clients',
    name: 'CLIENTS',
    part: 'intake hopper',
    detail: 'Every caller of the platform: product surfaces, internal services and agents.',
    spec: ['web · mobile', 'API consumers · agents'],
  },
  {
    id: 'edge',
    name: 'EDGE & SECURITY',
    part: 'filter grate',
    detail: 'Terminates TLS, drops hostile traffic and enforces auth before anything reaches the model path.',
    spec: ['CDN · API gateway · WAF', 'rate limiting · auth'],
  },
  {
    id: 'gateway',
    name: 'LLM GATEWAY — LiteLLM',
    part: 'manifold and gauges',
    detail: 'One API surface over every backend. Owns retries, fallbacks, spend caps and per-tenant cost attribution — and is what actually calls the frontier providers.',
    spec: ['OpenAI-compatible API', 'provider routing · load balancing', 'retries · fallbacks', 'budgets · cost tracking'],
  },
  {
    id: 'router',
    name: 'SEMANTIC ROUTER',
    part: 'diverter flap',
    detail: 'Decides which model class should answer. The gateway then executes that decision — the flap throws, and the request takes one of two paths.',
    spec: ['prompt / task classification', 'model selection', 'quality · cost · latency policy'],
  },
  {
    id: 'frontier',
    name: 'FRONTIER MODELS',
    part: 'outfeed pipe',
    detail: 'Hosted reasoning models for work that does not pay off on self-hosted weights. Reached through the gateway, so spend and fallbacks stay in one place.',
    spec: ['OpenAI · Anthropic', 'Gemini · Bedrock · Azure'],
  },
  {
    id: 'llmd',
    name: 'llm-d CONTROL PLANE',
    part: 'indexing carriage',
    detail: 'Places each request on a replica that already holds the relevant KV cache, and schedules against real GPU pressure rather than round-robin.',
    spec: ['request scheduling', 'KV-cache-aware routing', 'GPU-aware placement'],
  },
  {
    id: 'engines',
    name: 'INFERENCE ENGINES',
    part: 'drum bank',
    detail: 'The serving runtime. PagedAttention keeps KV memory from fragmenting; continuous batching keeps the drums fed between arrivals.',
    spec: ['vLLM · SGLang · Triton', 'prefix cache · PagedAttention', 'continuous batching'],
  },
  {
    id: 'optimisation',
    name: 'MODEL OPTIMIZATION',
    part: 'screw press',
    detail: 'Adapters and quantisation applied to the weights the drums serve. Local only — frontier traffic never passes through it.',
    spec: ['LoRA · QLoRA', 'AWQ · GPTQ', 'FP8 · INT4'],
  },
  {
    id: 'gpu',
    name: 'GPU NODE POOLS',
    part: 'finned plinth',
    detail: 'The metal everything stands on. Parallelism strategy is chosen per model shape — expert parallelism once the model is sparse.',
    spec: ['H100 · H200 · B200', 'tensor · pipeline · expert'],
  },
]

/** Share of traffic the router throws to the self-hosted path. */
export const SELF_HOSTED_SHARE = 0.82

/** Steady-state arrivals, and the jitter the readout shows. */
export const BASE_RPS = 1240
export const RPS_SPREAD = 260

/** Seconds a request spends in each station, used to pace the travelling token. */
export const DWELL = {
  clients: 0.5,
  edge: 0.45,
  gateway: 0.7,
  router: 0.55,
  frontier: 1.1,
  llmd: 0.6,
  engines: 1.2,
  optimisation: 0.6,
  gpu: 0.7,
}
