import { BookmarksResponse, Host } from '../../types'
import { getAuthInfo } from '../browser'
import fetchWithTimeout, { FetchError } from '../xfetch'

const basePath = `${Host}/i/api/graphql/`

const features = {
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
  responsive_web_media_download_video_enabled: false,
  responsive_web_graphql_skip_user_profile_image_extensions_enabled: false,
  responsive_web_graphql_timeline_navigation_enabled: true,
  responsive_web_enhance_cards_enabled: false,
}

enum EndpointQuery {
  LIST_BOOKMARKS = 'UyNF_BgJ5d5MbtuVukyl7A',
  CREATE_TWEET = 'BTWYQFqX-WbKZOhykzDpRg',
  DELETE_TWEET = 'VaenaVgh5q5ih7kvyVjgtg',
}

export enum Endpoint {
  LIST_BOOKMARKS = `${basePath}${EndpointQuery.LIST_BOOKMARKS}/Bookmarks`,
  CREATE_TWEET = `${basePath}${EndpointQuery.CREATE_TWEET}/CreateTweet`,
  DELETE_TWEET = `${basePath}${EndpointQuery.DELETE_TWEET}/DeleteTweet`,
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
  return data
}

export async function createTweet(tweetId: string, text: string) {
  const body = `{"variables":{"tweet_text":"${text}","reply":{"in_reply_to_tweet_id":"${tweetId}","exclude_reply_user_ids":[]},"batch_compose":"BatchSubsequent","dark_request":false,"media":{"media_entities":[],"possibly_sensitive":false},"semantic_annotation_ids":[]},"features":{"communities_web_enable_tweet_community_results_fetch":true,"c9s_tweet_anatomy_moderator_badge_enabled":true,"tweetypie_unmention_optimization_enabled":true,"responsive_web_edit_tweet_api_enabled":true,"graphql_is_translatable_rweb_tweet_is_translatable_enabled":true,"view_counts_everywhere_api_enabled":true,"longform_notetweets_consumption_enabled":true,"responsive_web_twitter_article_tweet_consumption_enabled":true,"tweet_awards_web_tipping_enabled":false,"creator_subscriptions_quote_tweet_preview_enabled":false,"longform_notetweets_rich_text_read_enabled":true,"longform_notetweets_inline_media_enabled":true,"articles_preview_enabled":true,"rweb_video_timestamps_enabled":true,"rweb_tipjar_consumption_enabled":true,"responsive_web_graphql_exclude_directive_enabled":true,"verified_phone_label_enabled":false,"freedom_of_speech_not_reach_fetch_enabled":true,"standardized_nudges_misinfo":true,"tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled":true,"responsive_web_graphql_skip_user_profile_image_extensions_enabled":false,"responsive_web_graphql_timeline_navigation_enabled":true,"responsive_web_enhance_cards_enabled":false},"queryId":"${EndpointQuery.CREATE_TWEET}"}`
  const data = await request(Endpoint.CREATE_TWEET, {
    body,
  })
  return data
}

export async function deleteTweet(tweetId: string) {
  const body = {
    variables: {
      tweet_id: tweetId,
      dark_request: false,
    },
    queryId: EndpointQuery.DELETE_TWEET,
  }
  return request(Endpoint.DELETE_TWEET, {
    body: JSON.stringify(body),
  })
}

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
  return `${Endpoint.LIST_BOOKMARKS}?variables=${query}`
}

export async function getBookmarks(cursor?: string, folderId?: string) {
  try {
    const variables = {
      cursor: '',
      count: pageSize,
      includePromotedContent: true,
    }
    if (cursor) {
      variables.cursor = cursor
    }
    const url = `${Endpoint.LIST_BOOKMARKS}?variables=${encodeURIComponent(JSON.stringify(variables))}&features={"graphql_timeline_v2_bookmark_timeline":true,"rweb_tipjar_consumption_enabled":true,"responsive_web_graphql_exclude_directive_enabled":true,"verified_phone_label_enabled":false,"creator_subscriptions_tweet_preview_api_enabled":true,"responsive_web_graphql_timeline_navigation_enabled":true,"responsive_web_graphql_skip_user_profile_image_extensions_enabled":false,"communities_web_enable_tweet_community_results_fetch":true,"c9s_tweet_anatomy_moderator_badge_enabled":true,"articles_preview_enabled":true,"tweetypie_unmention_optimization_enabled":true,"responsive_web_edit_tweet_api_enabled":true,"graphql_is_translatable_rweb_tweet_is_translatable_enabled":true,"view_counts_everywhere_api_enabled":true,"longform_notetweets_consumption_enabled":true,"responsive_web_twitter_article_tweet_consumption_enabled":true,"tweet_awards_web_tipping_enabled":false,"creator_subscriptions_quote_tweet_preview_enabled":false,"freedom_of_speech_not_reach_fetch_enabled":true,"standardized_nudges_misinfo":true,"tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled":true,"rweb_video_timestamps_enabled":true,"longform_notetweets_rich_text_read_enabled":true,"longform_notetweets_inline_media_enabled":true,"responsive_web_enhance_cards_enabled":false}`
    const res = await fetchWithTimeout(url, {
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
