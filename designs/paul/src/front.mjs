import { hidePresets, pctBasedOn } from '@freesewing/core'
import { elastics } from '@freesewing/snapseries'
import { front as titanFront } from '@freesewing/titan'

function draftPaulFront({
  points,
  Point,
  paths,
  Path,
  options,
  complete,
  measurements,
  store,
  macro,
  utils,
  snippets,
  Snippet,
  sa,
  log,
  part,
}) {
  delete points.kneeOutCp1
  delete points.kneeInCp1

  // Adapt bottom leg based on heel and heel ease
  let quarterHeel = (measurements.heel * (1 + options.heelEase) * (1 - options.legBalance)) / 2
  points.floorOut = points.floor.shift(180, quarterHeel)
  points.floorIn = points.floor.shift(0, quarterHeel)

  // Helper method to draw the outline path
  const drawPath = (withPocket = false) => {
    const result = frontInseamPath.clone().join(paths.crotchCurve)
    if (!withPocket) {
      return result.join(sideSeam)
    } else {
      return result
        .line(points.pocketTop)
        .join(paths.pocketCurve)
        .line(points.pocketLeft)
        .join(sideSeam.split(points.pocketLeft)[1])
    }
  }

  // Helper object holding the Titan side seam path
  const sideSeam = new Path()
    .move(points.styleWaistOut)
    .curve(
      points.seatOut,
      points.floorOut.translate(0, points.floorOut.dy(points.kneeIn) * options.heelShape),
      points.floorOut
    )

  paths.sideSeam = sideSeam.hide()

  // Helper object holding the inseam path
  const frontInseamPath = new Path()
    .move(points.floorIn)
    .curve(
      points.floorIn.translate(0, points.floorIn.dy(points.kneeIn) * options.heelShape),
      points.kneeIn,
      points.fork
    )

  // Helper object holding the crotchCurve
  let crotchCurveTmp = new Path()
    .move(points.fork)
    .curve(points.crotchSeamCurveCp1, points.crotchSeamCurveCp2, points.crotchSeamCurveStart)
    .line(points.styleWaistIn)

  // Mark the bottom of the fly J-seam
  const flyBottom = utils.curveIntersectsY(
    points.crotchSeamCurveStart,
    points.crotchSeamCurveCp2,
    points.crotchSeamCurveCp1,
    points.fork,
    points.cfSeat.shiftFractionTowards(points.crotchSeamCurveCp2, options.flyLength).y
  )

  if (flyBottom) points.flyBottom = flyBottom
  else log.error('Unable to locate the fly bottom. This draft will fail.')

  // Define Fly components
  points.flyExtensionBottom = utils.curveIntersectsY(
    points.crotchSeamCurveStart,
    points.crotchSeamCurveCp2,
    points.crotchSeamCurveCp1,
    points.fork,
    points.cfSeat.shiftFractionTowards(points.crotchSeamCurveCp2, options.flyLength * 1.5).y
  )

  points.flyTop = points.styleWaistOut.shiftFractionTowards(
    points.styleWaistIn,
    1 - options.flyWidth
  )

  points.flyCorner = points.flyTop.shift(
    points.styleWaistIn.angle(points.flyBottom),
    points.styleWaistIn.dist(points.flyBottom)
  )
  points.flyCurveStart = points.flyCorner.shiftTowards(
    points.flyTop,
    points.flyBottom.dist(points.flyCorner)
  )
  points.flyCurveCp1 = points.flyBottom.shiftFractionTowards(points.flyCorner, options.flyCurve)
  points.flyCurveCp2 = points.flyCurveStart.shiftFractionTowards(points.flyCorner, options.flyCurve)

  let topStitchDist = (1 - options.flyWidth) * 8

  points.flyTopSeamline = points.flyTop.shiftTowards(points.styleWaistIn, topStitchDist)

  points.flyBottomSeamLine = utils.curveIntersectsY(
    points.crotchSeamCurveStart,
    points.crotchSeamCurveCp2,
    points.crotchSeamCurveCp1,
    points.fork,
    points.flyBottom.shiftTowards(points.crotchSeamCurveStart, topStitchDist).y
  )

  let pointsToLinearize = ['flyBottomSeamLine', 'cfSeat', 'crotchSeamCurveStart']
  for (const point of pointsToLinearize) {
    let p = points[point]
    const a = p.dist(points.styleWaistIn)
    const b = p.dist(points.flyBottom)
    const factor = a / (a + b)
    points[point] = points.styleWaistIn.shiftFractionTowards(points.flyBottom, factor)
  }

  // Make sure fly edge is straight
  let split = crotchCurveTmp.split(points.flyBottom)
  if (split[0] !== null) {
    crotchCurveTmp = split[0]
  }
  paths.crotchCurve = crotchCurveTmp.line(points.styleWaistIn).hide()

  paths.flyFacingLine = new Path()
    .move(points.flyTop)
    .line(points.flyCurveStart)
    .curve(points.flyCurveCp2, points.flyCurveCp1, points.flyBottom)
    .setClass('lining dashed')

  let JseamCurve = paths.flyFacingLine.offset(-topStitchDist)

  let splitElement = JseamCurve.split(points.flyBottomSeamLine)[0]
  if (!splitElement) {
    splitElement = JseamCurve
  }
  if (splitElement) {
    paths.completeJseam = splitElement
      .clone()
      .setClass('dashed')
      .addText('jseamStitchLine', 'center text-sm')

    paths.flyRightLegExtension = paths.crotchCurve
      .clone()
      .split(points.flyBottom)[1]
      .offset(topStitchDist)
      .line(points.styleWaistIn)
      .reverse()
      .line(points.flyExtensionBottom)
      .reverse()
      .setClass('fabric')
      .addText('rightLegSeamline', 'center fill-note text-sm')
  }

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

  // Anchor for sampling/grid
  points.anchor = points.fork.clone()

  // Draw path
  paths.seam = drawPath(true).close().attr('class', 'fabric')

  if (sa) {
    paths.sa = drawPath(true)
      .offset(sa)
      .join(
        new Path()
          .move(points.floorOut)
          .line(points.floorIn)
          .offset(sa * 6)
      )
      .close()
      .trim()
      .addClass('fabric sa')

    // Draw the right leg fly extension (not for dolls)
    if (measurements.waist > 500) {
      let FlyRightLegExtensionSa = paths.flyRightLegExtension.offset(sa)
      paths.flyRightLegExtensionSa = FlyRightLegExtensionSa.split(
        FlyRightLegExtensionSa.intersects(paths.sa)[0]
      )[1]
        .setClass('sa')
        .addText('rightLegSeamAllowance', 'center fill-note text-sm')
    }
  }

  // Store waistband length
  store.set('waistbandFront', points.styleWaistIn.dist(points.styleWaistOut))
  store.set('waistbandFly', points.styleWaistIn.dist(points.flyTop))
  store.set('legWidthFront', points.floorIn.dist(points.floorOut))

  // Store inseam and outseam lengths
  store.set('frontInseamLength', frontInseamPath.length())
  store.set('frontOutseamLength', sideSeam.length())

  if (complete) {
    points.titleAnchor = new Point(points.knee.x, points.fork.y)
    macro('title', {
      at: points.titleAnchor,
      nr: 2,
      title: 'front',
    })
    snippets.logo = new Snippet('logo', points.titleAnchor.shiftFractionTowards(points.knee, 0.666))
    points.topPleat = utils.beamsIntersect(
      points.styleWaistIn,
      points.styleWaistOut,
      points.knee,
      points.grainlineBottom
    )
    macro('sprinkle', {
      snippet: 'notch',
      on: ['topPleat', 'grainlineBottom', 'flyBottom', 'flyExtensionBottom', 'flyBottomSeamLine'],
    })
  }

  delete paths.hint

  /*
   * Annotations
   */

  // Cut list
  store.cutlist.setCut({ cut: 2, from: 'fabric' })

  // Title
  points.titleAnchor = new Point(points.knee.x, points.fork.y)
  macro('title', {
    at: points.titleAnchor,
    nr: 2,
    title: 'front',
  })

  // Logo
  snippets.logo = new Snippet('logo', points.titleAnchor.shiftFractionTowards(points.knee, 0.666))
  points.topPleat = utils.beamsIntersect(
    points.styleWaistIn,
    points.styleWaistOut,
    points.knee,
    points.grainlineBottom
  )
  macro('sprinkle', {
    snippet: 'notch',
    on: ['topPleat', 'grainlineBottom', 'flyBottom', 'flyExtensionBottom'],
  })

  // Dimensions
  macro('rmad')
  macro('hd', {
    id: 'wPleatToHemRight',
    from: points.grainlineBottom,
    to: points.floorIn,
    y: points.floorIn.y - 15,
  })
  macro('hd', {
    id: 'wPleastToHemLeft',
    from: points.floorOut,
    to: points.grainlineBottom,
    y: points.floorIn.y - 15,
  })
  macro('hd', {
    id: 'wHem',
    from: points.floorOut,
    to: points.floorIn,
    y: points.floorIn.y - 30,
  })

  let y = points.styleWaistIn.y - sa
  macro('hd', {
    id: 'wPleatToJseam',
    from: points.topPleat,
    to: points.flyTop,
    y: y - 15,
  })
  macro('hd', {
    id: 'wPleatToCfWaist',
    from: points.topPleat,
    to: points.styleWaistIn,
    y: y - 30,
  })
  macro('hd', {
    id: 'wPleatToJeamEnd',
    from: points.topPleat,
    to: points.flyBottom,
    y: y - 45,
  })
  macro('hd', {
    id: 'wPleatToCrotchCurveStart',
    from: points.topPleat,
    to: points.flyExtensionBottom,
    y: y - 60,
  })
  macro('hd', {
    id: 'wPleatToFork',
    from: points.topPleat,
    to: points.fork,
    y: y - 75,
  })

  macro('hd', {
    id: 'wPleatToPocketFacingWaist',
    from: points.pocketFacingTop,
    to: points.topPleat,
    y: y - 15,
  })

  let x = points.fork.x + sa
  macro('vd', {
    id: 'hHemToFork',
    from: points.floorIn,
    to: points.fork,
    x: x + 15,
  })
  macro('vd', {
    id: 'hForkToStartCrotchSeam',
    from: points.fork,
    to: points.flyExtensionBottom,
    x: x + 15,
  })
  macro('vd', {
    id: 'hForkToJeamEnd',
    from: points.fork,
    to: points.flyBottom,
    x: x + 30,
  })
  macro('vd', {
    id: 'hForkToSideWaist',
    from: points.fork,
    to: points.styleWaistIn,
    x: x + 60,
  })

  return part
}

