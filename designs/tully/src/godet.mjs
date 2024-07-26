import { body } from './body.mjs'
import { capitalize } from '@freesewing/core'

export const godet = {
  name: 'tully.godet',
  options: {
    hemEase: {
      pct: 0,
      min: -50,
      max: 100,
      menu: (settings, mergedOptions) => (mergedOptions?.godet ? 'fit' : false),
    },
    godet: {
      bool: false,
      menu: 'construction',
    },
  },
  after: body,
  measurements: ['waistToFloor'],
  draft: tullyGodet,
}

function tullyGodet({
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
  units,
  expand,
  utils,
}) {
  if (!options.godet) {
    return part.hide()
  }

  // The godet is triangle, which we draft on the fold.
  // We need the following dimensions:
  // length: constructed on body part
  // width at hem: we estimate the width that we'd need on a floor length dress and determine the angle using that

  const length = store.get('splitDistance')
  const floor = store.get('splitToFloor')
  const neededFloorWidth = measurements.waistToFloor
  const hemAllowance = sa * 2.5

  points.split = new Point(0, 0)
  points.hemCenter = new Point(0, length)
  points.floorCenter = new Point(0, floor)
  points.floorSide = new Point(neededFloorWidth / 2 - store.get('bodyWidth'), floor)

  const slope = points.floorSide.y / points.floorSide.x

  const width = (length / slope) * (1 + options.hemEase)

  if (expand) {
    store.flag.preset('expandIsOn')
  } else {
    // Expand is off, do not draw the part but flag this to the user
    const extraSa = sa ? 2 * sa : 0
    store.flag.note({
      msg: `tully:cut${capitalize(part.name.split('.')[1])}`,
      notes: [sa ? 'flag:saIncluded' : 'flag:saExcluded', 'flag:partHiddenByExpand'],
      replace: {
        w: units(2 * width + extraSa),
        l: units(length + extraSa),
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

  points.hemSide = new Point(width, length)

  paths.godet = new Path()
    .move(points.hemCenter)
    .line(points.hemSide)
    .line(points.split)
    .close()
    .addClass('fabric')

  if (sa) {
    paths.sa = new Path()
      .move(points.hemCenter)
      .line(points.hemCenter.translate(0, hemAllowance))
      .line(points.hemSide.translate(sa, hemAllowance))
      .line(points.hemSide.translate(sa, 0))
      .join(new Path().move(points.hemSide).line(points.split).offset(sa))
      .line(points.split.translate(sa, 0))
      .line(points.split.translate(sa, -hemAllowance))
      .line(points.split.translate(0, -hemAllowance))
      .line(points.split)
      .trim()
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
    margin: 0.2,
    offset: 10,
    from: points.split,
    to: points.hemCenter,
  })

  // Dimensions
  macro('vd', {
    id: 'height',
    from: points.split,
    to: points.hemCenter,
    x: -15,
  })
  macro('hd', {
    id: 'widthBottom',
    from: points.hemCenter,
    to: points.hemSide,
    y: points.hemCenter.y + hemAllowance + 15,
  })

  // Title
  points.title = points.hemCenter.translate(10, -20)
  macro('title', {
    nr: 5,
    title: 'godet',
    at: points.title,
    scale: 0.5,
    notes: [],
  })

  return part
}
