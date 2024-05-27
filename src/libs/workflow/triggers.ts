import { Host } from '../../types'

/**
 * NOTE: 注意顺序可能影响单元测试
 */
export enum TriggerNames {
  CreateBookmark = 'Create a bookmark',
  DeleteBookmark = 'Delete a bookmark',
  CreateTweet = 'Create a tweet',
  CreateNoteTweet = 'Create a note tweet',
  CreateScheduledTweet = 'Create a scheduled tweet',
  ReplyTweet = 'Reply to a tweet',
  FavoriteTweet = 'Favorite a tweet',
}

export type Trigger = keyof typeof TriggerNames

/**
 * 开始监听用户的触发动作
 * @description bg only
 */
export function startTriggerListening(monitor) {
  chrome.webRequest.onBeforeRequest.addListener(
    (details) => {
      if (details.method !== 'POST') {
        return
      }

      monitor.setup(details)
    },
    { urls: [`${Host}/*`] },
    ['requestBody'],
  )
}
