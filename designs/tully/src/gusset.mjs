import { capitalize, hidePresets } from '@freesewing/core'
import { body } from './body.mjs'

export const gusset = {
  name: 'tully.gusset',
  options: {
    gusset: {
      bool: false,
      menu: 'construction',
    },
  },
  after: body,
  draft: tullyGusset,
}

function tullyGusset({
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
  expand,
  units,
  part,
  utils,
}) {
  if (!options.gusset) {
    return part.hide()
  }

  // The gusset is a square that's about 13cm wide for an adult.

  const gussetWidth = store.get('armpitDistance') * 0.42

  points.topLeft = new Point(0, 0)
  points.topRight = new Point(gussetWidth, 0)
  points.bottomLeft = new Point(0, gussetWidth)
  points.bottomRight = new Point(gussetWidth, gussetWidth)
  paths.gusset = new Path()
    .move(points.topLeft)
    .line(points.bottomLeft)
    .line(points.bottomRight)
    .line(points.topRight)
    .close()
    .setClass('fabric')

  if (sa) {
    points.topLeftSa = new Point(-sa, -sa)
    points.topRightSa = new Point(gussetWidth + sa, -sa)
    points.bottomLeftSa = new Point(-sa, gussetWidth + sa)
    points.bottomRightSa = new Point(gussetWidth + sa, gussetWidth + sa)
    paths.sa = new Path()
      .move(points.topLeftSa)
      .line(points.bottomLeftSa)
      .line(points.bottomRightSa)
      .line(points.topRightSa)
      .close()
      .setClass('fabric sa')
  }

  if (expand) {
    store.flag.preset('expandIsOn')
  } else {
    // Expand is off, do not draw the part but flag this to the user
    const extraSa = sa ? 2 * sa : 0
    store.flag.note({
      msg: `tully:cut${capitalize(part.name.split('.')[1])}`,
      notes: [sa ? 'flag:saIncluded' : 'flag:saExcluded', 'flag:partHiddenByExpand'],
      replace: {
        w: units(gussetWidth + extraSa),
        l: units(gussetWidth + extraSa),
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

  /*
   * Annotations
   */

  // Cutlist
  store.cutlist.setCut({ cut: 2, from: 'fabric', onFold: false, identical: true })

  // Dimensions
  macro('hd', {
    id: 'width',
    from: points.topLeft,
    to: points.topRight,
    y: -sa - 15,
  })
  macro('vd', {
    id: 'height',
    from: points.topLeft,
    to: points.bottomLeft,
    x: -sa - 15,
  })

  macro('grainline', {
    from: points.topLeft.translate(5, 0),
    to: points.bottomLeft.translate(5, 0),
  })

  macro('title', {
    nr: 4,
    title: 'gusset',
    at: new Point(15, 60),
    scale: 0.5,
    notes: [],
  })

  return part
}
