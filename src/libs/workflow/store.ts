import { unwrap } from 'solid-js/store'

import { readConfig, upsertConfig } from '../../libs/db/configs'
import dataStore, { mutateStore } from '../../options/store'
import { OptionName } from '../../types'
import { Trigger, TriggerNames } from '../../libs/workflow/triggers'
import { Action, ActionNames } from '../../libs/workflow/actions'
import { Workflow, sendWorkflows } from '../../libs/workflow'
import { getTweetConversations } from '../api/twitter'
import { addRecords, countRecords, deleteRecord, getRecord } from '../db/tweets'
import { getTasks, removeTask } from './task'

const [store] = dataStore

export const getUnusedWhen = () => {
  const usedWhens = new Set(store.workflows.map((w) => w.when))
  const unusedWhens = Object.keys(TriggerNames).filter(
    (action: Trigger) => !usedWhens.has(action),
  )
  return (unusedWhens.length > 0 ? unusedWhens[0] : 'CreateBookmark') as Trigger
}

export const getUsedThens = (currentThens: Action[]) => {
  return new Set(currentThens)
}

export const getUnusedThen = (currentThens: Action[]) => {
  const usedThens = getUsedThens(currentThens)
  const allThens = Object.keys(ActionNames)
  const unusedThens = allThens.filter(
    (action) => !usedThens.has(action as Action),
  )
  return (unusedThens.length > 0 ? unusedThens[0] : 'translate') as Action
}

/**
 * 仅更新 store 中的数据，不更新数据库
 */
export const addWorkflow = () => {
  const newWorkflow: Workflow = {
    id: Date.now().toString(16),
    when: getUnusedWhen(),
    thenList: [],
  }
  mutateStore((state) => {
    state.workflows.unshift(newWorkflow)
  })
}

/**
 * 保存到数据库，仅更新一条记录
 */
export const saveWorkflow = async (index: number) => {
  const workflow = unwrap(store.workflows[index])
  const dbRecords = await readConfig(OptionName.WORKFLOW)
  let workflows = []
  // 如果数据库中没有记录，则直接插入
  if (!dbRecords) {
    workflows.push(workflow)
  } else {
    workflows = dbRecords.option_value as Workflow[]
    const posIndex = workflows.findIndex((w) => w.id === workflow.id)
    if (posIndex > -1) {
      workflows[posIndex] = workflow
    } else {
      workflows.unshift(workflow)
    }
  }
  await upsertConfig({
    option_name: OptionName.WORKFLOW,
    option_value: workflows,
  })

  console.log('Workflow saved to database', workflows)
  sendWorkflows(workflows)
}

export const getWorkflows = async () => {
  const dbRecords = await readConfig(OptionName.WORKFLOW)
  const workflows = (dbRecords?.option_value || []) as Workflow[]
  mutateStore((state) => {
    state.workflows = workflows
  })
  return workflows
}

export const removeWorkflow = async (index: number) => {
  const id = store.workflows[index].id
  const dbRecords = await readConfig(OptionName.WORKFLOW)
  const dbWorkflows = (dbRecords?.option_value || []) as Workflow[]
  const isDbItem = dbWorkflows.some((w) => w.id === id)
  mutateStore((state) => {
    state.workflows.splice(index, 1)
    if (isDbItem) {
      upsertConfig({
        option_name: OptionName.WORKFLOW,
        option_value: unwrap(state.workflows),
      })
    }
  })
}

export const addThen = (index: number) => {
  const workflow = store.workflows[index]
  if (workflow.thenList.length === Object.keys(ActionNames).length) {
    console.warn('No action to add')
    return
  }

  mutateStore((state) => {
    state.workflows[index].thenList.push(getUnusedThen(workflow.thenList))
  })
}

export const removeThen = (workflowIndex: number, thenIndex: number) => {
  const workflow = store.workflows[workflowIndex]
  if (workflow.thenList.length === 1) {
    mutateStore((state) => {
      state.workflows.splice(workflowIndex, 1)
    })
    return
  }

  mutateStore((state) => {
    state.workflows[workflowIndex].thenList.splice(thenIndex, 1)
  })
}

export const updateWhen = (workflowIndex: number, newWhen: Trigger) => {
  mutateStore((state) => {
    state.workflows[workflowIndex].when = newWhen
  })
}

export const updateThen = (
  workflowIndex: number,
  thenIndex: number,
  newThen: Action,
) => {
  mutateStore((state) => {
    const index = state.workflows[workflowIndex].thenList.indexOf(newThen)
    state.workflows[workflowIndex].thenList[thenIndex] = newThen
    if (index > -1) {
      state.workflows[workflowIndex].thenList.splice(index, 1)
    }
  })
}

/**
 * 任务执行前置条件，同步最新的书签数据（主要是 sortIndex 字段）
 */
export async function executeAllTasks() {
  const tasks = await getTasks()
  console.log('execute tasks', tasks)
  for (const task of tasks) {
    console.log('execute task', task)
    /**
     * 自动同步 threads
     */
    if (task.name === 'UnrollThread') {
      const dbItem = await getRecord(task.tweetId)
      if (dbItem) {
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
        } else {
          console.log('no conversations found for tweet', task.tweetId)
        }
      } else {
        console.error(
          `Bookmark is not found in database for tweet ${task.tweetId}`,
        )
      }
    } else if (task.name === 'DeleteBookmark') {
      const record = await deleteRecord(task.tweetId)
      if (!record) {
        console.log('record not found for tweet', task.tweetId)
      } else {
        const totalCount = await countRecords()
        mutateStore((state) => {
          const index = state.tweets.findIndex(
            (t) => t.tweet_id === task.tweetId,
          )
          if (index > -1) {
            state.tweets.splice(index, 1)
          }
          if (record.folder) {
            state.folders[record.folder] -= 1
          }
          state.totalCount = totalCount
          state.selectedTweet = -1
        })
      }
    } else {
      console.error(`task ${task.name} not supported`)
    }
    await removeTask(task.id)
  }
}
