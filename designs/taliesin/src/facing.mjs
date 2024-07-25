import { hidePresets } from '@freesewing/core'

export const facing = {
  name: 'taliesin.facing',
  options: {
    neckEase: {
      pct: 7.5,
      min: -5,
      max: 50,
      menu: 'fit',
    },
    headEase: {
      pct: 5,
      min: 0,
      max: 30,
      menu: 'fit',
    },
  },
  measurements: ['neck', 'head'],
  draft: taliesinFacing,
}

function taliesinFacing({
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
  complete,
  part,
  utils,
}) {
  // The facing is a keyhole shaped piece of fabric.
  // We need the following dimensions:
  // facing width: width of the facing
  // inner radius: circle equals neck opening
  // outer radius: neck opening plus facing width
  // keyhole length: (head circumference-neck circumference) / 2 (+ ease)

  const innerRadius = ((1 + options.neckEase) * measurements.neck) / 6.28
  const shoulderOffset = innerRadius / -3
  const facingWidth = (innerRadius / 3) * 2
  const stitchDistFront = facingWidth / 20
  const stitchDistCircle = facingWidth / 8
  const keyholeLength = Math.max(
    stitchDistCircle,
    ((1 + options.headEase) * measurements.head - (1 + options.neckEase) * measurements.neck) / 2
  )

  points.center = new Point(0, 0)
  points.front = points.center.translate(0, innerRadius)
  points.outerFront = points.front.translate(0, facingWidth)
  points.stitchFront = points.front.translate(0, stitchDistCircle)
  points.bottom = points.front.translate(0, keyholeLength)
  points.outerBottom = points.bottom.translate(0, facingWidth)
  points.stitchBottom = points.bottom.translate(0, stitchDistFront)
  points.stitchBottomCorner = points.stitchBottom.translate(stitchDistFront, 0)

  points.outerRight = points.center.translate(innerRadius + facingWidth, 0)
  points.outerLeft = points.center.translate(-innerRadius - facingWidth, 0)
  points.outerTop = points.center.translate(0, -innerRadius - facingWidth)

  paths.innerCircle = new Path()
    .move(points.front)
    .circleSegment(180, points.center)
    .addClass('lining')
  paths.outerCircle = new Path().move(points.outerFront).circleSegment(180, points.center).hide()
  paths.stitchCircle = new Path().move(points.stitchFront).circleSegment(180, points.center).hide()
  paths.outerPilot = new Path()
    .move(points.center)
    .line(points.outerFront)
    .offset(-facingWidth)
    .hide()
  paths.stitchPilot = new Path()
    .move(points.center)
    .line(points.stitchFront)
    .offset(-stitchDistCircle)
    .hide()

  points.shoulderCenter = new Point(0, shoulderOffset)
  points.shoulder = paths.outerCircle.intersectsY(shoulderOffset)[0]
  if (complete)
    paths.shoulder = new Path()
      .move(points.shoulderCenter)
      .line(points.shoulder)
      .addClass('contrast dashed stroke-sm')

  points.outerCorner = paths.outerCircle.intersects(paths.outerPilot)[0]
  points.stitchCorner = paths.stitchCircle.intersects(paths.stitchPilot)[0]

  paths.keyhole = new Path().move(points.front).line(points.bottom).addClass('lining')
  paths.facing = new Path()
    .move(points.outerBottom)
    .move(points.outerBottom.translate(facingWidth, 0))
    .line(points.outerCorner)
    .join(paths.outerCircle.split(points.outerCorner)[1])
    .addClass('fabric')
  if (complete)
    paths.stitch = new Path()
      .move(points.stitchBottom)
      .line(points.stitchBottomCorner)
      .line(points.stitchCorner)
      .join(paths.stitchCircle.split(points.stitchCorner)[1])
      .addClass('fabric dashed')

  if (complete)
    paths.verticalCenter = new Path()
      .move(paths.outerCircle.end())
      .line(points.front)
      .move(points.bottom)
      .line(points.outerBottom)
      .addClass('contrast dashed stroke-sm')

  macro('mirror', {
    paths: ['facing', 'stitch', 'innerCircle', 'shoulder'],
    mirror: [points.center, points.front],
    prefix: 'mirror',
  })

  store.cutlist.setCut({ cut: 1, from: 'fabric' })

  macro('vd', {
    id: 'height',
    from: paths.innerCircle.start(),
    to: paths.innerCircle.end(),
    x: innerRadius + facingWidth + 15,
  })

  macro('vd', {
    id: 'front',
    from: points.bottom,
    to: points.front,
    x: innerRadius + facingWidth + 15,
  })
  macro('ld', {
    id: 'radius',
    from: points.center,
    to: points.front.rotate(155, points.center),
  })
  macro('vd', {
    id: 'shoulderOffset',
    from: points.center,
    to: points.shoulderCenter,
    x: -innerRadius - facingWidth - 15,
  })
  macro('vd', {
    id: 'width',
    from: paths.innerCircle.end(),
    to: paths.outerCircle.end(),
    x: innerRadius + facingWidth + 15,
  })

  macro('hd', {
    id: 'totalWidth',
    from: points.outerLeft,
    to: points.outerRight,
    y: points.outerTop.y - 15,
  })

  macro('hd', {
    id: 'haftWidth',
    from: points.center,
    to: points.outerRight,
    y: points.center.y,
  })

  macro('vd', {
    id: 'totalHeight',
    from: points.outerBottom,
    to: points.outerTop,
    x: points.outerLeft.x - 30,
  })

  macro('title', {
    nr: 3,
    title: 'facing',
    at: points.center.translate(-40, 0),
    notes: ['taliesin:noSeamAllowance'],
  })

  return part
}
