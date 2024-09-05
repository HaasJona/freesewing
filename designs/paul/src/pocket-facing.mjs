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

  for (let id in paths) if (id !== 'sideSeam') delete paths[id]
  for (let id in snippets) delete snippets[id]

  let height = points.styleWaistOut.dist(points.seatOut) * options.pocketHeight
  points.pocketFacingBottomCorner = paths.sideSeam.shiftAlong(
    height * (1 + options.pocketFacingBonus)
  )
  points.pocketFacingRightCorner = points.styleWaistOut.shiftFractionTowards(
    points.flyTop,
    options.pocketWidth * (1 + options.pocketFacingBonus)
  )
  points.pocketFacingInnerCorner = points.pocketFacingBottomCorner.translate(
    points.styleWaistOut.dx(points.pocketFacingRightCorner),
    points.styleWaistOut.dy(points.pocketFacingRightCorner)
  )

  points.pocketFacingInnerCornerCurveStart = points.pocketFacingBottomCorner.shiftTowards(
    points.pocketFacingInnerCorner,
    height * options.pocketFacingBonus
  )
  points.pocketFacingInnerCornerCurveEnd = points.pocketFacingRightCorner.shiftTowards(
    points.pocketFacingInnerCorner,
    height * options.pocketFacingBonus
  )
  points.pocketFacingInnerCornerCp1 = points.pocketFacingInnerCorner.shiftTowards(
    points.pocketFacingBottomCorner,
    height * options.pocketCurveShape
  )
  points.pocketFacingInnerCornerCp2 = points.pocketFacingInnerCorner.shiftTowards(
    points.pocketFacingRightCorner,
    height * options.pocketCurveShape
  )

  paths.pocketFacingCurve = paths.sideSeam
    .split(points.pocketFacingBottomCorner)[0]
    .line(points.pocketFacingInnerCornerCurveStart)
    .curve(
      points.pocketFacingInnerCornerCp1,
      points.pocketFacingInnerCornerCp2,
      points.pocketFacingInnerCornerCurveEnd
    )
    .line(points.pocketFacingRightCorner)
    .line(points.styleWaistOut)
    .close()
    .setClass('fabric')

  if (sa) {
    paths.sa = paths.pocketFacingCurve.offset(sa).setClass('fabric sa')
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
