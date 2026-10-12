/**
 * Procedural line-art parts for the isometric floor.
 *
 * Everything is LineSegments — the drawing is the edges, never a shaded
 * surface. Density of small detail is what makes a scene like this read
 * as a place rather than a diagram, so these helpers exist to make
 * detail cheap: rack units, fan grids, port rows, cable runs.
 *
 * WebGL ignores linewidth on nearly every platform, so hierarchy comes
 * from opacity rather than stroke weight.
 */
import type * as THREE_NS from 'three'

type THREE = typeof THREE_NS
type Group = THREE_NS.Group

export type Ink = { color: number; dim: number; bright: number }

export function makeInk(color: number): Ink {
  return { color, dim: 0.22, bright: 0.75 }
}

/** Collects disposables so the scene can tear itself down cleanly. */
export type Bin = { dispose(): void }[]

function mat(T: THREE, bin: Bin, color: number, opacity: number) {
  const m = new T.LineBasicMaterial({ color, transparent: true, opacity })
  bin.push(m)
  return m
}

function seg(T: THREE, bin: Bin, pts: THREE_NS.Vector3[], color: number, opacity: number) {
  const g = new T.BufferGeometry().setFromPoints(pts)
  bin.push(g)
  return new T.LineSegments(g, mat(T, bin, color, opacity))
}

/** Wireframe cuboid sitting on y=0, centred on x/z. */
export function boxEdges(
  T: THREE, bin: Bin, w: number, h: number, d: number, color: number, opacity: number,
) {
  const g = new T.BoxGeometry(w, h, d)
  const e = new T.EdgesGeometry(g)
  bin.push(g, e)
  const l = new T.LineSegments(e, mat(T, bin, color, opacity))
  l.position.y = h / 2
  return l
}

/** Horizontal rule across the front face — one rack unit. */
function unitLines(
  T: THREE, bin: Bin, w: number, h: number, d: number, units: number, color: number, opacity: number,
) {
  const pts: THREE_NS.Vector3[] = []
  for (let i = 1; i < units; i++) {
    const y = (h / units) * i
    pts.push(new T.Vector3(-w / 2, y, d / 2), new T.Vector3(w / 2, y, d / 2))
    // a shorter tick on the side face reads as depth
    pts.push(new T.Vector3(w / 2, y, d / 2), new T.Vector3(w / 2, y, d / 2 - d * 0.3))
  }
  return seg(T, bin, pts, color, opacity)
}

/** Small squares in a row — ports, drive bays, status LEDs. */
function ports(
  T: THREE, bin: Bin, n: number, y: number, w: number, d: number, s: number, color: number, opacity: number,
) {
  const pts: THREE_NS.Vector3[] = []
  const span = w * 0.74
  const step = span / (n - 1 || 1)
  for (let i = 0; i < n; i++) {
    const x = -span / 2 + step * i
    const z = d / 2 + 0.002
    pts.push(
      new T.Vector3(x - s, y - s, z), new T.Vector3(x + s, y - s, z),
      new T.Vector3(x + s, y - s, z), new T.Vector3(x + s, y + s, z),
      new T.Vector3(x + s, y + s, z), new T.Vector3(x - s, y + s, z),
      new T.Vector3(x - s, y + s, z), new T.Vector3(x - s, y - s, z),
    )
  }
  return seg(T, bin, pts, color, opacity)
}

