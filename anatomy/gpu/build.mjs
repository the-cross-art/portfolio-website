/**
 * INSIDE THE ACCELERATOR
 *
 * A B200 package with one SM lifted out of the array on projection lines.
 * Below: the substrate, two dies joined by NV-HBI, 208 SM tiles drawn one
 * for one, an L2 strip down each die's inner edge, eight HBM stacks and the
 * NVLink edge. Above: the SM that tile stands for, opened far enough to
 * show four partitions, their register files, CUDA cores and tensor cores,
 * over the L1/shared block they all read through.
 *
 * The request does not simply arrive and leave. It lands, is placed on the
 * array, climbs into the SM, and then loops on the memory hierarchy — a
 * short hop to L1, or the long haul out to HBM. The haul is drawn at the
 * same speed and is simply longer, because that is the whole point.
 *
 *   node anatomy/gpu/build.mjs [--light]
 */
import { writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import * as k from '../../../../.claude/skills/anatomy/kit/iso-kit.mjs'
import { kitScript } from '../../../../.claude/skills/anatomy/scripts/inline-kit.mjs'
import { PARTS, BASE_BW, BW_SPREAD, BW_UNIT, FAR_SHARE } from './model.mjs'

const HERE = dirname(fileURLToPath(import.meta.url))
const theme = process.argv.includes('--light') ? 'light' : 'dark'

const WIDTH = 1060
const HEIGHT = 640

/* ── Package ── */
const PKG = { x: -212, y: -124, w: 424, d: 248, r: 5 }
const PKG_H = 7

/* ── The two dies ── */
const DIE_D = 116
const DIE_Y = -58
const DIE_Z = PKG_H
const DIE_H = 3
const DIE_A = { x: -134, y: DIE_Y, w: 126, d: DIE_D, r: 2 }
const DIE_B = { x: 8, y: DIE_Y, w: 126, d: DIE_D, r: 2 }
const DIES = [DIE_A, DIE_B]

/* NV-HBI, the strip the two dies talk across */
const HBI = { x: -8, y: DIE_Y + 8, w: 16, d: DIE_D - 16, r: 1 }

/* On each die: a command strip along the far edge, an L2 strip down the
   inner edge, and the SM array filling what is left. */
const CP_D = 9
const L2_W = 13
const GRID_COLS = 8
const GRID_ROWS = 13
const TILE_GAP = 1.4

/* ── HBM: two stacks per die per side ── */
const HBM_D = 30
const HBM_W = 46
const HBM_FAR = PKG.y + 14
const HBM_NEAR = PKG.y + PKG.d - 14 - HBM_D
const HBM_XS = [-124, -70, 18, 72]
const HBM_LAYERS = 8
const HBM_H = 15

/* ── NVLink, off the near-right edge ── */
const NVL = { x: PKG.x + PKG.w - 92, y: PKG.y + PKG.d - 7, w: 76, d: 7, r: 1 }

/* ── The SM lifted out of the array ── */
/* Centred over the package: any x or y offset costs as much screen height
   as it gains, so the lift only reads when the only displacement is z. */
const SM = { x: -78, y: -58, w: 156, d: 116, r: 3 }
const SM_Z = 128
const SM_H = 5
const SM_STEPS = 2
const SM_BEVEL = 0.5
const B_CP = 0.2
const B_L2 = 0.2
const B_NVL = 0.3
const B_L1 = 0.4
const B_SCHED = 0.2
const B_RF = 0.2
const B_TC = 0.3
const L1 = { ...k.insetPlan(SM, -5), r: 2 }
const L1_Z = SM_Z - 10
const L1_H = 7

/* which tile in the array it is, and so where the projection lines start */
const SRC_DIE = 1
const SRC_COL = 1
const SRC_ROW = 6

/* ── Partitions inside the SM ── */
const PART_W = 70
const PART_D = 52
const PART_XS = [SM.x + 6, SM.x + 80]
const PART_YS = [SM.y + 6, SM.y + 62]

const P = k.fitProjection(
  [
    ...k.boxCorners(PKG, 0, PKG_H),
    ...k.boxCorners(SM, L1_Z, SM_Z - L1_Z + SM_H),
    [PKG.x + PKG.w + 34, PKG.y + PKG.d - 30, 6],
  ],
  WIDTH,
  HEIGHT,
  { pad: 48, azimuth: 45 },
)

const at = p => k.iso(p, P)
const S = (paths, style) => k.solidSvg(paths, style)
const L = (d, style) => k.lineSvg(d, style)
const D = (pts, style) => k.dotsSvg(pts, style)
const byDepth = pts => [...pts].sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P))
const part = (id, body) => `<g class="st" data-station="${id}">${body}</g>`

