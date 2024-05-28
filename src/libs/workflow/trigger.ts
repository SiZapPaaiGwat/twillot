/**
 * This module is for backgrounded workflow processing.
 */

import { TweetBase } from '../../types'
import { getWorkflows } from '.'
import { Action, ActionHandler, TriggerReponsePayload, Workflow } from './types'

export const triggerResponseRetriever = {
  /**
   * 依赖于回复返回的  id
   */
  CreateTweet: async function (
    responseText: string,
  ): Promise<{ tweetId: string; replyToTweetId: string }> {
    try {
      const json = JSON.parse(responseText)
      const tweet = json.data.create_tweet.tweet_results.result as TweetBase
      return {
        tweetId: tweet.rest_id,
        replyToTweetId: tweet.legacy.in_reply_to_status_id_str,
      }
    } catch (error) {
      console.error('CreateTweet error', error)
      return {
        tweetId: '',
        replyToTweetId: '',
      }
    }
  },
}

export class TriggerMonitor {
  requestBody = { variables: null as any, features: null as any }
  url = ''
  workflows = [] as Workflow[]
  handlers = {}

  /**
   * 获取所有的工作流
   * 1) 第一次启动时，从本地存储中获取所有的工作流
   * 2) 监听 chrome.runtime.onMessage 事件，获取新的工作流, 并更新本地存储
   */
  async init() {
    this.workflows = await getWorkflows()
  }

  register(action: Action, fn: ActionHandler) {
    this.handlers[action] = fn
  }

  async emit(payload: TriggerReponsePayload) {
    const { request, response, trigger } = payload
    if (request.body && typeof request.body === 'string') {
      request.body = JSON.parse(request.body)
    }
    const actions = this.workflows.filter((w) => w.when === trigger)
    actions.forEach(async (w) => {
      const context = {
        request,
        response,
        trigger,
        prevActionResponse: null,
      }
      for (const action of w.thenList) {
        // TODO 为 action 添加自定义参数
        const handler = this.handlers[action]
        if (handler) {
          context.prevActionResponse = await handler(context)
          console.log(`Workflow: ${w.when} -> ${action}`, context)
        }
      }
    })
  }
}