/** Circles on the front face — fans. */
function fans(
  T: THREE, bin: Bin, cols: number, rows: number, r: number, w: number, h: number, d: number,
  color: number, opacity: number,
) {
  const pts: THREE_NS.Vector3[] = []
  const stepX = w * 0.8 / cols
  const stepY = h * 0.7 / rows
  const SIDES = 12
  for (let cx = 0; cx < cols; cx++) {
    for (let cy = 0; cy < rows; cy++) {
      const ox = -w * 0.4 + stepX * (cx + 0.5)
      const oy = h * 0.15 + stepY * (cy + 0.5)
      for (let i = 0; i < SIDES; i++) {
        const a = (i / SIDES) * Math.PI * 2
        const b = ((i + 1) / SIDES) * Math.PI * 2
        pts.push(
          new T.Vector3(ox + Math.cos(a) * r, oy + Math.sin(a) * r, d / 2 + 0.002),
          new T.Vector3(ox + Math.cos(b) * r, oy + Math.sin(b) * r, d / 2 + 0.002),
        )
      }
    }
  }
  return seg(T, bin, pts, color, opacity)
}

/** A rack: shell, unit rules, bay ports, and a vent band up top. */
export function rack(
  T: THREE, bin: Bin, opts: { w: number; h: number; d: number; units: number; ink: Ink },
): Group {
  const { w, h, d, units, ink } = opts
  const g = new T.Group()
  g.add(boxEdges(T, bin, w, h, d, ink.color, ink.bright))
  g.add(unitLines(T, bin, w, h, d, units, ink.color, ink.dim))
  for (let u = 0; u < units; u++) {
    const y = (h / units) * (u + 0.5)
    g.add(ports(T, bin, 5, y, w, d, 0.035, ink.color, ink.dim * 1.3))
  }
  // feet
  const f: THREE_NS.Vector3[] = []
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    f.push(
      new T.Vector3(sx * w * 0.42, 0, sz * d * 0.4),
      new T.Vector3(sx * w * 0.42, -0.12, sz * d * 0.4),
    )
  }
  g.add(seg(T, bin, f, ink.color, ink.dim))
  return g
}

/** GPU chassis: wide, fan wall, card slots along the top. */
export function gpuChassis(
  T: THREE, bin: Bin, opts: { w: number; h: number; d: number; cards: number; ink: Ink },
): Group {
  const { w, h, d, cards, ink } = opts
  const g = new T.Group()
  g.add(boxEdges(T, bin, w, h, d, ink.color, ink.bright))
  g.add(fans(T, bin, 6, 2, 0.17, w, h, d, ink.color, ink.dim * 1.5))

  // cards standing proud of the lid
  const pts: THREE_NS.Vector3[] = []
  const span = w * 0.8
  const step = span / cards
  for (let i = 0; i < cards; i++) {
    const x = -span / 2 + step * (i + 0.5)
    const top = h + 0.42
    pts.push(
      new T.Vector3(x, h, -d * 0.3), new T.Vector3(x, top, -d * 0.3),
      new T.Vector3(x, top, -d * 0.3), new T.Vector3(x, top, d * 0.3),
      new T.Vector3(x, top, d * 0.3), new T.Vector3(x, h, d * 0.3),
    )
  }
  g.add(seg(T, bin, pts, ink.color, ink.bright * 0.8))
  return g
}

/** 1U appliance with a dense port row — firewall, gateway, router. */
export function appliance(
  T: THREE, bin: Bin, opts: { w: number; h: number; d: number; portCount: number; ink: Ink },
): Group {
  const { w, h, d, portCount, ink } = opts
  const g = new T.Group()
  g.add(boxEdges(T, bin, w, h, d, ink.color, ink.bright))
  g.add(ports(T, bin, portCount, h * 0.5, w, d, 0.04, ink.color, ink.dim * 1.6))
  // a mast, so the silhouette isn't just a slab
  g.add(seg(T, bin, [
    new T.Vector3(w * 0.36, h, 0), new T.Vector3(w * 0.36, h + 0.5, 0),
    new T.Vector3(w * 0.22, h + 0.5, 0), new T.Vector3(w * 0.5, h + 0.5, 0),
  ], ink.color, ink.dim))
  return g
}

