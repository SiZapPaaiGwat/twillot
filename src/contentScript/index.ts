import { Message, MessageType } from '../libs/workflow/types'
import { Host, X_DOMAIN } from '../types'
//@ts-ignore
import mainWorld from './injected?script&module'

const oldDomain = 'twitter.com'
if (location.host === oldDomain) {
  location.href = location.href.replace(oldDomain, X_DOMAIN)
}

window.addEventListener('message', (event) => {
  if (
    event.origin !== Host ||
    event.data.type !== MessageType.GetTriggerResponse
  ) {
    return
  }

  console.log('contentScript received message', { event })
  chrome.runtime.sendMessage<Message>(event.data)
})

/**
 * NOTE:HMR 无效
 */
const script = document.createElement('script')
script.src = chrome.runtime.getURL(mainWorld)
script.type = 'module'
document.head.prepend(script)
