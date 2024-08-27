import { Design, mergeI18n } from '@freesewing/core'
import { data } from '../data.mjs'
import { i18n as titanI18n } from '@freesewing/titan'
import { i18n as paulI18n } from '../i18n/index.mjs'
// Parts
import { back } from './back.mjs'
import { front } from './front.mjs'
import { waistband } from './waistband.mjs'
import { waistbandCurved } from './waistband-curved.mjs'
import { flyFacing } from './fly-facing.mjs'
import { beltLoops } from './beltloops.mjs'

// Create design
const Paul = new Design({
  data,
  parts: [front, back, waistband, waistbandCurved, flyFacing, beltLoops],
})

// Merge translations
const i18n = mergeI18n([titanI18n, paulI18n])

// Named exports
export { front, back, waistband, waistbandCurved, flyFacing, beltLoops, Paul, i18n }
