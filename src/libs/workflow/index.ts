import { initSync } from '../../options/handlers'
import { Host } from '../../types/index'
import { Action } from './actions'
import { Trigger } from './triggers'

const BASE_PATH = `${Host}/i/api/graphql/`

export enum EndpointQuery {
  LIST_BOOKMARKS = 'UyNF_BgJ5d5MbtuVukyl7A',
  CREATE_TWEET = 'BTWYQFqX-WbKZOhykzDpRg',
  DELETE_TWEET = 'VaenaVgh5q5ih7kvyVjgtg',
  TWEET_DETAIL = 'bFUhQzgl9zjo-teD0pAQZw',
  DELETE_BOOKMARK = 'Wlmlj2-xzyS1GN3a6cj-mQ',
}

export enum Endpoint {
  LIST_BOOKMARKS = `${BASE_PATH}${EndpointQuery.LIST_BOOKMARKS}/Bookmarks`,
  CREATE_TWEET = `${BASE_PATH}${EndpointQuery.CREATE_TWEET}/CreateTweet`,
  DELETE_TWEET = `${BASE_PATH}${EndpointQuery.DELETE_TWEET}/DeleteTweet`,
  DELETE_BOOKMARK = `${BASE_PATH}${EndpointQuery.DELETE_BOOKMARK}/DeleteBookmark`,
  TWEET_DETAIL = `${BASE_PATH}${EndpointQuery.TWEET_DETAIL}/TweetDetail`,
}

export interface Workflow {
  id: string
  name?: string
  // 系统默认的工作流无法修改
  editable?: boolean
  // 修改后才能保存
  unchanged?: boolean
  when: Trigger
  thenList: Action[]
}

/**
 * @description options only
 */
export function sendWorkflows(workflows: Workflow[]) {
  chrome.runtime.sendMessage({
    type: 'get_workflows',
    data: workflows,
  })
}

export function startTasksLitening() {
  chrome.runtime.onMessage.addListener(async (request) => {
    if (request.type === 'sync_task') {
      await initSync()
    }
  })
}
