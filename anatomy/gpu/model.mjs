/**
 * Inside the accelerator.
 *
 * The serving node figure stopped at the sled. This one opens it: the
 * package, its two dies, the SM array, and one SM lifted out on projection
 * lines so its insides are readable at a size the array never allows.
 *
 * The numbers are B200 (Blackwell), because that is the part the work is
 * actually on. The latencies are the usual order-of-magnitude figures —
 * they are what the drawing is really about, since the whole point of the
 * figure is that decode spends its life waiting on the long one.
 */

export const PARTS = [
  {
    id: 'launch',
    name: 'COMMAND PROCESSOR',
    part: 'host interface',
    detail:
      'Where a kernel launch arrives. It breaks the grid into thread blocks and hands them to whichever SMs have room — the GPU schedules itself, the host only asks.',
    spec: ['kernel launch', 'thread blocks → SMs'],
  },
  {
    id: 'sms',
    name: 'SM ARRAY',
    part: '208 streaming multiprocessors',
    detail:
      'Every tile is one SM, and all 208 are drawn. A decode step spreads one matrix multiply across the whole array; a batch of one leaves most of it idle, which is the real argument for batching.',
    spec: ['208 SMs · 2 dies', '104 per die'],
  },
  {
    id: 'sm',
    name: 'STREAMING MULTIPROCESSOR',
    part: 'one SM, opened',
    detail:
      'Four partitions, each with its own warp scheduler. Warps are switched on every stall, which is how the GPU hides the memory latency it cannot avoid.',
    spec: ['4 partitions', '128 CUDA cores', '4 tensor cores'],
    // the SM is the assembly these belong to, so it lights with them
    contains: ['regfile', 'tensor', 'l1'],
  },
  {
    id: 'tensor',
    name: 'TENSOR CORES',
    part: '5th generation',
    detail:
      'The matrix multiply itself. One instruction takes a tile of A, a tile of B and accumulates into C. At FP4 they are so fast that nothing but memory decides your token rate.',
    spec: ['MMA · FP4 / FP8', '20 PFLOPS FP4'],
  },
  {
    id: 'regfile',
    name: 'REGISTER FILE',
    part: 'per-partition',
    detail:
      'The only storage the cores reach at full speed. Registers per thread set how many warps fit on an SM at once, so occupancy is decided here, at compile time.',
    spec: ['256 KB per SM', '~1 cycle'],
  },
  {
    id: 'l1',
    name: 'L1 / SHARED',
    part: 'on the SM',
    detail:
      'One block of memory split between cache and the scratchpad a kernel manages itself. Tiles of the weight matrix are staged here so the cores read them many times for one trip out.',
    spec: ['256 KB per SM', '~30 cycles'],
  },
  {
    id: 'l2',
    name: 'L2 CACHE',
    part: 'shared across the die',
    detail:
      'The last stop before the long haul. Hot KV-cache pages live here between steps; weights are far too large and never do.',
    spec: ['shared by all SMs', '~200 cycles'],
  },
  {
    id: 'hbm',
    name: 'HBM3e',
    part: '8 stacks',
    detail:
      'Where the weights live. Decode reads the entire model once per token, so the step takes as long as the read does — this is why decode is bandwidth-bound and prefill is not.',
    spec: ['192 GB · 8 TB/s', '~500 cycles'],
  },
  {
    id: 'hbi',
    name: 'NV-HBI',
    part: 'die-to-die',
    detail:
      'The link that lets two reticle-limited dies behave as one GPU. Fast enough that software never has to know there are two.',
    spec: ['10 TB/s', '2 dies as one'],
  },
  {
    id: 'nvlink',
    name: 'NVLINK 5',
    part: 'off-package',
    detail:
      'The way out to the other GPUs. Tensor and expert parallelism both live on this link, so it sets how far a model can be split before the split costs more than it buys.',
    spec: ['1.8 TB/s per GPU', 'tensor · expert parallel'],
  },
]

/** Live readout: bandwidth, pinned near the ceiling the way decode pins it. */
export const BASE_BW = 7400
export const BW_SPREAD = 900
export const BW_UNIT = 'GB/s'

/** How often a fetch misses all the way out to HBM rather than hitting L1. */
export const FAR_SHARE = 0.78
