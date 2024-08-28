import { front } from './front.mjs'

function draftPaulFlyFacing({ points, Point, paths, Path, macro, snippets, store, sa, part }) {
  // Clean up
  for (let id in paths) delete paths[id]
  for (let id in snippets) delete snippets[id]

  // Anchor for sampling/grid
  points.anchor = points.flyTop.clone()

  // rotate all points so the fly is upright
  let rotAngle = 90 - points.flyBottom.angle(points.styleWaistIn)
  const rotPoints = [
    'flyCurveStart',
    'flyCurveCp2',
    'flyCurveCp1',
    'flyBottom',
    'flyTop',
    'styleWaistIn',
  ]
  for (const p of rotPoints) {
    points[p] = points[p].rotate(rotAngle, points.anchor)
  }

  paths.saBase = new Path()
    .move(points.flyBottom)
    .line(points.styleWaistIn)
    .line(points.flyTop)
    .hide()

  paths.seam = paths.saBase
    .clone()
    .line(points.flyCurveStart)
    .curve(points.flyCurveCp2, points.flyCurveCp1, points.flyBottom)
    .close()
    .unhide()
    .addClass('fabric')

  if (sa)
    paths.sa = paths.saBase
      .offset(sa)
      .line(points.flyTop)
      .reverse()
      .line(points.flyBottom)
      .unhide()
      .addClass('sa fabric')

  /*
   * Annotations
   */
  store.cutlist.setCut({ cut: 1, from: 'fabric' })

  // Grainline
  points.grainlineTop = points.flyTop.shiftFractionTowards(points.styleWaistIn, 0.5)
  points.grainlineBottom = new Point(points.grainlineTop.x, points.flyCurveCp2.y)
  macro('grainline', {
    from: points.grainlineTop,
    to: points.grainlineBottom,
  })

  // Title
  points.titleAnchor = points.grainlineTop.shiftFractionTowards(points.grainlineBottom, 0.5)
  macro('title', {
    at: points.titleAnchor,
    nr: 9,
    title: 'flyFacing',
    align: 'center',
    scale: 0.5,
  })

  return part
}

export const flyFacing = {
  name: 'paul.flyFacing',
  from: front,
  draft: draftPaulFlyFacing,
}
