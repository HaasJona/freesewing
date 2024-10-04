import { base } from './base.mjs'

function draftSide({
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
  paths.back.hide()
  paths.front.hide()
  paths.side.addClass('fabric')

  return part
}

export const side = {
  name: 'side',
  from: base,
  hide: { from: true },
  draft: draftSide,
}
