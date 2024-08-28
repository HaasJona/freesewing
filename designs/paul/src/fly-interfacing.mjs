import { flyFacing } from './fly-facing.mjs'

function draftPaulFlyInterfacing({ points, paths, Path, macro, complete, store, sa, part }) {
  macro('rmgrainline')

  paths.seam = new Path()
    .move(points.flyTop)
    .line(points.flyCurveStart)
    .curve(points.flyCurveCp2, points.flyCurveCp1, points.flyBottom)
    .line(points.styleWaistIn)
    .close()
    .addClass('interfacing')

  if (sa)
    paths.sa = new Path()
      .move(points.styleWaistIn)
      .line(points.styleWaistIn.translate(0, -sa))
      .line(points.flyTop.translate(0, -sa))
      .line(points.flyTop)
      .addClass('interfacing sa')

  /*
   * Annotations
   */
  store.cutlist.setCut({ cut: 2, from: 'interfacing' })

  // Title
  points.titleAnchor = points.grainlineTop.shiftFractionTowards(points.grainlineBottom, 0.5)
  macro('title', {
    at: points.titleAnchor,
    nr: 15,
    title: 'flyInterfacing',
    align: 'center',
    scale: 0.5,
  })

  return part
}

export const flyInterfacing = {
  name: 'paul.flyInterfacing',
  from: flyFacing,
  draft: draftPaulFlyInterfacing,
}