/** Client devices: a laptop wedge and a handset, on a small pad. */
export function devices(T: THREE, bin: Bin, ink: Ink): Group {
  const g = new T.Group()
  const p: THREE_NS.Vector3[] = []
  // laptop base
  p.push(
    new T.Vector3(-0.8, 0.05, -0.5), new T.Vector3(0.8, 0.05, -0.5),
    new T.Vector3(0.8, 0.05, -0.5), new T.Vector3(0.8, 0.05, 0.5),
    new T.Vector3(0.8, 0.05, 0.5), new T.Vector3(-0.8, 0.05, 0.5),
    new T.Vector3(-0.8, 0.05, 0.5), new T.Vector3(-0.8, 0.05, -0.5),
  )
  // screen, hinged up
  p.push(
    new T.Vector3(-0.8, 0.05, -0.5), new T.Vector3(-0.8, 0.95, -0.95),
    new T.Vector3(-0.8, 0.95, -0.95), new T.Vector3(0.8, 0.95, -0.95),
    new T.Vector3(0.8, 0.95, -0.95), new T.Vector3(0.8, 0.05, -0.5),
  )
  g.add(seg(T, bin, p, ink.color, ink.bright))

  const h: THREE_NS.Vector3[] = []
  const hx = 1.5
  h.push(
    new T.Vector3(hx, 0.02, -0.25), new T.Vector3(hx + 0.42, 0.02, -0.25),
    new T.Vector3(hx + 0.42, 0.02, -0.25), new T.Vector3(hx + 0.42, 0.02, 0.45),
    new T.Vector3(hx + 0.42, 0.02, 0.45), new T.Vector3(hx, 0.02, 0.45),
    new T.Vector3(hx, 0.02, 0.45), new T.Vector3(hx, 0.02, -0.25),
  )
  g.add(seg(T, bin, h, ink.color, ink.dim * 1.5))
  return g
}

/** Offsite block for the frontier providers — a distant stack. */
export function offsite(T: THREE, bin: Bin, ink: Ink): Group {
  const g = new T.Group()
  for (let i = 0; i < 3; i++) {
    const b = boxEdges(T, bin, 1.5, 0.9 + i * 0.25, 1.1, ink.color, ink.bright * 0.8)
    b.position.set((i - 1) * 1.9, 0, 0)
    g.add(b)
  }
  return g
}

/** Floor plate with a faint grid. */
export function floorPlate(
  T: THREE, bin: Bin, w: number, d: number, step: number, color: number,
): Group {
  const g = new T.Group()
  const grid: THREE_NS.Vector3[] = []
  for (let x = -w / 2; x <= w / 2 + 0.001; x += step) {
    grid.push(new T.Vector3(x, 0, -d / 2), new T.Vector3(x, 0, d / 2))
  }
  for (let z = -d / 2; z <= d / 2 + 0.001; z += step) {
    grid.push(new T.Vector3(-w / 2, 0, z), new T.Vector3(w / 2, 0, z))
  }
  g.add(seg(T, bin, grid, color, 0.07))

  const border: THREE_NS.Vector3[] = [
    new T.Vector3(-w / 2, 0, -d / 2), new T.Vector3(w / 2, 0, -d / 2),
    new T.Vector3(w / 2, 0, -d / 2), new T.Vector3(w / 2, 0, d / 2),
    new T.Vector3(w / 2, 0, d / 2), new T.Vector3(-w / 2, 0, d / 2),
    new T.Vector3(-w / 2, 0, d / 2), new T.Vector3(-w / 2, 0, -d / 2),
  ]
  g.add(seg(T, bin, border, color, 0.25))
  return g
}

