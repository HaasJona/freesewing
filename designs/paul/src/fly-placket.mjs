import { flyFacing } from './fly-facing.mjs'

function draftPaulFlyPlacket({
  points,
  paths,
  Point,
  Path,
  Snippet,
  macro,
  options,
  complete,
  snippets,
  store,
  sa,
  part,
}) {
  macro('mirror', {
    mirror: [points.styleWaistIn, points.flyBottom],
    points: ['flyTop', 'flyCurveStart', 'flyCurveCp2', 'flyCurveCp1'],
  })

  points.upperCenter = points.styleWaistIn.shiftFractionTowards(points.mirroredFlyTop, 0.5)
  points.lowerCenter = points.flyBottom.shiftFractionTowards(points.mirroredFlyCurveStart, 0.5)
  points.upperButton = points.upperCenter.shiftTowards(
    points.lowerCenter,
    points.styleWaistIn.dx(points.mirroredFlyTop) / 2
  )
  points.lowerButton = new Point(points.upperButton.x, points.mirroredFlyCurveStart.y)

  for (let i = 0; i < options.buttons; i++) {
    let frac = i / (options.buttons - 1)
    points['button' + i] = points.upperButton.shiftFractionTowards(points.lowerButton, frac)
    snippets['button' + i] = new Snippet('buttonhole', points['button' + i])
      .attr('data-scale', 2)
      .attr('data-rotate', 90)
  }

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
  options: {
    buttons: {
      count: 4,
      min: 2,
      max: 8,
    },
  },
  draft: draftPaulFlyPlacket,
}
