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
  store,
  part,
}) {
  paths.back.hide()
  paths.front.hide()
  paths.side.addClass('fabric')

  points.titleAnchor = points.sfChest.translate(10, 40)

  store.cutlist.setCut({ cut: 4, from: 'fabric' })

  macro('title', {
    at: points.titleAnchor,
    nr: 3,
    title: 'side',
    scale: 0.5,
  })

  if (sa) {
    paths.sa = macro('sa', {
      paths: ['sideFrontJoin', 'sideHem', 'sideBackJoin', null],
    })
  }

  macro('grainline', {
    from: points.armpitBottom,
    to: new Point(points.armpitBottom.x, points.cfHem.y),
  })

  return part
}

export const side = {
  name: 'side',
  from: base,
  hide: { from: true },
  draft: draftSide,
}