/* Screws as a ringed dot, the way the kit does plate corners. */
function screws(plan, inset, z, size = 0.45) {
  const pts = k.corners(plan, inset)
  return (
    L(pts.map(([x, y]) => k.ring(x, y, 1.9, z, P, 14)).join(''), { tone: 'lo' }) +
    D(pts.map(([x, y]) => at([x, y, z])), { size })
  )
}

/* Rules struck across a slab's bevelled top face.
 *
 * slabOf's signature is (plan, z, height, projection, steps, bevel) — the
 * fifth argument is corner smoothness, not the chamfer. The chamfer draws
 * an inset ring, and that ring is what a rule has to land on. Every ruled
 * texture goes through here, taking the same named bevel its slab took, so
 * the two cannot drift apart.
 *
 * axis 'x' cuts the width (lines run along the depth), 'y' cuts the depth.
 */
function rules(plan, bevel, z, n, axis, style) {
  const f = k.insetPlan(plan, bevel)
  const out = []
  for (let i = 1; i < n; i++) {
    const t = i / n
    out.push(
      axis === 'x'
        ? k.segment([f.x + f.w * t, f.y, z], [f.x + f.w * t, f.y + f.d, z], P)
        : k.segment([f.x, f.y + f.d * t, z], [f.x + f.w, f.y + f.d * t, z], P),
    )
  }
  return L(out.join(''), style)
}

/* ── Geometry of the SM array, shared by the drawing and the routes ── */
function gridOf(die) {
  const x0 = die === DIE_A ? die.x + 4 : die.x + L2_W + 6
  const x1 = die === DIE_A ? die.x + die.w - L2_W - 6 : die.x + die.w - 4
  const y0 = die.y + CP_D + 4
  const y1 = die.y + die.d - 4
  const cw = (x1 - x0) / GRID_COLS
  const ch = (y1 - y0) / GRID_ROWS
  return { x0, y0, cw, ch, w: cw - TILE_GAP, d: ch - TILE_GAP }
}
const tileOf = (die, col, row) => {
  const g = gridOf(die)
  return { x: g.x0 + col * g.cw, y: g.y0 + row * g.ch, w: g.w, d: g.d, r: 0.6 }
}
const SRC = tileOf(DIES[SRC_DIE], SRC_COL, SRC_ROW)
const l2Of = die => ({
  x: die === DIE_A ? die.x + die.w - L2_W - 2 : die.x + 2,
  y: die.y + CP_D + 4,
  w: L2_W,
  d: die.d - CP_D - 8,
  r: 1,
})

/* ── Substrate ── */
function substrate() {
  const out = [S(k.slabOf(PKG, 0, PKG_H, P, 3, 0.7), { tone: 'lo' })]
  // the ledge the dies and stacks sit on
  out.push(L(k.planOutline(k.insetPlan(PKG, 10), PKG_H, P), { tone: 'faint' }))
  out.push(screws(PKG, 6, PKG_H, 0.5))
  // decoupling capacitors, in the gaps the silicon leaves
  const caps = []
  for (const x of [-186, -176, -166, 156, 166, 176]) {
    for (const y of [-40, -24, -8, 8, 24, 40]) {
      caps.push([x, y])
    }
  }
  for (const [x, y] of byDepth(caps)) {
    out.push(S(k.slabOf({ x, y, w: 6, d: 10, r: 0.5 }, PKG_H, 2.4, P, 0.4, 0.2), { tone: 'mid' }))
  }
  // a label plate, with the three rules the kit's plates carry
  const lp = { x: PKG.x + 16, y: PKG.y + PKG.d - 30, w: 54, d: 18, r: 1 }
  out.push(S(k.slabOf(lp, PKG_H, 0.6, P, 0.3), { tone: 'faint', crease: 'none' }))
  for (const [i, frac] of [0.74, 0.5, 0.62].entries()) {
    out.push(S(k.slabOf(
      { x: lp.x + 3, y: lp.y + 4 + i * 4, w: (lp.w - 6) * frac, d: 1.6, r: 0.3 },
      PKG_H + 0.6, 0.3, P, 0,
    ), { tone: 'lo', crease: 'none' }))
  }
  return out.join('')
}

