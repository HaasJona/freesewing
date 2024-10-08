import { base } from './base.mjs'

function draftFront({ points, paths, Snippet, snippets, sa, macro, store, part }) {
  paths.back.hide()
  paths.side.hide()
  paths.front.addClass('fabric')

  points.titleAnchor = points.cfBust.shiftFractionTowards(points.strapFrontRight, 0.3)

  store.cutlist.setCut({ cut: 2, from: 'fabric', onFold: true })

  macro('title', {
    at: points.titleAnchor,
    nr: 1,
    title: 'front',
    scale: 0.5,
  })

  snippets.bustPoint = new Snippet('notch', points.bustPoint)
  snippets.frontJoin = new Snippet('notch', points.frontJoin)

  if (sa) {
    paths.sa = macro('sa', {
      paths: ['frontHem', 'frontSideJoin', null, 'frontStrap', null],
    })
  }

  macro('cutonfold', {
    from: points.cfNeck,
    to: points.cfHem,
    grainline: true,
  })

  return part
}

export const front = {
  name: 'front',
  from: base,
  hide: { from: true },
  draft: draftFront,
}
