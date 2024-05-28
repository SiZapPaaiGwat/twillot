import { initSync } from '../../options/handlers'
import { Workflow } from './types'

export function sendWorkflows(workflows: Workflow[]) {
  chrome.runtime.sendMessage({
    type: 'get_workflows',
    data: workflows,
  })
}

export function startTasksLitening() {
  chrome.runtime.onMessage.addListener(async (request) => {
    if (request.type === 'sync_task') {
      await initSync()
    }
  })
}
