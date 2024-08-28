import { flyFacing } from './fly-facing.mjs'

function draftPaulFlyPlacket({ points, paths, Path, macro, complete, store, sa, part }) {
  macro('mirror', {
    mirror: [points.styleWaistIn, points.flyBottom],
    points: ['flyTop', 'flyCurveStart', 'flyCurveCp2', 'flyCurveCp1'],
  })

  paths.seam = new Path()
    .move(points.flyTop)
    .line(points.flyCurveStart)
    .curve(points.flyCurveCp2, points.flyCurveCp1, points.flyBottom)
    .curve(points.mirroredFlyCurveCp1, points.mirroredFlyCurveCp2, points.mirroredFlyCurveStart)
    .line(points.mirroredFlyTop)
    .line(points.styleWaistIn)
    .close()
    .addClass('fabric')

  if (sa)
    paths.sa = new Path()
      .move(points.mirroredFlyTop)
      .line(points.mirroredFlyTop.translate(0, -sa))
      .line(points.styleWaistIn.translate(0, -sa))
      .line(points.flyTop.translate(0, -sa))
      .line(points.flyTop)
      .addClass('fabric sa')

  if (complete) {
    paths.fold = new Path()
      .move(points.styleWaistIn)
      .line(points.flyBottom)
      .attr('class', 'fabric help')
  }

  /*
   * Annotations
   */
  store.cutlist.setCut({ cut: 1, from: 'fabric' })

  // Title
  points.titleAnchor = points.grainlineTop.shiftFractionTowards(points.grainlineBottom, 0.5)
  macro('title', {
    at: points.titleAnchor,
    nr: 13,
    title: 'flyPlacket',
    align: 'center',
    scale: 0.5,
  })

  return part
}

export const flyPlacket = {
  name: 'paul.flyPlacket',
  from: flyFacing,
  draft: draftPaulFlyPlacket,
}
