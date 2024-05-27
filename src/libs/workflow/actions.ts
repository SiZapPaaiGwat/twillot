import { getUserTweets } from '../api/twitter'
import { addTask } from './task'
import { Trigger } from './triggers'

export enum ActionNames {
  UnrollThread = 'Unroll this thread',
  DeleteBookmark = 'Delete from local',
  AutoComment = 'Auto comment with a templated message',
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
  /**
   * webRequest API 无法直接获得响应体
   * 抓取个人主页信息去获取最新一条推文的 rest_id
   */
  AutoComment: async (context: ActionContext) => {
    const json = await getUserTweets()
  },
}
