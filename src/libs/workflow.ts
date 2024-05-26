/**
 * This module is for backgrounded workflow processing.
 */

import {
  type Action,
  ActionHandler,
  ActionTypes,
  Workflow,
} from './workflow/workflow'
import { getRequestBody, getWorkflows, startWorkflowListening } from './browser'
import actions from './workflow/actions'

const simpleTriggers =
  'CreateRetweet CreateNoteTweet CreateScheduledTweet CreateBookmark DeleteBookmark FavoriteTweet'.split(
    ' ',
  )

class TriggerMonitor {
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
    startWorkflowListening()
  }

  register(action: Action, fn: ActionHandler) {
    this.handlers[action] = fn
  }

  setup(details: chrome.webRequest.WebRequestBodyDetails) {
    const requestBody = getRequestBody(details)
    if (requestBody) {
      this.requestBody = requestBody
    }
    this.url = details.url
    this.emit()
  }

  getName() {
    const url = this.url
    const triggerName = simpleTriggers.find((t) => url.endsWith(`/${t}`))
    if (triggerName) {
      return triggerName
    }

    const variables = this.requestBody.variables
    if (!variables) {
      return ''
    }

    const { in_reply_to_tweet_id } = variables
    if (url.endsWith('/CreateTweet')) {
      return in_reply_to_tweet_id ? 'ReplyTweet' : 'CreateTweet'
    }

    return ''
  }

  async emit() {
    const triggerName = this.getName()
    if (triggerName) {
      const actions = this.workflows.filter((w) => w.when === triggerName)
      actions.forEach(async (w) => {
        const context = {
          requestBody: this.requestBody,
          prevResponse: null,
          triggerName,
        }
        for (const action of w.thenList) {
          const handler = this.handlers[action]
          if (handler) {
            const response = await handler(context)
            context.prevResponse = response
            console.log(`Workflow: ${w.when} -> ${action}`, response)
          }
        }
      })
    }
  }
}

const monitor = new TriggerMonitor()
monitor.init()
monitor.register(ActionTypes.translate, actions.saveTweetId)

export default monitor