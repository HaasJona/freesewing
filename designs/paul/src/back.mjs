import { back as titanBack } from '@freesewing/titan'
import { front } from './front.mjs'
import { hidePresets } from '@freesewing/core'

function draftPaulBack({
  points,
  Point,
  paths,
  Path,
  options,
  complete,
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
  /*
   * Helper method to draw the outline path
   */
  const drawPath = () => {
    // Helper object that holds the titan outseam path adapted for the dart
    const titanOutseam =
      points.waistOut.x > points.seatOut.x
        ? new Path()
            .move(points.floorOut)
            .line(points.kneeOut)
            .curve(points.kneeOutCp2, points.seatOut, points.styleWaistOut)
            .reverse()
        : new Path()
            .move(points.floorOut)
            .line(points.kneeOut)
            .curve(points.kneeOutCp2, points.seatOutCp1, points.seatOut)
            .curve_(points.seatOutCp2, points.styleWaistOut)
            .reverse()

    let waistIn = points.styleWaistIn || points.waistIn
    return titanOutseam
      .reverse()
      .curve(points.outCp, points.backDartRightCp, points.backDartRight)
      .noop('dart')
      .line(points.backDartLeft)
      .curve(points.backDartLeftCp, points.cbCp, waistIn)
      .line(points.crossSeamCurveStart)
      .curve(points.crossSeamCurveCp1, points.crossSeamCurveCp2, points.fork)
      .curve(points.forkCp2, points.kneeInCp1, points.kneeIn)
      .line(points.floorIn)
  }

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

  // Helper object holding the inseam path
  const backInseamPath = new Path()
    .move(points.fork)
    .curve(points.forkCp2, points.kneeInCp1, points.kneeIn)
    .line(points.floorIn)

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

  // Anchor for sampling/grid
  // This breaks the samples for reason not clear. See #
  // points.anchor = points.fork.clone()

  paths.saBase = drawPath()
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
  const backInseamLength = backInseamPath.length()
  const frontInseamLength = store.get('frontInseamLength')
  const inseamDiff = frontInseamLength - backInseamLength
  let inseamDesc = 'Paul back inseam is longer than front'
  if (inseamDiff > 0) inseamDesc = 'Paul front inseam is longer than back'
  if (Math.abs(inseamDiff) > 1) {
    log.warn(inseamDesc + ' by ' + utils.round(Math.abs(inseamDiff)) + ' mm')
    log.debug('Paul frontInseam: ' + utils.round(frontInseamLength).toString())
    log.debug('Paul backInseam: ' + utils.round(backInseamLength).toString())
  }
  // const backOutseamLength = drawOutseam().length()
  // const frontOutseamLength = store.get('frontOutseamLength')
  // const outseamDiff = frontOutseamLength - backOutseamLength
  // let outseamDesc = 'Paul back outseam is longer than front'
  // if (outseamDiff > 0) outseamDesc = 'Paul front outseam is longer than back'
  // if (Math.abs(outseamDiff) > 1) {
  //   log.warn(outseamDesc + ' by ' + utils.round(Math.abs(outseamDiff)) + ' mm')
  //   log.debug('Paul frontOutseam: ' + utils.round(frontOutseamLength).toString())
  //   log.debug('Paul backOutseam: ' + utils.round(backOutseamLength).toString())
  // }

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
    backDartDepth: { pct: 50, min: 1, max: 100, menu: 'style' },
  },
  draft: draftPaulBack,
}
