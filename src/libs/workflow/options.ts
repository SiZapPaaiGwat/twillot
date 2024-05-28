import { initSync } from '../../options/handlers'
import { MessageType, Workflow } from './types'

export function sendWorkflows(workflows: Workflow[]) {
  chrome.runtime.sendMessage({
    type: MessageType.GetWorkflows,
    payload: workflows,
  })
}

export function startTasksLitening() {
  chrome.runtime.onMessage.addListener(async (request) => {
    if (request.type === MessageType.SyncTasks) {
      await initSync()
    }
  })
}
