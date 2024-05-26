import { addRecords, toRecord, getTweetId, getRecord } from './db/tweets'
import {
  TimelineEntry,
  TimelineTimelineItem,
  TimelineTweet,
  TimelineAddEntriesInstruction,
  TimelineTimelineModule,
} from '../types'
import {
  addLocalItem,
  getIdsToSave,
  getLocalItem,
  removeIdToSave,
} from './browser'
import { getBookmarks, getTweet } from './api/twitter'

export async function* syncAllBookmarks(forceSync = false) {
  /**
   * 仅针对全量同步记录 cursor 到本地
   */
  let cursor: string | undefined = forceSync
    ? await getLocalItem('bookmark_cursor')
    : undefined
  while (true) {
    const json = await getBookmarks(cursor)
    const instruction =
      json.data.bookmark_timeline_v2.timeline.instructions?.find(
        (i) => i.type === 'TimelineAddEntries',
      ) as TimelineAddEntriesInstruction | undefined
    if (!instruction) {
      console.error('No instructions found in response')
      break
    }

    const tweets = instruction.entries.filter(
      (e) => e.content.entryType === 'TimelineTimelineItem',
    ) as TimelineEntry<TimelineTweet, TimelineTimelineItem<TimelineTweet>>[]
    if (!tweets.length) {
      console.warn(
        `Reached end of bookmarks with cursor ${cursor}, ${tweets.length}`,
      )
      break
    } else {
      if (!forceSync) {
        if (await isBookmarksSynced(tweets)) {
          console.log('All bookmarks have been synchronized')
          break
        }
      }

      const docs = tweets.map((i) =>
        toRecord(i.content.itemContent, i.sortIndex),
      )
      await addRecords(docs)
      yield docs
    }
    const target = instruction.entries[instruction.entries.length - 1].content
    if (target.entryType === 'TimelineTimelineCursor') {
      cursor = target.value
      if (forceSync) {
        await addLocalItem('bookmark_cursor', cursor)
      }
    } else {
      break
    }
  }

  const idsToSave = await getIdsToSave()
  for (let id of idsToSave) {
    const dbItem = await getRecord(id)
    const conversations = await getTweetConversations(id, '')
    if (conversations) {
      dbItem.conversations = conversations
      await addRecords([dbItem], true)
      // TODO update store
    }
    await removeIdToSave(id)
  }
}

export async function isBookmarksSynced(
  tweets: TimelineEntry<TimelineTweet, TimelineTimelineItem<TimelineTweet>>[],
) {
  const remoteLatest = tweets[0]
  const remoteLast = tweets[tweets.length - 1]
  const [localLatest, localLast] = await Promise.all([
    getRecord(getTweetId(remoteLatest)),
    getRecord(getTweetId(remoteLast)),
  ])
  /**
   * 首尾两条都同步过了，说明已经同步完毕，可以退出循环
   * 如果因为同步被中断导致部分旧数据未同步，可以手动调用时设置 forceSync 参数为 true
   */
  if (localLatest && localLast) {
    // 有可能将老数据取消收藏，然后又重新收藏
    // 这个时候 sort_index 没有更新，需要重新同步
    if (
      localLatest.sort_index === remoteLatest.sortIndex &&
      localLast.sort_index === remoteLast.sortIndex
    ) {
      return true
    }
  }

  return false
}

/**
 * 获取推文主题
 * sortIndex 依赖与书签同步接口
 */
export async function getTweetConversations(
  tweetId: string,
  sortIndex: string,
) {
  const json = await getTweet(tweetId)
  const wrapper =
    json.data.threaded_conversation_with_injections_v2.instructions
  const instructions = wrapper.find((i) => i.type === 'TimelineAddEntries') as
    | TimelineAddEntriesInstruction
    | undefined
  if (!instructions) {
    console.error('No instructions found in response')
    return null
  }

  // 这是原推
  let originalTweet = instructions.entries[0]
  if (!originalTweet) {
    console.error('Tweet not found in response')
    return null
  }

  const conversations = []
  // 主题回复只会在第一个？
  let entry = instructions.entries[1] as TimelineEntry<
    TimelineTweet,
    TimelineTimelineModule<TimelineTweet>
  > | null
  if (!entry) {
    return null
  }

  const items = entry.content.items.filter(
    (i) =>
      i.item.itemContent.itemType === 'TimelineTweet' &&
      i.item.itemContent.tweetDisplayType === 'SelfThread',
  )

  for (const i of items) {
    conversations.push(toRecord(i.item.itemContent, sortIndex))
  }

  return conversations
}
