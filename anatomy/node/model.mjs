/**
 * The serving node.
 *
 * This figure owns the physical half of the topology honestly: everything
 * here is hardware you could unrack. The logical flow — gateway, semantic
 * router, the frontier split — stays in the 2D diagram, where it belongs.
 * Stretching a chassis to depict a router would be a lie the drawing has
 * to keep telling.
 */

export const PARTS = [
  {
    id: 'intake',
    name: 'INTAKE',
    part: 'front panel',
    detail: 'Where requests land on the box: the port row, link lights and the service display.',
    spec: ['QSFP28 · RJ45 mgmt', 'status · service ID'],
  },
  {
    id: 'cooling',
    name: 'COOLING',
    part: 'fan wall',
    detail: 'Front-to-back airflow across the whole chassis. Fan curve follows GPU inlet temperature, not CPU.',
    spec: ['5 × counter-rotating', 'front-to-back'],
  },
  {
    id: 'host',
    name: 'HOST',
    part: 'CPU and DIMM banks',
    detail: 'Tokenisation, batching and the request queues live here. It feeds the accelerators and otherwise stays out of the way.',
    spec: ['2 sockets', '16 DIMM · DDR5'],
  },
  {
    id: 'control',
    name: 'CONTROL PLANE',
    part: 'management board',
    detail: 'Placement and health. Decides which replica takes a request, with the KV cache it already holds in mind.',
    spec: ['llm-d scheduling', 'KV-cache-aware routing', 'GPU-aware placement'],
  },
  {
    id: 'engines',
    name: 'INFERENCE ENGINES',
    part: 'accelerator dies',
    detail: 'The serving runtime, on the silicon under the heatsinks. PagedAttention keeps KV memory from fragmenting; continuous batching keeps the dies fed.',
    spec: ['vLLM · SGLang · Triton', 'prefix cache · PagedAttention', 'continuous batching'],
  },
  {
    id: 'gpu',
    name: 'GPU POOL',
    part: 'sleds, heatsinks and NVLink',
    detail: 'Four modules on one baseboard, bridged so they address each other directly. Parallelism strategy follows the model shape.',
    spec: ['H100 · H200 · B200', 'NVLink bridged', 'tensor · pipeline · expert'],
  },
  {
    id: 'fabric',
    name: 'EDGE & FABRIC',
    part: 'network card',
    detail: 'The node\'s way onto the cluster fabric, and the first place hostile traffic is dropped.',
    spec: ['dual 400G', 'RDMA · rate limiting'],
  },
  {
    id: 'power',
    name: 'POWER',
    part: 'redundant supplies',
    detail: 'Two supplies, either able to carry the node. A GPU sled pulls more than the rest of the chassis combined.',
    spec: ['2 × 3000W', 'N+1 redundant'],
  },
  {
    id: 'uplink',
    name: 'FRONTIER UPLINK',
    part: 'egress cable',
    detail: 'The one path out of the rack. Requests the router sends to hosted providers leave down this cable and never touch the silicon here.',
    spec: ['out to hosted providers', 'via the gateway'],
  },
]

export const BASE_RPS = 1240
export const RPS_SPREAD = 260

/** Share of traffic that stays on this node rather than leaving by uplink. */
export const LOCAL_SHARE = 0.82
