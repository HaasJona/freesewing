import { capitalize } from '@freesewing/core'

export const body = {
  name: 'taliesin.body',
  measurements: [
    'hpsToWaistBack',
    'chest',
    'seat',
    'waistToHips',
    'waistToUpperLeg',
    'waistToKnee',
    'waistToFloor',
    'biceps',
  ],
  options: {
    chestEase: { pct: 15, min: 5, max: 25, menu: 'fit' },
    seatEase: { pct: 15, min: 5, max: 25, menu: 'fit' },
    armpitEase: { pct: 33, min: 15, max: 50, menu: 'fit' },
    length: {
      dflt: 'thigh',
      list: ['thigh', 'knee', 'calf', 'floor'],
      menu: 'fit',
    },
    lengthBonus: {
      pct: 0,
      min: -20,
      max: 20,
      menu: 'fit',
      toAbs: (val, data, mergedOptions) =>
        determineAdjustedLength(mergedOptions, data.measurements) -
        determineLength(mergedOptions, data.measurements),
    },
    splitPosition: { pct: 30, min: -10, max: 100, menu: 'fit' },
  },
  draft: taliesinBody,
}

function determineAdjustedLength(options, measurements) {
  return (1 + options.lengthBonus) * determineLength(options, measurements)
}

function determineLength(options, measurements) {
  switch (options.length) {
    case 'thigh':
      return (
        measurements.hpsToWaistBack + (measurements.waistToUpperLeg + measurements.waistToKnee) / 2
      )
    case 'knee':
      return measurements.hpsToWaistBack + measurements.waistToKnee
    case 'calf':
      return (
        measurements.hpsToWaistBack + (measurements.waistToKnee + measurements.waistToFloor) / 2
      )
    case 'floor':
      return measurements.hpsToWaistBack + measurements.waistToFloor
  }
  throw `unsupported length value : ${options.length}`
}

function taliesinBody({
  store,
  sa,
  Point,
  points,
  Path,
  paths,
  Snippet,
  snippets,
  options,
  absoluteOptions,
  measurements,
  macro,
  complete,
  expand,
  units,
  part,
}) {
  // The body is a rectangular piece of fabric.
  // We need the following dimensions:
  // width: based on the largest body measurement
  // length: length from hps to the middle of the upper leg

  const topWidth = (measurements.chest / 4) * (1 + options.chestEase)
  const bottomWidth = (measurements.seat / 4) * (1 + options.seatEase)
  const width = Math.max(topWidth, bottomWidth)

  const length = determineAdjustedLength(options, measurements)

  const hemAllowance = sa * 2.5

  points.centerShoulder = new Point(0, 0)
  points.sideShoulder = new Point(width, 0)
  points.sideHem = new Point(width, length)
  points.centerHem = new Point(0, length)

  points.centerFloor = new Point(0, measurements.hpsToWaistBack + measurements.waistToFloor)
  points.armpit = new Point(width, ((1 + options.armpitEase) * measurements.biceps) / 2)
  points.splitPosition = new Point(
    width,
    measurements.hpsToWaistBack +
      measurements.waistToHips +
      ((measurements.waistToUpperLeg + measurements.waistToKnee) / 2 - measurements.waistToHips) *
        options.splitPosition
  )

  store.set('armpitDistance', points.sideShoulder.dist(points.armpit))
  store.set('splitDistance', points.splitPosition.dist(points.sideHem))
  store.set('splitToFloor', points.splitPosition.dy(points.centerFloor))
  store.set('bodyWidth', width)

  if (expand) {
    store.flag.preset('expandIsOn')
  } else {
    // Expand is off, do not draw the part but flag this to the user
    const extraSa = sa ? 2 * sa : 0
    store.flag.note({
      msg: `taliesin:cut${capitalize(part.name.split('.')[1])}`,
      notes: [sa ? 'flag:saIncluded' : 'flag:saExcluded', 'flag:partHiddenByExpand'],
      replace: {
        w: units(2 * width + extraSa),
        l: units(length + sa + hemAllowance),
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

  paths.body = new Path()
    .move(points.centerHem)
    .line(points.sideHem)
    .line(points.sideShoulder)
    .line(points.centerShoulder)
    .close()
    .addClass('fabric')
  if (sa)
    paths.sa = new Path()
      .move(points.centerHem)
      .line(points.centerHem.translate(0, hemAllowance))
      .line(points.sideHem.translate(sa, hemAllowance))
      .line(points.sideShoulder.translate(sa, -sa))
      .line(points.centerShoulder.translate(0, -sa))
      .line(points.centerShoulder)
      .addClass('fabric sa')

  /*
   * Annotations
   */

  snippets.splitPosition = new Snippet('notch', points.splitPosition)
  snippets.armpit = new Snippet('notch', points.armpit)

  // Cutlist
  store.cutlist.setCut({ cut: 2, from: 'fabric', onFold: true, identical: true })

  // Grainline
  macro('cutonfold', {
    grainline: true,
    from: points.centerShoulder,
    to: points.centerHem,
  })

  // Dimensions
  macro('hd', {
    id: 'width',
    from: points.centerShoulder,
    to: points.sideShoulder,
    y: -sa - 15,
  })
  macro('vd', {
    id: 'height',
    from: points.centerHem,
    to: points.centerShoulder,
    x: -15,
  })
  macro('vd', {
    id: 'shoulderToArmpit',
    from: points.sideShoulder,
    to: points.armpit,
    x: points.sideShoulder.x - 15,
  })
  macro('vd', {
    id: 'armpitToSplit',
    from: points.armpit,
    to: points.splitPosition,
    x: points.sideShoulder.x - 15,
  })
  macro('vd', {
    id: 'splitToHem',
    from: points.splitPosition,
    to: points.sideHem,
    x: points.sideShoulder.x - 15,
  })

  macro('title', {
    nr: 1,
    title: 'body',
    at: new Point(40, 100),
    notes: [],
  })

  return part
}
