import { hidePresets } from '@freesewing/core'

export const gusset = {
  name: 'taliesin.gusset',
  options: {
    gussetLength: {
      pct: 20,
      min: -20,
      max: 110,
      menu: (settings, mergedOptions) =>
        mergedOptions.gussets === false ? false : 'style.gussets',
    },
  },
  measurements: ['shoulderToWrist', 'wrist'],
  draft: taliesinGusset,
}

function taliesinGusset({
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
