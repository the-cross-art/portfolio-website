/**
 * THE REQUEST SORTER
 *
 * A sorting machine whose working is the serving topology: requests drop
 * into an intake hopper, fall through a filter grate, pass a manifold whose
 * gauges read spend and retries, and reach a diverter flap. The flap throws
 * — either out along the pipe to the hosted providers, or down into the rack
 * where an indexing carriage places the job over a bank of engine drums, a
 * screw press applies the adapters, and the whole thing stands on a finned
 * plinth of GPUs.
 *
 *   node anatomy/stack/build.mjs            dark
 *   node anatomy/stack/build.mjs --light    light
 */
import { writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import * as k from '../../../../.claude/skills/anatomy/kit/iso-kit.mjs'
import { kitScript } from '../../../../.claude/skills/anatomy/scripts/inline-kit.mjs'
import { STATIONS, BASE_RPS, RPS_SPREAD, SELF_HOSTED_SHARE } from './model.mjs'

const HERE = dirname(fileURLToPath(import.meta.url))
const theme = process.argv.includes('--light') ? 'light' : 'dark'

const WIDTH = 1040
const HEIGHT = 580

/* ── Plan ── */
const FOOT_H = 6
const PLINTH = { x: -150, y: -52, w: 300, d: 104, r: 7 }
const PLINTH_Z = -18
const PLINTH_H = 18

const POST_INSET = 7
const POST_R = 3.4
const DECK_Z = 34
const DECK_H = 7

const RACK = { x: 16, y: -34, w: 116, d: 68, r: 4 }
const RACK_Z = 0
const RACK_TOP = 30

const DRUM_Y = -6
const DRUM_R = 15
const DRUM_Z = 18
const DRUM_XS = [42, 74, 106]

const PRESS = { x: 20, y: 14, w: 46, d: 30, r: 3 }
const PRESS_Z = 0

const RAIL_Z = 40
const RAIL_FROM = 22
const RAIL_TO = 126
const CARRIAGE_X = 66

const HOPPER = [-116, 4]
const HOPPER_TOP = 92
const GRATE_Z = 0

const MANI = { x: -78, y: -22, w: 46, d: 44, r: 3 }
const MANI_Z = 0
const MANI_H = 20

const DIV = [-16, 0]
const DIV_Z = 54
const OFFSITE = { x: -150, y: 66, w: 58, d: 40, r: 4 }
const OFFSITE_Z = 0
const OFFSITE_H = 34

const P = k.fitProjection(
  [
    ...k.boxCorners(PLINTH, PLINTH_Z - FOOT_H, 0),
    ...k.boxCorners(OFFSITE, 0, OFFSITE_H),
    [HOPPER[0], HOPPER[1], HOPPER_TOP],
    [DIV[0] + 20, 0, DIV_Z + 30],
  ],
  WIDTH,
  HEIGHT,
  { pad: 34, azimuth: 44 },
)

const at = p => k.iso(p, P)
const S = (paths, style) => k.solidSvg(paths, style)
const L = (d, style) => k.lineSvg(d, style)
const D = (pts, style) => k.dotsSvg(pts, style)
const byDepth = pts => [...pts].sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P))
const station = (id, body) => `<g class="st" data-station="${id}">${body}</g>`

