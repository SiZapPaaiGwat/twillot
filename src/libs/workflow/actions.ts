import { getUserTweets } from '../api/twitter'
import { addTask } from './task'
import { ActionContext } from './types'

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
