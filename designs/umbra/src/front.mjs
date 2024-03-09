import { base } from './base.mjs'
import { Snippet } from '@freesewing/core'

export const front = {
  name: 'umbra.front',
  from: base,
  draft: draftUmbraFront,
}

/*
 * This drafts the front of Umbra, or rather recycles what's needed from base
 */
function draftUmbraFront({
  Point,
  Path,
  points,
  paths,
  store,
  sa,
  Snippet,
  snippets,
  utils,
  options,
  expand,
  macro,
  part,
}) {
  if (store.get('bulge'))
    paths.seamBase = new Path()
      .move(points.cfBulgeSplit)
      .curve(points.bulgeCpBottom, points.cfMiddleBulgeCp, points.cfMiddleBulge)
      .line(points.cfBackGussetBulge)
  else {
    paths.seamBase = new Path().move(points.cfBackGussetBulge)
  }
  paths.seamBase = paths.seamBase
    .line(points.backGussetSplitBulge)
    .join(paths.elasticLegFront)
    .line(points.sideWaistband)
    ._curve(points.cfWaistbandDipCp, points.cfWaistbandDip)
    .hide()
  if (expand) {
    macro('mirror', {
      mirror: [new Point(0, 0), new Point(0, 100)],
      paths: ['seamBase'],
      clone: true,
    })
    paths.seam = paths.seamBase.join(paths.mirroredSeamBase.reverse())
    paths.mirroredSeamBase.hide()

    macro('mirror', {
      mirror: [new Point(0, 0), new Point(0, 100)],
      paths: ['pocketShape', 'pocketHem', 'pocketHem', 'zipper', 'zipperCut'],
      points: ['pocketTop'],
      clone: true,
    })
  } else {
    paths.seam = paths.seamBase.clone().close()
  }
  paths.seam.unhide().addClass('fabric')
  if (sa) {
    paths.saBase = new Path()
      .move(points.cfBackGussetBulge)
      .line(points.backGussetSplitBulge)
      .join(paths.elasticLegFront)
      .line(points.sideWaistband)
      ._curve(points.cfWaistbandDipCp, points.cfWaistbandDip)
      .hide()
      .hide()

    if (expand) {
      macro('mirror', {
        mirror: [new Point(0, 0), new Point(0, 100)],
        paths: ['saBase'],
        clone: true,
      })
      paths.saBase = paths.saBase.join(paths.mirroredSaBase.reverse()).close().hide()
      paths.sa = paths.saBase.offset(sa).setClass('fabric sa').unhide()
    } else {
      paths.sa = paths.saBase
        .offset(sa)
        .reverse()
        .line(new Point(0, points.cfBackGussetBulge.y))
        .line(points.cfBulgeSplit)
        .reverse()
        .line(points.cfWaistbandDip)
        .setClass('fabric sa')
        .unhide()
    }
  }
  store.cutlist.setCut({ cut: 1, from: 'fabric', onFold: true })
  store.cutlist.addCut({ cut: 1, from: 'lining', onFold: true })
  points.title = points.cfWaistbandDip
    .shiftFractionTowards(points.sideLeg, 0.14)
    .shiftFractionTowards(points.cfMiddle, 0.25)
  if (!expand) {
    macro('cutonfold', {
      to: store.get('bulge') ? points.cfBulgeSplit : points.cfBackGusset,
      from: points.cfWaistbandDip,
      grainline: true,
    })
  } else {
    macro('grainline', {
      to: store.get('bulge') ? points.cfBulgeSplit : points.cfBackGusset,
      from: points.cfWaistbandDip,
    })
  }
  macro('hd', {
    id: 'wAtWaistband',
    from: points.cfWaistbandDip,
    to: points.sideWaistband,
    y: points.sideWaistband.y - sa - 15,
  })

  macro('vd', {
    id: 'grainline',
    from: points.cfWaistbandDip,
    to: points.cfBackGussetBulge,
    x: -30,
  })

  if (store.get('bulge'))
    macro('vd', {
      id: 'grainline2',
      from: points.cfWaistbandDip,
      to: points.cfBulgeSplit,
      x: -15,
    })

  macro('ld', {
    from: points.cfBulgeSplit,
    to: new Path()
      .move(points.sideMiddleBulge)
      .curve(points.gussetFrontCpBulge, points.sideLegCp, points.sideLeg)
      .intersectsY(points.cfBulgeSplit.y)[0],
    y: points.cfBulgeSplit.y,
  })

  macro('vd', {
    id: 'outer',
    from: points.sideWaistband,
    to: points.sideLeg,
    x: points.sideSeat.x + 15,
  })

  macro('vd', {
    id: 'outer2',
    from: points.cfWaistbandDip,
    to: points.sideLeg,
    x: points.sideSeat.x,
  })

  macro('vd', {
    from: points.cfWaistbandDip,
    to: points.sideWaistband,
    x: -15,
  })

  macro('vd', {
    from: points.cfWaistbandDip,
    to: points.backGussetSplitBulge,
    x: points.backGussetSplitBulge.x,
  })

  macro('hd', {
    from: points.backGussetSplitBulge,
    to: points.sideLeg,
    y: points.backGussetSplitBulge.y,
  })

  macro('hd', {
    id: 'backGusset',
    to: points.backGussetSplitBulge,
    from: points.cfBackGussetBulge,
    y: points.cfBackGussetBulge.y + 15,
  })

  macro('ld', {
    id: 'slimGusset',
    from: points.cfMiddleBulge,
    to: points.sideMiddleBulge,
    y: points.sideMiddleBulge.y,
  })

  if (points.pocketSeamTop) {
    snippets.pocketTop = new Snippet('notch', points.pocketSeamTop)
    snippets.pocketBottom = new Snippet('notch', points.pocketSeamBottom)
    if (expand) {
      snippets.pocketTopMirrored = new Snippet(
        'notch',
        new Point(-points.pocketSeamTop.x, points.pocketSeamTop.y)
      )
      snippets.pocketBottomMirrored = new Snippet(
        'notch',
        new Point(-points.pocketSeamBottom.x, points.pocketSeamBottom.y)
      )
    }
  }

  /*
   * Clean up paths from base
   */
  delete paths.back
  delete paths.front
  delete paths.saBase

  /*
   * Title
   */
  macro('title', {
    at: points.title,
    nr: 1,
    title: 'front',
  })

  return part
}
