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
    seatEase: { pct: 15, min: 5, max: 50, menu: 'fit' },
    armpitEase: { pct: 33, min: 15, max: 50, menu: 'fit' },
    length: {
      dflt: 'thigh',
      list: ['thigh', 'knee', 'calf', 'floor'],
      menu: 'style',
    },
    lengthBonus: {
      pct: 0,
      min: -20,
      max: 20,
      menu: 'style',
      toAbs: (val, data, mergedOptions) =>
        determineAdjustedLength(mergedOptions, data.measurements) -
        determineLength(mergedOptions, data.measurements),
    },
    splitPosition: { pct: 30, min: -10, max: 100, menu: 'fit' },
    shoulderSeam: { bool: true, menu: 'construction' },
    centerSeam: { bool: false, menu: 'construction' },
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

  const topWidth = ((measurements.chest + measurements.biceps / 3.5) / 4) * (1 + options.chestEase)
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
        w: units((options.centerSeam ? 1 : 2) * width + extraSa),
        l: units((options.shoulderSeam ? 1 : 2) * length + sa + hemAllowance),
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
  if (sa) {
    paths.sa = new Path()
      .move(points.centerHem)
      .line(points.centerHem.translate(0, hemAllowance))
      .line(points.sideHem.translate(sa, hemAllowance))
      .addClass('fabric sa')

    if (options.shoulderSeam) {
      paths.sa
        .line(points.sideShoulder.translate(sa, -sa))
        .line(points.centerShoulder.translate(0, -sa))
      if (!options.centerSeam) {
        paths.sa.line(points.centerShoulder)
      }
    } else {
      paths.sa
        .line(points.sideShoulder.translate(sa, 0))
        .line(points.sideShoulder)
        .move(points.centerShoulder)
    }
    if (options.centerSeam) {
      paths.sa
        .line(paths.sa.end().translate(-sa, 0))
        .line(points.centerHem.translate(-sa, hemAllowance))
      paths.sa.ops[0].to = points.centerHem.translate(-sa, hemAllowance)
    }
  }
  /*
   * Annotations
   */

  snippets.splitPosition = new Snippet('notch', points.splitPosition)
  snippets.armpit = new Snippet('notch', points.armpit)

  let cuts = 1
  if (options.shoulderSeam) cuts *= 2
  if (options.centerSeam) cuts *= 2

  // Cutlist
  store.cutlist.setCut({
    cut: cuts,
    from: 'fabric',
    onFold: options.shoulderSeam || options.centerSeam,
    identical: true,
  })

  // Grainline
  if (options.centerSeam) {
    macro('grainline', {
      id: 'left',
      from: points.centerShoulder.translate(15, 0),
      to: points.centerHem.translate(15, 0),
    })
  } else {
    macro('cutonfold', {
      id: 'left',
      grainline: true,
      from: points.centerShoulder,
      to: points.centerHem,
    })
  }

  if (!options.shoulderSeam) {
    macro('cutonfold', {
      id: 'top',
      from: points.sideShoulder,
      to: points.centerShoulder,
    })
  }

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
