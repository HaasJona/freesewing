import { front } from './front.mjs'

function draftPaulPocketBag({
  points,
  Point,
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
  for (let id in paths) if (id !== 'sideSeam') delete paths[id]
  for (let id in snippets) delete snippets[id]

  let pocketWidth = options.pocketWidth
  points.pocketTop = points.styleWaistOut.shiftFractionTowards(points.flyTop, pocketWidth)
  let height = points.styleWaistOut.dist(points.seatOut) * options.pocketHeight
  let pocketCurveShape = options.pocketCurveShape
  points.pocketLeft = paths.sideSeam.shiftAlong(height)
  points.pocketCorner = points.pocketTop.translate(0, points.styleWaistOut.dy(points.pocketLeft))
  points.pocketCornerCp1 = points.pocketCorner.shiftTowards(
    points.pocketTop,
    height * pocketCurveShape
  )
  points.pocketCornerCp2 = points.pocketCorner.shiftTowards(
    points.pocketLeft,
    height * pocketCurveShape
  )

  paths.pocketCurve = new Path()
    .move(points.pocketTop)
    .curve(points.pocketCornerCp1, points.pocketCornerCp2, points.pocketLeft)
    .hide()

  let pocketDepth = points.styleWaistOut.dist(points.seatOut) * options.pocketDepth
  let pocketBagLeftCurve = options.pocketBagCurve * 0.5
  let pocketBagLeftCurveShape = options.pocketBagCurveShape
  let pocketSlant = 1 - options.pocketBagSlant
  points.pocketBagTop = points.pocketTop.shiftFractionTowards(points.flyTop, options.pocketBagWidth)
  points.pocketBagLeft = paths.sideSeam.shiftAlong(height + pocketDepth * pocketSlant)
  points.pocketBagBottom = points.pocketBagTop.shift(
    points.styleWaistOut.angle(points.styleWaistIn) - 90,
    pocketDepth + height
  )
  points.pocketBagTopCorner = paths.sideSeam.shiftAlong(
    height + pocketDepth * (1 - pocketBagLeftCurve) * pocketSlant
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
    mirror: [points.pocketBagTop, points.pocketBagBottom],
  })

  let sideSeamA = paths.sideSeam.split(points.pocketBagTopCorner)[0]
  let sideSeamB = sideSeamA.split(points.pocketLeft)[1]
  paths.pocketBagCurve = sideSeamB
    .curve(points.pocketBagCornerCp1, points.pocketBagCornerCp2, points.pocketBagRightCorner)
    .line(points.pocketBagBottom)
    .line(points.mirroredPocketBagRightCorner)
    .curve(
      points.mirroredPocketBagCornerCp2,
      points.mirroredPocketBagCornerCp1,
      points.mirroredPocketBagTopCorner
    )
    .line(points.mirroredStyleWaistOut)
    .line(points.mirroredPocketBagTop)
    .line(points.pocketTop)
    .join(paths.pocketCurve)
    .close()
    .addClass('lining')

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
    pocketWidth: 0.6,
    pocketHeight: 0.8,
    pocketCurveShape: 0.15,
    pocketDepth: 2,
    pocketBagCurve: 0.5,
    pocketBagCurveShape: 0.5,
    pocketBagSlant: 0.0,
    pocketBagWidth: 0.9,
  },
  draft: draftPaulPocketBag,
}
