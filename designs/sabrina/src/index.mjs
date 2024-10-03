//

import { Design } from '@freesewing/core'
import { i18n } from '../i18n/index.mjs'
import { data } from '../data.mjs'
// Parts
import { base } from './base.mjs'

// Create new design
const Sabrina = new Design({
  data,
  parts: [base],
})

// Named exports
export { base, i18n, Sabrina }
