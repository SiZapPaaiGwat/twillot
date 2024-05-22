import dataStore, { mutateStore } from '../options/store'

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

export const removeWorkflow = (index: number) => {
  mutateStore((state) => {
    state.workflows.splice(index, 1)
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
