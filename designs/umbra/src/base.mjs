import { Snippet, stretchToScale } from '@freesewing/core'
import { formatPercentage } from '@freesewing/shared/utils.mjs'

function draftUmbraBase({
  options,
  Point,
  Path,
  points,
  paths,
  measurements,
  snippets,
  store,
  utils,
  expand,
  units,
  part,
}) {
  function rotatePath(path, angle, rotationOrigin) {
    const newPath = new Path()

    for (const op of path.ops) {
      if (op.type === 'move') {
        const to = op.to.rotate(angle, rotationOrigin)
        newPath.move(to)
      } else if (op.type === 'line') {
        const to = op.to.rotate(angle, rotationOrigin)
        newPath.line(to)
      } else if (op.type === 'curve') {
        const cp1 = op.cp1.rotate(angle, rotationOrigin)
        const cp2 = op.cp2.rotate(angle, rotationOrigin)
        const to = op.to.rotate(angle, rotationOrigin)

        newPath.curve(cp1, cp2, to)
      }
    }

    return newPath
  }

  /*
   * Calculate stretch for easy access
   */
  const stretch = {
    x: utils.stretchToScale(options.xStretch),
    y: utils.stretchToScale(options.yStretch),
  }

  /*
   * Create points
   * All center front (cf) points have x=0
   * All side points have positive Y-coordinate
   * Note that we're only drafting half of the shape as it's symmetric
   */

  /*
   * Waist line
   */
  points.cfWaist = new Point(0, 0)
  points.sideWaist = new Point((measurements.waist / 4) * stretch.x, 0)

  /*
   * Hip line
   */
  points.cfHips = new Point(0, measurements.waistToHips * stretch.y)
  points.sideHips = new Point((measurements.hips / 4) * stretch.x, points.cfHips.y)

  /*
   * Seat line
   */
  points.cfSeat = new Point(0, measurements.waistToSeat * stretch.y)
  points.sideSeat = new Point((measurements.seat / 4) * stretch.x, points.cfSeat.y)

  /*
   * The absolute middle
   */
  let waistToMiddle = measurements.crossSeam / 2

  points.cfMiddle = new Point(0, stretch.y * waistToMiddle)
  points.sideMiddle = new Point(waistToMiddle * options.gussetWidth * stretch.x, points.cfMiddle.y)

  /*
   * This path plots the width of the body from the waist to the seat to position the waistband according to height
   */
  paths.bodySide = new Path()
    .move(points.sideWaist)
    .line(points.sideHips)
    .line(points.sideSeat)
    .hide()

  /*
   * Waistband line
   */
  points.cfWaistband = points.cfSeat.shiftFractionTowards(points.cfHips, options.rise)
  let intersection = paths.bodySide.intersectsY(points.cfWaistband.y)
  if (intersection == null || intersection.length === 0) {
    // If the waistband is somehow above the waistline, continue to use the waist measurement
    // This is mostly to prevent errors when the user entered an abnormally low distance between waist and hips
    // together with a very high rise
    points.sideWaistband = new Point(points.sideWaist.x, points.cfWaistband.y)
  } else {
    points.sideWaistband = intersection[0]
  }

  /*
   * Dip the waistband at the front
   */
  points.cfWaistbandDip = points.cfWaistband.shift(-90, waistToMiddle * options.frontDip)
  points.cfWaistbandDipCp = new Point(points.sideWaistband.x / 2, points.cfWaistbandDip.y)

  /*
   * Start of the leg opening
   */
  let defaultSideLeg = points.sideSeat.shiftFractionTowards(points.sideHips, options.legRise)
  let alternativeSideLeg = points.sideSeat.shiftFractionTowards(
    points.sideWaistband,
    options.legRise
  )
  points.sideLeg = defaultSideLeg.y > alternativeSideLeg.y ? defaultSideLeg : alternativeSideLeg

  /*
   * We curve at the same angle as the front waistband dip here.
   * Not doing so would mean that when the front exposure is high,
   * and thus the fabric at the side gets narrow,
   * Both curves would not be parallel which looks messy.
   */
  const dipAngle = points.sideWaistband.angle(points.cfWaistbandDipCp)
  points.sideLegCp = points.sideLeg.shift(dipAngle, points.sideMiddle.dx(points.sideLeg) / 3)

  /*
   * Determine crotch seam split position
   */
  points.cfMaxGusset = new Point(0, 2 * stretch.y * waistToMiddle - points.sideLegCp.y)
  points.cfBackGusset = points.cfMiddle.shiftFractionTowards(
    points.cfMaxGusset,
    options.splitPosition
  )

  /*
   * If the back exposure is very high (more than 80%) we need to draft a thong style
   * and that requires narrowing the gusset as we make our way from front to back
   */
  const thongFactor = options.backExposure > 0.8 ? 1 - (options.backExposure - 0.8) * 4 : 1

  /*
   * Now add the front gusset control point
   */
  points.gussetFrontCp = points.sideMiddle
    .shift(90, points.sideLegCp.dy(points.sideMiddle) * options.frontExposure)
    .shift(0, (1 - thongFactor) * 0.25 * waistToMiddle * options.gussetWidth)

  /*
   * Flip front side waistband positions to back
   * TODO: Allow repositioning the side seams more towards the front
   */
  for (const flip of ['cfWaist', 'cfWaistband', 'sideWaistband', 'sideLeg']) {
    points[`${flip}Back`] = points[flip].flipY(points.cfMiddle)
  }

  /*
   * Dip the waistband at the back
   */
  points.cfWaistbandDipBack = points.cfWaistbandBack.shift(90, waistToMiddle * options.backDip)
  points.cfWaistbandDipCpBack = new Point(
    points.sideWaistbandBack.x / 2,
    points.cfWaistbandDipBack.y
  )

  let backExposureForCp = Math.max(0.25, options.backExposure - 0.25)
  let backExtraExposure = Math.max(-0.9, (options.backExposure - 0.3) * 0.85)
  let backCenterFactor = Math.min(options.backExposure, 0.5) * 2

  /*
   * We curve at the same angle as the back waistband dip here.
   * Not doing so would mean that when the back exposure is high,
   * and thus the fabric at the side gets narrow,
   * Both curves would not be parallel which looks messy.
   */
  const dipAngleBack = points.sideWaistbandBack.angle(points.cfWaistbandDipCpBack)
  points.sideLegCp1Back = points.sideLegBack.shift(
    dipAngleBack,
    points.sideMiddle.dx(points.sideLegBack) * backExposureForCp
  )

  /*
   * Now add the back gusset control point
   */
  points.gussetBackCp2 = points.sideMiddle
    .shift(90, points.sideLegCp1Back.dy(points.sideMiddle) * backExposureForCp)
    .shift(180, points.sideMiddle.x * (1 - thongFactor))

  /*
   * Make checking for bulge easy
   */
  store.set('bulge', options.bulge >= 2)

  paths.simpleBackCurve = new Path()
    .move(points.sideLegBack)
    .curve(points.sideLegCp1Back, points.gussetBackCp2, points.sideMiddle)
    .hide()

  let center = paths.simpleBackCurve.shiftFractionAlong(0.6)
  let testA = paths.simpleBackCurve.shiftFractionAlong(0.59)
  let testB = paths.simpleBackCurve.shiftFractionAlong(0.61)

  let shiftAmount =
    points.sideLegBack.dist(points.sideMiddle) * Math.max(0.2, (1 - options.backExposure) / 8)
  points.sideFullnessBack = points.sideLegBack
    .shiftFractionTowards(points.sideMiddle, 0.6)
    .shiftFractionTowards(points.cfMaxGusset, backExtraExposure)
    .shiftFractionTowards(center, backCenterFactor)
  let shiftAngle = Math.max(90, Math.min(135, testA.angle(testB)))
  points.sideLegCp2Back = points.sideFullnessBack.shift(shiftAngle, -shiftAmount)
  points.gussetBackCp1 = points.sideFullnessBack.shift(shiftAngle, shiftAmount)

  points.gussetBackCp2 = points.sideMiddle.shift(
    90,
    points.sideFullnessBack.dy(points.sideMiddle) / 4
  )
  //.shift(180, points.sideMiddle.x * (1 - thongFactor))

  points.gussetFrontCp = points.sideMiddle.shift(
    90,
    points.sideLegCp.dy(points.sideMiddle) * options.frontExposure
  )
  //.shift(180, (1 - thongFactor) * waistToMiddle / points.sideLegCp1Back.dy(points.sideFullnessBack) /2 * points.sideMiddle.x)
  /*
   * First split at the back
   */
  paths.backCurve = new Path()
    .move(points.sideLegBack)
    .curve(points.sideLegCp1Back, points.sideLegCp2Back, points.sideFullnessBack)
    .curve(points.gussetBackCp1, points.gussetBackCp2, points.sideMiddle)
    .hide()

  let intersectsY = paths.backCurve.intersectsY(points.cfBackGusset.y)[0]

  let backCurveParts = []
  if (intersectsY && !Array.isArray(intersectsY)) {
    points.backGussetSplit = intersectsY
    backCurveParts = paths.backCurve.split(points.backGussetSplit)
  }
  if (!(backCurveParts && backCurveParts.length > 1)) {
    points.backGussetSplit = points.sideMiddle
    backCurveParts = [paths.backCurve]
  }

  store.set('backCurveParts', backCurveParts)

  /*
   * If people want to max out the back exposure, we need to flare
   * out the back part, which requires some more splits
   */
  paths.elasticLegBack = backCurveParts[0].hide()

  paths.back = new Path()
    .move(points.cfWaistbandDipBack)
    .curve_(points.cfWaistbandDipCpBack, points.sideWaistbandBack)
    .join(paths.elasticLegBack)
    .line(points.cfBackGusset)
    .hide()

  points.cfBulgeSplit = points.cfMiddle.shiftFractionTowards(points.cfHips, 0.5)

  points.rotationOrigin = points.cfBulgeSplit.shiftFractionTowards(points.sideSeat, 0.7)

  for (const pid of [
    'backGussetSplit',
    'cfMiddle',
    'cfBackGusset',
    'sideMiddle',
    'gussetFrontCp',
  ]) {
    if (store.get('bulge'))
      points[`${pid}Bulge`] = points[pid].rotate(options.bulge, points.rotationOrigin)
    else points[`${pid}Bulge`] = points[pid]
  }

  points.bulgeCp = points.cfBulgeSplit.shift(-90, points.cfWaist.dy(points.cfMiddleBulge) * 0.25)

  points.cfMiddleBulgeCp = points.cfMiddleBulge.shiftFractionTowards(points.cfBackGussetBulge, -0.8)

  points.gussetFrontCpBulge = points.gussetFrontCpBulge.shiftFractionTowards(
    points.sideMiddleBulge,
    options.bulge / 200
  )

  for (const pid of ['bulgeCp']) {
    if (store.get('bulge'))
      points[`${pid}Bulge`] = points[pid].rotate(options.bulge, points.rotationOrigin)
    else points[`${pid}Bulge`] = points[pid]
  }

  points.bulgeCpBottom = points.bulgeCpBulge
    .shiftFractionTowards(points.bulgeCp, options.bulgeFullness)
    .shiftFractionTowards(points.cfBulgeSplit, 0.5)

  let rotatedPath
  if (backCurveParts.length <= 1) {
    rotatedPath = null
  } else if (store.get('bulge')) {
    rotatedPath = rotatePath(backCurveParts[1], options.bulge, points.rotationOrigin)
  } else {
    rotatedPath = backCurveParts[1]
  }

  paths.elasticLegFront = new Path().move(points.backGussetSplitBulge)

  if (rotatedPath) {
    paths.elasticLegFront = paths.elasticLegFront.join(rotatedPath)
  }

  paths.elasticLegFront.curve(points.gussetFrontCpBulge, points.sideLegCp, points.sideLeg).hide()

  /**
   * Construct pockets if desired
   */
  if (options.pockets !== 'none') {
    points.sidePocketHem = points.sideWaistband.shiftTowards(
      points.sideLeg,
      Math.min(
        options.pocketHem * points.cfHips.dist(points.cfSeat),
        points.sideWaistband.dist(points.sideLeg) / 3
      )
    )
    points.cfPocketHem = points.cfWaistbandDip.shiftTowards(
      points.cfMiddle,
      points.sidePocketHem.dist(points.sideWaistband)
    )
    points.cfPocketHemCp = new Point(points.sidePocketHem.x / 2, points.cfPocketHem.y)
    paths.pocketHem = new Path()
      .move(points.sidePocketHem)
      ._curve(points.cfPocketHemCp, points.cfPocketHem)
      .reverse()
      .addClass('help')
      .addText('fold lining', 'center help')

    let pocketSeamX = points.sideWaistband.x * options.pocketGap
    points.pocketSeamTop = new Path()
      .move(points.sideWaistband)
      ._curve(points.cfWaistbandDipCp, points.cfWaistbandDip)
      .intersectsX(pocketSeamX)[0]

    paths.pocketPilotPath = new Path()
      .move(points.pocketSeamTop)
      .curve_(
        points.pocketSeamTop.shift(-80, measurements.crossSeam / 4),
        points.sideMiddleBulge.shiftFractionTowards(points.sideSeat, 0.5)
      )
      .setClass('mark')
      .hide()

    let intersects = paths.elasticLegFront.intersects(paths.pocketPilotPath)
    if (intersects.length > 0) {
      points.pocketSeamBottom = intersects[0]
      paths.pocketPilotPath2 = new Path()
        .move(points.pocketSeamBottom)
        .line(points.pocketSeamBottom.shift(125, measurements.crossSeam))
        .hide()
      points.pocketSeamMiddle = paths.pocketPilotPath2.intersectsX(pocketSeamX)[0]

      points.pocketSeamBottomCp = new Point(
        pocketSeamX,
        (points.pocketSeamBottom.y * 2 + points.pocketSeamMiddle.y) / 3
      )

      paths.pocketShape = new Path()
        .move(points.pocketSeamTop)
        .line(points.pocketSeamMiddle)
        .curve_(points.pocketSeamBottomCp, points.pocketSeamBottom)
        .addClass('mark dashed')
        .addText('pocketseam', 'center mark')

      if (options.pockets === 'zipper') {
        // Construct zipper path. This uses absolute mm values as zippers are standardized.
        let zipperLeft = pocketSeamX + 10
        let zipperRight = Math.min(points.sidePocketHem.x - 10, zipperLeft + measurements.hips / 10)
        let a = paths.pocketHem.intersectsX(zipperLeft)[0]
        let b = paths.pocketHem.intersectsX(zipperRight)[0]

        let angle = a.angle(b)

        points.leftZipperTop = a.shift(angle + 90, 2.5)
        points.leftZipperBottom = points.leftZipperTop.shift(angle - 90, 5)
        points.rightZipperTop = b.shift(angle + 90, 2.5)
        points.rightZipperBottom = points.rightZipperTop.shift(angle - 90, 5)

        paths.zipper = new Path()
          .move(points.leftZipperBottom)
          .line(points.rightZipperBottom)
          .line(points.rightZipperTop)
          .line(points.leftZipperTop)
          .close()
          .reverse()
          .addClass('mark dashed')
          .addText('zipper', 'mark')
        paths.zipperCut = new Path()
          .move(points.leftZipperBottom)
          .line(points.leftZipperTop)
          .move(points.rightZipperTop)
          .line(points.rightZipperBottom)
          .move(a)
          .line(b)
          .addClass('fabric')
        paths.pocketHem.hide()
      }
    }
  }

  store.set(
    'waistbandElasticLength',
    new Path()
      .move(points.cfWaistbandDipBack)
      .curve_(points.cfWaistbandDipCpBack, points.sideWaistbandBack)
      .hide()
      .length() * 4
  )

  store.set('legElasticLength', paths.elasticLegBack.length() + paths.elasticLegFront.length())

  /*
   * Also flag this to the user, as well as the expand possibility
   */
  if (!expand) store.flag.preset('expandIsOff')
  else store.flag.preset('expandIsOn')
  store.flag.note({
    msg: `umbra:waistbandElasticLength`,
    replace: { length: units(store.get('waistbandElasticLength')) },
  })
  store.flag.note({
    msg: `umbra:legElasticLength`,
    replace: { length: units(store.get('legElasticLength')) },
  })
  store.flag.note({
    msg: `umbra:minStretch`,
    replace: { pct: formatPercentage(measurements.seat / store.get('waistbandElasticLength') - 1) },
  })

  /*
   * Hide this part, others will extend it
   */
  return part
}