/* ── One HBM stack: a logic die with DRAM layers above it ── */
function hbmStack(plan) {
  const out = [S(k.slabOf(plan, DIE_Z, HBM_H, P, 1, 0.4), { tone: 'mid' })]
  // each layer as a closed outline, so the stack reads without loose lines
  for (let i = 1; i < HBM_LAYERS; i++) {
    out.push(L(k.planOutline(plan, DIE_Z + (HBM_H / HBM_LAYERS) * i, P), { tone: 'faint' }))
  }
  // the interposer traces running at the die
  const ties = []
  const toward = plan.y < 0 ? plan.y + plan.d : plan.y
  const away = plan.y < 0 ? plan.y + plan.d + 7 : plan.y - 7
  for (let i = 1; i < 6; i++) {
    const x = plan.x + (plan.w / 6) * i
    ties.push(k.segment([x, toward, DIE_Z], [x, away, DIE_Z], P))
  }
  out.push(L(ties.join(''), { tone: 'lo' }))
  // bump pads at both ends: the trace starts on the stack's base outline,
  // which the bevel moves off the plan edge, so it is rooted rather than guessed
  const pads = []
  for (let i = 1; i < 6; i++) {
    const x = plan.x + (plan.w / 6) * i
    pads.push(at([x, toward, DIE_Z]))
    pads.push(at([x, away, DIE_Z]))
  }
  out.push(D(pads, { size: 0.4, tone: 'lo' }))
  return out.join('')
}

function hbm(side) {
  const y = side === 'far' ? HBM_FAR : HBM_NEAR
  return HBM_XS.map(x => hbmStack({ x, y, w: HBM_W, d: HBM_D, r: 1 })).join('')
}

/* ── A die: command strip, L2, and every SM it has ── */
function die(d) {
  const out = [S(k.slabOf(d, DIE_Z, DIE_H, P, 1, 0.5), { tone: 'lo' })]
  const top = DIE_Z + DIE_H

  // command processor along the far edge
  const cp = { x: d.x + 4, y: d.y + 2, w: d.w - 8, d: CP_D - 3, r: 1 }
  const cmd = S(k.slabOf(cp, top, 1.6, P, 2, B_CP), { tone: 'mid' })
  const slots = rules(cp, B_CP, top + 1.6, 14, 'x', { tone: 'faint' })

  // L2 down the inner edge, cut into banks
  const l2 = l2Of(d)
  const l2art = [S(k.slabOf(l2, top, 2.2, P, 2, B_L2), { tone: 'hi' })]
  l2art.push(rules(l2, B_L2, top + 2.2, 12, 'y', { tone: 'lo' }))

  // the array: all 104, the source tile left out so it can be drawn lit
  const tiles = []
  const cells = []
  for (let col = 0; col < GRID_COLS; col++) {
    for (let row = 0; row < GRID_ROWS; row++) cells.push([col, row])
  }
  for (const [col, row] of cells) {
    const t = tileOf(d, col, row)
    const isSrc = d === DIES[SRC_DIE] && col === SRC_COL && row === SRC_ROW
    tiles.push(
      S(k.slabOf(t, top, 1.1, P, 2, 0), { tone: isSrc ? 'lit' : 'mid', crease: 'none' }) +
        (isSrc ? L(k.planOutline(k.insetPlan(t, -1.6), top + 1.1, P), { tone: 'lit' }) : ''),
    )
  }

  return {
    base: out.join(''),
    cmd: cmd + slots,
    l2: l2art.join(''),
    tiles: tiles.join(''),
  }
}

