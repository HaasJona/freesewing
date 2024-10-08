function draftBase({ options, measurements, Point, Path, points, paths, utils, store, part }) {
  const bustDist = (measurements.bustSpan / 2) * (1 + options.horizontalEase)
  const bustCirc = measurements.chest * (1 + options.horizontalEase)
  const chestCirc = measurements.highBust * (1 + options.horizontalEase)
  const bustFront = measurements.bustFront * (1 + options.horizontalEase)
  const hemCirc =
    (measurements.waist * options.length + measurements.underbust * (1 - options.length)) *
    (1 + options.extraHemEase) *
    (1 + options.horizontalEase)
  points.hps = new Point(measurements.neck * options.neckWidthFront, 0)
  points.shoulder = utils.beamIntersectsX(
    points.hps,
    points.hps.shift(measurements.shoulderSlope * -1, 100),
    measurements.shoulderToShoulder / 2
  )
  const backOffset = bustCirc / 2
  points.hpsBack = new Point(backOffset - points.hps.x, 0)
  points.shoulderBack = new Point(backOffset - points.shoulder.x, points.shoulder.y)

  points.cfNeck = new Point(0, measurements.neck * options.neckHeightFront)
  points.cfBust = new Point(0, measurements.hpsToBust)
  points.cfUnderbust = points.cfBust.translate(0, measurements.bustPointToUnderbust)
  points.cfWaist = new Point(0, measurements.hpsToWaistFront)
  points.bustPoint = new Point(bustDist, measurements.hpsToBust)
  points.cfHem = points.cfUnderbust.shiftFractionTowards(points.cfWaist, options.length)
  const bustToHem = points.cfBust.dy(points.cfHem)

  points.sfHem = points.cfHem.translate(bustCirc * 0.15, 0)
  points.sfChest = points.cfBust.translate(bustFront / 2, 0)
  points.sfDart = points.sfHem
    .translate(0, -bustToHem)
    .shiftFractionTowards(points.bustPoint, options.bustPointFocus)
  points.armpit = new Point(
    points.sfChest.x,
    points.cfWaist.y - measurements.waistToArmpit * (1 - options.armpitAdjustment)
  )

  const armpitWidth = bustCirc * 0.05
  const backWidth = measurements.chest * options.backWidth

  const strapPositionAdj = options.strapPosition * (1 - options.strapWidth) + options.strapWidth / 2
  points.strapFrontLeft = points.hps.shiftFractionTowards(
    points.shoulder,
    strapPositionAdj - options.strapWidth / 2
  )
  points.strapFrontRight = points.hps.shiftFractionTowards(
    points.shoulder,
    strapPositionAdj + options.strapWidth / 2
  )
  points.strapBackLeft = points.hpsBack.shiftFractionTowards(
    points.shoulderBack,
    strapPositionAdj - options.strapWidth / 2
  )
  points.strapBackRight = points.hpsBack.shiftFractionTowards(
    points.shoulderBack,
    strapPositionAdj + options.strapWidth / 2
  )

  points.strapFrontLeftCp = points.strapFrontLeft.shift(
    options.strapAngle - 90 - measurements.shoulderSlope,
    measurements.chest * options.strapCurveFront
  )
  points.strapFrontRightCp = points.strapFrontRight.shift(
    options.strapAngle - 90 - measurements.shoulderSlope,
    measurements.chest * options.strapCurveFront
  )
  points.strapBackLeftCp = points.strapBackLeft.shift(
    options.strapAngle - 90 + measurements.shoulderSlope,
    measurements.chest * options.strapCurveBack
  )
  points.strapBackRightCp = points.strapBackRight.shift(
    options.strapAngle - 90 + measurements.shoulderSlope,
    measurements.chest * options.strapCurveBack
  )

  points.sfArmpit = points.armpit.shift(180, armpitWidth)
  points.armpitBottom = points.armpit.shift(270, armpitWidth)

  points.sbHem = points.cfHem.translate(bustCirc * 0.36, 0)
  points.sbBust = points.cfBust.translate(bustCirc * 0.36, 0)
  points.cbHem = points.cfHem.translate(bustCirc * 0.5, 0)
  points.cbNeck = new Point(backOffset, measurements.neck * options.neckHeightBack)
  points.sbDart = points.sbHem.translate(0, -bustToHem * 0.8)

  points.sbArmpit = utils
    .beamsIntersect(
      points.sbBust,
      points.armpit,
      points.armpitBottom,
      points.armpitBottom.shift(10, 10)
    )
    .translate(armpitWidth, 0)
  if (points.sbArmpit.x > points.sbBust.x) {
    points.sbArmpit.x = points.sbBust.x
  }

  points.cbCenter = new Point(
    points.cbNeck.x,
    points.strapBackRight.y + (points.sbArmpit.y - points.strapBackRight.y) * 0.6
  )
  points.backCCenter = points.cbCenter.translate(-backWidth / 2, 0)
  points.backCCenterCp1 = points.backCCenter.translate(
    0,
    points.strapBackRight.dy(points.backCCenter) * -options.upperBackShape
  )
  points.backCCenterCp2 = points.backCCenter.translate(
    0,
    points.strapBackRight.dy(points.backCCenter) * options.lowerBackShape
  )

  points.cfNeckCp = points.cfNeck.translate(80, 0)
  points.cbNeckCp = points.cbNeck.translate(-20, 0)

  const frontArmpitAngle = -60
  const backArmpitAngle = points.backCCenterCp2.angle(points.armpitBottom)

  points.sfArmpitCp1 = points.sfArmpit.shift(frontArmpitAngle, armpitWidth)
  points.sfArmpitCp2 = points.sfArmpit.shift(180 + frontArmpitAngle, armpitWidth)

  points.sbArmpitCp1 = points.sbArmpit.shift(backArmpitAngle, armpitWidth)
  points.sbArmpitCp2 = points.sbArmpit.shift(180 + backArmpitAngle, armpitWidth / 2)

  points.sfHemCp1 = points.sfHem.shiftFractionTowards(points.cfHem, 1 / 3)
  points.sfHemCp2 = points.sfHem.shiftFractionTowards(points.sbHem, 1 / 3)
  points.sbHemCp1 = points.sbHem.shiftFractionTowards(points.sfHem, 1 / 3)
  points.sbHemCp2 = points.sbHem.shiftFractionTowards(points.cbHem, 1 / 3)

  let bottomDartWidth = Math.max(0, (bustCirc - hemCirc) / 4)
  let bustDartWidth = Math.max(0, (bustCirc - chestCirc) / 2) + bustCirc * 0.01
  let backDartWidth = bustCirc * 0.01

  function constructDart(dartPoint, centerPointName, prevCpPointName, nextCpPointName, dartWidth) {
    const centerPoint = points[centerPointName]
    let dartAngle = (Math.atan(dartWidth / 2 / dartPoint.dist(centerPoint)) / Math.PI) * 180
    points[centerPointName + 'DartLeft'] = centerPoint.rotate(-dartAngle, dartPoint)
    points[centerPointName + 'DartRight'] = centerPoint.rotate(dartAngle, dartPoint)
    points[prevCpPointName + 'Dart'] = points[prevCpPointName].rotate(-dartAngle, dartPoint)
    points[nextCpPointName + 'Dart'] = points[nextCpPointName].rotate(dartAngle, dartPoint)
  }

  function adjustDart(dartPoint, referencePath, tester, collisionPointName = null, adjust = 10) {
    let dist = adjust
    let offset = 0
    let lastCollision = false
    let probe = dartPoint.translate(offset, 0)
    // paths['refPath' + adjust + "--"] = referencePath.clone().addClass('contrast')

    for (let step = 0; step < 15; step++) {
      let testPath = tester(probe)
      const intersections = testPath.intersects(referencePath)
      let collision = intersections.length > 0
      // paths['refPath' + adjust + "-" + step] = testPath
      // if(collision) paths['refPath' + adjust + "-" + step].addClass('mark')
      if (collision !== lastCollision) {
        dist *= 1 / 3
      }
      if (collision && collisionPointName) {
        points[collisionPointName] = intersections[0]
      }
      lastCollision = collision
      offset += collision ? -dist : dist
      probe = dartPoint.translate(offset, 0)
      if (Math.abs(dist) < 0.1) {
        break
      }
    }
    return probe
  }

  constructDart(points.sfDart, 'sfHem', 'sfHemCp1', 'sfHemCp2', bottomDartWidth)
  constructDart(points.sbDart, 'sbHem', 'sbHemCp1', 'sbHemCp2', bottomDartWidth)
  constructDart(points.sfDart, 'sfArmpit', 'sfArmpitCp1', 'sfArmpitCp2', bustDartWidth)
  constructDart(points.sbDart, 'sbArmpit', 'sbArmpitCp2', 'sbArmpitCp1', backDartWidth)

  if (bottomDartWidth > 0) {
    points.sfDartSide = adjustDart(
      points.sfDart,
      new Path()
        .move(points.sfHemDartLeft)
        .curve(points.sfDart, points.sfDart, points.sfArmpitDartRight),
      (p) => new Path().move(points.sfArmpitDartLeft).curve(p, p, points.sfHemDartRight),
      'frontJoin',
      -10
    )

    points.sbDartSide = adjustDart(
      points.sbDart,
      new Path()
        .move(points.sbHemDartRight)
        .curve(points.sbDart, points.sbDart, points.sbArmpitDartLeft),
      (p) => new Path().move(points.sbArmpitDartRight).curve(p, p, points.sbHemDartLeft),
      'backJoin',
      10
    )
  } else {
    points.sfDartSide = points.sfDart
    points.sbDartSide = points.sbDart
    points.frontJoin = points.sfHem
    points.backJoin = points.sbHem
  }

  points.strapBackLeft = points.strapBackLeft.rotate(-options.backDartAngle, points.cbCenter)
  points.strapBackLeftCp = points.strapBackLeftCp.rotate(-options.backDartAngle, points.cbCenter)
  points.strapBackRight = points.strapBackRight.rotate(-options.backDartAngle, points.cbCenter)
  points.strapBackRightCp = points.strapBackRightCp.rotate(-options.backDartAngle, points.cbCenter)

  points.cfHem = utils
    .beamIntersectsX(points.sfHemCp1Dart, points.sfHemDartLeft, 0)
    .shiftFractionTowards(points.cfHem, 0.6)
  points.cbHem = utils
    .beamIntersectsX(points.sbHemCp2Dart, points.sbHemDartRight, points.cbHem.x)
    .shiftFractionTowards(points.cbHem, 0.6)

  paths.front = new Path()
    .move(points.cfHem)
    ._curve(points.sfHemCp1Dart, points.sfHemDartLeft)
    .curve(points.sfDart, points.sfDart, points.sfArmpitDartRight)
    .curve(points.sfArmpitCp2Dart, points.strapFrontRightCp, points.strapFrontRight)
    .line(points.strapFrontLeft)
    .curve(points.strapFrontLeftCp, points.cfNeckCp, points.cfNeck)
    .close()

  paths.frontStrap = new Path().move(points.strapFrontRight).line(points.strapFrontLeft).hide()

  paths.frontSideJoin = new Path()
    .move(points.sfHemDartLeft)
    .curve(points.sfDart, points.sfDart, points.sfArmpitDartRight)
    .hide()

  paths.frontHem = new Path()
    .move(points.cfHem)
    ._curve(points.sfHemCp1Dart, points.sfHemDartLeft)
    .hide()

  paths.back = new Path()
    .move(points.sbHemDartRight)
    .curve_(points.sbHemCp2Dart, points.cbHem)
    .line(points.cbNeck)
    .curve(points.cbNeckCp, points.strapBackLeftCp, points.strapBackLeft)
    .line(points.strapBackRight)
    .curve(points.strapBackRightCp, points.backCCenterCp1, points.backCCenter)
    .curve(points.backCCenterCp2, points.sbArmpitCp2Dart, points.sbArmpitDartLeft)
    .curve(points.sbDart, points.sbDart, points.sbHemDartRight)
    .close()

  paths.backHem = new Path()
    .move(points.sbHemDartRight)
    .curve_(points.sbHemCp2Dart, points.cbHem)
    .hide()

  paths.backStrap = new Path().move(points.strapBackLeft).line(points.strapBackRight).hide()

  paths.backSideJoin = new Path()
    .move(points.sbArmpitDartLeft)
    .curve(points.sbDart, points.sbDart, points.sbHemDartRight)
    .hide()

  paths.side = new Path()
    .move(points.sfHemDartRight)
    .curve(points.sfHemCp2Dart, points.sbHemCp1Dart, points.sbHemDartLeft)
    .curve(points.sbDartSide, points.sbDartSide, points.sbArmpitDartRight)
    .curve(points.sbArmpitCp1Dart, points.sfArmpitCp1Dart, points.sfArmpitDartLeft)
    .curve(points.sfDartSide, points.sfDartSide, points.sfHemDartRight)
    .close()

  paths.sideFrontJoin = new Path()
    .move(points.sfArmpitDartLeft)
    .curve(points.sfDartSide, points.sfDartSide, points.sfHemDartRight)
    .hide()

  paths.sideBackJoin = new Path()
    .move(points.sbHemDartLeft)
    .curve(points.sbDartSide, points.sbDartSide, points.sbArmpitDartRight)
    .hide()

  paths.sideHem = new Path()
    .move(points.sfHemDartRight)
    .curve(points.sfHemCp2Dart, points.sbHemCp1Dart, points.sbHemDartLeft)
    .hide()

  store.set(
    'waistband',
    2 * (paths.frontHem.length() + paths.sideHem.length() + paths.backHem.length())
  )

  return part
}

