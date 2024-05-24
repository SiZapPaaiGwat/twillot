import { unwrap } from 'solid-js/store'
import { readConfig, upsertConfig } from '../libs/db/configs'
import dataStore, { mutateStore } from '../options/store'
import { OptionName } from '../types'

export enum WhenAction {
  bookmark = 'bookmark',
  reply = 'reply',
  retweet = 'retweet',
  refer = 'refer',
  like = 'like',
}

export enum ThenAction {
  translate = 'Translate',
  summarize = 'Summarize',
  question = 'Question',
  extend = 'Extend',
  webhook = 'Send a webhook',
}

export interface Workflow {
  id: string
  when: WhenAction
  thenList: ThenAction[]
}

const [store] = dataStore

export const getUnusedWhen = () => {
  const usedWhens = new Set(store.workflows.map((w) => w.when))
  const unusedWhens = Object.values(WhenAction).filter(
    (action) => !usedWhens.has(action),
  )
  return unusedWhens.length > 0 ? unusedWhens[0] : WhenAction.bookmark
}

export const getUsedThens = (currentThens: ThenAction[]) => {
  return new Set(currentThens)
}

export const getUnusedThen = (currentThens: ThenAction[]) => {
  const usedThens = getUsedThens(currentThens)
  const allThens = Object.values(ThenAction)
  const unusedThens = allThens.filter((action) => !usedThens.has(action))
  return unusedThens.length > 0 ? unusedThens[0] : ThenAction.translate
}

/**
 * 仅更新 store 中的数据，不更新数据库
 */
export const addWorkflow = () => {
  const newWorkflow: Workflow = {
    id: Date.now().toString(16),
    when: getUnusedWhen(),
    thenList: [ThenAction.translate],
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
  // 如果数据库中没有记录，则直接插入
  if (!dbRecords) {
    await upsertConfig({
      option_name: OptionName.WORKFLOW,
      option_value: [workflow],
    })
    return
  }

  const records = dbRecords.option_value as Workflow[]
  const posIndex = records.findIndex((w) => w.id === workflow.id)

  if (posIndex > -1) {
    records[posIndex] = workflow
  } else {
    records.unshift(workflow)
  }

  await upsertConfig({
    option_name: OptionName.WORKFLOW,
    option_value: records,
  })
}

export const getWorkflows = async () => {
  const dbRecords = await readConfig(OptionName.WORKFLOW)
  mutateStore((state) => {
    state.workflows = (dbRecords?.option_value || []) as Workflow[]
  })
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
  if (workflow.thenList.length === Object.values(ThenAction).length) {
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

export const updateWhen = (workflowIndex: number, newWhen: WhenAction) => {
  mutateStore((state) => {
    state.workflows[workflowIndex].when = newWhen
  })
}

export const updateThen = (
  workflowIndex: number,
  thenIndex: number,
  newThen: ThenAction,
) => {
  mutateStore((state) => {
    const index = state.workflows[workflowIndex].thenList.indexOf(newThen)
    state.workflows[workflowIndex].thenList[thenIndex] = newThen
    if (index > -1) {
      state.workflows[workflowIndex].thenList.splice(index, 1)
    }
  })
}