export const front = {
  name: 'paul.front',
  from: titanFront,
  hide: hidePresets.HIDE_TREE,
  measurements: [
    'crossSeam',
    'crossSeamFront',
    'knee',
    'seat',
    'seatBack',
    'waist',
    'waistBack',
    'waistToFloor',
    'waistToKnee',
    'waistToHips',
    'waistToSeat',
    'waistToUpperLeg',
    'heel',
  ],
  options: {
    // Constants (from Titan)
    fitCrossSeam: true,
    fitCrossSeamFront: true,
    fitCrossSeamBack: true,
    fitGuides: false,
    // Lock titan options
    fitKnee: true,
    // Paul constants
    waistbandReduction: 0.25, // See src/index.js
    waistbandFactor: 0.1,

    // Fit (from Titan)
    waistEase: { pct: 1, min: 0, max: 5, menu: 'fit' },
    seatEase: { pct: 5, min: 0, max: 10, menu: 'fit' },
    kneeEase: { pct: 15, min: 10, max: 30, menu: 'fit' },

    // Style (from Titan)
    waistHeight: { pct: -4, min: -15, max: 40, menu: 'style' },
    waistbandWidth: {
      pct: 3,
      min: 1,
      max: 6,
      snap: elastics,
      ...pctBasedOn('waistToFloor'),
      menu: 'style',
    },
    //waistbandWidth: { pct: 3.5, min: 2, max: 5 },
    lengthBonus: { pct: 2, min: -20, max: 10, menu: 'style' },
    crotchDrop: { pct: 2, min: 0, max: 15, menu: 'style' },

    // Advanced (from Titan)
    crossSeamCurveStart: { pct: 85, min: 60, max: 100, menu: 'advanced' },
    crossSeamCurveBend: { pct: 65, min: 45, max: 85, menu: 'advanced' },
    crossSeamCurveAngle: { deg: 12, min: 0, max: 20, menu: 'advanced' },
    crotchSeamCurveStart: { pct: 80, min: 60, max: 95, menu: 'advanced' },
    crotchSeamCurveBend: { pct: 80, min: 45, max: 100, menu: 'advanced' },
    crotchSeamCurveAngle: { deg: 25, min: 0, max: 35, menu: 'advanced' },
    grainlinePosition: { pct: 50, min: 30, max: 60, menu: 'advanced' },
    legBalance: { pct: 57.5, min: 52.5, max: 62.5, menu: 'advanced' },
    waistBalance: { pct: 55, min: 30, max: 90, menu: 'advanced' },

    // Fly
    flyCurve: { pct: 72, min: 50, max: 100, menu: 'advanced.fly' },
    flyLength: { pct: 45, min: 30, max: 60, menu: 'advanced.fly' },
    flyWidth: { pct: 15, min: 10, max: 20, menu: 'advanced.fly' },

    heelEase: { pct: 5, min: 0, max: 100, menu: 'style' },
    heelShape: { pct: 50, min: 0, max: 100, menu: 'style' },

    pocketWidth: 0.6,
    pocketHeight: 0.8,
    pocketCurveShape: 0.15,
    pocketDepth: 2,
  },
  draft: draftPaulFront,
}
