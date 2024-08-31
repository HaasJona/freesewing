import { front } from './front.mjs'

function draftPaulPocketBag({
  points,
  Point,
  measurements,
  paths,
  Path,
  macro,
  snippets,
  store,
  sa,
  options,
  complete,
  part,
}) {
  for (let id in paths) if (id !== 'sideSeam' && id !== 'pocketCurve') delete paths[id]
  for (let id in snippets) delete snippets[id]

  let height = points.styleWaistOut.dist(points.seatOut) * options.pocketHeight

  let pocketDepth = measurements.waistToUpperLeg * options.pocketDepth
  let pocketBagLeftCurve = options.pocketBagCurve * 0.5
  let pocketBagLeftCurveShape = options.pocketBagCurveShape
  let pocketBagSlant = 1 - options.pocketBagSlant
  points.pocketBagTop = points.pocketTop.shiftFractionTowards(points.flyTop, options.pocketBagWidth)
  points.pocketBagLeft = paths.sideSeam.shiftAlong(height + pocketDepth * pocketBagSlant)
  points.pocketBagBottom = points.pocketBagTop.shift(
    points.styleWaistOut.angle(points.styleWaistIn) - 90,
    pocketDepth + height
  )
  points.pocketBagTopCorner = paths.sideSeam.shiftAlong(
    height + pocketDepth * (1 - pocketBagLeftCurve) * pocketBagSlant
  )
  points.pocketBagRightCorner = points.pocketBagLeft.shiftTowards(
    points.pocketBagBottom,
    pocketDepth * pocketBagLeftCurve
  )
  points.pocketBagCornerCp1 = points.pocketBagTopCorner.shiftFractionTowards(
    points.pocketBagLeft,
    pocketBagLeftCurveShape
  )
  points.pocketBagCornerCp2 = points.pocketBagRightCorner.shiftFractionTowards(
    points.pocketBagLeft,
    pocketBagLeftCurveShape
  )

  paths.sideSeamA = paths.sideSeam.split(points.pocketBagTopCorner)[0].hide()
  paths.sideSeamB = paths.sideSeamA.split(points.pocketLeft)[1].hide()

  macro('mirror', {
    points: [
      'pocketBagTop',
      'pocketBagLeft',
      'pocketBagBottom',
      'pocketBagTopCorner',
      'pocketBagRightCorner',
      'pocketBagCornerCp1',
      'pocketBagCornerCp2',
      'styleWaistOut',
    ],
    paths: ['sideSeamA'],
    mirror: [points.pocketBagTop, points.pocketBagBottom],
  })

  paths.pocketBagCurve = paths.sideSeamB
    .curve(points.pocketBagCornerCp1, points.pocketBagCornerCp2, points.pocketBagRightCorner)
    .line(points.pocketBagBottom)
    .line(points.mirroredPocketBagRightCorner)
    .curve(
      points.mirroredPocketBagCornerCp2,
      points.mirroredPocketBagCornerCp1,
      points.mirroredPocketBagTopCorner
    )
    .join(paths.mirroredSideSeamA.reverse())
    .line(points.mirroredStyleWaistOut)
    .line(points.mirroredPocketBagTop)
    .line(points.pocketTop)
    .join(paths.pocketCurve)
    .close()
    .addClass('lining')

  if (sa) {
    paths.sa = paths.pocketBagCurve.offset(sa).addClass('lining sa')
  }

  if (complete) {
    paths.center = new Path()
      .move(points.pocketBagTop)
      .line(points.pocketBagBottom)
      .addClass('lining help')
  }

  store.cutlist.setCut({ cut: 2, from: 'lining' })

  // Title
  points.titleAnchor = points.pocketCorner.shiftFractionTowards(points.pocketBagRightCorner, 0.5)
  macro('title', {
    at: points.titleAnchor,
    nr: 9,
    title: 'pocketBag',
    align: 'center',
  })

  return part
}

export const pocketBag = {
  name: 'paul.pocketBag',
  from: front,
  options: {
    pocketBagCurve: 0.5,
    pocketBagCurveShape: 0.5,
    pocketBagSlant: 0.0,
    pocketBagWidth: 0.9,
  },
  draft: draftPaulPocketBag,
}
