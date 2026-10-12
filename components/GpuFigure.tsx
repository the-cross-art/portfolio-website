'use client'

import AnatomyFigure, { type FigureData } from './AnatomyFigure'
import * as M from './generated/gpuFigure'

/* Binds one generated drawing to the figure component. Kept as its own module
   so each figure is a separate lazy chunk — the landing page never pays for
   one it does not show. */
const FIG: FigureData = {
  svg: M.FIGURE_SVG,
  viewBox: M.FIGURE_VIEWBOX,
  title: M.FIGURE_TITLE,
  fig: M.FIGURE_FIG,
  blurb: M.FIGURE_BLURB,
  readout: M.FIGURE_READOUT,
  stations: M.FIGURE_STATIONS,
  routes: M.FIGURE_ROUTES,
}

export default function GpuFigure() {
  return <AnatomyFigure fig={FIG} />
}
