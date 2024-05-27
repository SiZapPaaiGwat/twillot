import { Workflow } from '.'
import actions, { Action } from './actions'
import TriggerMonitor from './trigger-monitor'
import { startTriggerListening } from './triggers'

export function startWorkflowListening(monitor: TriggerMonitor) {
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'get_workflows') {
      console.log('get_workflows', message.data)
      const workflows = message.data as Workflow[]
      if (!workflows || workflows.length === 0) {
        return
      }

      chrome.storage.local.set({ workflows })
      monitor.workflows = workflows
    }
  })
}

export async function getWorkflows() {
  const item = await chrome.storage.local.get('workflows')
  return item.workflows || []
}

export default function initWorkflows() {
  const monitor = new TriggerMonitor()
  for (const [key, value] of Object.entries(actions)) {
    monitor.register(key as Action, value)
  }

  startTriggerListening(monitor)
  monitor.init()
}