/** A zone marked on the floor: outline plus short corner posts. */
export function zoneFence(
  T: THREE, bin: Bin,
  x0: number, z0: number, x1: number, z1: number,
  postH: number, color: number, opacity: number,
): Group {
  const g = new T.Group()
  const y = 0.004
  g.add(seg(T, bin, [
    new T.Vector3(x0, y, z0), new T.Vector3(x1, y, z0),
    new T.Vector3(x1, y, z0), new T.Vector3(x1, y, z1),
    new T.Vector3(x1, y, z1), new T.Vector3(x0, y, z1),
    new T.Vector3(x0, y, z1), new T.Vector3(x0, y, z0),
  ], color, opacity))

  const posts: THREE_NS.Vector3[] = []
  for (const [px, pz] of [[x0, z0], [x1, z0], [x1, z1], [x0, z1]]) {
    posts.push(new T.Vector3(px, 0, pz), new T.Vector3(px, postH, pz))
  }
  g.add(seg(T, bin, posts, color, opacity * 0.9))
  return g
}

/** Cable run along the floor, right-angled like real trunking. */
export function cableRun(
  T: THREE, bin: Bin,
  from: [number, number], to: [number, number], color: number, opacity: number,
) {
  const y = 0.012
  const [ax, az] = from
  const [bx, bz] = to
  const midX = (ax + bx) / 2
  const path = [
    new T.Vector3(ax, y, az),
    new T.Vector3(midX, y, az),
    new T.Vector3(midX, y, bz),
    new T.Vector3(bx, y, bz),
  ]
  const pts: THREE_NS.Vector3[] = []
  for (let i = 0; i < path.length - 1; i++) pts.push(path[i], path[i + 1])
  return { line: seg(T, bin, pts, color, opacity), path }
}

/* ────────────────────────────────────────────────────────────
 * Iconography
 *
 * Each node gets a recognisable mark rather than another box: the
 * Kubernetes helm, a cloud for hosted providers, a shield for the
 * network perimeter, a die for the GPU. Paths are unit-square
 * polylines in [-0.5, 0.5]; `icon()` lays them flat on a slab top so
 * they read straight-on from the isometric camera.
 * ──────────────────────────────────────────────────────────── */

type Path = [number, number][]

function regular(sides: number, r: number, rot = -Math.PI / 2): Path {
  return Array.from({ length: sides }, (_, i) => {
    const a = rot + (i / sides) * Math.PI * 2
    return [Math.cos(a) * r, Math.sin(a) * r] as [number, number]
  })
}

function circle(r: number, seg = 20, cx = 0, cy = 0): Path {
  return Array.from({ length: seg }, (_, i) => {
    const a = (i / seg) * Math.PI * 2
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r] as [number, number]
  })
}

export type IconName =
  | 'devices' | 'shield' | 'gateway' | 'router'
  | 'cloud' | 'helm' | 'models' | 'engine' | 'gauge' | 'die'

