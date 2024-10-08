import { base } from './base.mjs'

function draftBack({ points, paths, Snippet, snippets, sa, macro, store, part }) {
  paths.front.hide()
  paths.side.hide()
  paths.back.hide()

  macro('mirror', {
    clone: true,
    mirror: [points.cbNeck, points.cbHem],
    paths: ['back', 'backSideJoin', 'backHem', 'backStrap'],
    points: Object.keys(points),
  })

  // mirror plugin doesn't reverse paths
  paths.mirroredBack = paths.mirroredBack.reverse().addClass('fabric')
  paths.mirroredBackSideJoin = paths.mirroredBackSideJoin.reverse().hide()
  paths.mirroredBackHem = paths.mirroredBackHem.reverse().hide()
  paths.mirroredBackStrap = paths.mirroredBackStrap.reverse().hide()

  points.titleAnchor = points.cbHem.shiftFractionTowards(points.cbNeck, 0.1).translate(20, 0)

  snippets.backJoin = new Snippet('bnotch', points.mirroredBackJoin)

  store.cutlist.setCut({ cut: 2, from: 'fabric', onFold: true })

  macro('title', {
    at: points.titleAnchor,
    nr: 2,
    title: 'back',
    scale: 0.5,
  })

  if (sa) {
    paths.sa = macro('sa', {
      paths: ['mirroredBackHem', 'mirroredBackSideJoin', null, 'mirroredBackStrap', null],
    })
  }

  macro('cutonfold', {
    from: points.cbNeck,
    to: points.cbHem,
    grainline: true,
  })

  return part
}

export const back = {
  name: 'back',
  from: base,
  hide: { from: true },
  draft: draftBack,
}
