import { base } from './base.mjs'

function draftBack({
  options,
  measurements,
  Point,
  Path,
  points,
  paths,
  Snippet,
  snippets,
  sa,
  macro,
  utils,
  part,
}) {
  paths.front.hide()
  paths.side.hide()
  paths.back.addClass('fabric')

  return part
}

export const back = {
  name: 'back',
  from: base,
  hide: { from: true },
  draft: draftBack,
}
