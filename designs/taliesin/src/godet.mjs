import { body } from './body.mjs'

export const godet = {
  name: 'taliesin.godet',
  options: {
    hemEase: {
      pct: 0,
      min: -50,
      max: 100,
      menu: 'fit',
    },
    godet: {
      bool: false,
      menu: 'fit',
    },
  },
  after: body,
  measurements: ['waistToFloor'],
  draft: taliesinGodet,
}

function taliesinGodet({
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

  points.hemSide = new Point((length / slope) * (1 + options.hemEase), length)

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
      .join(new Path().move(points.hemSide).line(points.split).offset(sa))
      .line(points.split.translate(sa, -hemAllowance))
      .line(points.split.translate(0, -hemAllowance))
      .line(points.split)
      .close()
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
  points.title = points.hemCenter.translate(40, -40)
  macro('title', {
    nr: 5,
    title: 'godet',
    at: points.title,
    notes: [],
  })

  return part
}
