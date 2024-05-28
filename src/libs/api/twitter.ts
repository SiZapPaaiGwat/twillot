import {
  BookmarksResponse,
  TimelineAddEntriesInstruction,
  TimelineEntry,
  TimelineTimelineItem,
  TimelineTimelineModule,
  TimelineTweet,
  Endpoint,
  EndpointQuery,
  Tweet,
  TweetBase,
  TweetUnion,
  EntityURL,
} from '../../types'
import { getAuthInfo } from '../browser'
import { URL_REG } from '../text'
import fetchWithTimeout, { FetchError } from '../xfetch'

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

export async function deleteBookmark(tweetId: string) {
  return request(Endpoint.DELETE_BOOKMARK, {
    body: JSON.stringify({
      variables: {
        tweet_id: tweetId,
      },
      queryId: EndpointQuery.DELETE_BOOKMARK,
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

export function getTweetDetails(tweetId: string, cursor?: string) {
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
  const json = await getTweetDetails(tweetId)
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
  let originalTweetEntry = instructions.entries[0] as TimelineEntry<
    TimelineTweet,
    TimelineTimelineItem<TimelineTweet>
  > | null
  if (!originalTweetEntry) {
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

export async function getUserTweets(
  userId: string = '2751923820',
  type: string = '',
  count: number = 20,
) {
  const params = {
    variables: {
      userId,
      count,
      includePromotedContent: true,
      withQuickPromoteEligibilityTweetFields: true,
      withVoice: true,
      withV2Timeline: true,
    },
    features: {
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
      tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled:
        true,
      rweb_video_timestamps_enabled: true,
      longform_notetweets_rich_text_read_enabled: true,
      longform_notetweets_inline_media_enabled: true,
      responsive_web_enhance_cards_enabled: false,
    },
    fieldToggles: { withArticlePlainText: false },
  }
  return request(`${Endpoint.USER_TWEETS}?${flatten(params)}`, {
    body: null,
    method: 'GET',
  })
}