/* ── NV-HBI, the bridge between the dies ── */
function hbi() {
  const out = [S(k.slabOf(HBI, DIE_Z, DIE_H + 1.4, P, 0.5, 0.3), { tone: 'hi' })]
  const bumps = []
  for (let i = 0; i < 22; i++) {
    const y = HBI.y + 2 + (HBI.d - 4) * (i / 21)
    bumps.push(at([HBI.x + HBI.w / 2 - 3, y, DIE_Z + DIE_H + 1.4]))
    bumps.push(at([HBI.x + HBI.w / 2 + 3, y, DIE_Z + DIE_H + 1.4]))
  }
  out.push(D(bumps, { size: 0.4, tone: 'lo' }))
  return part('hbi', out.join(''))
}

/* ── NVLink: the way off the package ── */
function nvlink() {
  const out = [S(k.slabOf(NVL, PKG_H, 5, P, 2, B_NVL), { tone: 'mid' })]
  out.push(rules(NVL, B_NVL, PKG_H + 5, 18, 'x', { tone: 'faint' }))
  // the pair of lanes leaving the package edge
  const lanes = []
  for (const dx of [18, 58]) {
    lanes.push(k.segment([NVL.x + dx, NVL.y + NVL.d, PKG_H + 2], [NVL.x + dx, PKG.y + PKG.d + 24, PKG_H + 2], P))
  }
  out.push(L(lanes.join(''), { tone: 'mid' }))
  out.push(D([18, 58].flatMap(dx => [
    at([NVL.x + dx, NVL.y + NVL.d, PKG_H + 2]),
    at([NVL.x + dx, PKG.y + PKG.d + 24, PKG_H + 2]),
  ]), { size: 0.5 }))
  return part('nvlink', out.join(''))
}

/* ── The lifted SM ── */
function liftedSm() {
  const out = []
  const floor = SM_Z
  const top = SM_Z + SM_H

  // L1 / shared sits under the whole SM, which is what it serves
  const l1 = [S(k.slabOf(L1, L1_Z, L1_H, P, 3, B_L1), { tone: 'mid' })]
  l1.push(rules(L1, B_L1, L1_Z + L1_H, 10, 'x', { tone: 'faint' }))
  l1.push(screws(L1, 4, L1_Z + L1_H, 0.4))

  // the SM floor the partitions stand on
  out.push(S(k.slabOf(SM, floor, SM_H, P, SM_STEPS, SM_BEVEL), { tone: 'lo' }))

  const regs = []
  const tensors = []
  for (const [pi, px] of PART_XS.entries()) {
    for (const [pj, py] of PART_YS.entries()) {
      const first = pi === 0 && pj === 0
      // warp scheduler and its dispatch ports
      const sched = { x: px, y: py, w: PART_W, d: 7, r: 0.8 }
      out.push(S(k.slabOf(sched, top, 1.8, P, 2, B_SCHED), { tone: 'hi' }))
      out.push(rules(sched, B_SCHED, top + 1.8, 9, 'x', { tone: 'faint' }))

      // register file, cut into banks
      const rf = { x: px, y: py + 9, w: PART_W, d: 11, r: 0.8 }
      const rfart = [S(k.slabOf(rf, top, 2.2, P, 2, B_RF), { tone: 'mid' })]
      rfart.push(rules(rf, B_RF, top + 2.2, 10, 'x', { tone: 'faint' }))
      regs.push(rfart.join(''))

      // 32 CUDA cores, as the cells they are
      const cores = []
      for (let c = 0; c < 8; c++) {
        for (let r = 0; r < 4; r++) {
          cores.push(at([px + 3 + c * 4.6, py + 24 + r * 4.2, top + 1]))
        }
      }
      out.push(S(k.slabOf({ x: px, y: py + 22, w: 38, d: 18, r: 0.8 }, top, 1, P, 0.3, 0.2), { tone: 'lo' }))
      out.push(D(cores, { size: 0.5, tone: 'mid' }))

      // the tensor core: the one thing in here doing the multiply
      const tc = { x: px + 42, y: py + 22, w: PART_W - 42, d: 18, r: 1 }
      const tcart = [S(k.slabOf(tc, top, 3.4, P, 2, B_TC), { tone: first ? 'lit' : 'hi' })]
      const mtone = { tone: first ? 'lo' : 'faint' }
      tcart.push(rules(tc, B_TC, top + 3.4, 5, 'y', mtone))
      tcart.push(rules(tc, B_TC, top + 3.4, 6, 'x', mtone))
      tensors.push(tcart.join(''))

      // load/store and special function units along the bottom
      out.push(S(k.slabOf({ x: px, y: py + 42, w: PART_W - 24, d: 6, r: 0.8 }, top, 1.4, P, 0.3, 0.2), { tone: 'lo' }))
      out.push(S(k.slabOf({ x: px + PART_W - 21, y: py + 42, w: 21, d: 6, r: 0.8 }, top, 1.4, P, 0.3, 0.2), { tone: 'faint' }))
    }
  }

  return {
    l1: part('l1', l1.join('')),
    body: part('sm', out.join('')),
    regs: part('regfile', regs.join('')),
    tensors: part('tensor', tensors.join('')),
  }
}

