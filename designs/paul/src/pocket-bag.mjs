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
  complete,
  part,
}) {
  for (let id in paths) if (id !== 'sideSeam') delete paths[id]
  for (let id in snippets) delete snippets[id]

  let pocketWidth = 0.6
  points.pocketTop = points.styleWaistOut.shiftFractionTowards(points.flyTop, pocketWidth)
  let height = 80
  let pocketCurveShape = 0.4
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

  let pocketDepth = 200
  let pocketBackLeftCurve = 0.4
  let pocketBackLeftCurveShape = 0.8
  let pocketSlant = 1 - 0.1
  points.pocketBagTop = points.pocketTop.shiftFractionTowards(points.flyTop, 0.5)
  points.pocketBagLeft = paths.sideSeam.shiftAlong(height + pocketDepth * pocketSlant)
  points.pocketBagBottom = points.pocketBagTop.shift(
    points.styleWaistOut.angle(points.styleWaistIn) - 90,
    pocketDepth + height
  )
  points.pocketBagTopCorner = paths.sideSeam.shiftAlong(
    height + pocketDepth * (1 - pocketBackLeftCurve)
  )
  points.pocketBagRightCorner = points.pocketBagLeft.shiftTowards(
    points.pocketBagBottom,
    pocketDepth * pocketBackLeftCurve
  )
  points.pocketBagCornerCp1 = points.pocketBagTopCorner.shiftFractionTowards(
    points.pocketBagLeft,
    pocketBackLeftCurveShape
  )
  points.pocketBagCornerCp2 = points.pocketBagRightCorner.shiftFractionTowards(
    points.pocketBagLeft,
    pocketBackLeftCurveShape
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
  draft: draftPaulPocketBag,
}
