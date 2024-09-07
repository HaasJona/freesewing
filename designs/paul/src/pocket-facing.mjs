import { pocketBag } from './pocket-bag.mjs'

function draftPaulPocketFacing({
  points,
  Point,
  paths,
  Path,
  macro,
  snippets,
  store,
  sa,
  options,
  expand,
  units,
  utils,
  part,
}) {
  if (!options.frontPockets) {
    return part.hide()
  }

  for (let id in paths) if (id !== 'sideSeam' && id !== 'pocketCurve') delete paths[id]
  for (let id in snippets) delete snippets[id]

  let height = points.styleWaistOut.dist(points.seatOut) * options.pocketHeight
  const bonusHeight = height * (1 + options.pocketFacingBonus)
  points.pocketFacingBottomCorner = paths.sideSeam.shiftAlong(bonusHeight)
  points.pocketFacingRightCorner = points.styleWaistOut.shiftFractionTowards(
    points.flyTop,
    options.pocketWidth * (1 + options.pocketFacingBonus)
  )
  points.pocketFacingInnerCorner = points.pocketFacingBottomCorner.translate(
    points.styleWaistOut.dx(points.pocketFacingRightCorner),
    points.styleWaistOut.dy(points.pocketFacingRightCorner)
  )
  //
  // points.pocketFacingInnerCornerCurveStart = points.pocketFacingBottomCorner.shiftTowards(
  //   points.pocketFacingInnerCorner,
  //   height * options.pocketFacingBonus
  // )
  // points.pocketFacingInnerCornerCurveEnd = points.pocketFacingRightCorner.shiftTowards(
  //   points.pocketFacingInnerCorner,
  //   height * options.pocketFacingBonus
  // )
  // points.pocketFacingInnerCornerCp1 = points.pocketFacingInnerCorner.shiftTowards(
  //   points.pocketFacingBottomCorner,
  //   height * options.pocketCurveShape
  // )
  // points.pocketFacingInnerCornerCp2 = points.pocketFacingInnerCorner.shiftTowards(
  //   points.pocketFacingRightCorner,
  //   height * options.pocketCurveShape
  // )

  const curve = paths.pocketCurve.reverse().offset(bonusHeight - height)
  const sideSeam = paths.sideSeam.split(points.pocketFacingBottomCorner)[0]
  paths.pocketFacingCurve = new Path()
    .move(curve.end())
    .line(points.styleWaistOut)
    .join(sideSeam)
    .join(curve)
    .close()
    .setClass('fabric')

  if (sa) {
    paths.sa = new Path()
      .move(curve.end())
      .line(points.styleWaistOut)
      .join(sideSeam)
      .offset(sa)
      .line(curve.start())
      .reverse()
      .line(curve.end())
      .reverse()
      .setClass('fabric sa')
  }

  // Title
  points.center = points.styleWaistOut.shiftFractionTowards(points.pocketFacingInnerCorner, 0.5)

  points.grainlineTop = points.styleWaistOut.shiftFractionTowards(
    points.pocketFacingRightCorner,
    0.3
  )
  points.grainlineBottom = utils.beamIntersectsX(
    points.pocketFacingInnerCorner,
    points.pocketFacingBottomCorner,
    points.grainlineTop.x
  )

  // straighten part
  // const rotAngle = -points.styleWaistOut.angle(points.pocketFacingRightCorner)
  // paths.pocketFacingCurve = paths.pocketFacingCurve
  //   .rotate(rotAngle, points.center)
  //   .addClass('fabric')
  // if (sa) paths.sa = paths.sa.rotate(rotAngle, points.center).addClass('fabric sa')
  // points.grainlineTop = points.grainlineTop.rotate(rotAngle, points.center)
  // points.grainlineBottom = points.grainlineBottom.rotate(rotAngle, points.center)

  store.cutlist.setCut({ cut: 2, from: 'fabric' })

  macro('title', {
    at: points.center,
    nr: 9,
    title: 'pocketFacing',
    align: 'center',
  })

  macro('grainline', {
    from: points.grainlineTop,
    to: points.grainlineBottom,
  })

  return part
}

export const pocketFacing = {
  name: 'paul.pocketFacing',
  from: pocketBag,
  options: {
    pocketFacingBonus: 0.4,
  },
  draft: draftPaulPocketFacing,
}