export const base = {
  name: 'umbra.base',
  measurements: ['waist', 'seat', 'waistToSeat', 'crossSeam', 'waistToHips', 'hips'],
  options: {
    // Fit options

    /*
     * xStretch is for the horizontal fabric stretch
     */
    xStretch: { pct: 30, min: 0, max: 50, menu: 'fit' },

    /*
     * yStretch is for the vertical fabric stretch
     */
    yStretch: { pct: 5, min: 0, max: 10, menu: 'fit' },

    /*
     * The gusset width, based on the crossSeam measurement
     */
    gussetWidth: {
      pct: 12,
      min: 3,
      max: 20,
      menu: 'fit',
      toAbs: (val, { measurements }, mergedOptions) =>
        measurements.crossSeam * mergedOptions.gussetWidth * stretchToScale(mergedOptions.xStretch),
    },

    /*
     * splitPosition allows you to shift the split towards the front or back
     */
    splitPosition: { pct: 11, min: 0, max: 45, menu: 'fit' },

    /*
     * The bulge option allows you to create room in the front
     * to keep for a snack, or other things you might want to carry there.
     */
    bulge: { deg: 0, min: 0, max: 45, menu: 'fit' },

    /*
     * This option allows you to create extra room in the bulge
     */
    bulgeFullness: { pct: 50, min: 25, max: 100, menu: 'fit' },

    // Style options

    /*
     * Rise controls the waist height
     */
    rise: {
      pct: 100,
      min: 30,
      max: 200,
      menu: 'style',
      toAbs: (val, { measurements }, mergedOptions) =>
        (measurements.crossSeam / 2 -
          measurements.waistToSeat +
          (measurements.waistToSeat - measurements.waistToHips) * mergedOptions.rise) *
        stretchToScale(mergedOptions.xStretch),
    },

    /*
     * legRise controls how high the leg opening is cut out
     */
    legRise: { pct: 45, min: -15, max: 95, menu: 'style' },

    /*
     * Front dip dips the front waistband
     */
    frontDip: { pct: 0, min: -5, max: 15, menu: 'style' },

    /*
     * frontExposure determines how much skin is on display at the front
     * Note that frontDip will also influence this
     */
    frontExposure: { pct: 70, min: 5, max: 100, menu: 'style' },

    /*
     * Front dip dips the back waistband
     */
    backDip: { pct: 0, min: -15, max: 10, menu: 'style' },

    /*
     * backExposure determines how much skin is on display at the back
     * Note that backDip will also influence this
     */
    backExposure: { pct: 10, min: 5, max: 115, menu: 'style' },

    flipBack: {
      dflt: 'true',
      list: ['true', 'false'],
      menu: 'advanced',
      extraNote:
        'Select if the back part should be flipped into upright orientation, set to false for easier development',
    },

    pockets: {
      dflt: 'none',
      list: ['none', 'inside', 'zipper'],
      menu: 'style',
      extraNote: 'Select if you want pockets',
    },

    pocketGap: {
      pct: 25,
      min: 15,
      max: 35,
      menu: 'style',
      toAbs: (val, { measurements }, mergedOptions) =>
        (measurements.hips / 2) * mergedOptions.pocketGap * stretchToScale(mergedOptions.xStretch),
    },

    pocketHem: {
      pct: 20,
      min: 10,
      max: 30,
      menu: 'style',
    },
  },
  draft: draftUmbraBase,
  hide: { self: true },
}
