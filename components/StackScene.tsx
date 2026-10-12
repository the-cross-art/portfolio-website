'use client'

import { useEffect, useRef, useState } from 'react'
import { ALL_TIERS, OBSERVABILITY, type Tier } from './stackTopology'
import type { IconName } from './stackBuilders'

/* ── Composition ──
 * The vertical stack, annotated. Each tier is a slab carrying a
 * recognisable mark — the Kubernetes helm, a cloud for hosted
 * providers, a shield for the perimeter, a die for the metal — with its
 * spec lines called out to the side. Callouts sit at distinct heights,
 * so unlike screen-space labels on a crowded floor they cannot collide.
 */
type Slot = {
  x: number
  y: number
  w: number
  d: number
  mark: IconName
  /** which side the callout hangs off */
  side: 'left' | 'right'
}

const LAYOUT: Record<string, Slot> = {
  clients:      { x:  0.0, y:   0.0, w: 4.0, d: 2.4, mark: 'devices', side: 'left'  },
  edge:         { x:  0.0, y:  -2.3, w: 4.3, d: 2.5, mark: 'shield',  side: 'left'  },
  gateway:      { x:  0.0, y:  -4.6, w: 4.7, d: 2.7, mark: 'gateway', side: 'left'  },
  router:       { x:  0.0, y:  -6.9, w: 4.3, d: 2.5, mark: 'router',  side: 'left'  },
  frontier:     { x: -8.6, y:  -9.4, w: 4.0, d: 2.4, mark: 'cloud',   side: 'left'  },
  llmd:         { x:  4.2, y:  -9.4, w: 4.2, d: 2.5, mark: 'helm',    side: 'right' },
  models:       { x:  4.2, y: -11.7, w: 4.2, d: 2.5, mark: 'models',  side: 'right' },
  engines:      { x:  4.2, y: -14.0, w: 4.2, d: 2.5, mark: 'engine',  side: 'right' },
  optimisation: { x:  4.2, y: -16.3, w: 4.2, d: 2.5, mark: 'gauge',   side: 'right' },
  gpu:          { x:  4.2, y: -19.0, w: 5.0, d: 3.0, mark: 'die',     side: 'right' },
}

const ZONE_INK: Record<string, number> = {
  edge:     0x8fa0bb,
  gateway:  0x66a6f5,
  frontier: 0xa98cf7,
  cluster:  0x2ad3ec,
  metal:    0x6fe4f5,
}

const SLAB_H = 0.42

const TIER_SWATCH: Record<string, string> = {
  edge:     '#8fa0bb',
  gateway:  '#66a6f5',
  frontier: '#a98cf7',
  cluster:  '#2ad3ec',
  metal:    '#6fe4f5',
}

