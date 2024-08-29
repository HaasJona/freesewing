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
  complete,
  part,
}) {
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

  paths.pocketFacingCurve = new Path()
    .move(points.styleWaistOut)
    .line(points.pocketFacingBottomCorner)
    .line(points.pocketFacingInnerCorner)
    .line(points.pocketFacingRightCorner)
    .line(points.styleWaistOut)
    .close()
    .addClass('fabric')

  if (sa) {
    paths.sa = paths.pocketFacingCurve.offset(sa).addClass('fabric sa')
  }

  store.cutlist.setCut({ cut: 2, from: 'fabric' })

  // Title
  points.titleAnchor = points.styleWaistOut.shiftFractionTowards(
    points.pocketFacingInnerCorner,
    0.5
  )
  macro('title', {
    at: points.titleAnchor,
    nr: 9,
    title: 'pocketFacing',
    align: 'center',
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
