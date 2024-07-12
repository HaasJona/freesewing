import { hidePresets } from '@freesewing/core'

export const sleeve = {
  name: 'taliesin.sleeve',
  options: {
    sleeveLength: {
      pct: 20,
      min: -20,
      max: 110,
      menu: (settings, mergedOptions) =>
        mergedOptions.sleeves === false ? false : 'style.sleeves',
    },
  },
  measurements: ['shoulderToWrist', 'wrist'],
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
}) {
  return part
}
