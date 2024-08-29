import { flyFacing } from './fly-facing.mjs'

function draftPaulFlyPlacket({
  points,
  paths,
  Point,
  Path,
  Snippet,
  macro,
  options,
  expand,
  snippets,
  store,
  sa,
  part,
}) {
  macro('mirror', {
    mirror: [points.styleWaistIn, points.flyBottom],
    points: ['flyTop', 'flyCurveStart', 'flyCurveCp2', 'flyCurveCp1'],
  })
  macro('rmgrainline')

  let topStitchDist = (1 - options.flyWidth) * 8

  points.top = points.styleWaistIn.translate(options.placketOffset, 0)
  points.bottom = points.flyBottom.translate(options.placketOffset, 0)

  points.upperCenter = points.styleWaistIn
    .shiftFractionTowards(points.mirroredFlyTop, 0.5)
    .shiftTowards(points.styleWaistIn, topStitchDist / 2)
  points.lowerCenter = points.flyBottom
    .shiftFractionTowards(points.mirroredFlyCurveStart, 0.5)
    .shiftTowards(points.flyBottom, topStitchDist / 2)
  points.upperButton = points.upperCenter.shiftTowards(
    points.lowerCenter,
    points.styleWaistIn.dx(points.mirroredFlyTop) / 2
  )
  points.lowerButton = new Point(points.upperButton.x, points.mirroredFlyCurveStart.y)

  let buttons = options.buttons * 1
  for (let i = 0; i < buttons; i++) {
    let frac = (i + 0.5) / buttons
    points['button' + i] = points.upperButton.shiftFractionTowards(points.lowerButton, frac)
    snippets['button' + i] = new Snippet('buttonhole', points['button' + i])
      .attr('data-scale', 1.5)
      .attr('data-rotate', 90)
  }

  paths.seam = new Path()
    .move(points.bottom)
    .curve(points.mirroredFlyCurveCp1, points.mirroredFlyCurveCp2, points.mirroredFlyCurveStart)
    .line(points.mirroredFlyTop)
    .line(points.top)
    .close()
    .addClass('fabric')

  if (sa)
    paths.sa = new Path()
      .move(points.mirroredFlyTop)
      .line(points.mirroredFlyTop.translate(0, -sa))
      .line(points.top.translate(0, -sa))
      // .line(points.flyTop.translate(0, -sa))
      .line(points.top)
      .addClass('fabric sa')

  // if (complete) {
  //   paths.fold = new Path()
  //     .move(points.styleWaistIn)
  //     .line(points.flyBottom)
  //     .attr('class', 'fabric help')
  // }

  /*
   * Annotations
   */
  // Cut list
  store.cutlist.setCut({ cut: 1, from: 'fabric', onFold: true })
  store.cutlist.addCut({ cut: 1, from: 'interfacing', onFold: false })

  // Cut on fold
  macro('cutonfold', {
    from: points.top,
    to: points.bottom,
    grainline: true,
    offset: 10,
  })

  // Title
  points.titleAnchor = points.upperCenter.shiftFractionTowards(points.lowerCenter, 0.5)
  macro('title', {
    at: points.titleAnchor,
    nr: 13,
    title: 'flyPlacket',
    align: 'center',
    scale: 0.3,
    rotation: -11,
  })

  return part
}

export const flyPlacket = {
  name: 'paul.flyPlacket',
  from: flyFacing,
  options: {
    buttons: {
      count: 3,
      min: 1,
      max: 5,
      menu: 'style',
    },
    placketOffset: 1.5,
  },
  draft: draftPaulFlyPlacket,
}
