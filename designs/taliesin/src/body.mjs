import { capitalize } from '@freesewing/core'

export const body = {
  name: 'taliesin.body',
  measurements: ['hpsToWaistBack', 'chest', 'seat', 'waistToUpperLeg', 'waistToKnee'],
  options: {
    chestEase: { pct: 15, min: 5, max: 25, menu: 'fit' },
    seatEase: { pct: 15, min: 5, max: 25, menu: 'fit' },
    length: { pct: 100, min: 50, max: 150, menu: 'fit' },
  },
  draft: taliesinBody,
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
  // The body is rectangular piece of fabric.
  // We need the following dimensions:
  // width: based on the largest body measurement
  // length: length from hps to middle of upper leg

  const topWidth = (measurements.chest / 4) * (1 + options.chestEase)
  const bottomWidth = (measurements.seat / 4) * (1 + options.seatEase)
  const width = Math.max(topWidth, bottomWidth)
  const length =
    (measurements.hpsToWaistBack + (measurements.waistToUpperLeg + measurements.waistToKnee) / 2) *
    options.length

  const hemAllowance = sa * 3

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
        l: units(length + extraSa + hemAllowance),
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

  points.centerShoulder = new Point(0, 0)
  points.sideShoulder = new Point(width, 0)
  points.sideHem = new Point(width, length)
  points.centerHem = new Point(0, length)

  paths.body = new Path()
    .move(points.centerShoulder)
    .line(points.centerHem)
    .line(points.sideHem)
    .line(points.sideShoulder)
    .close()
    .addClass('fabric')
  paths.sa = new Path()
    .move(points.centerShoulder.translate(0, -sa))
    .line(points.centerHem.translate(0, hemAllowance))
    .line(points.sideHem.translate(sa, hemAllowance))
    .line(points.sideShoulder.translate(sa, -sa))
    .close()
    .addClass('fabric sa')

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

  return part
}
