/**
 * bg 任务
 * 通常 bg 只是记录任务，并不执行具体的操作
 * 实际执行在 options 页面
 */

import { mutateStore } from '../../options/store'
import { getTweetConversations } from '../api/twitter'
import { addRecords, countRecords, deleteRecord, getRecord } from '../db/tweets'
import { Task, TaskName } from './workflow'

export async function addTask(task: Task) {
  console.log('add task', task)
  const tasks = await getTasks()
  tasks.push(task)
  await saveTasks(tasks)
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

export async function executeAllTasks() {
  const tasks = await getTasks()
  for (const task of tasks) {
    console.log('execute task', task)
    /**
     * 自动同步 threads
     */
    if (task.name === TaskName.FecthTweet) {
      const dbItem = await getRecord(task.tweetId)
      const conversations = await getTweetConversations(task.tweetId)
      if (conversations) {
        dbItem.conversations = conversations
        await addRecords([dbItem], true)
        mutateStore((state) => {
          const index = state.tweets.findIndex(
            (t) => t.tweet_id === task.tweetId,
          )
          if (index > -1) {
            state.tweets[index].conversations = conversations
          }
        })
      }
    } else if (task.name === TaskName.DeleteBookmark) {
      const record = await deleteRecord(task.tweetId)
      const totalCount = await countRecords()
      mutateStore((state) => {
        const index = state.tweets.findIndex((t) => t.tweet_id === task.tweetId)
        if (index > -1) {
          state.tweets.splice(index, 1)
        }
        if (record.folder) {
          state.folders[record.folder] -= 1
        }
        state.totalCount = totalCount
        state.selectedTweet = -1
      })
    } else {
      console.error(`task ${task.name} not supported`)
    }
    await removeTask(task.id)
  }
}
