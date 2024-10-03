import { bustPlugin } from '@freesewing/plugin-bust'

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

  points.strapFrontLeft = points.hps.shiftFractionTowards(points.shoulder, 1 / 3)
  points.strapFrontRight = points.hps.shiftFractionTowards(points.shoulder, 2 / 3)
  points.strapBackLeft = points.hpsBack.shiftFractionTowards(points.shoulder, 1 / 3)
  points.strapBackRight = points.hpsBack.shiftFractionTowards(points.shoulder, 2 / 3)
  points.sfArmpitDart = points.armpit.shift(180, armpitWidth)
  points.armpitBottom = points.armpit.shift(270, armpitWidth)
  points.sbArmpitDart = points.armpit.shift(-20, armpitWidth * 1.8)

  paths.cf = new Path()
    .move(points.cfNeck)
    .line(points.cfHem)
    .line(points.sfHem)
    .line(points.sfDart)
    .line(points.sfArmpitDart)
    .line(points.strapFrontRight)
    .line(points.strapFrontLeft)
    .close()

  points.sbHem = points.sfHem.translate(bustCirc * 0.25, 0)
  points.cbHem = points.sbHem.translate(bustCirc * 0.1, 0)
  points.cbNeck = new Point(backOffset, measurements.neck * options.neckHeightBack)

  points.sbDart = points.sbHem.translate(0, -bustToHem * 0.6)

  paths.cb = new Path()
    .move(points.sbHem)
    .line(points.cbHem)
    .line(points.cbNeck)
    .line(points.strapBackLeft)
    .line(points.strapBackRight)
    .line(points.sbArmpitDart)
    .line(points.sbDart)
    .close()
  paths.side = new Path()
    .move(points.sfHem)
    .line(points.sbHem)
    .line(points.sbDart)
    .line(points.sbArmpitDart)
    .line(points.armpitBottom)
    .line(points.sfArmpitDart)
    .line(points.sfDart)
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
    bustEase: { pct: -15, min: -30, max: 0, menu: 'fit' },
    hemEase: { pct: -15, min: -30, max: 0, menu: 'fit' },
  },
  draft: draftBase,
}
