/**
 * bg 任务
 * 通常 bg 只是记录任务，并不执行具体的操作
 * 实际执行在 options 页面
 */

import { sendMessageToOptions } from '../browser'
import { Action } from './actions'

export interface Task {
  id: string
  name: Action
  tweetId?: string
}

/**
 * 同时向 options 页面发送消息，通知任务已添加
 */
export async function addTask(task: Task) {
  console.log('add task', task)
  const tasks = await getTasks()
  tasks.push(task)
  await saveTasks(tasks)
  await sendMessageToOptions({ type: 'sync_task', task })
}

export async function getTasks(): Promise<Task[]> {
  const obj = await chrome.storage.local.get('tasks')
  return obj.tasks || []
}

export async function saveTasks(tasks: Task[]) {
  await chrome.storage.local.set({ tasks })
}

export async function removeTask(id: string) {
  const tasks = (await getTasks()) as Task[]
  const index = tasks.findIndex((task) => task.id === id)
  if (index !== -1) {
    tasks.splice(index, 1)
    await saveTasks(tasks)
  } else {
    console.warn(`task ${id} not found`)
  }
}
