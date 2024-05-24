import { Host, Tweet } from './index'

const BASE_PATH = `${Host}/i/api/graphql/`

export enum EndpointQuery {
  LIST_BOOKMARKS = 'UyNF_BgJ5d5MbtuVukyl7A',
  CREATE_TWEET = 'BTWYQFqX-WbKZOhykzDpRg',
  DELETE_TWEET = 'VaenaVgh5q5ih7kvyVjgtg',
  TWEET_DETAIL = 'bFUhQzgl9zjo-teD0pAQZw',
}

export enum Endpoint {
  LIST_BOOKMARKS = `${BASE_PATH}${EndpointQuery.LIST_BOOKMARKS}/Bookmarks`,
  CREATE_TWEET = `${BASE_PATH}${EndpointQuery.CREATE_TWEET}/CreateTweet`,
  DELETE_TWEET = `${BASE_PATH}${EndpointQuery.DELETE_TWEET}/DeleteTweet`,
  TWEET_DETAIL = `${BASE_PATH}${EndpointQuery.TWEET_DETAIL}/TweetDetail`,
}

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

export enum ActionTypes {
  translate = 'translate',
  summarize = 'summarize',
  question = 'question',
  extend = 'extend',
  webhook = 'webhook',
}

export enum ActionNames {
  translate = 'Translate this tweet',
  summarize = 'Summarize this tweet',
  question = 'Generate some questions',
  extend = 'Extend this tweet',
  webhook = 'Forward to a webhook',
}

export type Action = keyof typeof ActionNames

export interface Workflow {
  id: string
  when: Trigger
  thenList: Action[]
}

export interface ActionContext {
  tweet: Tweet | null
  requestBody: any
  prevResponse: any
}

export type ActionHandler = (context: ActionContext) => Promise<any>
