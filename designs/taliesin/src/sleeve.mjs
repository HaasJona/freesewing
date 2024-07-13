import { body } from './body.mjs'

export const sleeve = {
  name: 'taliesin.sleeve',
  options: {
    sleeveLength: {
      pct: 100,
      min: 20,
      max: 110,
      menu: 'fit',
    },
    wristEase: {
      pct: 80,
      min: 5,
      max: 200,
      menu: 'fit',
    },
  },
  after: body,
  measurements: ['shoulderToShoulder', 'shoulderToWrist', 'wrist'],
  draft: taliesinSleeve,
}

function taliesinSleeve({
  options,
  store,
  measurements,
  points,
  paths,
  Point,
  Path,
  sa,
  macro,
  snippets,
  Snippet,
  part,
  utils,
}) {
  // The sleeve is a trapezoid which we draft on the fold.
  // We need the following dimensions:
  // width at armpit: constructed on body part
  // width at wrist: from wrist measurement
  // length: length from shoulder to wrist

  const wristToWrist = measurements.shoulderToShoulder + 2 * measurements.shoulderToWrist
  const length = wristToWrist / 2 - store.get('bodyWidth')
  const wristWidth = (1 + options.wristEase) * measurements.wrist

  const hemAllowance = sa * 2.5

  const armpitDistance = store.get('armpitDistance')

  points.shoulder = new Point(0, 0)
  points.armpit = new Point(armpitDistance, 0)
  points.wristCenter = new Point(0, length)
  points.wristSide = new Point(wristWidth / 2, length)
  points.cuffCenter = points.wristCenter.shiftFractionTowards(
    points.shoulder,
    1 - options.sleeveLength
  )
  points.cuffSide = points.wristSide.shiftFractionTowards(points.armpit, 1 - options.sleeveLength)
  points.forearm = points.cuffSide.translate(0, measurements.shoulderToWrist / -3)

  const sideLine = new Path().move(points.cuffSide).line(points.forearm).line(points.armpit)

  paths.sleeve = new Path()
    .move(points.cuffCenter)
    .join(sideLine)
    .line(points.shoulder)
    .close()
    .addClass('fabric')

  if (sa) {
    paths.sa = new Path()
      .move(points.cuffCenter)
      .line(points.cuffCenter.translate(0, hemAllowance))
      .line(points.cuffSide.translate(sa, hemAllowance))
      .join(sideLine.offset(sa))
      .line(points.armpit.translate(sa, -sa))
      .line(points.shoulder.translate(0, -sa))
      .line(points.shoulder)
      .addClass('fabric sa')
  }

  /*
   * Annotations
   */

  // Cutlist
  store.cutlist.setCut({ cut: 2, from: 'fabric', onFold: true, identical: true })

  // Grainline
  macro('cutonfold', {
    grainline: true,
    from: points.shoulder,
    to: points.cuffCenter,
  })

  // Dimensions
  macro('hd', {
    id: 'widthTop',
    from: points.shoulder,
    to: points.armpit,
    y: -sa - 15,
  })
  macro('hd', {
    id: 'widthBottom',
    from: points.cuffCenter,
    to: points.cuffSide,
    y: points.cuffCenter.y + hemAllowance + 15,
  })
  macro('vd', {
    id: 'height',
    from: points.shoulder,
    to: points.cuffCenter,
    x: -15,
  })
  macro('vd', {
    id: 'straightHeight',
    from: points.forearm,
    to: points.cuffSide,
    x: points.cuffSide.x - 15,
  })
  macro('vd', {
    id: 'upperHeight',
    from: points.forearm,
    to: points.armpit,
    x: points.armpit.x + 15,
  })

  macro('title', {
    nr: 2,
    title: 'sleeve',
    at: new Point(40, 100),
    notes: [],
  })

  return part
}