/* ── Projection lines: the tile below and the SM above are the same thing ── */
function projection() {
  const src = k.corners(SRC, SRC.r)
  const dst = k.corners(k.insetPlan(SM, SM_BEVEL), SM.r)
  const lines = []
  for (let i = 0; i < 4; i++) {
    lines.push(k.segment([src[i][0], src[i][1], DIE_Z + DIE_H + 1.1], [dst[i][0], dst[i][1], SM_Z], P))
  }
  // dotted at both ends: the SM's corner radius means the exact corner point
  // is not on its outline, so the line is rooted rather than left to chance
  return (
    L(lines.join(''), { tone: 'faint' }) +
    D(src.map(([x, y]) => at([x, y, DIE_Z + DIE_H + 1.1])), { size: 0.55, tone: 'lo' }) +
    D(dst.map(([x, y]) => at([x, y, SM_Z])), { size: 0.7, tone: 'lo' })
  )
}

/* ── Where a request goes ── */
const TC0 = [PART_XS[0] + 56, PART_YS[0] + 31, SM_Z + SM_H + 3.4]
const SHARED = [
  [PKG.x + PKG.w + 30, PKG.y + PKG.d - 34, 4],
  [PKG.x + PKG.w, PKG.y + PKG.d - 34, PKG_H],
  [DIE_B.x + DIE_B.w / 2, DIE_B.y + 4, DIE_Z + DIE_H + 1.6],
  [SRC.x + SRC.w / 2, SRC.y + SRC.d / 2, DIE_Z + DIE_H + 1.1],
  [SM.x + SM.w / 2, SM.y + SM.d / 2, SM_Z],
  [PART_XS[0] + PART_W / 2, PART_YS[0] + 3, SM_Z + SM_H + 1.8],
  TC0,
]

/* the short hop: staged in L1 and read again */
const FAST = [
  TC0,
  [PART_XS[0] + 20, PART_YS[0] + 14, SM_Z + SM_H + 2.2],
  [L1.x + 24, L1.y + L1.d / 2, L1_Z + L1_H],
  [PART_XS[0] + 20, PART_YS[0] + 14, SM_Z + SM_H + 2.2],
  TC0,
]

/* the long haul: out of the SM, down to L2, across to HBM and back */
const L2B = l2Of(DIE_B)
const SLOW = [
  TC0,
  [PART_XS[0] + 20, PART_YS[0] + 14, SM_Z + SM_H + 2.2],
  [L1.x + 24, L1.y + L1.d / 2, L1_Z + L1_H],
  [SRC.x + SRC.w / 2, SRC.y + SRC.d / 2, DIE_Z + DIE_H + 1.1],
  [L2B.x + L2B.w / 2, L2B.y + L2B.d / 2, DIE_Z + DIE_H + 2.2],
  [L2B.x + L2B.w / 2, HBM_FAR + HBM_D, DIE_Z + 2],
  [HBM_XS[2] + HBM_W / 2, HBM_FAR + HBM_D / 2, DIE_Z + HBM_H],
  [L2B.x + L2B.w / 2, HBM_FAR + HBM_D, DIE_Z + 2],
  [L2B.x + L2B.w / 2, L2B.y + L2B.d / 2, DIE_Z + DIE_H + 2.2],
  [L1.x + 24, L1.y + L1.d / 2, L1_Z + L1_H],
  TC0,
]

