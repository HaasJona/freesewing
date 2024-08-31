import { back } from './back.mjs'

function draftPaulYoke({
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
  log,
  part,
}) {
  for (let id in paths) if (id !== 'sideSeam') delete paths[id]
  for (let id in snippets) delete snippets[id]

  let yokeCpDist = points.yokeRightRotated.dist(points.crossSeamCurveStart) * 0.2
  let yokeCpAngle = points.yokeRightRotated.angle(points.crossSeamCurveStart)
  points.yokeCp1 = points.dartTip.shift(yokeCpAngle, yokeCpDist)
  points.yokeCp2 = points.dartTip.shift(yokeCpAngle + 180, yokeCpDist)

  let waistCpDist = points.styleWaistOutRotated.dist(points.styleWaistIn) * 0.2
  let waistCpAngle = points.styleWaistOutRotated.angle(points.styleWaistIn)
  points.waistCp1 = points.backDartLeft.shift(waistCpAngle, waistCpDist)
  points.waistCp2 = points.backDartLeft.shift(waistCpAngle + 180, waistCpDist)

  function adjustPoint(pointId, pathCreator, expectedLength, stopAngle) {
    log.debug(`adjusting ${pointId} position`)
    for (let i = 0; i < 4; i++) {
      let tmp = pathCreator()
      let length = tmp.length()
      log.debug(`actual length: ${length}, expected length: ${expectedLength}`)
      let delta = expectedLength - length
      points[pointId] = points[pointId].shift(stopAngle, delta)
    }
  }

  // correct the seam lengths, so we match the back part and the waistband
  let drawYokeBottom = () =>
    new Path()
      .move(points.crossSeamCurveStart)
      .curve_(points.yokeCp1, points.dartTip)
      .curve_(points.yokeCp2, points.yokeRightRotated)
  adjustPoint(
    'yokeRightRotated',
    drawYokeBottom,
    store.get('yokeBottom'),
    points.yokeCp2.angle(points.yokeRightRotated)
  )

  let drawWaistband = () =>
    new Path()
      .move(points.styleWaistIn)
      .curve_(points.waistCp1, points.backDartLeft)
      .curve_(points.waistCp2, points.styleWaistOutRotated)
  adjustPoint(
    'styleWaistIn',
    drawWaistband,
    store.get('waistbandBack'),
    points.waistCp1.angle(points.styleWaistIn)
  )

  paths.yoke = new Path()
    .move(points.styleWaistIn)
    .line(points.crossSeamCurveStart)
    .join(drawYokeBottom())
    .line(points.styleWaistOutRotated)
    .join(drawWaistband().reverse())
    .close()
    .setClass('fabric')

  if (sa) {
    paths.sa = paths.yoke.offset(sa).setClass('fabric sa')
  }

  points.titleAnchor = points.styleWaistIn
    .shiftFractionTowards(points.dartTip, 0.5)
    .shiftFractionTowards(points.crossSeamCurveStart, 0.3)
  macro('title', {
    at: points.titleAnchor,
    nr: 4,
    scale: 0.5,
    title: 'yoke',
    align: 'center',
  })

  macro('grainline', {
    from: points.backDartLeft,
    to: points.dartTip,
  })

  return part
}

export const yoke = {
  name: 'paul.yoke',
  from: back,
  options: {},
  draft: draftPaulYoke,
}