/* ── Plinth: the GPU pools everything stands on ── */
function plinth() {
  const out = [`<path class="iso-halo" d="${k.haloOf(PLINTH, PLINTH_Z - FOOT_H, PLINTH_H, P)}"/>`]

  for (const [x, y] of byDepth(k.corners(PLINTH, 16))) {
    out.push(S(k.cylinder(x, y, 7.5, PLINTH_Z - FOOT_H, 1.8, P, 28), { tone: 'lo' }))
    out.push(S(k.cylinder(x, y, 5.8, PLINTH_Z - FOOT_H + 1.8, FOOT_H - 1.8, P, 28), { tone: 'mid' }))
  }

  out.push(S(k.slabOf(PLINTH, PLINTH_Z, PLINTH_H, P, 6, 1.4), { tone: 'lo' }))

  // heat fins down the long flanks. The top end lands on the plinth
  // outline; the underside has no stroke, so the bottom ramps out.
  const fins = []
  for (let x = PLINTH.x + 20; x <= PLINTH.x + PLINTH.w - 20; x += 5) {
    for (const y of [PLINTH.y, PLINTH.y + PLINTH.d]) {
      fins.push(
        k.fadeLineSvg([at([x, y, 0]), at([x, y, PLINTH_Z + 2])], { fade: [0, 1], tone: 'faint' }),
      )
    }
  }
  out.push(fins.join(''))

  // top groove and corner screws
  out.push(L(k.planOutline(k.insetPlan(PLINTH, 5), 0, P), { tone: 'faint' }))
  const screws = k.corners(PLINTH, 9)
  out.push(L(screws.map(([x, y]) => k.ring(x, y, 2.3, 0, P, 16)).join(''), { tone: 'lo' }))
  out.push(D(screws.map(([x, y]) => at([x, y, 0])), { size: 0.5 }))

  // ruler strip along the front edge
  const strip = { x: PLINTH.x + 14, y: PLINTH.y + PLINTH.d - 11, w: PLINTH.w - 28, d: 7, r: 1 }
  out.push(S(k.slabOf(strip, 0, 0.6, P, 3), { tone: 'lo', crease: 'none' }))
  const t = k.topTicks(strip.x + 4, strip.x + strip.w - 4, 5, 5, strip.y, 0.6, [strip.d, strip.d], P)
  out.push(L(t.minor, { tone: 'lo' }), L(t.major, { tone: 'mid' }))
  out.push(D([at([strip.x + 2, strip.y + 3.5, 0.6]), at([strip.x + strip.w - 2, strip.y + 3.5, 0.6])], { size: 0.45 }))

  return station('gpu', out.join(''))
}

/* ── Cabinet frame: the private network boundary ── */
function posts(front) {
  const out = []
  const sorted = byDepth(k.corners(RACK, -4))
  const take = front ? sorted.slice(2) : sorted.slice(0, 2)
  for (const [x, y] of take) {
    out.push(S(k.cylinder(x, y, POST_R, 0, RACK_TOP + 10, P, 24), { tone: 'mid', crease: 'none' }))
    out.push(L([12, 26].map(z => k.sideArc(x, y, POST_R, z, P, 16)).join(''), { tone: 'faint' }))
    out.push(S(k.cylinder(x, y, POST_R + 1.4, 0, 3, P, 24), { tone: 'lo' }))
  }
  return out.join('')
}

/* ── Sub-rack: the Kubernetes cluster inside the network ── */
function rackFrame(front) {
  const out = []
  const cs = byDepth(k.corners(RACK, 3))
  const take = front ? cs.slice(2) : cs.slice(0, 2)
  for (const [x, y] of take) {
    out.push(S(k.cylinder(x, y, 2.1, RACK_Z, RACK_TOP - RACK_Z, P, 20), { tone: 'mid', crease: 'none' }))
  }
  if (!front) {
    out.push(S(k.slabOf(RACK, RACK_Z, 3, P, 4, 0.5), { tone: 'lo' }))
    // rack unit rules on the back rail
    const rules = []
    for (let z = RACK_Z + 8; z < RACK_TOP + 8; z += 9) {
      rules.push(k.segment([RACK.x - 4, RACK.y - 4, z], [RACK.x + RACK.w + 4, RACK.y - 4, z], P))
    }
    out.push(L(rules.join(''), { tone: 'faint' }))
  }
  return out.join('')
}

/* ── Screw press: the optimisation stage ── */
function press() {
  const out = []
  out.push(S(k.slabOf(PRESS, PRESS_Z, 9, P, 3, 0.7), { tone: 'mid' }))
  out.push(L(k.planOutline(k.insetPlan(PRESS, 3.5), PRESS_Z + 9, P), { tone: 'faint' }))
  out.push(D(k.corners(PRESS, 5).map(([x, y]) => at([x, y, PRESS_Z + 9])), { size: 0.45 }))

  // two columns and a crosshead
  for (const sx of [-1, 1]) {
    const x = sx * (PRESS.w / 2 - 5)
    out.push(S(k.cylinder(x, 0, 2.2, PRESS_Z + 9, 13, P, 18), { tone: 'mid', crease: 'none' }))
  }
  const head = { x: PRESS.x + 3, y: PRESS.y + 6, w: PRESS.w - 6, d: PRESS.d - 12, r: 2 }
  out.push(S(k.slabOf(head, PRESS_Z + 22, 5, P, 2, 0.5), { tone: 'mid' }))

  // the screw itself, knurled
  out.push(S(k.cylinder(0, 0, 3.6, PRESS_Z + 27, 6, P, 22), { tone: 'hi' }))
  out.push(L(k.knurl(0, 0, 3.6, PRESS_Z + 27, PRESS_Z + 33, 26, P), { tone: 'lo' }))
  out.push(D([at([0, 0, PRESS_Z + 33])], { size: 0.5, tone: 'hi' }))
  return station('optimisation', out.join(''))
}

