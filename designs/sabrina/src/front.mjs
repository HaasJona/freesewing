import { base } from './base.mjs'

function draftFront({
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
  paths.side.hide()
  paths.front.addClass('fabric')

  snippets.bustPoint = new Snippet('notch', points.bustPoint)

  return part
}

export const front = {
  name: 'front',
  from: base,
  hide: { from: true },
  draft: draftFront,
}
