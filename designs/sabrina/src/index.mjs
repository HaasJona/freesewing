//

import { Design } from '@freesewing/core'
import { i18n } from '../i18n/index.mjs'
import { data } from '../data.mjs'
// Parts
import { base } from './base.mjs'
import { front } from './front.mjs'
import { side } from './side.mjs'
import { back } from './back.mjs'

// Create new design
const Sabrina = new Design({
  data,
  parts: [base, front, side, back],
})

// Named exports
export { base, front, side, back, i18n, Sabrina }