/* ── Drum bank: the inference engines ── */
function drums() {
  const out = []
  for (const x of DRUM_XS) {
    // axle through the drum, ends on the rack posts
    out.push(S(k.cylinder(x, DRUM_Y, DRUM_R, DRUM_Z - 11, 22, P, 36), { tone: 'mid' }))
    // vanes as side rings: the drum's own surface, not noise
    out.push(L([DRUM_Z - 5, DRUM_Z + 5].map(z => k.sideArc(x, DRUM_Y, DRUM_R, z, P, 22)).join(''), { tone: 'faint' }))
    out.push(L(k.knurl(x, DRUM_Y, DRUM_R, DRUM_Z - 11, DRUM_Z + 11, 30, P), { tone: 'lo' }))
    // end cap and hub
    out.push(S(k.cylinder(x, DRUM_Y, 4.2, DRUM_Z + 11, 2.4, P, 20), { tone: 'hi' }))
    out.push(D([at([x, DRUM_Y, DRUM_Z + 13.4])], { size: 0.5, tone: 'hi' }))
  }
  return station('engines', out.join(''))
}

/* ── Indexing carriage on its rail: llm-d ── */
function carriage() {
  const out = []
  // rail with end stops
  out.push(S(k.slabOf({ x: RAIL_FROM, y: -3, w: RAIL_TO - RAIL_FROM, d: 6, r: 1 }, RAIL_Z, 3.4, P, 2, 0.4), { tone: 'mid' }))
  for (const x of [RAIL_FROM - 4, RAIL_TO]) {
    out.push(S(k.slabOf({ x, y: -5, w: 4, d: 10, r: 1 }, RAIL_Z, 7, P, 2, 0.5), { tone: 'mid' }))
    out.push(D([at([x + 2, 0, RAIL_Z + 7])], { size: 0.45 }))
  }
  const ticks = k.topTicks(RAIL_FROM + 4, RAIL_TO - 4, 6, 4, -3, RAIL_Z + 3.4, [6, 6], P)
  out.push(L(ticks.minor, { tone: 'lo' }), L(ticks.major, { tone: 'mid' }))

  // the carriage, on bushings
  const car = { x: CARRIAGE_X - 11, y: -9, w: 22, d: 18, r: 2 }
  out.push(S(k.slabOf(car, RAIL_Z + 3.4, 8, P, 2, 0.6), { tone: 'hi' }))
  out.push(L(k.planOutline(k.insetPlan(car, 3), RAIL_Z + 11.4, P), { tone: 'faint' }))
  for (const sx of [-1, 1]) {
    out.push(S(k.cylinder(CARRIAGE_X + sx * 7, 0, 2.6, RAIL_Z + 1, 3, P, 16), { tone: 'lo' }))
  }
  out.push(D([at([CARRIAGE_X, 0, RAIL_Z + 11.4])], { size: 0.5, tone: 'hi' }))
  return station('llmd', out.join(''))
}

