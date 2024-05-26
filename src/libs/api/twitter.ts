import {
  BookmarksResponse,
  TimelineAddEntriesInstruction,
  TimelineEntry,
  TimelineTimelineModule,
  TimelineTweet,
} from '../../types'
import { Endpoint, EndpointQuery } from '../workflow/workflow'
import { getAuthInfo } from '../browser'
import fetchWithTimeout, { FetchError } from '../xfetch'
import { toRecord } from '../db/tweets'

const pageSize = 100

const COMMON_FEATURES = {
  creator_subscriptions_tweet_preview_api_enabled: true,
  c9s_tweet_anatomy_moderator_badge_enabled: true,
  tweetypie_unmention_optimization_enabled: true,
  responsive_web_edit_tweet_api_enabled: true,
  graphql_is_translatable_rweb_tweet_is_translatable_enabled: true,
  view_counts_everywhere_api_enabled: true,
  longform_notetweets_consumption_enabled: true,
  responsive_web_twitter_article_tweet_consumption_enabled: true,
  tweet_awards_web_tipping_enabled: false,
  longform_notetweets_rich_text_read_enabled: true,
  longform_notetweets_inline_media_enabled: true,
  rweb_video_timestamps_enabled: true,
  responsive_web_graphql_exclude_directive_enabled: true,
  verified_phone_label_enabled: false,
  freedom_of_speech_not_reach_fetch_enabled: true,
  standardized_nudges_misinfo: true,
  tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled: true,
  responsive_web_graphql_skip_user_profile_image_extensions_enabled: false,
  responsive_web_graphql_timeline_navigation_enabled: true,
  responsive_web_enhance_cards_enabled: false,
}
const FEATURES = {
  ...COMMON_FEATURES,
  responsive_web_media_download_video_enabled: false,
}
const BOOKMARK_FEATURES = {
  ...COMMON_FEATURES,
  graphql_timeline_v2_bookmark_timeline: true,
  rweb_tipjar_consumption_enabled: true,
  communities_web_enable_tweet_community_results_fetch: true,
  articles_preview_enabled: true,
  creator_subscriptions_quote_tweet_preview_enabled: false,
}
const TWEET_DETAIL_FEATURES = {
  rweb_tipjar_consumption_enabled: true,
  responsive_web_graphql_exclude_directive_enabled: true,
  verified_phone_label_enabled: false,
  creator_subscriptions_tweet_preview_api_enabled: true,
  responsive_web_graphql_timeline_navigation_enabled: true,
  responsive_web_graphql_skip_user_profile_image_extensions_enabled: false,
  communities_web_enable_tweet_community_results_fetch: true,
  c9s_tweet_anatomy_moderator_badge_enabled: true,
  articles_preview_enabled: true,
  tweetypie_unmention_optimization_enabled: true,
  responsive_web_edit_tweet_api_enabled: true,
  graphql_is_translatable_rweb_tweet_is_translatable_enabled: true,
  view_counts_everywhere_api_enabled: true,
  longform_notetweets_consumption_enabled: true,
  responsive_web_twitter_article_tweet_consumption_enabled: true,
  tweet_awards_web_tipping_enabled: false,
  creator_subscriptions_quote_tweet_preview_enabled: false,
  freedom_of_speech_not_reach_fetch_enabled: true,
  standardized_nudges_misinfo: true,
  tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled: true,
  rweb_video_timestamps_enabled: true,
  longform_notetweets_rich_text_read_enabled: true,
  longform_notetweets_inline_media_enabled: true,
  responsive_web_enhance_cards_enabled: false,
}

function flatten(obj: {}) {
  return Object.keys(obj)
    .map((key) => `${key}=${encodeURIComponent(JSON.stringify(obj[key]))}`)
    .join('&')
}

function get_headers(token: string, csrf: string) {
  return {
    Authorization: token,
    'X-Csrf-Token': csrf,
    'Content-Type': 'application/json',
    'X-Twitter-Active-User': 'yes',
    'X-Twitter-Auth-Type': 'OAuth2Session',
    'X-Twitter-Client-Language': 'en-us',
  }
}

async function request(url: string, options: RequestInit) {
  const { token, csrf } = await getAuthInfo()
  const res = await fetchWithTimeout(url, {
    method: 'POST',
    ...options,
    headers: {
      ...options.headers,
      ...get_headers(token, csrf),
    },
  })
  const data = await res.json()
  if ('errors' in data) {
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

  return data
}

export async function createTweet({ text = '', replyTweetId = '' }) {
  if (!text) {
    throw new Error('Text is required')
  }

  const variables = {
    tweet_text: text,
    dark_request: false,
    media: {
      media_entities: [],
      possibly_sensitive: false,
    },
    semantic_annotation_ids: [],
  }
  if (replyTweetId) {
    variables['reply'] = {
      in_reply_to_tweet_id: replyTweetId,
      exclude_reply_user_ids: [],
    }
  }
  return request(Endpoint.CREATE_TWEET, {
    body: JSON.stringify({
      queryId: EndpointQuery.CREATE_TWEET,
      variables,
      features: FEATURES,
    }),
  })
}

export async function deleteTweet(tweetId: string) {
  return request(Endpoint.DELETE_TWEET, {
    body: JSON.stringify({
      variables: {
        tweet_id: tweetId,
        dark_request: false,
      },
      queryId: EndpointQuery.DELETE_TWEET,
    }),
  })
}

export async function getBookmarks(cursor?: string) {
  try {
    const variables = {
      cursor: '',
      count: pageSize,
      includePromotedContent: true,
    }
    if (cursor) {
      variables.cursor = cursor
    }
    const query = flatten({
      variables,
      features: BOOKMARK_FEATURES,
    })
    const json = (await request(`${Endpoint.LIST_BOOKMARKS}?${query}`, {
      body: null,
      method: 'GET',
    })) as BookmarksResponse

    return json
  } catch (e) {
    if (e.name !== FetchError.TimeoutError && e.name !== FetchError.DataError) {
      e.name = FetchError.IdentityError
    }

    throw e
  }
}

export function getTweet(tweetId: string, cursor?: string) {
  const variables = {
    focalTweetId: tweetId,
    with_rux_injections: false,
    includePromotedContent: true,
    withCommunity: true,
    withQuickPromoteEligibilityTweetFields: true,
    withBirdwatchNotes: true,
    withVoice: true,
    withV2Timeline: true,
    cursor: '',
  }
  if (cursor) {
    variables.cursor = cursor
  }

  const params = {
    variables: variables,
    features: TWEET_DETAIL_FEATURES,
    fieldToggles: {
      withArticleRichContentState: true,
      withArticlePlainText: false,
      withGrokAnalyze: false,
    },
  }
  return request(`${Endpoint.TWEET_DETAIL}?${flatten(params)}`, {
    method: 'GET',
    body: null,
  })
}

/**
 * 获取推文主题
 * sortIndex 依赖与书签同步接口
 */
export async function getTweetConversations(tweetId: string) {
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
    conversations.push(toRecord(i.item.itemContent, ''))
  }

  return conversations
}
