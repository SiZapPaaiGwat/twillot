/**
 * Mostly copied from prinsss's repo
 * https://github.com/prinsss/twitter-web-exporter/blob/main/src/types/index.ts
 */

import { Media, TimelineTweet } from './tweet'
import { TimelineTwitterList } from './list'
import { TimelineUser } from './user'
export * from './list'
export * from './tweet'
export * from './user'

export interface CountInfo {
  total: number
  image: number
  video: number
  gif: number
  link: number
  quote: number
  long_text: number
}

export interface FontSet {
  name: string
  url: string
  preview?: string[]
}

export enum OptionName {
  FOLDER = 'folder',
  RULE = 'rule',
  WORKFLOW = 'workflow',
}

export interface Config {
  option_name: OptionName
  option_value: any
}

export interface Tweet extends TweetQuoted {
  title?: string
  note?: string
  tags?: string[]
  sort_index: string
  has_image: boolean
  has_video: boolean
  has_gif: boolean
  has_link: boolean
  has_quote: boolean
  is_long_text: boolean
  quoted_tweet?: TweetQuoted
  // 不可以属于多个文件夹
  folder: string
  conversations?: Tweet[]
}

export interface TweetQuoted {
  tweet_id: string
  user_id: string
  username: string
  screen_name: string
  avatar_url: string
  full_text: string
  lang: string
  created_at: number
  possibly_sensitive: boolean
  media_items: Media[] | null | undefined
}

export interface TweetWithPosition {
  tweet: Tweet
  position: number
}

export interface IndexedDbIndexItem {
  name: string
  options: IDBIndexParameters
}

export interface Header {
  url: string
  token: string
  csrf: string
  cookie: string
}

export interface QueryOptions {
  keyword?: string
  fromUser?: string
  since?: string
  until?: string
  folder?: string
}

export enum AuthStatus {
  AUTH_PENDING = 'AUTH_PENDING',
  AUTH_SUCCESS = 'AUTH_SUCCESS',
  AUTH_FAILED = 'AUTH_FAILED',
}

export interface User {
  screen_name: string
  username: string
  avatar_url: string
  count: number
}

export const X_DOMAIN = 'x.com'

export const Host = `https://${X_DOMAIN}`

export enum ActionPage {
  DEL_BOOKMARK = `${Host}/i/bookmarks?twillot=delete-bookmark`,
  AUTHENTICATE = `${Host}/i/bookmarks?twillot=reauth`,
}

interface ErrorResponse {
  message: string
  code: number
  kind: string
  name: string
  source: string
}

export interface BookmarksResponse {
  data: {
    bookmark_timeline_v2: {
      timeline: {
        instructions: TimelineInstructions
        responseObjects: unknown
      }
    }
  }
  errors?: ErrorResponse[]
}

export interface EntityURL {
  display_url: string
  expanded_url: string
  url: string
  indices: number[]
}

export type TimelineInstructions = Array<
  | TimelineClearCacheInstruction
  | TimelineTerminateTimelineInstruction
  | TimelinePinEntryInstruction
  | TimelineAddEntriesInstruction
  | TimelineAddToModuleInstruction
>

export interface TimelineClearCacheInstruction {
  type: 'TimelineClearCache'
}

export interface TimelineTerminateTimelineInstruction {
  type: 'TimelineTerminateTimeline'
  direction: 'Top' | 'Bottom'
}

export interface TimelineEntry<
  T = ItemContentUnion,
  C =
    | TimelineTimelineItem<T>
    | TimelineTimelineModule<T>
    | TimelineTimelineCursor,
> {
  content: C
  entryId: string
  sortIndex: string
}

export interface TimelinePinEntryInstruction {
  type: 'TimelinePinEntry'
  entry: TimelineEntry<TimelineTweet, TimelineTimelineItem<TimelineTweet>>
}

export interface TimelineAddEntriesInstruction<T = ItemContentUnion> {
  type: 'TimelineAddEntries'
  entries: TimelineEntry<T>[]
}

export interface TimelineAddToModuleInstruction<T = ItemContentUnion> {
  type: 'TimelineAddToModule'
  // "conversationthread-{id}"
  // "profile-grid-{id}"
  moduleEntryId: string
  prepend: boolean
  moduleItems: {
    // "conversationthread-{id}-tweet-{tid}"
    // "profile-grid-{id}-tweet-{tid}"
    entryId: string
    item: {
      clientEventInfo: unknown
      itemContent: T
    }
  }[]
}

// TimelineEntry.entryId: "tweet-{id}"
// TimelineEntry.entryId: "user-{id}"
export interface TimelineTimelineItem<T = ItemContentUnion> {
  entryType: 'TimelineTimelineItem'
  __typename: 'TimelineTimelineItem'
  itemContent: T
  clientEventInfo: unknown
}

