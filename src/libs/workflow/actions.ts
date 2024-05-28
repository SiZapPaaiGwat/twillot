import { createTweet } from '../api/twitter'
import { addTask } from '.'
import { ActionContext } from './types'

export default {
  UnrollThread: async (context: ActionContext) =>
    await addTask({
      id: Date.now().toString(16),
      name: 'UnrollThread',
      tweetId: context.request.body.variables.tweet_id,
    }),
  DeleteBookmark: async (context: ActionContext) =>
    await addTask({
      id: Date.now().toString(16),
      name: 'DeleteBookmark',
      tweetId: context.request.body.variables.tweet_id,
    }),
  /**
   * webRequest API 无法直接获得响应体
   * 抓取个人主页信息去获取最新一条推文的 rest_id
   */
  AutoComment: async (context: ActionContext) => {
    const { tweetId, replyToTweetId } = context.response.body
    if (!replyToTweetId) {
      console.log('This is a new tweet', context)
      await createTweet({
        text: '自动评论 by #twillot @readwise',
        replyTweetId: tweetId,
      })
    } else {
      console.log('This is a reply, just ignore', context)
    }
  },
}
