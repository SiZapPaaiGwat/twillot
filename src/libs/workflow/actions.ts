import { addTask } from './task'
import { Trigger } from './triggers'

export enum ActionNames {
  UnrollThread = 'Unroll this thread',
  DeleteBookmark = 'Delete from local',
}

export type Action = keyof typeof ActionNames

export interface ActionContext {
  triggerName: Trigger
  requestBody: any
  prevResponse: any
}

export type ActionHandler = (context: ActionContext) => Promise<any>

export default {
  UnrollThread: async (context: ActionContext) =>
    await addTask({
      id: Date.now().toString(16),
      name: 'UnrollThread',
      tweetId: context.requestBody.variables.tweet_id,
    }),
  DeleteBookmark: async (context: ActionContext) =>
    await addTask({
      id: Date.now().toString(16),
      name: 'DeleteBookmark',
      tweetId: context.requestBody.variables.tweet_id,
    }),
}
