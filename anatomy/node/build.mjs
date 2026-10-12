/**
 * THE SERVING NODE
 *
 * A GPU server with its lid and near wall off: front panel and port row,
 * a fan wall pulling front to back, the host with its DIMM banks, the
 * management board that places work, four bridged accelerator sleds under
 * finned heatsinks, and the supplies and network card at the back. One
 * cable leaves the chassis — the traffic that goes to hosted providers
 * and never touches this silicon.
 *
 *   node anatomy/node/build.mjs [--light]
 */
import { writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import * as k from '../../../../.claude/skills/anatomy/kit/iso-kit.mjs'
import { kitScript } from '../../../../.claude/skills/anatomy/scripts/inline-kit.mjs'
import { PARTS, BASE_RPS, RPS_SPREAD, LOCAL_SHARE } from './model.mjs'

const HERE = dirname(fileURLToPath(import.meta.url))
const theme = process.argv.includes('--light') ? 'light' : 'dark'

const WIDTH = 1060
const HEIGHT = 600

/* ── Chassis ── */
const CH = { x: -176, y: -64, w: 352, d: 128, r: 3 }
const PAN_Z = -7
const PAN_H = 7
const WALL_H = 34
const WALL_T = 3

/* ── Stations along the airflow ── */
const BEZEL_X = CH.x
const BEZEL_W = 14

const FAN_X = CH.x + 26
const FAN_R = 11.5
const FAN_YS = [-46, -23, 0, 23, 46]

const CPU_XS = [CH.x + 66, CH.x + 108]
const CPU = { w: 30, d: 48 }
const DIMM_XS = [CH.x + 52, CH.x + 94, CH.x + 136]

const BMC = { x: CH.x + 158, y: 30, w: 44, d: 26, r: 2 }

const SLED_XS = [12, 46, 80, 114]
const SLED = { w: 28, d: 100, r: 2 }
const SLED_Z = 2
const BASEBOARD = { x: 4, y: -54, w: 146, d: 108, r: 2 }

const NIC = { x: CH.x + CH.w - 26, y: -52, w: 18, d: 40, r: 1.5 }
const PSU_YS = [6, 36]
const PSU = { x: CH.x + CH.w - 30, w: 26, d: 26, r: 2 }

const P = k.fitProjection(
  [
    ...k.boxCorners(CH, PAN_Z - 4, WALL_H),
    [SLED_XS[3] + SLED.w, 0, SLED_Z + 30],
    [CH.x + CH.w + 54, -52, 10],
  ],
  WIDTH,
  HEIGHT,
  { pad: 52, azimuth: 44 },
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

/* ── Pan and walls ── */
function pan() {
  const out = [`<path class="iso-halo" d="${k.haloOf(CH, PAN_Z - 4, PAN_H, P)}"/>`]
  // rack rails under the pan
  for (const y of [CH.y + 6, CH.y + CH.d - 6]) {
    out.push(S(k.slabOf({ x: CH.x + 8, y: y - 3, w: CH.w - 16, d: 6, r: 1 }, PAN_Z - 4, 4, P, 2, 0.3), { tone: 'lo' }))
  }
  out.push(S(k.slabOf(CH, PAN_Z, PAN_H, P, 3, 0.8), { tone: 'lo' }))
  // vent slots in the floor, closed shapes that end on their own outline
  const vents = []
  for (let x = CH.x + 150; x < CH.x + CH.w - 40; x += 7) {
    vents.push(k.planOutline({ x, y: CH.y + 14, w: 3.4, d: CH.d - 28, r: 1.6 }, 0, P))
  }
  out.push(L(vents.join(''), { tone: 'faint' }))
  out.push(screws(CH, 10, 0))
  return part('power', '') + out.join('')
}

function wall(side) {
  const out = []
  if (side === 'back') {
    out.push(S(k.slabOf({ x: CH.x + CH.w - WALL_T, y: CH.y, w: WALL_T, d: CH.d, r: 1 }, 0, WALL_H, P, 2, 0.5), { tone: 'mid' }))
  }
  if (side === 'far') {
    out.push(S(k.slabOf({ x: CH.x, y: CH.y, w: CH.w, d: WALL_T, r: 1 }, 0, WALL_H, P, 2, 0.5), { tone: 'mid' }))
    // stiffening ribs, ending on the wall's own top and bottom edges
    const ribs = []
    for (let x = CH.x + 24; x < CH.x + CH.w - 24; x += 26) {
      ribs.push(k.segment([x, CH.y, 0], [x, CH.y, WALL_H], P))
    }
    out.push(L(ribs.join(''), { tone: 'faint' }))
  }
  return out.join('')
}

/* ── Front panel: where requests land ── */
function bezel() {
  const plan = { x: BEZEL_X, y: CH.y, w: BEZEL_W, d: CH.d, r: 2 }
  const BEZEL_H = 22
  const out = [S(k.slabOf(plan, 0, BEZEL_H, P, 2, 0.7), { tone: 'mid' })]

  // handles
  for (const y of [CH.y + 16, CH.y + CH.d - 16]) {
    out.push(S(k.slabOf({ x: BEZEL_X - 5, y: y - 5, w: 5, d: 10, r: 1.5 }, 8, 18, P, 2, 0.4), { tone: 'lo' }))
  }

  // port row on the face, as closed cages
  const cages = []
  for (let i = 0; i < 6; i++) {
    const y = CH.y + 34 + i * 10
    cages.push(k.planOutline({ x: BEZEL_X + 2, y, w: BEZEL_W - 4, d: 6, r: 0.8 }, BEZEL_H, P))
  }
  out.push(L(cages.join(''), { tone: 'lo' }))

  // link lights, and the service display as a recessed panel
  out.push(D(Array.from({ length: 6 }, (_, i) => at([BEZEL_X + BEZEL_W / 2, CH.y + 37 + i * 10, BEZEL_H])), { size: 0.5, tone: 'hi' }))
  const disp = { x: BEZEL_X + 3, y: CH.y + 8, w: BEZEL_W - 6, d: 16, r: 1 }
  out.push(S(k.slabOf(disp, BEZEL_H, 0.6, P, 1), { tone: 'lo', crease: 'none' }))
  // lines of text on the LCD, as thin inlays rather than rules: they carry
  // their own outline, so nothing hangs off the edge of the screen
  for (const [i, frac] of [0.82, 0.55, 0.7, 0.4].entries()) {
    out.push(S(k.slabOf(
      { x: disp.x + 2, y: disp.y + 3 + i * 3.2, w: (disp.w - 4) * frac, d: 1.4, r: 0.3 },
      BEZEL_H + 0.6, 0.3, P, 0,
    ), { tone: 'faint', crease: 'none' }))
  }
  out.push(screws(plan, 4, BEZEL_H, 0.4))
  return part('intake', out.join(''))
}

/* ── Fan wall ── */
function fans() {
  const out = []
  const bracket = { x: FAN_X - 14, y: CH.y + 6, w: 28, d: CH.d - 12, r: 2 }
  out.push(S(k.slabOf(bracket, 0, 3, P, 2, 0.4), { tone: 'lo' }))

  for (const y of byDepth(FAN_YS.map(v => [FAN_X, v]))) {
    const [fx, fy] = y
    out.push(S(k.cylinder(fx, fy, FAN_R, 3, 20, P, 28), { tone: 'mid' }))
    // blades, each from hub to rim so both ends land
    const blades = []
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2
      const b = a + 0.62
      blades.push(
        k.segment(
          [fx + Math.cos(a) * 2.6, fy + Math.sin(a) * 2.6, 23],
          [fx + Math.cos(b) * (FAN_R - 0.4), fy + Math.sin(b) * (FAN_R - 0.4), 23],
          P,
        ),
      )
    }
    out.push(L(blades.join(''), { tone: 'faint' }))
    out.push(S(k.cylinder(fx, fy, 2.6, 23, 1.6, P, 18), { tone: 'hi' }))
    out.push(D([at([fx, fy, 24.6])], { size: 0.5, tone: 'hi' }))
    out.push(L(k.sideArc(fx, fy, FAN_R, 12, P, 20), { tone: 'faint' }))
  }
  return part('cooling', out.join(''))
}

/* ── Heatsink: a block whose fins run the airflow ── */
function heatsink(plan, z, h, step, ink = 'mid', fin = 'faint') {
  const out = [S(k.slabOf(plan, z, h, P, 2, 0.5), { tone: ink })]
  const fins = []
  for (let y = plan.y + step; y < plan.y + plan.d - step / 2; y += step) {
    fins.push(k.segment([plan.x, y, z + h], [plan.x + plan.w, y, z + h], P))
  }
  out.push(L(fins.join(''), { tone: fin }))
  // the fin stack seen on the end face
  const ends = []
  for (let y = plan.y + step; y < plan.y + plan.d - step / 2; y += step) {
    ends.push(k.segment([plan.x + plan.w, y, z + h], [plan.x + plan.w, y, z], P))
  }
  out.push(L(ends.join(''), { tone: fin }))
  return out.join('')
}

/* ── Host: sockets and memory ── */
function host() {
  const out = []
  for (const x of CPU_XS) {
    const plan = { x: x - CPU.w / 2, y: -CPU.d / 2, w: CPU.w, d: CPU.d, r: 2 }
    // socket frame under the sink
    out.push(S(k.slabOf(k.insetPlan(plan, -3), 0, 3, P, 2, 0.4), { tone: 'lo' }))
    out.push(heatsink(plan, 3, 16, 3.4, 'mid', 'lo'))
    out.push(screws(k.insetPlan(plan, -3), 2, 3, 0.4))
  }
  // DIMM banks: thin boards standing in their slots
  for (const x of DIMM_XS) {
    for (const sy of [-1, 1]) {
      const slot = { x, y: sy > 0 ? 34 : -52, w: 4, d: 18, r: 0.6 }
      out.push(S(k.slabOf(slot, 0, 2.4, P, 1), { tone: 'lo' }))
      for (let i = 0; i < 4; i++) {
        out.push(S(k.slabOf({ x: x + 0.6, y: slot.y + 1 + i * 4.2, w: 2.4, d: 2.6, r: 0.4 }, 2.4, 13, P, 1, 0.2), { tone: 'mid' }))
      }
    }
  }
  return part('host', out.join(''))
}

/* ── Management board ── */
function control() {
  const out = [S(k.slabOf(BMC, 0, 2.2, P, 2, 0.3), { tone: 'lo' })]
  // its own small sink
  out.push(heatsink({ x: BMC.x + 6, y: BMC.y + 6, w: 14, d: 14, r: 1 }, 2.2, 7, 2.6, 'mid'))
  // a header row and a coin cell, both closed shapes
  const hdr = []
  for (let i = 0; i < 8; i++) {
    hdr.push(k.planOutline({ x: BMC.x + 24 + i * 2.2, y: BMC.y + 5, w: 1.2, d: 1.2, r: 0.3 }, 2.2, P))
  }
  out.push(L(hdr.join(''), { tone: 'faint' }))
  out.push(S(k.cylinder(BMC.x + 32, BMC.y + 18, 4, 2.2, 1.6, P, 20), { tone: 'mid' }))
  out.push(L(k.sideArc(BMC.x + 32, BMC.y + 18, 4, 2.9, P, 16), { tone: 'faint' }))
  out.push(screws(BMC, 3, 2.2, 0.4))
  return part('control', out.join(''))
}

/* ── Accelerator sleds ── */
function sleds() {
  const out = [S(k.slabOf(BASEBOARD, 0, 2.6, P, 2, 0.4), { tone: 'lo' })]
  out.push(screws(BASEBOARD, 5, 2.6, 0.45))

  const dies = []
  const LIFT = 30
  for (const [i, x] of SLED_XS.entries()) {
    const plan = { x, y: -SLED.d / 2, w: SLED.w, d: SLED.d, r: SLED.r }
    const exposed = i === 0

    // the module carrier
    out.push(S(k.slabOf(k.insetPlan(plan, -2), 2.6, 3, P, 2, 0.4), { tone: 'mid' }))

    // power stages down one flank, as closed cans
    const vrm = []
    for (let j = 0; j < 7; j++) {
      vrm.push(k.planOutline({ x: x + 2, y: -44 + j * 5, w: SLED.w - 4, d: 3, r: 0.6 }, 5.6, P))
    }
    out.push(L(vrm.join(''), { tone: 'faint' }))

    // the die sits on the carrier, under the sink
    const die = { x: x + 6, y: -16, w: SLED.w - 12, d: 32, r: 1 }
    const dieArt =
      S(k.slabOf(die, 5.6, 2.4, P, 1, 0.3), { tone: exposed ? 'lit' : 'hi' }) +
      (exposed
        ? L(k.planOutline(k.insetPlan(die, 3), 8, P), { tone: 'lo' }) +
          D([at([die.x + die.w / 2, 0, 8])], { size: 0.5, tone: 'lit' })
        : '')
    if (exposed) dies.push(dieArt)
    else out.push(dieArt)

    // its heatsink: lifted on the exposed module, with guides down to the seat
    const z = exposed ? 8 + LIFT : 8
    if (exposed) {
      const guides = []
      const seats = k.corners(k.insetPlan(plan, 2), 0)
      for (const [gx, gy] of seats) {
        guides.push(k.segment([gx, gy, 5.6], [gx, gy, z], P))
      }
      out.push(L(guides.join(''), { tone: 'faint' }))
      // dowels: the lift rides these, and they root the guide lines
      out.push(D(seats.map(([gx, gy]) => at([gx, gy, 5.6])), { size: 0.45, tone: 'lo' }))
    }
    out.push(heatsink(plan, z, 22, 3.2, 'hi', 'lo'))
  }

  // NVLink bridges spanning adjacent modules
  for (let i = 0; i < SLED_XS.length - 1; i++) {
    const x0 = SLED_XS[i] + SLED.w
    const x1 = SLED_XS[i + 1]
    for (const y of [-26, 26]) {
      out.push(S(k.slabOf({ x: x0 - 2, y: y - 4, w: x1 - x0 + 4, d: 8, r: 1 }, 30, 4, P, 1, 0.3), { tone: 'mid' }))
      out.push(D([at([x0 - 1, y, 34]), at([x1 + 1, y, 34])], { size: 0.45 }))
    }
  }

  return part('gpu', out.join('')) + part('engines', dies.join(''))
}

/* ── Back: network and power ── */
function back() {
  const out = []
  out.push(S(k.slabOf(NIC, 0, 26, P, 1.5, 0.4), { tone: 'mid' }))
  // two cages on the card's face
  const cages = []
  for (const dy of [8, 24]) {
    cages.push(k.planOutline({ x: NIC.x + 2, y: NIC.y + dy, w: NIC.w - 4, d: 9, r: 1 }, 26, P))
  }
  out.push(L(cages.join(''), { tone: 'lo' }))
  out.push(D([at([NIC.x + NIC.w / 2, NIC.y + 12, 26]), at([NIC.x + NIC.w / 2, NIC.y + 28, 26])], { size: 0.5, tone: 'hi' }))
  const nicPart = part('fabric', out.join(''))

  const psu = []
  for (const y of PSU_YS) {
    const plan = { x: PSU.x, y, w: PSU.w, d: PSU.d, r: PSU.r }
    psu.push(S(k.slabOf(plan, 0, 22, P, 2, 0.5), { tone: 'lo' }))
    // its own fan, and a handle
    psu.push(L(k.ring(plan.x + plan.w / 2, y + plan.d / 2, 7, 22, P, 20), { tone: 'faint' }))
    psu.push(L(k.ring(plan.x + plan.w / 2, y + plan.d / 2, 2.4, 22, P, 14), { tone: 'lo' }))
    psu.push(D([at([plan.x + plan.w / 2, y + plan.d / 2, 22])], { size: 0.45 }))
    psu.push(S(k.slabOf({ x: plan.x + 4, y: y + 2, w: plan.w - 8, d: 3, r: 0.8 }, 22, 2.4, P, 1, 0.2), { tone: 'mid' }))
  }
  return nicPart + part('power', psu.join(''))
}

/* ── The one cable that leaves ── */
function uplink() {
  const out = []
  const start = [NIC.x + NIC.w, NIC.y + 12, 16]
  const route = [
    start,
    [CH.x + CH.w + 22, NIC.y + 12, 16],
    [CH.x + CH.w + 22, NIC.y - 16, 16],
    [CH.x + CH.w + 46, NIC.y - 16, 16],
    [CH.x + CH.w + 46, NIC.y - 16, 4],
  ]
  const segs = []
  for (let i = 0; i < route.length - 1; i++) segs.push(k.segment(route[i], route[i + 1], P))
  out.push(L(segs.join(''), { tone: 'mid' }))
  for (const pt of route) out.push(D([at(pt)], { size: 0.5 }))
  // the connector shell it ends in
  out.push(S(k.slabOf({ x: CH.x + CH.w + 40, y: NIC.y - 22, w: 12, d: 12, r: 1 }, 0, 5, P, 1, 0.3), { tone: 'lo' }))
  return part('uplink', out.join(''))
}

/* ── The path a request takes through the box ── */
const SHARED = [
  [BEZEL_X - 26, CH.y + 44, 14],
  [BEZEL_X + BEZEL_W, CH.y + 44, 14],
  [FAN_X, CH.y + 44, 14],
  [FAN_X, 0, 14],
  [CPU_XS[0], 0, 21],
  [CPU_XS[1], 0, 21],
  [BMC.x + 14, 0, 12],
  [BMC.x + 14, BMC.y + 12, 12],
]

const LOCAL_PATH = [
  [BMC.x + 14, BMC.y + 12, 12],
  [BMC.x + 14, 0, 12],
  [SLED_XS[0] + SLED.w / 2, 0, 12],
  [SLED_XS[0] + SLED.w / 2, 0, 9],
  [SLED_XS[1] + SLED.w / 2, 0, 32],
  [SLED_XS[2] + SLED.w / 2, 0, 32],
  [SLED_XS[3] + SLED.w / 2, 0, 32],
]

const UPLINK_PATH = [
  [BMC.x + 14, BMC.y + 12, 12],
  [NIC.x + NIC.w / 2, BMC.y + 12, 12],
  [NIC.x + NIC.w / 2, NIC.y + 12, 16],
  [NIC.x + NIC.w, NIC.y + 12, 16],
  [CH.x + CH.w + 22, NIC.y + 12, 16],
  [CH.x + CH.w + 22, NIC.y - 16, 16],
  [CH.x + CH.w + 46, NIC.y - 16, 16],
  [CH.x + CH.w + 46, NIC.y - 16, 4],
]

const onScreen = pts => pts.map(pt => {
  const [sx, sy] = at(pt)
  return [Math.round(sx * 100) / 100, Math.round(sy * 100) / 100]
})

/* ── Assemble, back to front ── */
const art = [
  pan(),
  wall('back'),
  wall('far'),
  back(),
  uplink(),
  fans(),
  host(),
  control(),
  sleds(),
  bezel(),
].join('')

const svg = k.figureSvg({ width: WIDTH, height: HEIGHT, body: art })
const card = k.plateHtml({
  fig: 'Fig 1',
  title: 'The serving node',
  hint: 'hover a part',
  readout: `${BASE_RPS} req/s`,
  body: svg,
})

writeFileSync(
  join(HERE, theme === 'light' ? 'page-light.html' : 'page.html'),
  k.pageHtml({ title: 'The serving node', body: card, theme, width: WIDTH, script: kitScript() }),
)
console.log('wrote', theme === 'light' ? 'page-light.html' : 'page.html')

if (theme === 'dark') {
  const mod = [
    '/* Generated by anatomy/node/build.mjs — do not edit.',
    ' * Rebuild: node anatomy/node/build.mjs',
    ' */',
    '',
    'export const FIGURE_SVG = ' + JSON.stringify(svg) + ' as const',
    '',
    'export const FIGURE_VIEWBOX = { width: ' + WIDTH + ', height: ' + HEIGHT + ' } as const',
    '',
    'export const FIGURE_TITLE = ' + JSON.stringify('THE SERVING NODE') + ' as const',
    'export const FIGURE_FIG = ' + JSON.stringify('FIG 1') + ' as const',
    'export const FIGURE_READOUT = { base: ' + BASE_RPS + ', spread: ' + RPS_SPREAD + ", unit: 'req/s' } as const",
    '',
    'export const FIGURE_BLURB = ' + JSON.stringify(
      'The hardware the stack runs on: requests land on the front panel, cross the fan wall to the host, and the control plane places them on an accelerator. One cable leaves the chassis for the hosted providers.',
    ) + ' as const',
    '',
    'export type Station = { id: string; name: string; part: string; detail: string; spec: string[]; contains?: string[] }',
    '',
    'export const FIGURE_STATIONS: Station[] = ' + JSON.stringify(PARTS, null, 2),
    '',
    '/** Screen-space route a request takes through the node. */',
    'export const FIGURE_ROUTES = {',
    '  shared: ' + JSON.stringify(onScreen(SHARED)) + ',',
    '  branches: [',
    '    { share: ' + LOCAL_SHARE + ', points: ' + JSON.stringify(onScreen(LOCAL_PATH)) + ' },',
    '    { share: ' + (1 - LOCAL_SHARE).toFixed(2) + ', points: ' + JSON.stringify(onScreen(UPLINK_PATH)) + ' },',
    '  ],',
    '} as const',
    '',
  ].join('\n')
  writeFileSync(join(HERE, '..', '..', 'components', 'generated', 'nodeFigure.ts'), mod)
  console.log('wrote components/generated/nodeFigure.ts')
}
