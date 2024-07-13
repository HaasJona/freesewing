import { hidePresets } from '@freesewing/core'

export const facing = {
  name: 'taliesin.facing',
  options: {
    neckEase: {
      pct: 10,
      min: -20,
      max: 110,
      menu: 'fit',
    },
    headEase: {
      pct: 5,
      min: -20,
      max: 110,
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
    facingWidth,
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

  paths.innerCircle = new Path()
    .move(points.front)
    .circleSegment(180, points.center)
    .addClass('fabric')
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

  points.shoulerCenter = new Point(0, shoulderOffset)
  points.shoulder = paths.outerCircle.intersectsY(shoulderOffset)[0]
  if (complete)
    paths.shoulder = new Path()
      .move(points.shoulerCenter)
      .line(points.shoulder)
      .addClass('contrast stroke-sm')

  points.outerCorner = paths.outerCircle.intersects(paths.outerPilot)[0]
  points.stitchCorner = paths.stitchCircle.intersects(paths.stitchPilot)[0]

  paths.keyhole = new Path().move(points.front).line(points.bottom).addClass('fabric')
  paths.facing = new Path()
    .move(points.outerBottom)
    .circleSegment(90, points.bottom)
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
      .line(points.outerBottom)
      .addClass('contrast stroke-sm')

  macro('mirror', {
    paths: ['facing', 'stitch', 'innerCircle', 'shoulder'],
    mirror: [points.center, points.front],
    prefix: 'mirror',
  })

  store.cutlist.setCut({ cut: 1, from: 'fabric' })

  macro('title', {
    nr: 4,
    title: 'facing',
    at: points.center.translate(-40, 0),
    notes: ['taliesin:noSeamAllowance'],
  })

  return part
}
