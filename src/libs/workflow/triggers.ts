import { Host } from '../../types'

export enum TriggerTypes {
  CreateTweet = 'CreateTweet',
  CreateNoteTweet = 'CreateNoteTweet',
  CreateScheduledTweet = 'CreateScheduledTweet',
  ReplyTweet = 'ReplyTweet',
  CreateBookmark = 'CreateBookmark',
  DeleteBookmark = 'DeleteBookmark',
  FavoriteTweet = 'FavoriteTweet',
}

export enum TriggerNames {
  CreateTweet = 'Create a tweet',
  CreateNoteTweet = 'Create a note tweet',
  CreateScheduledTweet = 'Create a scheduled tweet',
  ReplyTweet = 'Reply to a tweet',
  CreateBookmark = 'Create a bookmark',
  DeleteBookmark = 'Delete a bookmark',
  FavoriteTweet = 'Favorite a tweet',
}

export type Trigger = keyof typeof TriggerTypes

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
