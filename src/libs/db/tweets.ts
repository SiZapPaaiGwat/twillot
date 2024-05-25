import {
  TimelineTweet,
  Tweet,
  TimelineEntry,
  TimelineTimelineItem,
  TweetWithPosition,
  QueryOptions,
  TweetBase,
  TweetUnion,
  EntityURL,
} from '../../types'
import { parseTwitterQuery } from '../query-parser'
import { URL_REG } from '../text'
import { openDb, getObjectStore } from './index'

export async function addRecords(
  records: Tweet[],
  overwrite = false,
): Promise<void> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const { transaction, objectStore } = getObjectStore(db)
    transaction.oncomplete = () => {
      resolve()
    }
    transaction.onerror = (event: Event) => {
      reject(
        'Transaction error: ' + (event.target as IDBRequest).error?.toString(),
      )
    }

    records.forEach((record) => {
      if (record) {
        if (overwrite) {
          objectStore.put(record)
          return
        }

        const getRequest = objectStore.get(record.tweet_id)
        getRequest.onsuccess = () => {
          if (!getRequest.result) {
            objectStore.put(record)
          }
        }
        getRequest.onerror = (event: Event) => {
          console.error(
            'Get request error: ' +
              record.tweet_id +
              (event.target as IDBRequest).error?.toString(),
          )
        }
      }
    })
  })
}

function meetsCriteria(
  tweet: Tweet,
  options: QueryOptions,
  category = '',
  folder = '',
): boolean {
  return (
    (!options.keyword ||
      tweet.full_text.toLowerCase().includes(options.keyword.toLowerCase())) &&
    (!options.fromUser ||
      tweet.screen_name.toLowerCase() === options.fromUser.toLowerCase()) &&
    (!category || tweet[category]) &&
    (!folder || tweet.folder?.toLowerCase() === folder.toLowerCase())
  )
}

function getRange(since?: number, until?: number): IDBKeyRange | null {
  if (since && until) {
    return IDBKeyRange.bound(since, until)
  } else if (since) {
    return IDBKeyRange.lowerBound(since)
  } else if (until) {
    return IDBKeyRange.upperBound(until)
  }
  return null
}

/**
 * Number 目前都只查了第一页，翻页涉及查询条件会不准
 */
export async function findRecords(
  keyword = '',
  category = '',
  folder = '',
  lastId = '',
  pageSize = 100,
): Promise<Tweet[]> {
  const db = await openDb()
  const options = parseTwitterQuery(keyword)
  const results: Tweet[] = []
  let recordsFetched = 0 // 实际已获取的记录数
  let isStartLooking = !lastId
  const since = options.since
    ? Math.floor(new Date(options.since + ' 00:00:00').getTime() / 1000)
    : null
  const until = options.until
    ? Math.floor(new Date(options.until + ' 23:59:59').getTime() / 1000)
    : null
  const indexName = since || until ? 'created_at' : 'sort_index' // 选择索引

  return new Promise((resolve, reject) => {
    const { objectStore } = getObjectStore(db)
    const index = objectStore.index(indexName)
    const range = getRange(since, until) // 创建时间范围
    const request = index.openCursor(range, 'prev')

    request.onsuccess = (event: Event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result
      if (cursor) {
        const tweet = cursor.value as Tweet
        if (isStartLooking) {
          const met = meetsCriteria(tweet, options, category, folder)
          if (met) {
            recordsFetched++
            if (recordsFetched <= pageSize) {
              results.push(tweet)
            }
            if (recordsFetched === pageSize) {
              resolve(results)
              return
            }
          }
        } else {
          if (tweet.tweet_id === lastId) {
            isStartLooking = true
          }
        }

        cursor.continue()
      } else {
        resolve(results)
      }
    }

    request.onerror = (event: Event) => {
      reject(
        'Failed to retrieve records: ' +
          (event.target as IDBRequest).error?.toString(),
      )
    }
  })
}

