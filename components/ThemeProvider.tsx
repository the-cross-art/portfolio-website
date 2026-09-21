'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'dark' | 'light'

/** Optional origin point so the toggle can reveal from the button. */
type Toggle = (origin?: { x: number; y: number }) => void

const Ctx = createContext<{ theme: Theme; toggle: Toggle }>({
  theme: 'dark',
  toggle: () => {},
})
export const useTheme = () => useContext(Ctx)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark')

  useEffect(() => {
    const stored = localStorage.getItem('theme') as Theme | null
    const t: Theme = stored ?? 'dark'
    setTheme(t)
    document.documentElement.classList.toggle('dark', t === 'dark')
    // Enable colour transitions only after first paint, so loading the
    // page doesn't animate every element from the wrong colour.
    requestAnimationFrame(() => {
      document.documentElement.classList.add('theme-ready')
    })
  }, [])

  const toggle: Toggle = origin => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'

    const apply = () => {
      localStorage.setItem('theme', next)
      document.documentElement.classList.toggle('dark', next === 'dark')
      setTheme(next)
    }

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const startViewTransition = (
      document as Document & {
        startViewTransition?: (cb: () => void) => { ready: Promise<void> }
      }
    ).startViewTransition?.bind(document)

    if (!startViewTransition || reduced || !origin) {
      apply()
      return
    }

    // Circular wipe outward from the toggle button.
    const { x, y } = origin
    const radius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    )

    startViewTransition(apply).ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`],
        },
        {
          duration: 480,
          easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
          pseudoElement: '::view-transition-new(root)',
        },
      )
    })
  }

  return <Ctx.Provider value={{ theme, toggle }}>{children}</Ctx.Provider>
}
