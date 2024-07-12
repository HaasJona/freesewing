export const body = {
  name: 'taliesin.body',
  measurements: ['hips', 'waist', 'hpsToWaistBack', 'chest', 'seat', 'seatBack', 'waistToSeat'],
  optionalMeasurements: ['bustSpan', 'highBust', 'waistToUnderbust', 'waistToKnee', 'waistToFloor'],
  options: {
    necklineWidth: { pct: 15, min: -5, max: 90, menu: 'style' },
    strapWidth: {
      pct: 40,
      min: 15,
      max: 100,
      menu: (settings, mergedOptions) => (mergedOptions.sleeves ? false : 'style.sleeves'),
    },
    sleeves: { bool: true, menu: 'style.sleeves' },
    seatBackAdjustment: {
      pct: 20,
      min: 0,
      max: 100,
      menu: 'advanced',
    },
    curvatureAdjustment: {
      pct: 20,
      min: 0.1,
      max: 100,
      menu: 'advanced',
    },
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
  macro,
  complete,
  part,
}) {
  return part
}