export const base = {
  name: 'base',
  measurements: [
    'neck',
    'chest',
    'bustFront',
    'highBust',
    'underbust',
    'waist',
    'hpsToBust',
    'hpsToWaistFront',
    'waistToArmpit',
    'bustPointToUnderbust',
    'shoulderSlope',
    'shoulderToShoulder',
    'bustSpan',
  ],
  options: {
    length: { pct: 22.5, min: 0, max: 100, menu: 'fit' },
    neckWidthFront: 0.17,
    neckHeightFront: { pct: 35, min: 25, max: 50, menu: 'style' },
    neckHeightBack: { pct: 17, min: 10, max: 25, menu: 'style' },
    horizontalEase: { pct: -16, min: -35, max: 0, menu: 'fit' },
    extraHemEase: { pct: 0, min: -20, max: 0, menu: 'fit' },
    armpitAdjustment: { pct: -1.5, min: -10, max: 10, menu: 'fit' },
    strapPosition: { pct: 40, min: 20, max: 60, menu: 'fit' },
    strapAngle: { deg: 25, min: 0, max: 45, menu: 'fit' },
    strapWidth: { pct: 33, min: 15, max: 50, menu: 'style' },
    backWidth: { pct: 9, min: 2.5, max: 20, menu: 'style' },
    bustPointFocus: { pct: 0, min: -50, max: 100, menu: 'fit' },
    backDartAngle: { deg: 10, min: 0, max: 30, menu: 'advanced' },
    upperBackShape: { pct: 40, min: 20, max: 60, menu: 'advanced' },
    lowerBackShape: { pct: 40, min: 20, max: 80, menu: 'advanced' },
    strapCurveFront: { pct: 5, min: 2, max: 10, menu: 'advanced' },
    strapCurveBack: { pct: 3, min: 1, max: 4, menu: 'advanced' },
  },
  draft: draftBase,
}
