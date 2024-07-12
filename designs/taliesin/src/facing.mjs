import { hidePresets } from '@freesewing/core'

export const facing = {
  name: 'taliesin.facing',
  options: {
    facingLength: {
      pct: 20,
      min: -20,
      max: 110,
      menu: (settings, mergedOptions) =>
        mergedOptions.facings === false ? false : 'style.facings',
    },
  },
  measurements: ['shoulderToWrist', 'wrist'],
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
  part,
  utils,
}) {
  return part
}