export async function getRecord(id: string): Promise<Tweet | undefined> {
  if (!id) {
    return Promise.resolve(undefined)
  }

  const db = await openDb()

  return new Promise((resolve, reject) => {
    const { objectStore } = getObjectStore(db)
    const request = objectStore.get(id)

    request.onsuccess = (event: Event) => {
      resolve((event.target as IDBRequest<Tweet>).result)
    }

    request.onerror = (event: Event) => {
      reject(
        'Get record error: ' + (event.target as IDBRequest).error?.toString(),
      )
    }
  })
}
export async function countRecords(
  indexName?: string,
  value?: string,
): Promise<{
  total: number
  image: number
  video: number
  gif: number
  link: number
  quote: number
  long_text: number
}> {
  const db = await openDb()

  return new Promise((resolve, reject) => {
    const { objectStore } = getObjectStore(db)
    let request
    if (indexName) {
      const index = objectStore.index(indexName)
      const keyRange = IDBKeyRange.only(value)
      request = index.count(keyRange)
    } else {
      request = objectStore.count()
    }
    const counts = {
      total: 0,
      image: 0,
      video: 0,
      gif: 0,
      link: 0,
      quote: 0,
      long_text: 0,
    }
    request.onsuccess = async (event: Event) => {
      const total = (event.target as IDBRequest<number>).result
      if (indexName) {
        counts.total = total
        resolve(counts)
      } else {
        const cursorRequest = objectStore.openCursor()
        cursorRequest.onsuccess = (cursorEvent: Event) => {
          const cursor = (cursorEvent.target as IDBRequest<IDBCursorWithValue>)
            .result
          if (cursor) {
            const record = cursor.value
            counts.total++
            if (record.has_image) counts.image++
            if (record.has_video) counts.video++
            if (record.has_gif) counts.gif++
            if (record.has_link) counts.link++
            if (record.has_quote) counts.quote++
            if (record.is_long_text) counts.long_text++
            cursor.continue()
          } else {
            resolve(counts)
          }
        }
        cursorRequest.onerror = (cursorEvent: Event) => {
          reject(
            'Cursor error: ' +
              (cursorEvent.target as IDBRequest).error?.toString(),
          )
        }
      }
    }
    request.onerror = (event: Event) => {
      reject(
        'Count records error: ' +
          (event.target as IDBRequest).error?.toString(),
      )
    }
  })
}

function replaceWithExpandedUrl(text: string, urls: EntityURL[]) {
  if (urls.length === 0) {
    return text
  }

  for (let item of urls) {
    text = text.replace(new RegExp(item.url, 'g'), item.expanded_url)
  }

  return text
}

function getTweet(tweet?: TweetUnion): TweetBase | null {
  if (!tweet) {
    return null
  }
  if (tweet.__typename === 'TweetWithVisibilityResults') {
    return tweet.tweet
  }

  return 'legacy' in tweet && tweet.legacy ? tweet : null
}

function getTweetFields(tweet?: TweetUnion) {
  if (!tweet) {
    return null
  }
  tweet = getTweet(tweet)
  if (!tweet) {
    return null
  }

  const user_legacy = tweet.core.user_results.result.legacy
  const entities = tweet.legacy.extended_entities || tweet.legacy.entities
  const media_items = entities?.media
  let full_text = ''
  if (tweet.note_tweet) {
    full_text = tweet.note_tweet.note_tweet_results.result.text
    full_text = replaceWithExpandedUrl(
      full_text,
      tweet.note_tweet.note_tweet_results.result.entity_set.urls,
    )
  } else {
    full_text = tweet.legacy.full_text
    full_text = replaceWithExpandedUrl(full_text, tweet.legacy.entities.urls)
  }

  return {
    username: user_legacy.name,
    screen_name: user_legacy.screen_name,
    avatar_url: user_legacy.profile_image_url_https,
    user_id: tweet.legacy.user_id_str,
    tweet_id: tweet.legacy.id_str,
    possibly_sensitive: tweet.legacy.possibly_sensitive,
    full_text,
    media_items,
    lang: tweet.legacy.lang,
    created_at: Math.floor(new Date(tweet.legacy.created_at).getTime() / 1000),
  }
}

export function toRecord(
  record: TimelineTweet,
  sortIndex: string,
): Tweet | null {
  let tweet_base = getTweet(record.tweet_results.result)
  if (!tweet_base) {
    return null
  }

  const fields = getTweetFields(tweet_base)
  const media_items = fields.media_items
  const has_quote = !!tweet_base.quoted_status_result?.result

  return {
    ...fields,
    sort_index: sortIndex,
    has_gif: !!media_items?.some((item) => item.type === 'animated_gif'),
    has_image: !!media_items?.some((item) => item.type === 'photo'),
    has_video: !!media_items?.some((item) => item.type === 'video'),
    has_quote,
    is_long_text: !!tweet_base.note_tweet?.note_tweet_results,
    has_link: URL_REG.test(fields.full_text),
    quoted_tweet: has_quote
      ? getTweetFields(tweet_base.quoted_status_result.result)
      : null,
  } as Tweet
}

