import { Design } from '@freesewing/core'
import { i18n } from '../i18n/index.mjs'
import { base } from './base.mjs'
import { back } from './back.mjs'
import { front } from './front.mjs'

/*
 * Let core bake a new design for us
 */
const Umbra = new Design({
  data: {
    name: 'Umbra',
    version: '1.0.0',
  },
  parts: [base, back, front],
})

/*
 * Named exports
 */
export {
  // Individual parts
  base,
  back,
  front,
  // The Umbra design itself
  Umbra,
  // Translations
  i18n,
}
