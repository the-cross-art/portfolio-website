'use client'

import { useEffect, useState } from 'react'
import AsciiField from './AsciiField'
import HeroScatter from './HeroScatter'

/**
 * Picks the hero's backdrop on each load: mostly the character field, now and
 * then the scatter of reading notes, so the page is not identical every visit.
 *
 * The roll happens after mount, never during render. The server cannot know
 * the outcome, and rendering one backdrop on the server and the other on the
 * client is a hydration error, not a coin flip.
 */

/** Share of loads that get the character field. The rest get the scatter. */
const FIELD_SHARE = 0.7

/** The scatter is xl-only by design — below that it renders nothing at all. */
const WIDE = '(min-width: 1280px)'

type Pick = 'field' | 'scatter'

export default function HeroBackdrop() {
  const [pick, setPick] = useState<Pick | null>(null)

  useEffect(() => {
    // ?bg=field or ?bg=scatter forces one, for comparing them side by side
    const forced = new URLSearchParams(window.location.search).get('bg')
    if (forced === 'field' || forced === 'scatter') {
      setPick(forced)
      return
    }
    /* Rolling for the scatter on a narrow screen would buy a blank hero 30%
       of the time, so below xl the field is the only candidate. */
    const wide = window.matchMedia(WIDE).matches
    setPick(!wide || Math.random() < FIELD_SHARE ? 'field' : 'scatter')
  }, [])

  if (pick === null) return null
  return pick === 'field' ? <AsciiField /> : <HeroScatter />
}
