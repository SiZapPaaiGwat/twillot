import { authTwitter, openOptionsPageWhenIconClicked } from '../libs/browser'
import { TriggerMonitor } from '../libs/workflow/trigger'
import {
  Action,
  Message,
  MessageType,
  TriggerReponsePayload,
  Workflow,
} from '../libs/workflow/types'
import actions from '../libs/workflow/actions'

openOptionsPageWhenIconClicked()
authTwitter()

function initWorkflows() {
  const monitor = new TriggerMonitor()
  for (const [key, value] of Object.entries(actions)) {
    monitor.register(key as Action, value)
  }

  chrome.runtime.onMessage.addListener((message: Message) => {
    if (message.type === MessageType.GetTriggerResponse) {
      monitor.emit(message.payload as TriggerReponsePayload)
    } else if (message.type === MessageType.GetWorkflows) {
      const workflows = message.payload as Workflow[]
      if (!workflows || workflows.length === 0) {
        return
      }

      chrome.storage.local.set({ workflows })
      monitor.workflows = workflows
    } else {
      console.log('Unknown message type:', message)
    }
  })
  monitor.init()
}

initWorkflows()