/* ── The stand that raises the diverter ── */
function stand() {
  const base = { x: DIV[0] - 15, y: -15, w: 30, d: 30, r: 3 }
  const out = [S(k.slabOf(base, 0, 5, P, 3, 0.8), { tone: 'lo' })]
  out.push(L(k.planOutline(k.insetPlan(base, 4), 5, P), { tone: 'faint' }))
  out.push(D(k.corners(base, 5).map(([x, y]) => at([x, y, 5])), { size: 0.45 }))
  // the column, with collars
  out.push(S(k.cylinder(DIV[0], 0, 5, 5, DIV_Z - 5, P, 26), { tone: 'mid', crease: 'none' }))
  out.push(L([18, 34].map(z => k.sideArc(DIV[0], 0, 5, z, P, 18)).join(''), { tone: 'faint' }))
  out.push(S(k.cylinder(DIV[0], 0, 7, 20, 5, P, 26), { tone: 'mid' }))
  out.push(L(k.knurl(DIV[0], 0, 7, 20, 25, P ? 22 : 22, P), { tone: 'faint' }))
  return out.join('')
}

/* ── Intake hopper: the clients ── */
function hopper() {
  const out = []
  const mouth = { x: HOPPER[0] - 21, y: -21, w: 42, d: 42, r: 3 }
  const throat = { x: HOPPER[0] - 7, y: -7, w: 14, d: 14, r: 2 }
  // funnel walls as a stack of thin solid bands, so the taper has a surface
  const steps = 9
  const topZ = HOPPER_TOP
  const botZ = GRATE_Z + 13
  for (let i = steps - 1; i >= 0; i--) {
    const t = i / (steps - 1)
    const plan = {
      x: mouth.x + (throat.x - mouth.x) * t,
      y: mouth.y + (throat.y - mouth.y) * t,
      w: mouth.w + (throat.w - mouth.w) * t,
      d: mouth.d + (throat.d - mouth.d) * t,
      r: 3,
    }
    const z = topZ - (topZ - botZ) * t
    const h = (topZ - botZ) / (steps - 1) + 0.6
    out.push(S(k.slabOf(plan, z - h, h, P, 4, 0.3), { tone: i < 3 ? 'mid' : 'lo', crease: 'none' }))
  }
  out.push(S(k.slabOf(mouth, HOPPER_TOP, 3, P, 3, 0.6), { tone: 'mid' }))
  out.push(S(k.cylinder(HOPPER[0], 0, 7, GRATE_Z + 10, 4, P, 20), { tone: 'mid' }))
  out.push(D(k.corners(mouth, 5).map(([x, y]) => at([x, y, HOPPER_TOP + 3])), { size: 0.45 }))
  return station('clients', out.join(''))
}

/* ── Filter grate: edge and security ── */
function grate() {
  const out = []
  const plan = { x: HOPPER[0] - 15, y: -15, w: 30, d: 30, r: 2 }
  out.push(S(k.slabOf(plan, GRATE_Z, 3.5, P, 2, 0.5), { tone: 'mid' }))
  // the mesh, ending on the frame at both ends
  const mesh = []
  for (let x = plan.x + 3; x <= plan.x + plan.w - 3; x += 3.6) {
    mesh.push(k.segment([x, plan.y, GRATE_Z + 3.5], [x, plan.y + plan.d, GRATE_Z + 3.5], P))
  }
  for (let y = plan.y + 3; y <= plan.y + plan.d - 3; y += 3.6) {
    mesh.push(k.segment([plan.x, y, GRATE_Z + 3.5], [plan.x + plan.w, y, GRATE_Z + 3.5], P))
  }
  out.push(L(mesh.join(''), { tone: 'faint' }))
  out.push(L(k.planOutline(k.insetPlan(plan, 2), GRATE_Z + 3.5, P), { tone: 'lo' }))
  // latch on the near side
  out.push(S(k.slabOf({ x: plan.x + plan.w - 4, y: plan.y + plan.d + 1, w: 8, d: 4, r: 1 }, GRATE_Z + 1, 3, P, 1.5, 0.4), { tone: 'lo' }))
  out.push(D(k.corners(plan, 3.5).map(([x, y]) => at([x, y, GRATE_Z + 3.5])), { size: 0.45 }))
  return station('edge', out.join(''))
}