const onScreen = pts => pts.map(pt => {
  const [sx, sy] = at(pt)
  return [Math.round(sx * 100) / 100, Math.round(sy * 100) / 100]
})

/* ── Assemble, back to front ── */
const A = die(DIE_A)
const B = die(DIE_B)
const sm = liftedSm()

const art = [
  substrate(),
  part('hbm', hbm('far')),
  A.base,
  B.base,
  part('launch', A.cmd + B.cmd),
  part('l2', A.l2 + B.l2),
  part('sms', A.tiles + B.tiles),
  hbi(),
  part('hbm', hbm('near')),
  nvlink(),
  projection(),
  sm.l1,
  sm.body,
  sm.regs,
  sm.tensors,
].join('')

const svg = k.figureSvg({ width: WIDTH, height: HEIGHT, body: art })
const card = k.plateHtml({
  fig: 'Fig 2',
  title: 'Inside the accelerator',
  hint: 'hover a part',
  readout: `${BASE_BW} ${BW_UNIT}`,
  body: svg,
})

writeFileSync(
  join(HERE, theme === 'light' ? 'page-light.html' : 'page.html'),
  k.pageHtml({ title: 'Inside the accelerator', body: card, theme, width: WIDTH, script: kitScript() }),
)
console.log('wrote', theme === 'light' ? 'page-light.html' : 'page.html')

if (theme === 'dark') {
  const mod = [
    '/* Generated by anatomy/gpu/build.mjs — do not edit.',
    ' * Rebuild: node anatomy/gpu/build.mjs',
    ' */',
    '',
    'export const FIGURE_SVG = ' + JSON.stringify(svg) + ' as const',
    '',
    'export const FIGURE_VIEWBOX = { width: ' + WIDTH + ', height: ' + HEIGHT + ' } as const',
    '',
    'export const FIGURE_TITLE = ' + JSON.stringify('INSIDE THE ACCELERATOR') + ' as const',
    'export const FIGURE_FIG = ' + JSON.stringify('FIG 2') + ' as const',
    'export const FIGURE_BLURB = ' + JSON.stringify(
      'One SM lifted out of the array it belongs to. A kernel lands on the command processor, is placed on a tile, and the work loops on memory: a short hop to L1, or the long haul to HBM. Decode spends almost all of its time on the long one.',
    ) + ' as const',
    '',
    'export const FIGURE_READOUT = { base: ' + BASE_BW + ', spread: ' + BW_SPREAD + ', unit: ' + JSON.stringify(BW_UNIT) + ' } as const',
    '',
    'export type Station = { id: string; name: string; part: string; detail: string; spec: string[]; contains?: string[] }',
    '',
    'export const FIGURE_STATIONS: Station[] = ' + JSON.stringify(PARTS, null, 2),
    '',
    '/** Screen-space routes. The slow one is longer on purpose. */',
    'export const FIGURE_ROUTES = {',
    '  shared: ' + JSON.stringify(onScreen(SHARED)) + ',',
    '  branches: [',
    '    { share: ' + FAR_SHARE + ', points: ' + JSON.stringify(onScreen(SLOW)) + ' },',
    '    { share: ' + (1 - FAR_SHARE).toFixed(2) + ', points: ' + JSON.stringify(onScreen(FAST)) + ' },',
    '  ],',
    '} as const',
    '',
  ].join('\n')
  writeFileSync(join(HERE, '..', '..', 'components', 'generated', 'gpuFigure.ts'), mod)
  console.log('wrote components/generated/gpuFigure.ts')
}
