import { Workflow } from '.'
import actions, { Action } from './actions'
import TriggerMonitor from './trigger-monitor'
import { startTriggerListening } from './triggers'

/**
 * @description bg only
 * */
export function startWorkflowListening(monitor) {
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'get_workflows') {
      const workflows = message.data as Workflow[]
      if (!workflows || workflows.length === 0) {
        return
      }

      chrome.storage.local.set({ workflows })
      monitor.workflows = workflows
    }
  })
}

/**
 * @description bg only
 */
export async function getWorkflows() {
  const item = await chrome.storage.local.get('workflows')
  return item.workflows || []
}

export default function initWorkflows() {
  const monitor = new TriggerMonitor()
  monitor.register(Action.UnrollThread, actions[Action.UnrollThread])
  monitor.register(Action.DeleteBookmark, actions[Action.DeleteBookmark])

  startTriggerListening(monitor)
  monitor.init()
}