/* ── Manifold with gauges: the LiteLLM gateway ── */
function manifold() {
  const out = []
  out.push(S(k.slabOf(MANI, MANI_Z, MANI_H, P, 3, 0.8), { tone: 'mid' }))
  out.push(L(k.planOutline(k.insetPlan(MANI, 4), MANI_Z + MANI_H, P), { tone: 'faint' }))

  // three gauges across the top: budget, cost, retries
  const gx = [MANI.x + 9, MANI.x + 19, MANI.x + 29]
  for (const x of gx) {
    out.push(S(k.cylinder(x, 0, 5.2, MANI_Z + MANI_H, 2.6, P, 24), { tone: 'hi' }))
    out.push(L(k.ring(x, 0, 3.2, MANI_Z + MANI_H + 2.6, P, 20), { tone: 'faint' }))
    out.push(L(k.radialTicks(x, 0, 3.2, 12, 3, MANI_Z + MANI_H + 2.6, [2, 2], P), { tone: 'lo' }))
    out.push(D([at([x, 0, MANI_Z + MANI_H + 2.6])], { size: 0.45, tone: 'hi' }))
  }

  // relief valve on the far side — the fallback path
  out.push(S(k.cylinder(MANI.x + MANI.w - 6, MANI.y + 5, 3.4, MANI_Z + MANI_H, 7, P, 18), { tone: 'mid' }))
  out.push(L(k.knurl(MANI.x + MANI.w - 6, MANI.y + 5, 3.4, MANI_Z + MANI_H, MANI_Z + MANI_H + 7, 20, P), { tone: 'faint' }))

  // label plate with three rule lines
  const lab = { x: MANI.x + 5, y: MANI.y + MANI.d - 9, w: 26, d: 6, r: 1 }
  out.push(S(k.slabOf(lab, MANI_Z + MANI_H, 0.5, P, 1), { tone: 'lo', crease: 'none' }))
  out.push(L([2, 3.4, 4.8].map(dy => k.segment([lab.x + 3, lab.y + dy, MANI_Z + MANI_H + 0.5], [lab.x + lab.w - 3, lab.y + dy, MANI_Z + MANI_H + 0.5], P)).join(''), { tone: 'faint' }))
  out.push(D(k.corners(MANI, 4).map(([x, y]) => at([x, y, MANI_Z + MANI_H])), { size: 0.45 }))
  return station('gateway', out.join(''))
}

/* ── Diverter: the semantic router. The one lit part. ── */
function diverter() {
  const out = []
  const base = { x: DIV[0] - 13, y: -13, w: 26, d: 26, r: 2 }
  out.push(S(k.slabOf(base, DIV_Z, 6, P, 2, 0.6), { tone: 'mid' }))

  // pivot posts either side of the flap
  for (const sy of [-1, 1]) {
    out.push(S(k.cylinder(DIV[0], sy * 13, 2.6, DIV_Z + 6, 11, P, 16), { tone: 'mid', crease: 'none' }))
  }
  // the flap, lit
  out.push(S(k.slabOf({ x: DIV[0] - 14, y: -12, w: 30, d: 24, r: 2 }, DIV_Z + 14, 3.2, P, 2, 0.5), { tone: 'lit' }))
  // throw arc scratched into the flap, and the two seats it swings between
  out.push(L(k.planOutline({ x: DIV[0] - 10, y: -8, w: 22, d: 16, r: 1.5 }, DIV_Z + 17.2, P), { tone: 'lo' }))
  out.push(D([at([DIV[0] + 1, 0, DIV_Z + 17.2])], { size: 0.6, tone: 'lit' }))

  // solenoid that throws it
  out.push(S(k.cylinder(DIV[0] - 15, 0, 4, DIV_Z + 6, 9, P, 18), { tone: 'mid' }))
  out.push(L(k.coil(DIV_Z + 6.5, DIV_Z + 14.5, [DIV[0] - 15, 0], 4.6, 7, 'z', P), { tone: 'faint' }))
  out.push(D(k.corners(base, 4).map(([x, y]) => at([x, y, DIV_Z + 6])), { size: 0.45 }))
  return station('router', out.join(''))
}

