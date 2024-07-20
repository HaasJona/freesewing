import { capitalize } from '@freesewing/core'
import { body } from './body.mjs'

export const sleeve = {
  name: 'taliesin.sleeve',
  options: {
    sleeveLength: {
      pct: 100,
      min: 30,
      max: 110,
      menu: 'style',
    },
    wristEase: {
      pct: 80,
      min: 20,
      max: 200,
      menu: 'fit',
    },
    cuffWidth: {
      pct: 150,
      min: 100,
      max: 500,
      menu: (settings) => (settings.sa ? 'style' : false),
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
  units,
  expand,
}) {
  // The sleeve is a trapezoid which we draft on the fold.
  // We need the following dimensions:
  // width at armpit: constructed on body part
  // width at wrist: from wrist measurement
  // length: length from shoulder to wrist

  const wristToWrist = measurements.shoulderToShoulder + 2 * measurements.shoulderToWrist
  const length = wristToWrist / 2 - store.get('bodyWidth')
  const wristWidth = (1 + options.wristEase) * measurements.wrist
  const hemAllowance = options.cuffWidth * sa * 2
  const armpitWidth = store.get('armpitDistance')

  points.shoulder = new Point(0, 0)
  points.armpit = new Point(armpitWidth, 0)
  points.wristCenter = new Point(0, length)
  points.wristSide = new Point(wristWidth / 2, length)
  points.cuffCenter = points.wristCenter.shiftFractionTowards(
    points.shoulder,
    1 - options.sleeveLength
  )
  points.cuffSide = points.wristSide.shiftFractionTowards(points.armpit, 1 - options.sleeveLength)
  const flatLength = points.cuffSide.y / 3
  points.forearm = points.cuffSide.translate(0, -flatLength)

  if (expand) {
    store.flag.preset('expandIsOn')
  } else {
    // Expand is off, do not draw the part but flag this to the user
    const extraSa = sa ? 2 * sa : 0
    store.flag.note({
      msg: `taliesin:cut${capitalize(part.name.split('.')[1])}`,
      notes: [sa ? 'flag:saIncluded' : 'flag:saExcluded', 'flag:partHiddenByExpand'],
      replace: {
        wt: units(2 * armpitWidth + extraSa),
        wb: units(2 * points.cuffSide.x + extraSa),
        l: units(points.cuffCenter.y + extraSa / 2 + hemAllowance),
        fl: units(flatLength + extraSa / 2 + hemAllowance),
      },
      suggest: {
        text: 'flag:show',
        icon: 'expand',
        update: {
          settings: ['expand', 1],
        },
      },
    })
    // Also hint about expand
    store.flag.preset('expandIsOff')

    return part.hide()
  }

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

    paths.cuffFold = new Path()
      .move(points.cuffCenter.translate(0, hemAllowance / 2))
      .line(points.cuffSide.translate(sa, hemAllowance / 2))
      .addClass('fabric lashed')
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
