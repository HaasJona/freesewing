import { Snippet, stretchToScale } from '@freesewing/core'

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
  /*
   * Calculate stretch for easy access
   */
  const stretch = {
    x: utils.stretchToScale(options.xStretch),
    y: utils.stretchToScale(options.yStretch),
  }
  const gussetLength = (measurements.crossSeam / 2) * stretch.y

  /*
   * Back exposure as used for calculating paths should never be below
   * 0.25. If it's lower than that, we'll do a specific on the back
   * part after splitting the curves
   */
  const minBackExposure = options.backExposure < 0.25 ? 0.25 : options.backExposure

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
   * The gusset can shift backwards/forwards, but this point remains stable
   */
  let waistToMiddle = measurements.crossSeam / 2

  points.cfMiddle = new Point(0, stretch.y * waistToMiddle)
  points.sideMiddle = new Point(waistToMiddle * options.gussetWidth * stretch.x, points.cfMiddle.y)

  paths.bodySide = new Path()
    .move(points.sideWaist)
    .line(points.sideHips)
    .line(points.sideSeat)
    .hide()

  /*
   * Waistband line
   */
  points.cfWaistband = points.cfSeat.shiftFractionTowards(points.cfHips, options.rise)
  points.sideWaistband = paths.bodySide.intersectsY(points.cfWaistband.y)[0]

  /*
   * Dip the waistband at the front
   */
  points.cfWaistbandDip = points.cfWaistband.shift(-90, waistToMiddle * options.frontDip)
  points.cfWaistbandDipCp = new Point(points.sideWaistband.x / 2, points.cfWaistbandDip.y)

  /*
   * Start of the leg opening
   */
  points.sideLeg = points.sideSeat.shiftFractionTowards(points.sideWaistband, options.legRise)

  /*
   * We curve at the same angle as the front waistband dip here.
   * Not doing so would mean that when the front exposure is high,
   * and thus the fabric at the side gets narrow,
   * Both curves would not be parallel which looks messy.
   */
  const dipAngle = points.sideWaistband.angle(points.cfWaistbandDipCp)
  points.sideLegCp = points.sideLeg.shift(dipAngle, points.sideMiddle.dx(points.sideLeg) / 3)

  /*
   * Determine gusset split position
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
  const thongFactor = minBackExposure > 0.8 ? 1 - (minBackExposure - 0.8) * 4 : 1

  /*
   * Now add the front gusset control point
   */
  points.gussetFrontCp = points.sideMiddle
    .shift(90, points.sideLegCp.dy(points.sideMiddle) * options.frontExposure)
    .shift(0, (1 - thongFactor) * 0.25 * waistToMiddle * options.gussetWidth)

  /*
   * Now extend the gusset into the back part
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

  /*
   * We curve at the same angle as the back waitband dip here.
   * Not doing so would mean that when the back exposure is high,
   * and thus the fabric at the side gets narrow,
   * Both curves would not be parallel which looks messy.
   */
  const dipAngleBack = points.sideWaistbandBack.angle(points.cfWaistbandDipCpBack)
  points.sideLegCpBack = points.sideLegBack.shift(
    dipAngleBack,
    points.sideMiddle.dx(points.sideLegBack) * minBackExposure
  )

  /*
   * Now add the back gusset control point
   */
  points.gussetBackCp = points.sideMiddle
    .shift(90, points.sideLegCpBack.dy(points.sideMiddle) * minBackExposure)
    .shift(180, points.sideMiddle.x * (1 - thongFactor))

  /*
   * Force the sideMiddle point to lie on the line between front and back
   * control points. This only kicks in when backExposure > 80 and thus
   * thongFactor is not 1
   */
  if (thongFactor !== 1) {
    points.sideMiddle = utils.beamIntersectsY(
      points.gussetFrontCp,
      points.gussetBackCp,
      points.sideMiddle.y
    )
  }

  /*
   * Make checking for bulge easy
   */
  store.set('bulge', options.bulge >= 2)

  /*
   * First split at the back
   */
  let intersectsY = utils.curveIntersectsY(
    points.sideLegBack,
    points.sideLegCpBack,
    points.gussetBackCp,
    points.sideMiddle,
    points.cfBackGusset.y
  )
  paths.backCurve = new Path()
    .move(points.sideLegBack)
    .curve(points.sideLegCpBack, points.gussetBackCp, points.sideMiddle)
    .hide()

  let backCurveParts = []
  if (intersectsY && !Array.isArray(intersectsY)) {
    points.backGussetSplit = intersectsY
    backCurveParts = paths.backCurve.split(points.backGussetSplit)
  }
  if (backCurveParts && backCurveParts.length > 1 && backCurveParts[0].ops) {
    /*
     * Add the controls points of the split path to the part points
     */
    points.backGussetSplitCpBottom = backCurveParts[0].ops[1].cp1
    points.backGussetSplitCpTop = backCurveParts[0].ops[1].cp2

    points.gussetBackSplitCpTop = backCurveParts[1].ops[1].cp2
    points.gussetBackSplitCpBottom = backCurveParts[1].ops[1].cp1
  } else {
    points.backGussetSplit = points.sideMiddle
    points.backGussetSplitCpBottom = points.backGussetSplit
    points.backGussetSplitCpTop = points.backGussetSplit
    points.gussetBackSplitCpTop = points.backGussetSplit
    points.gussetBackSplitCpBottom = points.backGussetSplit

    backCurveParts = [paths.backCurve]
  }

  /*
   * If people want to max out the back exposure, we need to flare
   * out the back part, which requires some more splits
   */
  if (options.backExposure < 0.25) {
    paths.backCurve = new Path()
      .move(points.backGussetSplit)
      .curve(points.backGussetSplitCpTop, points.backGussetSplitCpBottom, points.sideLegBack)
      .addClass('stroke-xl lining')
      .hide()
    const fraction = 0.05
    points.backCurveGussetSplit = paths.backCurve.shiftFractionAlong(fraction)
    points.backCurveBackSplit = paths.backCurve.reverse().shiftFractionAlong(fraction)
    const angle = points.backCurveGussetSplit.angle(points.backCurveBackSplit)
    const dist = points.backCurveGussetSplit.dist(points.backCurveBackSplit)
    const shift = points.sideMiddle.x * 2 * (0.25 - options.backExposure)
    points.backCurveBump = points.backCurveGussetSplit
      .shiftFractionTowards(points.backCurveBackSplit, 0.5)
      .shift(angle + 90, shift)
    points.backCurveBumpCp1 = points.backCurveBump.shift(angle, dist / 4)
    points.backCurveBumpCp2 = points.backCurveBump.shift(angle, dist / -4)

    let parts = paths.backCurve.split(points.backCurveBackSplit)
    paths.backCurveBackRest = parts[0].hide()
    paths.backCurveBack = parts[1].hide()
    parts = paths.backCurve.split(points.backCurveGussetSplit)
    paths.backCurveGusset = parts[0].hide()
    paths.backCurveGussetRest = parts[1].hide()

    points.backCurveGussetCp = points.backCurveGussetSplit.shiftTowards(
      paths.backCurveBackRest.ops[1].cp1,
      shift
    )
    points.backCurveBackCp = points.backCurveBackSplit.shiftTowards(
      paths.backCurveGussetRest.ops[1].cp1,
      shift
    )
    paths.bump = new Path()
      .move(points.backCurveBackSplit)
      .curve(points.backCurveBackCp, points.backCurveBumpCp1, points.backCurveBump)
      .smurve(points.backCurveGussetCp, points.backCurveGussetSplit)
      .hide()

    paths.elasticLegBack = new Path()
      .move(points.sideLegBack)
      .join(paths.backCurveBack.reverse())
      .join(paths.bump)
      .join(paths.backCurveGusset.reverse())
      .hide()

    paths.back = new Path()
      .move(points.cfWaistbandDipBack)
      .curve_(points.cfWaistbandDipCpBack, points.sideWaistbandBack)
      .join(paths.elasticLegBack)
      .line(points.cfBackGusset)
      .hide()
  } else {
    paths.elasticLegBack = backCurveParts[0].hide()

    paths.back = new Path()
      .move(points.cfWaistbandDipBack)
      .curve_(points.cfWaistbandDipCpBack, points.sideWaistbandBack)
      .join(paths.elasticLegBack)
      .line(points.cfBackGusset)
      .addClass('note')
  }

  points.cfBulgeSplit = points.cfMiddle.shiftFractionTowards(points.cfWaistband, 0.33)

  points.rotationOrigin = points.cfBulgeSplit.shiftFractionTowards(points.sideSeat, 0.15)

  for (const pid of [
    'gussetFrontCp',
    'backGussetSplit',
    'cfMiddle',
    'cfBackGusset',
    'gussetBackSplitCpBottom',
    'gussetBackSplitCpTop',
    'sideMiddle',
  ]) {
    if (store.get('bulge'))
      points[`${pid}Bulge`] = points[pid].rotate(options.bulge, points.rotationOrigin)
    else points[`${pid}Bulge`] = points[pid]
  }

  points.bulgeCp = points.cfBulgeSplit.shift(-90, points.cfWaist.dy(points.cfMiddleBulge) * 0.25)

  points.cfMiddleBulgeCp = points.cfMiddleBulge.shiftFractionTowards(points.cfBackGussetBulge, -0.8)

  for (const pid of ['gussetFrontCp', 'bulgeCp']) {
    if (store.get('bulge'))
      points[`${pid}Bulge`] = points[pid].rotate(options.bulge, points.rotationOrigin)
    else points[`${pid}Bulge`] = points[pid]
  }

  points.bulgeCpBottom = points.bulgeCpBulge
    .shiftFractionTowards(points.bulgeCp, options.bulgeFullness)
    .shiftFractionTowards(points.cfBulgeSplit, 0.5)

  paths.elasticLegFront = new Path()
    .move(points.backGussetSplitBulge)
    .curve(
      points.gussetBackSplitCpBottomBulge,
      points.gussetBackSplitCpTopBulge,
      points.sideMiddleBulge
    )
    .curve(points.gussetFrontCpBulge, points.sideLegCp, points.sideLeg)
    .hide()

  /**
   * Construct pockets if desired
   */
  if (options.pockets !== 'none') {
    points.sidePocketHem = points.sideWaistband.shiftFractionTowards(
      points.sideLeg,
      options.pocketHem
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
        points.pocketSeamTop.shift(-80, measurements.crossSeam / 3),
        points.pocketSeamTop.shift(-40, measurements.crossSeam / 2)
      )
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

      snippets.pocketTop = new Snippet('notch', points.pocketSeamTop)
      snippets.pocketBottom = new Snippet('notch', points.pocketSeamBottom)
      if (expand) {
        snippets.pocketTopMirrored = new Snippet(
          'notch',
          new Point(-points.pocketSeamTop.x, points.pocketSeamTop.y)
        )
        snippets.pocketBottomMirrored = new Snippet(
          'notch',
          new Point(-points.pocketSeamBottom.x, points.pocketSeamBottom.y)
        )
      }

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
      pct: 10,
      min: 3,
      max: 20,
      menu: 'fit',
      toAbs: (val, { measurements }, mergedOptions) =>
        measurements.crossSeam * mergedOptions.gussetWidth * stretchToScale(mergedOptions.xStretch),
    },

    /*
     * splitPosition allows you to shift the split towards the front or back
     */
    splitPosition: { pct: 11, min: 0, max: 80, menu: 'fit' },

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
    frontDip: { pct: 5, min: -5, max: 15, menu: 'style' },

    /*
     * frontExposure determines how much skin is on display at the front
     * Note that frontDip will also influence this
     */
    frontExposure: { pct: 70, min: 5, max: 100, menu: 'style' },

    /*
     * Front dip dips the back waistband
     */
    backDip: { pct: -5, min: -15, max: 10, menu: 'style' },

    /*
     * backExposure determines how much skin is on display at the back
     * Note that backDip will also influence this
     */
    backExposure: { pct: 30, min: 0, max: 115, menu: 'style' },

    pockets: {
      dflt: 'none',
      list: ['none', 'inside', 'zipper'],
      menu: 'style',
      extraNote: 'Select if you want pockets',
    },

    pocketGap: {
      pct: 25,
      min: 0,
      max: 35,
      menu: 'style',
      toAbs: (val, { measurements }, mergedOptions) =>
        (measurements.hips / 2) * mergedOptions.pocketGap * stretchToScale(mergedOptions.xStretch),
    },

    pocketHem: {
      pct: 33,
      min: 20,
      max: 45,
      menu: 'style',
    },
  },
  draft: draftUmbraBase,
  hide: { self: true },
}
