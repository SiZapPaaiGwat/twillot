import { Workflow } from '../types/workflow'
import { getRequestBody } from './browser'

class TriggerMonitor {
  body = { variables: null as any, features: null as any }
  url = ''
  workflows = [] as Workflow[]

  /**
   * 获取所有的工作流
   */
  init() {
    chrome.runtime.onMessage.addListener((message) => {
      if (message.type === 'get_workflows') {
        this.workflows = message.data as Workflow[]
      }
    })
  }

  setup(details: chrome.webRequest.WebRequestBodyDetails) {
    const requestBody = getRequestBody(details)
    if (requestBody) {
      this.body = requestBody
    }
    this.url = details.url
  }

  getName() {
    const url = this.url
    const simpleTriggers =
      'CreateRetweet CreateNoteTweet CreateScheduledTweet CreateBookmark DeleteBookmark FavoriteTweet'.split(
        ' ',
      )
    const triggerName = simpleTriggers.find((t) => url.endsWith(`/${t}`))
    if (triggerName) {
      return triggerName
    }

    const variables = this.body.variables
    if (!variables) {
      return ''
    }

    const { in_reply_to_tweet_id } = variables
    if (url.endsWith('/CreateTweet')) {
      return in_reply_to_tweet_id ? 'ReplyTweet' : 'CreateTweet'
    }

    return ''
  }

  emit() {
    const triggerName = this.getName()
    if (triggerName) {
      const actions = this.workflows.filter((w) => w.when === triggerName)
      actions.forEach((w) => {
        console.log(`Trigger ${triggerName} emitted`, w, this.body)
      })
    }
  }
}

export default TriggerMonitor
