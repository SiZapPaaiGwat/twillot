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

export enum ActionNames {
  UnrollThread = 'Unroll this thread',
  DeleteBookmark = 'Delete from local',
  AutoComment = 'Auto comment with a templated message',
}

export type Action = keyof typeof ActionNames

export interface ActionContext {
  triggerName: Trigger
  requestBody: any
  prevResponse: any
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
