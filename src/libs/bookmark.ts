import { addRecords, toRecord, getTweetId, getRecord } from './db/tweets'
import {
  Header,
  Host,
  TimelineEntry,
  TimelineTimelineItem,
  TimelineTweet,
  TimelineAddEntriesInstruction,
} from '../types'
import { BookmarksResponse } from '../types'
import { addLocalItem, getLocalItem } from './browser'
import xfetch, { FetchError } from './xfetch'
import { Endpoint } from './api/twitter'

const pageSize = 100

function buildUrl(url: string, cursor?: string) {
  const [_, query] = url.split('?')
  const variables = {
    cursor: '',
    count: pageSize,
    includePromotedContent: true,
  }
  if (cursor) {
    variables.cursor = cursor
  }
  return `${Endpoint.LIST_BOOKMARKS}?variables=${encodeURIComponent(JSON.stringify(variables))}${query}`
}

async function getBookmarks(headers: Header, cursor?: string) {
  try {
    const res = await xfetch(`${buildUrl(headers.url, cursor)}`, {
      headers: {
        accept: '*/*',
        'accept-language': 'en-US,en;q=0.9',
        authorization: headers.token,
        'content-type': 'application/json',
        'x-csrf-token': headers.csrf,
        'x-twitter-active-user': 'yes',
        'x-twitter-auth-type': 'OAuth2Session',
        'x-twitter-client-language': 'en-us',
        cookie: headers.cookie,
        Referer: `${Host}/i/bookmarks`,
      },
      body: null,
      method: 'GET',
    })
    const json = (await res.json()) as BookmarksResponse

    if ('errors' in json) {
      const t = res.headers.get('X-Rate-Limit-Reset')
      const leftTime = t
        ? Math.ceil((parseInt(t) * 1000 - Date.now()) / 60000)
        : 10
      const error = new Error(
        `Server error occurred, retry after ${leftTime} minutes.`,
      )
      error.name = FetchError.DataError
      throw error
    }
    return json
  } catch (e) {
    if (e.name !== FetchError.TimeoutError && e.name !== FetchError.DataError) {
      e.name = FetchError.IdentityError
    }

    throw e
  }
}

export async function* syncAllBookmarks(headers: Header, forceSync = false) {
  /**
   * 仅针对全量同步记录 cursor 到本地
   */
  let cursor: string | undefined = forceSync
    ? await getLocalItem('bookmark_cursor')
    : undefined
  while (true) {
    const json = await getBookmarks(headers, cursor)
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

      const docs = tweets.map((i) => toRecord(i))
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
}

// export async function exportBookmarks(format: ExportFormatType) {
//   let allTweets = await findRecords('', '', 1, 100000)
//   const all = allTweets.map((i) => {
//     return {
//       username: i.username,
//       url: `${Host}/${i.screen_name}/status/${i.tweet_id}`,
//       content: i.full_text,
//       media: i.media_items
//         ? i.media_items.map((m) => m.media_url_https).join('\t')
//         : [],
//       media_count: i.media_items.length,
//       contains_video: i.has_video,
//     }
//   })
//   exportData(all, format, `twillot.${format.toLowerCase()}`)
// }

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