/* ── Outfeed pipe and the offsite box: frontier providers ── */
function frontierPipe() {
  const out = []
  // a flanged stub leaving the diverter
  out.push(S(k.cylinder(DIV[0] - 20, 0, 4.6, DIV_Z + 6, 5, P, 18), { tone: 'mid' }))
  // the run: off the flap, down the stand, across the bench to the box
  const route = [
    [DIV[0] - 20, 0, DIV_Z + 9],
    [DIV[0] - 20, 40, DIV_Z + 9],
    [DIV[0] - 20, 40, 14],
    [OFFSITE.x + OFFSITE.w / 2, 40, 14],
    [OFFSITE.x + OFFSITE.w / 2, OFFSITE.y + 8, 14],
    [OFFSITE.x + OFFSITE.w / 2, OFFSITE.y + 8, OFFSITE_H],
  ]
  const segs = []
  for (let i = 0; i < route.length - 1; i++) segs.push(k.segment(route[i], route[i + 1], P))
  out.push(L(segs.join(''), { tone: 'mid' }))
  // collars where the run turns, so the bends read as joints
  for (const pt of route.slice(1, -1)) out.push(D([at(pt)], { size: 0.5 }))
  out.push(D([at(route[0]), at(route[route.length - 1])], { size: 0.55 }))

  return station('frontier', out.join(''))
}

function frontierBox() {
  const out = []
  // three stacked units, nothing of ours inside
  out.push(`<path class="iso-halo" d="${k.haloOf(OFFSITE, 0, OFFSITE_H, P)}"/>`)
  out.push(S(k.slabOf(OFFSITE, OFFSITE_Z, OFFSITE_H, P, 4, 1), { tone: 'lo' }))
  out.push(L(k.planOutline(k.insetPlan(OFFSITE, 4), OFFSITE_H, P), { tone: 'faint' }))
  out.push(D(k.corners(OFFSITE, 6).map(([x, y]) => at([x, y, OFFSITE_H])), { size: 0.45 }))
  return station('frontier', out.join(''))
}

/* ── Assemble, back to front ── */
const art = [
  frontierBox(),
  plinth(),
  posts(false),
  rackFrame(false),
  press(),
  drums(),
  carriage(),
  rackFrame(true),
  posts(true),
  hopper(),
  grate(),
  manifold(),
  stand(),
  diverter(),
  frontierPipe(),
].join('')

const svg = k.figureSvg({ width: WIDTH, height: HEIGHT, body: art })

const card = k.plateHtml({
  fig: 'Fig 1',
  title: 'The request sorter',
  hint: 'hover a station',
  readout: `${BASE_RPS} req/s`,
  body: svg,
})

const live = `
const STATIONS = ${JSON.stringify(STATIONS)};
const BASE = ${BASE_RPS}, SPREAD = ${RPS_SPREAD};
const byId = Object.fromEntries(STATIONS.map(s => [s.id, s]));

const figure = document.querySelector('.iso-figure') || document;
const groups = [...figure.querySelectorAll('.st')];
const readout = document.querySelector('[data-readout]');
const hint = document.querySelector('[data-corner=\\'hint\\']');
const idle = readout ? readout.textContent : '';

let held = null;

function focus(id) {
  for (const g of groups) {
    const on = id === null || g.dataset.station === id;
    g.style.opacity = on ? '1' : '0.28';
  }
  if (!readout) return;
  if (id && byId[id]) {
    const s = byId[id];
    readout.textContent = s.name + ' · ' + s.part;
    if (hint) hint.textContent = s.spec.join('  ·  ');
  } else {
    readout.textContent = idle;
    if (hint) hint.textContent = 'hover a station';
  }
}

for (const g of groups) {
  g.style.transition = 'opacity .18s ease';
  g.addEventListener('pointerenter', () => { if (!held) focus(g.dataset.station); });
  g.addEventListener('pointerleave', () => { if (!held) focus(null); });
  g.addEventListener('click', e => {
    e.stopPropagation();
    held = held === g.dataset.station ? null : g.dataset.station;
    focus(held);
  });
}
document.addEventListener('click', () => { held = null; focus(null); });

// the readout drifts the way a real counter does, while nothing is held
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!reduced && readout) {
  let cur = BASE, target = BASE;
  setInterval(() => {
    if (held || groups.some(g => g.matches(':hover'))) return;
    if (Math.random() < 0.3) target = BASE - SPREAD / 2 + Math.random() * SPREAD;
    cur += (target - cur) * 0.2;
    readout.textContent = Math.round(cur).toLocaleString('en-US') + ' req/s';
  }, 260);
}
`

