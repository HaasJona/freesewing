import { back as titanBack } from '@freesewing/titan'
import { front } from './front.mjs'
import { hidePresets } from '@freesewing/core'

function draftPaulBack({
  points,
  Point,
  paths,
  Path,
  options,
  measurements,
  store,
  macro,
  snippets,
  Snippet,
  sa,
  log,
  units,
  utils,
  part,
}) {
  // Adapt bottom leg width based on heel & heel ease
  let quarterHeel = (measurements.heel * (1 + options.heelEase) * options.legBalance) / 2
  points.floorOut = points.floor.shift(0, quarterHeel)
  points.floorIn = points.floor.shift(180, quarterHeel)

  /*
   * Helper method to draw the outline path
   */
  const drawPath = (yoke = false) => {
    let waistIn = points.styleWaistIn || points.waistIn
    let result = drawOutseam(yoke)
    if (!yoke) {
      result = result
        .curve(points.outCp, points.backDartRightCp, points.backDartRight)
        .noop('dart')
        .line(points.backDartLeft)
        .curve(points.backDartLeftCp, points.cbCp, waistIn)
        .line(points.crossSeamCurveStart)
    } else {
      result = result
        .curve_(points.yokeCp2, points.dartTip)
        .curve_(points.yokeCp1, points.crossSeamCurveStart)
    }
    return result
      .curve(points.crossSeamCurveCp1, points.crossSeamCurveCp2, points.fork)
      .join(drawInseam())
  }

  function drawInseam() {
    return new Path()
      .move(points.fork)
      .curve(
        points.forkCp2,
        points.floorIn.translate(0, points.floorOut.dy(points.kneeIn) * options.heelShape),
        points.floorIn
      )
  }

  function drawOutseam(yoke = false) {
    let outSeam = new Path()
      .move(points.floorOut)
      .curve(
        points.floorOut.translate(0, points.floorOut.dy(points.kneeIn) * options.heelShape),
        points.seatOutCp1,
        points.seatOut
      )
      .curve_(points.seatOutCp2, points.styleWaistOut)
    if (yoke) {
      return outSeam.split(points.yokeRight)[0]
    }
    return outSeam
  }

  /*
   * Helper method to calculate the inseam delta
   */
  const inseamDelta = () => drawInseam().length() - store.get('frontInseamLength')
  /*
   * Helper method to calculate the outseam delta
   */
  const outseamDelta = () => drawOutseam().length() - store.get('frontOutseamLength')

  // Our style changes will have influenced the inseam & outseam a bit
  // but not enough to do a full slash & rotate. So let's just fix the
  // inseam, and then lengthen/shorten the outseam at the waist
  let dIn = inseamDelta()
  points.floor = points.floor.shift(90, dIn)
  points.floorIn = points.floorIn.shift(90, dIn)
  points.floorOut = points.floorOut.shift(90, dIn)
  points.grainlineBottom = points.grainlineBottom.shift(90, dIn)
  points.styleWaistOut = points.floorOut.shiftOutwards(points.styleWaistOut, outseamDelta() * -1)

  // Mark back pocket
  let base = points.styleWaistIn.dist(points.styleWaistOut)
  let angle = points.styleWaistIn.angle(points.styleWaistOut)
  store.set('backPocketToWaistband', base * options.backPocketVerticalPlacement)
  store.set('backPocketWidth', base * options.backPocketWidth)
  store.set('backPocketDepth', base * options.backPocketDepth)
  points.dartCenter = points.styleWaistIn.shiftFractionTowards(
    points.styleWaistOut,
    options.backPocketHorizontalPlacement
  )
  points.dartPilot = points.dartCenter.shift(angle - 90, 666)
  points.dartTip = utils
    .beamsIntersect(points.dartCenter, points.dartPilot, points.cbSeat, points.seatOut)
    .shiftFractionTowards(points.dartCenter, 1 - options.backDartDepth)

  // Back dart
  points.tmp1 = points.dartCenter.rotate(options.backDartAngle, points.dartTip)
  points.tmp2 = points.dartCenter.rotate(-options.backDartAngle, points.dartTip)
  points.backDartLeft = points.dartTip.shiftFractionTowards(points.tmp1, 1.05)
  points.backDartRight = points.dartTip.shiftFractionTowards(points.tmp2, 1.05)
  let newBase =
    points.styleWaistIn.dist(points.backDartLeft) + points.styleWaistOut.dist(points.backDartRight)
  let delta = base - newBase
  // Adapt waist to new darted reality
  for (let p of ['styleWaistIn', 'crossSeamCurveStart', 'crossSeamCurveCp1']) {
    points[p] = points[p].shift(angle + 180, delta / 2)
  }
  points.styleWaistOut = points.styleWaistOut.shift(angle, delta / 2)

  // Keep the seat control point vertically between the (lowered) waist and seat line
  points.seatOutCp2.y = points.styleWaistOut.y + points.styleWaistOut.dy(points.seatOut) / 2

  // Shape waist
  let dist = points.styleWaistOut.dist(points.dartCenter) / 3
  points.cbCp = points.styleWaistIn
    .shiftTowards(points.crossSeamCurveStart, dist)
    .rotate(90, points.styleWaistIn)
  points.backDartLeftCp = points.backDartLeft
    .shiftTowards(points.dartTip, dist)
    .rotate(-90, points.backDartLeft)
  points.backDartRightCp = points.backDartRight
    .shiftTowards(points.dartTip, dist)
    .rotate(90, points.backDartRight)
  points.outCp = points.styleWaistOut
    .shiftTowards(points.seatOut, dist)
    .rotate(-90, points.styleWaistOut)

  // Store waistband length
  store.set(
    'waistbandBack',
    new Path()
      .move(points.styleWaistIn)
      .curve(points.cbCp, points.backDartLeftCp, points.backDartLeft)
      .length() +
      new Path()
        .move(points.backDartRight)
        .curve(points.backDartRightCp, points.outCp, points.styleWaistOut)
        .length()
  )

  store.set('legWidthBack', points.floorIn.dist(points.floorOut))

  points.yokeRight = drawOutseam()
    .reverse()
    .shiftAlong(points.styleWaistOut.dist(points.seatOut) * options.yokeOuterWidth)
  let yokeCpDist = points.yokeRight.dist(points.crossSeamCurveStart) * 0.2
  let yokeCpAngle = points.yokeRight.angle(points.crossSeamCurveStart)
  points.yokeCp1 = points.dartTip.shift(yokeCpAngle, yokeCpDist)
  points.yokeCp2 = points.dartTip.shift(yokeCpAngle + 180, yokeCpDist)
  points.yokeRightRotated = points.yokeRight.rotate(options.backDartAngle * 2, points.dartTip)
  points.styleWaistOutRotated = points.styleWaistOut.rotate(
    options.backDartAngle * 2,
    points.dartTip
  )

  store.set(
    'yokeBottom',
    new Path()
      .move(points.yokeRight)
      .curve_(points.yokeCp2, points.dartTip)
      .curve_(points.yokeCp1, points.crossSeamCurveStart)
      .length()
  )

  // Anchor for sampling/grid
  // This breaks the samples for reason not clear. See #
  // points.anchor = points.fork.clone()

  paths.saBase = drawPath(true)
  paths.seam = paths.saBase
    .insop('dart', new Path().line(points.dartTip))
    .close()
    .attr('class', 'fabric')
  paths.saBase.hide()

  if (sa)
    paths.sa = paths.saBase
      .offset(sa)
      .join(
        new Path()
          .move(points.floorIn)
          .line(points.floorOut)
          .offset(sa * 6)
      )
      .close()
      .addClass('fabric sa')

  // Sanity check, to make sure inseams and outseams match front and back
  const backInseamLength = drawInseam().length()
  const frontInseamLength = store.get('frontInseamLength')
  const inseamDiff = frontInseamLength - backInseamLength
  let inseamDesc = 'Paul back inseam is longer than front'
  if (inseamDiff > 0) inseamDesc = 'Paul front inseam is longer than back'
  if (Math.abs(inseamDiff) > 1) {
    log.warn(inseamDesc + ' by ' + utils.round(Math.abs(inseamDiff)) + ' mm')
    log.debug('Paul frontInseam: ' + utils.round(frontInseamLength).toString())
    log.debug('Paul backInseam: ' + utils.round(backInseamLength).toString())
  }
  const backOutseamLength = drawOutseam().length()
  const frontOutseamLength = store.get('frontOutseamLength')
  const outseamDiff = frontOutseamLength - backOutseamLength
  let outseamDesc = 'Paul back outseam is longer than front'
  if (outseamDiff > 0) outseamDesc = 'Paul front outseam is longer than back'
  if (Math.abs(outseamDiff) > 1) {
    log.warn(outseamDesc + ' by ' + utils.round(Math.abs(outseamDiff)) + ' mm')
    log.debug('Paul frontOutseam: ' + utils.round(frontOutseamLength).toString())
    log.debug('Paul backOutseam: ' + utils.round(backOutseamLength).toString())
  }

  /*
   * Annotations
   */

  // Cut list
  store.cutlist.setCut({ cut: 2, from: 'fabric' })

  // Title
  points.titleAnchor = new Point(points.knee.x, points.fork.y)
  macro('title', {
    at: points.titleAnchor,
    nr: 1,
    title: 'back',
  })

  // Logo
  snippets.logo = new Snippet('logo', points.titleAnchor.shiftFractionTowards(points.knee, 0.5))

  // Notches

  macro('sprinkle', {
    snippet: 'bnotch',
    on: ['grainlineBottom'],
  })

  log.info(
    `Inseam height: ${units(points.fork.dy(points.floorIn))} | ` +
      `Waist: ${units((store.get('waistbandBack') + store.get('waistbandFront')) * 2)} | ` +
      `Bottom leg width: ${units((store.get('legWidthBack') + store.get('legWidthFront')) / 2)}`
  )

  // Dimensions
  macro('rmad')
  delete paths.hint

  macro('hd', {
    id: 'wHemLeftToPleat',
    from: points.floorIn,
    to: points.grainlineBottom,
    y: points.floorIn.y - 15,
  })
  macro('hd', {
    id: 'wHemRightToPleat',
    from: points.grainlineBottom,
    to: points.floorOut,
    y: points.floorIn.y - 15,
  })
  macro('hd', {
    id: 'wHem',
    from: points.floorIn,
    to: points.floorOut,
    y: points.floorIn.y - 30,
  })

  let y = points.floorIn.y + sa * 6
  macro('hd', {
    id: 'wForkToPleat',
    from: points.fork,
    to: points.grainlineBottom,
    y: y + 15,
  })

  y = points.styleWaistIn.y - sa
  macro('hd', {
    id: 'wCbWaistToPleat',
    from: points.styleWaistIn,
    to: points.grainlineTop,
    y: y - 15,
  })
  macro('hd', {
    id: 'wForkToPleat',
    from: points.fork,
    to: points.grainlineTop,
    y: y - 30,
  })
  macro('hd', {
    id: 'wPleatToDartMid',
    from: points.grainlineTop,
    to: points.dartCenter,
    y: y - 15,
  })
  macro('ld', {
    id: 'lWelt',
    from: points.pocketLeft,
    to: points.pocketRight,
    d: -15,
  })
  macro('ld', {
    id: 'lDart',
    from: points.backDartLeft,
    to: points.backDartRight,
    d: 15,
  })
  macro('ld', {
    id: 'lWaistToWeltPocket',
    from: points.dartTip,
    to: points.dartCenter,
    d: 25,
  })
  let x = points.fork.x - sa
  macro('vd', {
    id: 'hForkToDartTip',
    from: points.fork,
    to: points.dartTip,
    x: x - 15,
  })
  macro('vd', {
    id: 'hForkToDartMid',
    from: points.fork,
    to: points.dartCenter,
    x: x - 30,
  })
  macro('vd', {
    id: 'hForkToCbWaist',
    from: points.fork,
    to: points.styleWaistIn,
    x: x - 45,
  })

  return part
}

export const back = {
  name: 'paul.back',
  from: titanBack,
  after: front,
  hide: hidePresets.HIDE_TREE,
  options: {
    backPocketVerticalPlacement: { pct: 24, min: 18, max: 30, menu: 'pockets.backpockets' },
    backPocketHorizontalPlacement: { pct: 55, min: 48, max: 62, menu: 'pockets.backpockets' },
    backPocketWidth: { pct: 55, min: 50, max: 60, menu: 'pockets.backpockets' },
    backPocketDepth: { pct: 60, min: 40, max: 80, menu: 'pockets.backpockets' },
    backPocketFacing: { bool: true, menu: 'pockets.backpockets' },
    backDartAngle: { deg: 8.66, min: 0, max: 15, menu: 'style' },
    backDartDepth: { pct: 50, min: 20, max: 100, menu: 'style' },
    yokeOuterWidth: { pct: 35, min: 10, max: 100, menu: 'style' },
  },
  draft: draftPaulBack,
}
