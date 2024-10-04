import { bool } from 'prop-types'

function draftBase({
  options,
  measurements,
  Point,
  Path,
  points,
  paths,
  Snippet,
  snippets,
  sa,
  macro,
  utils,
  part,
}) {
  const bustDist = (measurements.bustSpan / 2) * (1 + options.bustEase)
  const bustCirc = measurements.chest * (1 + options.bustEase)
  const hemCirc =
    (measurements.waist * options.length + measurements.underbust * (1 - options.length)) *
    (1 + options.hemEase)
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
  points.sfDart = points.sfHem.translate(0, -bustToHem)
  points.sfChest = points.cfBust.translate(bustCirc / 4, 0)
  points.armpit = new Point(points.sfChest.x, points.cfWaist.y - measurements.waistToArmpit)

  snippets.bustPoint = new Snippet('notch', points.bustPoint)

  const armpitWidth = points.armpit.x * 0.2
  const backWidth = measurements.chest * 0.05

  points.strapFrontLeft = points.hps.shiftFractionTowards(
    points.shoulder,
    options.strapPosition - options.strapWidth / 2
  )
  points.strapFrontRight = points.hps.shiftFractionTowards(
    points.shoulder,
    options.strapPosition + options.strapWidth / 2
  )
  points.strapBackLeft = points.hpsBack.shiftFractionTowards(
    points.shoulder,
    options.strapPosition - options.strapWidth / 2
  )
  points.strapBackRight = points.hpsBack.shiftFractionTowards(
    points.shoulder,
    options.strapPosition + options.strapWidth / 2
  )

  points.strapFrontLeftCp = points.strapFrontLeft.shift(
    options.strapAngle - 90 - measurements.shoulderSlope,
    40
  )
  points.strapFrontRightCp = points.strapFrontRight.shift(
    options.strapAngle - 90 - measurements.shoulderSlope,
    40
  )
  points.strapBackLeftCp = points.strapBackLeft.shift(
    options.strapAngle - 90 + measurements.shoulderSlope,
    40
  )
  points.strapBackRightCp = points.strapBackRight.shift(
    options.strapAngle - 90 + measurements.shoulderSlope,
    40
  )

  points.sfArmpitDart = points.armpit.shift(200, armpitWidth)
  points.armpitBottom = points.armpit.shift(270, armpitWidth)
  points.sbArmpitDart = points.armpitBottom.shift(5, armpitWidth * 2)

  points.sbHem = points.cfHem.translate(bustCirc * 0.36, 0)
  points.cbHem = points.cfHem.translate(bustCirc * 0.5, 0)
  points.cbNeck = new Point(backOffset, measurements.neck * options.neckHeightBack)
  points.sbDart = points.sbHem.translate(0, -bustToHem * 0.8)
  points.cbCenter = new Point(
    points.cbNeck.x,
    points.strapBackRight.y + (points.sbArmpitDart.y - points.strapBackRight.y) * 0.6
  )
  points.backCCenter = points.cbCenter.translate(-backWidth / 2, 0)
  points.backCCenterCp1 = points.backCCenter.translate(0, -40)
  points.backCCenterCp2 = points.backCCenter.translate(0, 40)

  points.cfNeckCp = points.cfNeck.translate(80, 0)
  points.cbNeckCp = points.cbNeck.translate(-40, 0)

  const frontArmpitAngle = -60
  const backArmpitAngle = points.backCCenterCp2.angle(points.armpitBottom)

  points.sfArmpitDartCp1 = points.sfArmpitDart.shift(frontArmpitAngle, armpitWidth / 2)
  points.sfArmpitDartCp2 = points.sfArmpitDart.shift(180 + frontArmpitAngle, armpitWidth * 2)

  points.sbArmpitDartCp1 = points.sbArmpitDart.shift(backArmpitAngle, armpitWidth / 2)
  points.sbArmpitDartCp2 = points.sbArmpitDart.shift(180 + backArmpitAngle, armpitWidth / 2)

  points.armpitBottomCp1 = points.armpitBottom.translate((armpitWidth * 2) / 3, 0)
  points.armpitBottomCp2 = points.armpitBottom.translate(-armpitWidth / 3, 0)

  points.sfHemCp1 = points.sfHem.shiftFractionTowards(points.cfHem, 1 / 3)
  points.sfHemCp2 = points.sfHem.shiftFractionTowards(points.sbHem, 1 / 3)
  points.sbHemCp1 = points.sbHem.shiftFractionTowards(points.sfHem, 1 / 3)
  points.sbHemCp2 = points.sbHem.shiftFractionTowards(points.cbHem, 1 / 3)

  let bottomDartWidth = (bustCirc - hemCirc) / 4
  let bustDartWidth = bustCirc * 0.025
  let backDartWidth = bustCirc * 0.01

  function constructDart(dartPoint, centerPointName, prevCpPointName, nextCpPointName, dartWidth) {
    const centerPoint = points[centerPointName]
    let dartAngle = (Math.atan(dartWidth / 2 / dartPoint.dist(centerPoint)) / Math.PI) * 180
    points[centerPointName + 'DartLeft'] = centerPoint.rotate(-dartAngle, dartPoint)
    points[centerPointName + 'DartRight'] = centerPoint.rotate(dartAngle, dartPoint)
    points[prevCpPointName + 'Dart'] = points[prevCpPointName].rotate(-dartAngle, dartPoint)
    points[nextCpPointName + 'Dart'] = points[nextCpPointName].rotate(dartAngle, dartPoint)
  }

  function adjustDart(dartPoint, referencePath, tester, adjust = 10) {
    let dist = adjust
    let offset = 0
    let lastCollision = false
    let probe = dartPoint.translate(offset, 0)
    for (let step = 0; step < 50; step++) {
      let testPath = tester(probe)
      let collision = testPath.intersects(referencePath).length > 0
      if (collision !== lastCollision) {
        dist /= 2
      }
      lastCollision = collision
      offset += collision ? -dist : dist
      probe = dartPoint.translate(offset, 0)
    }
    return probe
  }

  constructDart(points.sfDart, 'sfHem', 'sfHemCp1', 'sfHemCp2', bottomDartWidth)
  constructDart(points.sbDart, 'sbHem', 'sbHemCp1', 'sbHemCp2', bottomDartWidth)
  constructDart(points.sfDart, 'sfArmpitDart', 'sfArmpitDartCp1', 'sfArmpitDartCp2', bustDartWidth)
  constructDart(points.sbDart, 'sbArmpitDart', 'sbArmpitDartCp2', 'sbArmpitDartCp1', backDartWidth)

  points.sfDartSide = adjustDart(
    points.sfDart,
    new Path().move(points.sfHemDartLeft).curve_(points.sfDart, points.sfArmpitDartDartRight),
    (p) => new Path().move(points.sfArmpitDartDartLeft)._curve(p, points.sfHemDartRight),
    -10
  )

  points.sbDartSide = adjustDart(
    points.sbDart,
    new Path().move(points.sbHemDartRight).curve_(points.sbDart, points.sbArmpitDartDartLeft),
    (p) => new Path().move(points.sbArmpitDartDartRight)._curve(p, points.sbHemDartLeft),
    10
  )

  points.cfHem = utils
    .beamIntersectsX(points.sfHemCp1Dart, points.sfHemDartLeft, 0)
    .shiftFractionTowards(points.cfHem, 0.6)
  points.cbHem = utils
    .beamIntersectsX(points.sbHemCp2Dart, points.sbHemDartRight, points.cbHem.x)
    .shiftFractionTowards(points.cbHem, 0.6)

  paths.cf = new Path()
    .move(points.cfNeck)
    .line(points.cfHem)
    ._curve(points.sfHemCp1Dart, points.sfHemDartLeft)
    .curve_(points.sfDart, points.sfArmpitDartDartRight)
    .curve(points.sfArmpitDartCp2Dart, points.strapFrontRightCp, points.strapFrontRight)
    .line(points.strapFrontLeft)
    .curve(points.strapFrontLeftCp, points.cfNeckCp, points.cfNeck)
    .close()

  paths.cb = new Path()
    .move(points.sbHemDartRight)
    .curve_(points.sbHemCp2Dart, points.cbHem)
    .line(points.cbNeck)
    .curve(points.cbNeckCp, points.strapBackLeftCp, points.strapBackLeft)
    .line(points.strapBackRight)
    .curve(points.strapBackRightCp, points.backCCenterCp1, points.backCCenter)
    .curve(points.backCCenterCp2, points.sbArmpitDartCp2Dart, points.sbArmpitDartDartLeft)
    ._curve(points.sbDart, points.sbHemDartRight)
    .close()

  paths.side = new Path()
    .move(points.sfHemDartRight)
    .curve(points.sfHemCp2Dart, points.sbHemCp1Dart, points.sbHemDartLeft)
    .curve_(points.sbDartSide, points.sbArmpitDartDartRight)
    .curve(points.sbArmpitDartCp1Dart, points.armpitBottomCp1, points.armpitBottom)
    .curve(points.armpitBottomCp2, points.sfArmpitDartCp1Dart, points.sfArmpitDartDartLeft)
    ._curve(points.sfDartSide, points.sfHemDartRight)
    .close()

  return part
}

export const base = {
  name: 'base',
  measurements: [
    'neck',
    'chest',
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
    length: { pct: 30, min: 0, max: 100, menu: 'fit' },
    neckWidthFront: 0.17,
    neckHeightFront: 0.4,
    neckHeightBack: 0.17,
    bustEase: { pct: -20, min: -35, max: 0, menu: 'fit' },
    hemEase: { pct: -20, min: -35, max: 0, menu: 'fit' },
    strapPosition: { pct: 40, min: 40, max: 60, menu: 'fit' },
    strapWidth: { pct: 33, min: 20, max: 90, menu: 'fit' },
    strapAngle: { deg: 15, min: 0, max: 30, menu: 'fit' },
  },
  draft: draftBase,
}