export function getTweetId(
  record: TimelineEntry<TimelineTweet, TimelineTimelineItem<TimelineTweet>>,
): string {
  let tweet = getTweet(record.content.itemContent.tweet_results.result)
  return tweet?.legacy?.id_str || ''
}

export async function aggregateUsers() {
  const db = await openDb()
  const userInfo = {}

  return new Promise((resolve, reject) => {
    const { objectStore } = getObjectStore(db)
    const index = objectStore.index('sort_index')
    const request = index.openCursor()

    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result
      if (cursor) {
        const userId = cursor.value.screen_name
        if (!userInfo[userId]) {
          userInfo[userId] = {
            avatar_url: cursor.value.avatar_url,
            username: cursor.value.username,
            screen_name: cursor.value.screen_name,
            count: 0,
          }
        }
        userInfo[userId].count += 1

        cursor.continue()
      } else {
        resolve(userInfo)
      }
    }

    request.onerror = () => reject(request.error)
  })
}

export async function getTopUsers(num = 10) {
  const users = await aggregateUsers()
  return Object.values(users)
    .sort((a, b) => b.count - a.count)
    .slice(0, num)
}

export async function getTimeline(): Promise<TweetWithPosition[]> {
  const db = await openDb()

  return new Promise((resolve, reject) => {
    const { objectStore } = getObjectStore(db)
    const index = objectStore.index('sort_index')
    const request = index.openCursor(null, 'next')
    const results: TweetWithPosition[] = []
    let count = 0
    const targets = new Set([1, 100, 1000])

    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result
      if (cursor) {
        count++
        if (
          (count <= 1000 && targets.has(count)) ||
          (count > 1000 && (count - 1000) % 1000 === 0)
        ) {
          results.unshift({
            tweet: cursor.value,
            position: count,
          })
        }
        cursor.continue()
      } else {
        resolve(results)
      }
    }

    request.onerror = (event) => {
      reject((event.target as IDBRequest).error)
    }
  })
}

export async function getRencentTweets(days: number): Promise<{
  total: number
  data: { date: string; count: number }[]
}> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const { objectStore } = getObjectStore(db)
    const index = objectStore.index('created_at')
    const oneYearAgo = Math.floor(
      (Date.now() - days * 24 * 60 * 60 * 1000) / 1000,
    )
    const range = IDBKeyRange.lowerBound(oneYearAgo)
    const request = index.openCursor(range)
    const dateCounts: { [key: string]: number } = {}
    let total = 0

    request.onsuccess = () => {
      const cursor = request.result
      if (cursor) {
        const tweet = cursor.value
        const date = new Date(tweet.created_at * 1000).toLocaleDateString()
        total += 1
        if (dateCounts[date]) {
          dateCounts[date] += 1
        } else {
          dateCounts[date] = 1
        }
        cursor.continue()
      } else {
        const result = Object.keys(dateCounts).map((date) => ({
          date,
          count: dateCounts[date],
        }))
        resolve({
          total,
          data: result,
        })
      }
    }

    request.onerror = (event) => {
      reject(request.error)
    }
  })
}

export async function clearFolder(folder: string): Promise<void> {
  const db = await openDb()

  return new Promise((resolve, reject) => {
    const store = getObjectStore(db, 'tweets').objectStore
    const index = store.index('folder')
    const request = index.openCursor(IDBKeyRange.only(folder))

    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result
      if (cursor) {
        const updateData = cursor.value
        updateData.folder = ''
        cursor.update(updateData)
        cursor.continue()
      } else {
        resolve()
      }
    }

    request.onerror = (event) => {
      reject(
        'Failed to clear folder: ' +
          (event.target as IDBRequest).error?.toString(),
      )
    }
  })
}

export async function getRandomTweet(skip: number): Promise<Tweet | undefined> {
  const db = await openDb()

  return new Promise((resolve, reject) => {
    const { objectStore } = getObjectStore(db)
    const request = objectStore.openCursor()
    let skipped = false

    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result
      if (cursor) {
        if (skipped) {
          resolve(cursor.value)
          return
        }
        cursor.advance(skip)
        skipped = true
      } else {
        resolve(null)
      }
    }

    request.onerror = (event) => {
      reject(
        'Failed to get random tweet: ' +
          (event.target as IDBRequest).error?.toString(),
      )
    }
  })
}
