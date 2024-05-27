import { initSync } from '../../options/handlers'
import { Action } from './actions'
import { Trigger } from './triggers'

export interface Workflow {
  id: string
  name?: string
  // 系统默认的工作流无法修改
  editable?: boolean
  // 修改后才能保存
  unchanged?: boolean
  when: Trigger
  thenList: Action[]
}

/**
 * @description options only
 */
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
