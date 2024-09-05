import { back } from './back.mjs'

function draftPaulBackPocket({
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
  utils,
}) {
  if (!options.backPockets) {
    return part.hide()
  }

  if (expand) {
    store.flag.preset('expandIsOn')
  } else {
    // Expand is off, do not draw the part but flag this to the user
    store.flag.note({
      msg: `paul:cutBackPocket`,
      notes: ['flag:partHiddenByExpand'],
      suggest: {
        text: 'flag:show',
        icon: 'expand',
        update: {
          settings: ['expand', 1],
        },
      },
    })
    // Also hint about expand
    store.flag.preset('expandIsOff')

    return part.hide()
  }

  for (let id in paths) if (id !== 'backPocket') delete paths[id]
  for (let id in snippets) delete snippets[id]

  paths.backPocket.unhide().setClass('fabric')

  if (sa) {
    const verticalAngle = points.pocketTopCenter.angle(points.pocketBottomCenter)
    points.intersect1 = points.pocketTopIn.shift(verticalAngle, sa)
    points.intersect2 = points.pocketTopOut.shift(verticalAngle, sa)
    points.intersect3 = utils.beamsIntersect(
      points.pocketTopIn,
      points.pocketBottomIn,
      points.intersect1,
      points.intersect2
    )
    points.intersect4 = utils.beamsIntersect(
      points.pocketTopOut,
      points.pocketBottomOut,
      points.intersect1,
      points.intersect2
    )
    macro('mirror', {
      points: ['intersect3', 'intersect4'],
      mirror: [points.pocketTopOut, points.pocketTopIn],
    })
    macro('mirror', {
      points: ['pocketTopOut', 'pocketTopIn'],
      mirror: [points.mirroredIntersect3, points.mirroredIntersect4],
    })

    paths.sa = new Path()
      .move(points.pocketTopIn)
      .line(points.pocketBottomIn)
      .line(points.pocketBottomCenter)
      .line(points.pocketBottomOut)
      .line(points.pocketTopOut)
      .line(points.mirroredIntersect4)
      .line(points.mirroredPocketTopOut)
      .move(points.mirroredPocketTopIn)
      .line(points.mirroredIntersect3)
      .line(points.pocketTopIn)
      .offset(sa)
      .close()
      .setClass('fabric sa')

    if (complete)
      paths.fold = new Path()
        .move(points.mirroredIntersect3)
        .line(points.mirroredIntersect4)
        .setClass('help')
  }

  store.cutlist.setCut({ cut: 1, from: 'cardboard' })
  store.cutlist.addCut({ cut: 2, from: 'fabric' })

  macro('title', {
    at: points.pocketCenter,
    nr: 4,
    title: 'backPocket',
    align: 'center',
  })

  return part
}

export const backPocket = {
  name: 'paul.backPocketTemplate',
  from: back,
  options: {},
  draft: draftPaulBackPocket,
}
