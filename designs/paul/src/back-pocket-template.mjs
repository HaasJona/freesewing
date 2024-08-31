import { back } from './back.mjs'

function draftPaulBackPocketTemplate({
  points,
  paths,
  Point,
  Path,
  Snippet,
  macro,
  options,
  expand,
  snippets,
  store,
  complete,
  sa,
  part,
}) {
  if (!expand) {
    return part.hide()
  }

  for (let id in paths) if (id !== 'backPocketTemplate') delete paths[id]
  for (let id in snippets) delete snippets[id]

  paths.backPocketTemplate.setClass('various')

  store.cutlist.setCut({ cut: 1, from: 'cardboard' })

  macro('title', {
    at: points.pocketCenter,
    nr: 4,
    title: 'backPocketTemplate',
    align: 'center',
  })

  return part
}

export const backPocketTemplate = {
  name: 'paul.backPocketTemplate',
  from: back,
  options: {},
  draft: draftPaulBackPocketTemplate,
}
