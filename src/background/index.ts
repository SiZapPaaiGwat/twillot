import { authTwitter, openOptionsPageWhenIconClicked } from '../libs/browser'
import initWorkflows from '../libs/workflow/bg'

openOptionsPageWhenIconClicked()
authTwitter()
// TODO wait until authentication is complete
initWorkflows()

console.log('background script loaded')
