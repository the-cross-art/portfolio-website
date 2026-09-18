'use client'

import { useState, useEffect } from 'react'
import { useTheme } from './ThemeProvider'

const links = [
  { href: '#about',    label: 'about'    },
  { href: '#work',     label: 'work'     },
  { href: '#projects', label: 'projects' },
  { href: '#writing',  label: 'writing'  },
  { href: '#contact',  label: 'contact'  },
]

function SunIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { theme, toggle } = useTheme()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#f7f8fa]/90 dark:bg-[#0a0a0f]/90 backdrop-blur-md border-b border-black/[0.05] dark:border-white/[0.05]'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="font-mono text-sm text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 dark:hover:text-cyan-300 transition-colors">
          meimran.me
        </a>

        {/* Desktop links + theme toggle */}
        <div className="hidden md:flex items-center gap-7">
          {links.map(l => (
            <a
              key={l.href}
              href={l.href}
              className="font-mono text-sm text-slate-500 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
            >
              {l.label}
            </a>
          ))}

          {/* Theme toggle */}
          <button
            onClick={toggle}
            className="text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors p-1"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>

          <a
            href="https://www.dropbox.com/scl/fi/rff4d1qic60bwgkodgo0q/imran_resume_mle.pdf?rlkey=00tq7rj7ltju1yqzw9in9ttpw&st=x9pgfz91&dl=0"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs px-3 py-1.5 border border-cyan-400/40 dark:border-cyan-400/30 text-cyan-600 dark:text-cyan-400 rounded-md hover:bg-cyan-50 dark:hover:bg-cyan-400/10 transition-all"
          >
            resume ↗
          </a>
        </div>

        {/* Mobile row: theme toggle + hamburger */}
        <div className="md:hidden flex items-center gap-3">
          <button
            onClick={toggle}
            className="text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors p-1"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>

          <button
            className="flex flex-col gap-1.5 p-1"
            onClick={() => setMenuOpen(v => !v)}
            aria-label="Toggle menu"
          >
            <span className={`block w-5 h-px bg-slate-500 dark:bg-slate-400 transition-all duration-200 ${menuOpen ? 'rotate-45 translate-y-[10px]' : ''}`} />
            <span className={`block w-5 h-px bg-slate-500 dark:bg-slate-400 transition-all duration-200 ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-5 h-px bg-slate-500 dark:bg-slate-400 transition-all duration-200 ${menuOpen ? '-rotate-45 -translate-y-[4px]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="md:hidden border-t border-black/[0.05] dark:border-white/[0.05] bg-[#f7f8fa] dark:bg-[#0f0f18] px-6 py-5 flex flex-col gap-5">
          {links.map(l => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className="font-mono text-sm text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
            >
              {l.label}
            </a>
          ))}
          <a
            href="https://www.dropbox.com/scl/fi/rff4d1qic60bwgkodgo0q/imran_resume_mle.pdf?rlkey=00tq7rj7ltju1yqzw9in9ttpw&st=x9pgfz91&dl=0"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-sm text-cyan-600 dark:text-cyan-400"
          >
            resume ↗
          </a>
        </div>
      )}
    </nav>
  )
}
