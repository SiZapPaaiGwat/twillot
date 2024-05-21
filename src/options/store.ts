import { createStore } from 'solid-js/store'

import {
  type FontSet,
  type Tweet,
  type TweetWithPosition,
  type User,
  type CountInfo,
} from '../types'
import { DAYS } from '../libs/date'

const activeFont = JSON.parse(
  localStorage.getItem('activeFont') || 'null',
) as FontSet | null
const fontSize = parseInt(localStorage.getItem('fontSize') || '16', 10)

const store = createStore({
  keyword: '',
  category: '',
  folder: '',
  pageSize: 100,
  hasMore: true,
  totalCount: null as null | CountInfo,
  tweets: new Array<Tweet>(),
  selectedTweet: -1,
  topUsers: new Array<User>(),
  folders: new Array<string>(),
  folderInfo: new Map<string, number>(),
  history: new Array<{ date: string; count: number }>(DAYS).fill({
    date: '',
    count: 0,
  }),
  historySize: 0,
  searchTime: 0,
  isAuthenicating: false,
  isAuthFailed: false,
  isAutoSyncing: false,
  isForceSyncing: false,
  isForceSyncTimedout: false,
  memApiKey: '',
  timeline: new Array<TweetWithPosition>(),
  activeFont,
  fontSize,
  theme: localStorage.getItem('theme') || 'light',
  isSidePanel: location.pathname.endsWith('sidepanel.html'),
})

const [state, _] = store

export const isFilterVisible = () =>
  state.category || state.folder || state.keyword

export default store
