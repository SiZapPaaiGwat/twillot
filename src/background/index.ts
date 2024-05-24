import {
  authTwitter,
  openOptionsPageWhenIconClicked,
  startTriggerListening,
} from '../libs/browser'

openOptionsPageWhenIconClicked()
authTwitter()
startTriggerListening()

console.log('background script loaded')
