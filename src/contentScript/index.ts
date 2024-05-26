import { X_DOMAIN } from '../types'

const oldDomain = 'twitter.com'

if (location.host === oldDomain) {
  location.href = location.href.replace(oldDomain, X_DOMAIN)
}