/** Closed loops plus open polylines, per icon. */
const ICON_PATHS: Record<IconName, { loops: Path[]; lines: Path[] }> = {
  // laptop silhouette, screen folded up
  devices: {
    loops: [[[-0.5, -0.28], [0.5, -0.28], [0.34, 0.12], [-0.34, 0.12]]],
    lines: [[[-0.34, 0.12], [-0.28, 0.42]], [[-0.28, 0.42], [0.28, 0.42]], [[0.28, 0.42], [0.34, 0.12]]],
  },
  // perimeter shield
  shield: {
    loops: [[[0, 0.5], [0.42, 0.28], [0.42, -0.08], [0, -0.5], [-0.42, -0.08], [-0.42, 0.28]]],
    lines: [[[0, 0.28], [0, -0.26]], [[-0.22, 0.02], [0.22, 0.02]]],
  },
  // funnel: many in, one out
  gateway: {
    loops: [],
    lines: [
      [[-0.48, 0.42], [-0.1, -0.02], [-0.1, -0.44]],
      [[0.48, 0.42], [0.1, -0.02], [0.1, -0.44]],
      [[-0.48, 0.42], [0.48, 0.42]],
      [[-0.1, -0.44], [0.1, -0.44]],
    ],
  },
  // one path splitting into two
  router: {
    loops: [],
    lines: [
      [[0, 0.5], [0, 0.1]],
      [[-0.38, -0.34], [-0.38, 0.1], [0.38, 0.1], [0.38, -0.34]],
      [[-0.5, -0.2], [-0.38, -0.38], [-0.26, -0.2]],
      [[0.26, -0.2], [0.38, -0.38], [0.5, -0.2]],
    ],
  },
  // hosted / offsite
  cloud: {
    loops: [[
      [-0.46, -0.2], [-0.46, -0.04], [-0.36, 0.1], [-0.18, 0.14],
      [-0.1, 0.34], [0.12, 0.4], [0.3, 0.26], [0.44, 0.12],
      [0.46, -0.06], [0.38, -0.2],
    ]],
    lines: [],
  },
  // Kubernetes helm: heptagon, hub, seven spokes
  helm: {
    loops: [regular(7, 0.46), regular(7, 0.15)],
    lines: regular(7, 0.46).map((p, i) => {
      const inner = regular(7, 0.15)[i]
      return [inner, p] as Path
    }),
  },
  // two weight tiers, one small one large
  models: {
    loops: [
      [[-0.46, 0.06], [-0.08, 0.06], [-0.08, 0.4], [-0.46, 0.4]],
      [[0.04, -0.42], [0.46, -0.42], [0.46, 0.18], [0.04, 0.18]],
    ],
    lines: [[[-0.46, 0.23], [-0.08, 0.23]], [[0.04, -0.12], [0.46, -0.12]]],
  },
  // turbine
  engine: {
    loops: [circle(0.46), circle(0.11)],
    lines: Array.from({ length: 6 }, (_, i) => {
      const a = (i / 6) * Math.PI * 2
      const b = a + 0.5
      return [
        [Math.cos(a) * 0.13, Math.sin(a) * 0.13],
        [Math.cos(b) * 0.42, Math.sin(b) * 0.42],
      ] as Path
    }),
  },
  // compression gauge
  gauge: {
    loops: [],
    lines: [
      Array.from({ length: 13 }, (_, i) => {
        const a = Math.PI * (1 - i / 12)
        return [Math.cos(a) * 0.44, Math.sin(a) * 0.44 - 0.12] as [number, number]
      }),
      [[-0.44, -0.12], [0.44, -0.12]],
      [[0, -0.12], [0.22, 0.26]],
    ],
  },
  // silicon die with pins
  die: {
    loops: [[[-0.34, -0.34], [0.34, -0.34], [0.34, 0.34], [-0.34, 0.34]],
            [[-0.16, -0.16], [0.16, -0.16], [0.16, 0.16], [-0.16, 0.16]]],
    lines: [-0.2, 0, 0.2].flatMap(o => ([
      [[o, 0.34], [o, 0.5]],
      [[o, -0.34], [o, -0.5]],
      [[0.34, o], [0.5, o]],
      [[-0.34, o], [-0.5, o]],
    ] as Path[])),
  },
}

/** Lays an icon flat in the XZ plane, centred on the origin. */
export function icon(
  T: THREE, bin: Bin, name: IconName, size: number, color: number, opacity: number,
): THREE_NS.LineSegments {
  const { loops, lines } = ICON_PATHS[name]
  const pts: THREE_NS.Vector3[] = []
  const put = (a: [number, number], b: [number, number]) => {
    pts.push(new T.Vector3(a[0] * size, 0, a[1] * size))
    pts.push(new T.Vector3(b[0] * size, 0, b[1] * size))
  }
  for (const loop of loops) {
    for (let i = 0; i < loop.length; i++) put(loop[i], loop[(i + 1) % loop.length])
  }
  for (const line of lines) {
    for (let i = 0; i < line.length - 1; i++) put(line[i], line[i + 1])
  }
  const g = new T.BufferGeometry().setFromPoints(pts)
  bin.push(g)
  const m = new T.LineBasicMaterial({ color, transparent: true, opacity })
  bin.push(m)
  return new T.LineSegments(g, m)
}