writeFileSync(
  join(HERE, theme === 'light' ? 'page-light.html' : 'page.html'),
  k.pageHtml({ title: 'The request sorter', body: card, theme, width: WIDTH, script: kitScript() + live }),
)
console.log('wrote', theme === 'light' ? 'page-light.html' : 'page.html')

/* ── The two paths a request can take ── */
const SHARED = [
  [HOPPER[0], HOPPER[1], HOPPER_TOP + 14],
  [HOPPER[0], HOPPER[1], GRATE_Z + 16],
  [HOPPER[0], HOPPER[1], GRATE_Z + 5],
  [MANI.x + MANI.w / 2, 0, GRATE_Z + 5],
  [MANI.x + MANI.w / 2, 0, MANI_Z + MANI_H + 4],
  [DIV[0], 0, MANI_Z + MANI_H + 4],
  [DIV[0], 0, DIV_Z + 19],
]

const SELF_HOSTED_PATH = [
  [DIV[0], 0, DIV_Z + 19],
  [CARRIAGE_X, 0, DIV_Z + 19],
  [CARRIAGE_X, 0, RAIL_Z + 13],
  [DRUM_XS[0], DRUM_Y, RAIL_Z + 13],
  [DRUM_XS[0], DRUM_Y, DRUM_Z + 14],
  [DRUM_XS[1], DRUM_Y, DRUM_Z + 14],
  [DRUM_XS[2], DRUM_Y, DRUM_Z + 14],
  [DRUM_XS[2], DRUM_Y, PRESS_Z + 26],
  [PRESS.x + PRESS.w / 2, PRESS.y + PRESS.d / 2, PRESS_Z + 26],
  [PRESS.x + PRESS.w / 2, PRESS.y + PRESS.d / 2, PRESS_Z + 11],
  [PRESS.x + PRESS.w / 2, PRESS.y + PRESS.d / 2, 2],
]

const FRONTIER_PATH = [
  [DIV[0], 0, DIV_Z + 19],
  [DIV[0] - 20, 0, DIV_Z + 19],
  [DIV[0] - 20, 0, DIV_Z + 9],
  [DIV[0] - 20, 40, DIV_Z + 9],
  [DIV[0] - 20, 40, 14],
  [OFFSITE.x + OFFSITE.w / 2, 40, 14],
  [OFFSITE.x + OFFSITE.w / 2, OFFSITE.y + 8, 14],
  [OFFSITE.x + OFFSITE.w / 2, OFFSITE.y + 8, OFFSITE_H],
]

const onScreen = pts => pts.map(pt => {
  const [sx, sy] = at(pt)
  return [Math.round(sx * 100) / 100, Math.round(sy * 100) / 100]
})

// The site renders the figure itself, so emit the art and the station data
// as a module. Generated — do not edit by hand.
if (theme === 'dark') {
  const mod = [
    '/* Generated by anatomy/stack/build.mjs — do not edit.',
    ' * Rebuild: node anatomy/stack/build.mjs',
    ' */',
    '',
    'export const FIGURE_SVG = ' + JSON.stringify(svg) + ' as const',
    '',
    'export const FIGURE_VIEWBOX = { width: ' + WIDTH + ', height: ' + HEIGHT + ' } as const',
    '',
    'export type Station = {',
    '  id: string',
    '  name: string',
    '  part: string',
    '  detail: string',
    '  spec: string[]',
    '}',
    '',
    'export const FIGURE_STATIONS: Station[] = ' + JSON.stringify(STATIONS, null, 2),
    '',
    '/** Screen-space routes a request takes, shared stem then one of two branches. */',
    'export const FIGURE_ROUTES = {',
    '  shared: ' + JSON.stringify(onScreen(SHARED)) + ',',
    '  selfHosted: ' + JSON.stringify(onScreen(SELF_HOSTED_PATH)) + ',',
    '  frontier: ' + JSON.stringify(onScreen(FRONTIER_PATH)) + ',',
    '  selfHostedShare: ' + SELF_HOSTED_SHARE + ',',
    '} as const',
    '',
  ].join('\n')
  writeFileSync(join(HERE, '..', '..', 'components', 'generated', 'stackFigure.ts'), mod)
  console.log('wrote components/generated/stackFigure.ts')
}
