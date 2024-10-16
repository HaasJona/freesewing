import { base } from './base.mjs'

function draftSide({ Point, points, paths, Snippet, snippets, sa, macro, store, part }) {
  paths.back.hide()
  paths.front.hide()
  paths.side.addClass('fabric')

  points.titleAnchor = points.armpitBottom.translate(10, 30)

  store.cutlist.setCut({ cut: 4, from: 'fabric' })

  snippets.frontJoin = new Snippet('notch', points.frontJoin)
  snippets.backJoin = new Snippet('bnotch', points.backJoin)

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

  macro('pd', {
    id: 'sideHem',
    path: paths.sideHem,
    d: sa + 15,
  })

  macro('pd', {
    id: 'sideFrontJoin',
    path: paths.sideFrontJoin,
    d: sa + 15,
  })
  macro('pd', {
    id: 'sideBackJoin',
    path: paths.sideBackJoin,
    d: sa + 15,
  })

  return part
}

export const side = {
  name: 'sabrina.side',
  from: base,
  hide: { from: true },
  draft: draftSide,
}
