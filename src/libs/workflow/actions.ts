import { Task, addTask } from './task'
import { Trigger } from './triggers'

export enum Action {
  UnrollThread,
  DeleteBookmark,
}

export enum ActionNames {
  UnrollThread = 'Unroll this thread',
  DeleteBookmark = 'Delete from local',
}

export interface ActionContext {
  triggerName: Trigger
  requestBody: any
  prevResponse: any
}

export type ActionHandler = (context: ActionContext) => Promise<any>

/**
 * 将当前推文 id 保存到本地存储 idsToSave
 * idsToSave 列表会在入库时拉取主题推文全部内容
 */
const saveTweetId = async (context: ActionContext) => {
  const { requestBody, triggerName } = context
  console.log('save_thread: triggerName:', triggerName, requestBody)
  let tweet_id = ''
  if (triggerName === 'CreateBookmark' || triggerName === 'DeleteBookmark') {
    tweet_id = requestBody.variables.tweet_id
  } else {
    return Promise.reject(
      new Error('Currenttrigger is not supported for save_thread action'),
    )
  }

  if (!tweet_id) {
    console.error('save_thread: tweet_id is empty')
    return
  }

  await addTask({
    id: Date.now().toString(16),
    name: Action.UnrollThread,
    tweetId: tweet_id,
  } as Task)
}

export default {
  [Action.UnrollThread]: async (context: ActionContext) =>
    await addTask({
      id: Date.now().toString(16),
      name: Action.UnrollThread,
      tweetId: context.requestBody.variables.tweet_id,
    }),
  [Action.DeleteBookmark]: async (context: ActionContext) =>
    await addTask({
      id: Date.now().toString(16),
      name: Action.DeleteBookmark,
      tweetId: context.requestBody.variables.tweet_id,
    }),
}
