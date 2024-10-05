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
  store,
  part,
}) {
  paths.front.hide()
  paths.side.hide()
  paths.back.addClass('fabric')

  points.titleAnchor = points.sbHemDartRight.shiftFractionTowards(points.sbArmpitCp2, 0.3)

  store.cutlist.setCut({ cut: 2, from: 'fabric', onFold: true })

  macro('title', {
    at: points.titleAnchor,
    nr: 2,
    title: 'back',
    scale: 0.5,
  })

  if (sa) {
    paths.sa = macro('sa', {
      paths: ['backSideJoin', 'backHem', null, 'backStrap', null],
    })
  }

  macro('cutonfold', {
    from: points.cbHem,
    to: points.cbNeck,
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
