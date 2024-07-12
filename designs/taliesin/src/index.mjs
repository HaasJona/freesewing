import { Design, mergeI18n } from '@freesewing/core'
import { data } from '../data.mjs'
import { i18n } from '../i18n/index.mjs'
import { facing } from './facing.mjs'
import { gusset } from './gusset.mjs'
import { body } from './body.mjs'
import { sleeve } from './sleeve.mjs'

// Setup our new design
const Taliesin = new Design({
  data,
  parts: [sleeve, body, facing, gusset],
})

// Named exports
export { body, sleeve, facing, gusset, Taliesin, i18n }