export default function StackScene() {
  const mountRef = useRef<HTMLDivElement>(null)
  const api = useRef<{ emphasise(id: string | null): void } | null>(null)
  const [hovered, setHovered] = useState<string | null>(null)
  const [selected, setSelected] = useState<Tier | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'unsupported'>('loading')
  const [rps, setRps] = useState(1240)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return
    let disposed = false
    let cleanup = () => {}

    ;(async () => {
      const T = await import('three')
      const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js')
      const { CSS2DRenderer, CSS2DObject } = await import(
        'three/examples/jsm/renderers/CSS2DRenderer.js'
      )
      const B = await import('./stackBuilders')
      if (disposed) return

      let renderer: InstanceType<typeof T.WebGLRenderer>
      try {
        renderer = new T.WebGLRenderer({ antialias: true, alpha: true })
      } catch {
        setStatus('unsupported')
        return
      }

      const scene = new T.Scene()
      const bin: { dispose(): void }[] = []
      const picks: InstanceType<typeof T.Mesh>[] = []
      const slabsByTier = new Map<string, InstanceType<typeof T.Group>>()

      /* Hover gives the focused slab a little pop: it scales up, lifts, and
         eases out toward the viewer while the rest fall back. Targets are
         set on hover and eased every frame rather than snapped. */
      type Pop = {
        group: InstanceType<typeof T.Group>
        baseY: number
        baseZ: number
        scale: number; lift: number; push: number; fade: number
        tScale: number; tLift: number; tPush: number; tFade: number
      }
      const pops = new Map<string, Pop>()

      const W = () => mount.clientWidth
      const H = () => mount.clientHeight

      const FRUSTUM = 27
      const camera = new T.OrthographicCamera(-1, 1, 1, -1, 0.1, 300)
      camera.position.set(34, 13, 34)

      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.setSize(W(), H())
      renderer.domElement.style.display = 'block'
      mount.appendChild(renderer.domElement)

      const labels = new CSS2DRenderer()
      labels.setSize(W(), H())
      Object.assign(labels.domElement.style, {
        position: 'absolute', inset: '0', pointerEvents: 'none',
      })
      mount.appendChild(labels.domElement)

      const controls = new OrbitControls(camera, renderer.domElement)
      controls.enableDamping = true
      controls.dampingFactor = 0.08
      controls.target.set(1.2, -9.6, 0)
      controls.minZoom = 0.55
      controls.maxZoom = 3.5
      controls.enablePan = false

      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      controls.autoRotate = false

      function resize() {
        const a = W() / H()
        camera.left = (-FRUSTUM * a) / 2
        camera.right = (FRUSTUM * a) / 2
        camera.top = FRUSTUM / 2
        camera.bottom = -FRUSTUM / 2
        camera.updateProjectionMatrix()
        renderer.setSize(W(), H())
        labels.setSize(W(), H())
      }

      /* ── Slabs, marks and callouts ── */
      for (const tier of ALL_TIERS) {
        const slot = LAYOUT[tier.id]
        if (!slot) continue
        const color = ZONE_INK[tier.zone]
        const group = new T.Group()
        group.position.set(slot.x, slot.y, 0)
        scene.add(group)
        slabsByTier.set(tier.id, group)
        pops.set(tier.id, {
          group, baseY: slot.y, baseZ: 0,
          scale: 1, lift: 0, push: 0, fade: 1,
          tScale: 1, tLift: 0, tPush: 0, tFade: 1,
        })

        // the slab
        const geo = new T.BoxGeometry(slot.w, SLAB_H, slot.d)
        const edgeGeo = new T.EdgesGeometry(geo)
        const edgeMat = new T.LineBasicMaterial({ color, transparent: true, opacity: 0.85 })
        bin.push(geo, edgeGeo, edgeMat)
        group.add(new T.LineSegments(edgeGeo, edgeMat))

        const fillMat = new T.MeshBasicMaterial({
          color, transparent: true, opacity: 0.07, depthWrite: false,
        })
        bin.push(fillMat)
        group.add(new T.Mesh(geo, fillMat))

        // the mark, lying on the lid
        const mark = B.icon(T, bin, slot.mark, 1.75, color, 0.95)
        mark.position.y = SLAB_H / 2 + 0.01
        group.add(mark)

        // picking proxy
        const hg = new T.BoxGeometry(slot.w, SLAB_H + 1.2, slot.d)
        const hm = new T.MeshBasicMaterial({ visible: false })
        bin.push(hg, hm)
        const hit = new T.Mesh(hg, hm)
        hit.position.set(slot.x, slot.y, 0)
        hit.userData.tierId = tier.id
        scene.add(hit)
        picks.push(hit)

      }

      /* ── Zones ── */
      function zoneBox(
        ids: string[], padXZ: number, padY: number, color: number, label: string,
        anchor: 'min' | 'max' = 'min',
      ) {
        const slots = ids.map(i => LAYOUT[i]).filter(Boolean)
        const minX = Math.min(...slots.map(s => s.x - s.w / 2)) - padXZ
        const maxX = Math.max(...slots.map(s => s.x + s.w / 2)) + padXZ
        const minY = Math.min(...slots.map(s => s.y)) - SLAB_H / 2 - padY
        const maxY = Math.max(...slots.map(s => s.y)) + SLAB_H / 2 + padY
        const minZ = Math.min(...slots.map(s => -s.d / 2)) - padXZ
        const maxZ = Math.max(...slots.map(s => s.d / 2)) + padXZ

        const g = new T.BoxGeometry(maxX - minX, maxY - minY, maxZ - minZ)
        const e = new T.EdgesGeometry(g)
        const m = new T.LineDashedMaterial({
          color, transparent: true, opacity: 0.4, dashSize: 0.32, gapSize: 0.24,
        })
        bin.push(g, e, m)
        const box = new T.LineSegments(e, m)
        box.computeLineDistances()
        box.position.set((minX + maxX) / 2, (minY + maxY) / 2, (minZ + maxZ) / 2)
        scene.add(box)

        const el = document.createElement('div')
        el.className =
          'font-mono text-[9px] uppercase tracking-[0.18em] whitespace-nowrap px-1.5 py-0.5 rounded ' +
          'bg-white/85 dark:bg-[#07080c]/85'
        el.textContent = label
        el.style.color = `#${color.toString(16).padStart(6, '0')}`
        const o = new CSS2DObject(el)
        o.position.set(
          minX + 1.9,
          anchor === 'min' ? maxY + 0.38 : minY - 0.45,
          maxZ,
        )
        scene.add(o)
      }

      zoneBox(['llmd', 'models', 'engines', 'optimisation'], 0.7, 0.6, ZONE_INK.cluster, 'kubernetes cluster')
      zoneBox(['llmd', 'models', 'engines', 'optimisation', 'gpu'], 1.5, 1.3, 0x94a3b8, 'private network', 'max')

      /* ── Flow ── */
      const HOPS: [string, string][] = [
        ['clients', 'edge'], ['edge', 'gateway'], ['gateway', 'router'],
        ['router', 'llmd'], ['llmd', 'models'], ['models', 'engines'],
        ['engines', 'optimisation'], ['optimisation', 'gpu'],
      ]

      function pathFor(from: string, to: string) {
        const a = LAYOUT[from]
        const b = LAYOUT[to]
        const mid = (a.y - SLAB_H / 2 + b.y + SLAB_H / 2) / 2
        return [
          new T.Vector3(a.x, a.y - SLAB_H / 2, 0),
          new T.Vector3(a.x, mid, 0),
          new T.Vector3(b.x, mid, 0),
          new T.Vector3(b.x, b.y + SLAB_H / 2, 0),
        ]
      }

      for (const [from, to] of [...HOPS, ['router', 'frontier'] as [string, string]]) {
        const pts = pathFor(from, to)
        const flat: InstanceType<typeof T.Vector3>[] = []
        for (let i = 0; i < pts.length - 1; i++) flat.push(pts[i], pts[i + 1])
        const g = new T.BufferGeometry().setFromPoints(flat)
        const color = to === 'frontier' ? ZONE_INK.frontier : ZONE_INK.cluster
        const m = new T.LineBasicMaterial({ color, transparent: true, opacity: 0.45 })
        bin.push(g, m)
        scene.add(new T.LineSegments(g, m))
      }

      const pg = new T.SphereGeometry(0.1, 8, 8)
      const pm = new T.MeshBasicMaterial({ color: 0x8df0fb })
      bin.push(pg, pm)
      const packets = HOPS.map(([from, to], i) => {
        const m = new T.Mesh(pg, pm)
        scene.add(m)
        return { mesh: m, path: pathFor(from, to), t: -(i / HOPS.length) }
      })

      function walk(path: InstanceType<typeof T.Vector3>[], t: number) {
        const segs = path.length - 1
        const f = Math.min(Math.max(t, 0), 0.999) * segs
        const i = Math.floor(f)
        return path[i].clone().lerp(path[i + 1], f - i)
      }

      /* ── Picking ── */
      const ray = new T.Raycaster()
      const ptr = new T.Vector2()
      let hovered: string | null = null

      function emphasise(id: string | null) {
        pops.forEach((p, key) => {
          const on = key === id
          p.tScale = on ? 1.12 : 1
          p.tLift = on ? 0.55 : 0
          p.tPush = on ? 1.1 : 0
          p.tFade = id === null ? 1 : on ? 1 : 0.32
        })
      }

      function at(ev: PointerEvent) {
        const r = renderer.domElement.getBoundingClientRect()
        ptr.x = ((ev.clientX - r.left) / r.width) * 2 - 1
        ptr.y = -((ev.clientY - r.top) / r.height) * 2 + 1
        ray.setFromCamera(ptr, camera)
        return ray.intersectObjects(picks, false)[0]
      }

      api.current = { emphasise }

      function onMove(ev: PointerEvent) {
        const id = (at(ev)?.object.userData.tierId as string) ?? null
        if (id === hovered) return
        hovered = id
        emphasise(id)
        setHovered(id)
        renderer.domElement.style.cursor = id ? 'pointer' : 'grab'
      }

      function onClick(ev: PointerEvent) {
        const id = at(ev)?.object.userData.tierId as string | undefined
        setSelected(id ? ALL_TIERS.find(t => t.id === id) ?? null : null)
      }

      renderer.domElement.addEventListener('pointermove', onMove)
      renderer.domElement.addEventListener('click', onClick)
      window.addEventListener('resize', resize)
      resize()
      setStatus('ready')

      let raf = 0
      const clock = new T.Clock()
      let acc = 0, cur = 1240, target = 1240

      function frame() {
        raf = requestAnimationFrame(frame)
        const dt = clock.getDelta()
        if (!reduced) {
          for (const p of packets) {
            p.t += dt * 0.34
            if (p.t > 1.15) p.t -= 1.4
            p.mesh.visible = p.t >= 0 && p.t <= 1
            if (p.mesh.visible) p.mesh.position.copy(walk(p.path, p.t))
          }
          acc += dt
          if (acc > 0.25) {
            acc = 0
            if (Math.random() < 0.35) target = 1150 + Math.random() * 260
            cur += (target - cur) * 0.2
            setRps(Math.round(cur))
          }
        }
        // ease the hover pop
        const k = Math.min(1, dt * 11)
        pops.forEach(p => {
          p.scale += (p.tScale - p.scale) * k
          p.lift += (p.tLift - p.lift) * k
          p.push += (p.tPush - p.push) * k
          p.fade += (p.tFade - p.fade) * k

          p.group.scale.setScalar(p.scale)
          p.group.position.y = p.baseY + p.lift
          p.group.position.z = p.baseZ + p.push

          p.group.traverse(o => {
            const anyO = o as { isLineSegments?: boolean; isMesh?: boolean; material?: unknown }
            const m = anyO.material as InstanceType<typeof T.LineBasicMaterial> | undefined
            if (!m || (!anyO.isLineSegments && !anyO.isMesh)) return
            if (m.userData.base === undefined) m.userData.base = m.opacity
            m.opacity = m.userData.base * p.fade
          })
        })

        controls.update()
        renderer.render(scene, camera)
        labels.render(scene, camera)
      }
      frame()

      cleanup = () => {
        cancelAnimationFrame(raf)
        window.removeEventListener('resize', resize)
        renderer.domElement.removeEventListener('pointermove', onMove)
        renderer.domElement.removeEventListener('click', onClick)
        api.current = null
        controls.dispose()
        bin.forEach(d => d.dispose())
        renderer.dispose()
        mount.replaceChildren()
      }
    })()

    return () => { disposed = true; cleanup() }
  }, [])

  const active = selected?.id ?? hovered

  function focus(id: string | null) {
    setHovered(id)
    api.current?.emphasise(id)
  }

  return (
    <div className="grid h-full gap-4 lg:grid-cols-[minmax(0,1fr)_21rem]">
      {/* ── Scene ── */}
      <div className="relative">
        <div
          ref={mountRef}
          className="relative h-[clamp(380px,60vh,520px)] w-full overflow-hidden rounded-2xl lg:h-full border border-black/[0.07] bg-[#fbfbfc] dark:border-white/[0.06] dark:bg-[#07080c]"
          style={{ cursor: 'grab' }}
        />

        <div className="pointer-events-none absolute inset-0 p-5">
          <div className="flex items-start justify-between">
            <span className="font-mono text-[10px] tracking-[0.2em] text-slate-400 dark:text-slate-700">
              FIG 1
            </span>
            <span className="font-mono text-[10px] tracking-[0.2em] text-slate-400 dark:text-slate-600">
              LLM INFERENCE STACK
            </span>
          </div>
        </div>

        <div className="pointer-events-none absolute bottom-5 left-5 font-mono text-[10px] text-slate-400 dark:text-slate-700">
          drag to orbit · scroll to zoom · click a layer
        </div>
        <div className="pointer-events-none absolute bottom-5 right-5 font-mono text-[10px] tabular-nums text-slate-400 dark:text-slate-600">
          {rps.toLocaleString('en-US')} req/s
        </div>

        {status === 'loading' && (
          <div className="pointer-events-none absolute inset-0 grid place-items-center">
            <span className="font-mono text-xs text-slate-400 dark:text-slate-700">building stack…</span>
          </div>
        )}
        {status === 'unsupported' && (
          <div className="pointer-events-none absolute inset-0 grid place-items-center px-6 text-center">
            <span className="font-mono text-xs text-slate-500">
              WebGL isn&apos;t available here — the full topology is in the diagram on the home page.
            </span>
          </div>
        )}
      </div>

      {/* ── Detail, linked to the scene ──
          Annotations anchored in 3D always collided with the slabs, because an
          isometric slab projects far wider than any sane offset. Out here they
          stay readable, and hovering either side highlights the other. */}
      <aside className="rounded-2xl border border-black/[0.07] bg-white/60 p-1.5 dark:border-white/[0.06] dark:bg-white/[0.02] lg:max-h-full lg:overflow-y-auto">
        {ALL_TIERS.map(tier => {
          const on = active === tier.id
          return (
            <button
              key={tier.id}
              onMouseEnter={() => focus(tier.id)}
              onMouseLeave={() => focus(null)}
              onClick={() => setSelected(selected?.id === tier.id ? null : tier)}
              className={`w-full rounded-xl px-3 py-2.5 text-left transition-colors ${
                on
                  ? 'bg-cyan-50 dark:bg-cyan-400/[0.08]'
                  : 'hover:bg-black/[0.03] dark:hover:bg-white/[0.03]'
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-2 w-2 shrink-0 rounded-sm"
                  style={{ background: TIER_SWATCH[tier.zone] }}
                />
                <span
                  className={`font-mono text-[10px] font-semibold tracking-wide ${
                    on
                      ? 'text-cyan-700 dark:text-cyan-300'
                      : 'text-slate-800 dark:text-slate-200'
                  }`}
                >
                  {tier.label}
                </span>
              </div>

              <div className="mt-1 pl-4">
                {tier.lines.map(l => (
                  <div
                    key={l}
                    className="font-mono text-[9px] leading-[1.6] text-slate-500 dark:text-slate-500"
                  >
                    {l}
                  </div>
                ))}
              </div>

              {on && (
                <p className="mt-2 pl-4 text-[11px] leading-relaxed text-slate-600 dark:text-slate-400">
                  {tier.detail}
                </p>
              )}
            </button>
          )
        })}

        <div className="mt-1 rounded-xl border-t border-black/[0.06] px-3 py-2.5 dark:border-white/[0.06]">
          <div className="font-mono text-[8px] uppercase tracking-[0.18em] text-slate-400 dark:text-slate-700">
            Observability
          </div>
          <div className="mt-1 grid grid-cols-2 gap-x-3">
            {OBSERVABILITY.map(([kind, tool]) => (
              <div key={kind} className="font-mono text-[9px] text-slate-500 dark:text-slate-600">
                <span className="text-slate-400 dark:text-slate-700">{kind}</span> {tool}
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  )
}