// TimelineEntry.entryId: "cursor-top-{id}"
// TimelineEntry.entryId: "cursor-bottom-{id}"
export interface TimelineTimelineCursor {
  entryType: 'TimelineTimelineCursor'
  __typename: 'TimelineTimelineCursor'
  value: string
  cursorType: 'Top' | 'Bottom' | 'ShowMore' | 'ShowMoreThreads'
}

export interface TimelinePrompt {
  itemType: 'TimelinePrompt'
  __typename: 'TimelinePrompt'
}

export interface TimelineMessagePrompt {
  itemType: 'TimelineMessagePrompt'
  __typename: 'TimelineMessagePrompt'
}

export type ItemContentUnion =
  | TimelineTweet
  | TimelineUser
  | TimelinePrompt
  | TimelineMessagePrompt
  | TimelineTimelineCursor
  | TimelineTwitterList

// TimelineEntry.entryId: "who-to-follow-{id}"
// TimelineEntry.entryId: "profile-conversation-{id}"
// TimelineEntry.entryId: "conversationthread-{id}"
// TimelineEntry.entryId: "tweetdetailrelatedtweets-{id}"
// TimelineEntry.entryId: "profile-grid-{id}"
// TimelineEntry.entryId: "search-grid-{id}"
// TimelineEntry.entryId: "list-search-{id}"
export interface TimelineTimelineModule<T = ItemContentUnion> {
  entryType: 'TimelineTimelineModule'
  __typename: 'TimelineTimelineModule'
  clientEventInfo: unknown
  displayType:
    | 'Vertical'
    | 'VerticalConversation'
    | 'VerticalGrid'
    | 'ListWithPin'
    | 'ListWithSubscribe'
    | string
  items: {
    // "who-to-follow-{id}-user-{uid}"
    // "profile-conversation-{id}-tweet-{tid}"
    // "conversationthread-{id}-tweet-{tid}"
    // "conversationthread-{id}-cursor-showmore-{cid}"
    // "tweetdetailrelatedtweets-{id}-tweet-{tid}"
    // "profile-grid-{id}-tweet-{tid}"
    // "search-grid-{id}-tweet-{tid}"
    // "list-search-{id}-list-{lid}"
    entryId: string
    item: {
      clientEventInfo: unknown
      feedbackInfo: unknown
      itemContent: T
    }
  }[]
  header?: unknown
  metadata?: {
    conversationMetadata: {
      allTweetIds: string[]
      enableDeduplication: boolean
    }
  }
}

const BASE_PATH = `${Host}/i/api/graphql/`

export enum EndpointQuery {
  LIST_BOOKMARKS = 'UyNF_BgJ5d5MbtuVukyl7A',
  CREATE_BOOKMARK = 'aoDbu3RHznuiSkQ9aNM67Q',
  DELETE_BOOKMARK = 'Wlmlj2-xzyS1GN3a6cj-mQ',
  CREATE_TWEET = '31-6kYrWwW7ZqHmLu2mm9w',
  CREATE_NOTE_TWEET = 'AeGhOs6NT4w5_bCW5jBQJw',
  CREATE_REPLY = '31-6kYrWwW7ZqHmLu2mm9w',
  TWEET_DETAIL = 'bFUhQzgl9zjo-teD0pAQZw',
  DELETE_TWEET = 'VaenaVgh5q5ih7kvyVjgtg',
  USER_TWEETS = 'gQlOy4mD5C8M8fYxqa0FJg',
}

export enum Endpoint {
  LIST_BOOKMARKS = `${BASE_PATH}${EndpointQuery.LIST_BOOKMARKS}/Bookmarks`,
  CREATE_BOOKMARK = `${BASE_PATH}${EndpointQuery.CREATE_BOOKMARK}/CreateBookmark`,
  DELETE_BOOKMARK = `${BASE_PATH}${EndpointQuery.DELETE_BOOKMARK}/DeleteBookmark`,
  CREATE_TWEET = `${BASE_PATH}${EndpointQuery.CREATE_TWEET}/CreateTweet`,
  CREATE_NOTE_TWEET = `${BASE_PATH}${EndpointQuery.CREATE_NOTE_TWEET}/CreateNoteTweet`,
  CREATE_REPLY = `${BASE_PATH}${EndpointQuery.CREATE_REPLY}/CreateTweet`,
  TWEET_DETAIL = `${BASE_PATH}${EndpointQuery.TWEET_DETAIL}/TweetDetail`,
  DELETE_TWEET = `${BASE_PATH}${EndpointQuery.DELETE_TWEET}/DeleteTweet`,
  USER_TWEETS = `${BASE_PATH}${EndpointQuery.USER_TWEETS}/UserTweets`,
}
