import { Endpoint } from '../../types'

/**
 * NOTE: 注意顺序可能影响单元测试
 */
export enum TriggerNames {
  CreateBookmark = 'Create a bookmark',
  DeleteBookmark = 'Delete a bookmark',
  CreateTweet = 'Create a tweet',
  // CreateNoteTweet = 'Create a note tweet',
  // CreateScheduledTweet = 'Create a scheduled tweet',
  // ReplyTweet = 'Reply to a tweet',
  // FavoriteTweet = 'Favorite a tweet',
}

export enum TiggerUrls {
  CreateBookmark = Endpoint.CREATE_BOOKMARK,
  DeleteBookmark = Endpoint.DELETE_BOOKMARK,
  CreateTweet = Endpoint.CREATE_TWEET,
  // CreateNoteTweet = 'Create a note tweet',
  // CreateScheduledTweet = 'Create a scheduled tweet',
  // ReplyTweet = 'Reply to a tweet',
  // FavoriteTweet = 'Favorite a tweet',
}

export type Trigger = keyof typeof TriggerNames

export enum ActionNames {
  UnrollThread = 'Unroll this thread',
  DeleteBookmark = 'Delete from local',
  AutoComment = 'Auto comment with a templated message',
}

export type Action = keyof typeof ActionNames

export interface TriggerReponsePayload {
  trigger: Trigger
  request: { method: string; url: string; body: any }
  response: { status: number; statusText: string; body: any }
}

export interface ActionContext extends TriggerReponsePayload {
  prevActionResponse: any
}

export type ActionHandler = (context: ActionContext) => Promise<any>

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

export interface Task {
  id: string
  name: Action
  tweetId?: string
}

export interface Message {
  type: MessageType
  payload: any
}

export enum MessageType {
  GetWorkflows = 'get_workflows',
  GetTriggerResponse = 'get_trigger_response',
  SyncTasks = 'sync_tasks',
}
