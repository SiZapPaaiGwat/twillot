import { unwrap } from 'solid-js/store'

import { readConfig, upsertConfig } from '../../libs/db/configs'
import dataStore, { mutateStore } from '../../options/store'
import { OptionName } from '../../types'
import { sendWorkflows } from './options'
import { getTweetConversations } from '../api/twitter'
import { addRecords, countRecords, deleteRecord, getRecord } from '../db/tweets'
import { getTasks, removeTask } from '.'
import { Action, ActionNames, Trigger, TriggerNames, Workflow } from './types'

const [store] = dataStore

const defaultWorkflows: Workflow[] = [
  {
    id: '0',
    name: 'Auto unroll threads when a bookmark is created',
    editable: false,
    when: 'CreateBookmark',
    thenList: ['UnrollThread'],
  },
  {
    id: '1',
    name: 'Delete from local when a bookmark is deleted',
    editable: false,
    when: 'DeleteBookmark',
    thenList: ['DeleteBookmark'],
  },
]

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

export const isWorkflowUnchanged = async (index: number) => {
  const workflow = store.workflows[index]
  const workflowsDB = (await readConfig(OptionName.WORKFLOW))
    .option_value as Workflow[]
  const dbWorkflow = workflowsDB.find((wDB) => wDB.id === workflow.id)
  if (dbWorkflow) {
    return 'name,when,thenList'
      .split(',')
      .every((key) =>
        key === 'thenList'
          ? workflow[key].join(',') === dbWorkflow[key].join(',')
          : workflow[key] === dbWorkflow[key],
      )
  } else {
    return !workflow.name || workflow.thenList.length < 1
  }
}

/**
 * 仅更新 store 中的数据，不更新数据库
 */
export const addWorkflow = () => {
  const newWorkflow: Workflow = {
    id: Date.now().toString(16),
    name: '',
    editable: true,
    unchanged: true,
    when: getUnusedWhen(),
    thenList: [],
  }
  mutateStore((state) => {
    state.workflows.unshift(newWorkflow)
  })
}

export const renameWorkflow = (index: number, value: string) => {
  mutateStore(async (state) => {
    const current = state.workflows[index]
    current.name = value
    current.unchanged = await isWorkflowUnchanged(index)
  })
}

/**
 * 保存到数据库，仅更新一条记录
 */
export const saveWorkflow = async (index: number) => {
  const workflow = unwrap(store.workflows[index])
  const dbRecords = await readConfig(OptionName.WORKFLOW)
  let workflows = []
  delete workflow.unchanged
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
  mutateStore((state) => {
    state.workflows[index].unchanged = true
  })

  console.log('Workflow saved to database', workflows)
  sendWorkflows(workflows)
}

export const removeWorkflow = async (index: number) => {
  const id = store.workflows[index].id
  const dbRecords = await readConfig(OptionName.WORKFLOW)
  const dbWorkflows = (dbRecords?.option_value || []) as Workflow[]
  const isDbItem = dbWorkflows.some((w) => w.id === id)
  mutateStore((state) => {
    state.workflows.splice(index, 1)
    if (isDbItem) {
      const items = unwrap(state.workflows)
      upsertConfig({
        option_name: OptionName.WORKFLOW,
        option_value: items,
      })
    }
  })
}

export const getWorkflows = async () => {
  const dbRecords = await readConfig(OptionName.WORKFLOW)
  let workflows = (dbRecords?.option_value || []) as Workflow[]
  if (!workflows || !workflows.length) {
    workflows = [...defaultWorkflows]
    await upsertConfig({
      option_name: OptionName.WORKFLOW,
      option_value: workflows,
    })
  }
  workflows.forEach((w) => {
    w.unchanged = true
  })
  mutateStore((state) => {
    state.workflows = workflows
  })
  return workflows
}

export const updateWhen = (workflowIndex: number, newWhen: Trigger) => {
  mutateStore(async (state) => {
    const current = state.workflows[workflowIndex]
    current.when = newWhen
    current.unchanged = await isWorkflowUnchanged(workflowIndex)
  })
}

export const addThen = (index: number) => {
  const workflow = store.workflows[index]
  if (workflow.thenList.length === Object.keys(ActionNames).length) {
    console.warn('No action to add')
    return
  }

  mutateStore(async (state) => {
    const current = state.workflows[index]
    current.thenList.push(getUnusedThen(workflow.thenList))
    current.unchanged = await isWorkflowUnchanged(index)
  })
}

export const removeThen = (workflowIndex: number, thenIndex: number) => {
  const workflow = store.workflows[workflowIndex]
  if (workflow.thenList.length === 1) {
    return
  }

  mutateStore(async (state) => {
    const current = state.workflows[workflowIndex]
    state.workflows[workflowIndex].thenList.splice(thenIndex, 1)
    current.unchanged = await isWorkflowUnchanged(workflowIndex)
  })
}

export const updateThen = (
  workflowIndex: number,
  thenIndex: number,
  newThen: Action,
) => {
  mutateStore(async (state) => {
    const current = state.workflows[workflowIndex]
    const index = current.thenList.indexOf(newThen)
    current.thenList[thenIndex] = newThen
    if (index > -1) {
      state.workflows[workflowIndex].thenList.splice(index, 1)
    }
    current.unchanged = await isWorkflowUnchanged(workflowIndex)
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
