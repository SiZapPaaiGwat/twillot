import { Host } from '../types'
import { getAuthInfo, proxyRequest } from './browser'

export enum EndpointQuery {
  LIST_BOOKMARKS = 'UyNF_BgJ5d5MbtuVukyl7A',
  CREATE_TWEET = 'BTWYQFqX-WbKZOhykzDpRg',
}

export enum Endpoint {
  LIST_BOOKMARKS = `${Host}/i/api/graphql/${EndpointQuery.LIST_BOOKMARKS}/Bookmarks`,
  CREATE_TWEET = `${Host}/i/api/graphql/${EndpointQuery.CREATE_TWEET}/CreateTweet`,
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

export async function createTweet(tweetId: string, text: string) {
  const { token, csrf } = await getAuthInfo()
  const body = `{"variables":{"tweet_text":"${text}","reply":{"in_reply_to_tweet_id":"${tweetId}","exclude_reply_user_ids":[]},"batch_compose":"BatchSubsequent","dark_request":false,"media":{"media_entities":[],"possibly_sensitive":false},"semantic_annotation_ids":[]},"features":{"communities_web_enable_tweet_community_results_fetch":true,"c9s_tweet_anatomy_moderator_badge_enabled":true,"tweetypie_unmention_optimization_enabled":true,"responsive_web_edit_tweet_api_enabled":true,"graphql_is_translatable_rweb_tweet_is_translatable_enabled":true,"view_counts_everywhere_api_enabled":true,"longform_notetweets_consumption_enabled":true,"responsive_web_twitter_article_tweet_consumption_enabled":true,"tweet_awards_web_tipping_enabled":false,"creator_subscriptions_quote_tweet_preview_enabled":false,"longform_notetweets_rich_text_read_enabled":true,"longform_notetweets_inline_media_enabled":true,"articles_preview_enabled":true,"rweb_video_timestamps_enabled":true,"rweb_tipjar_consumption_enabled":true,"responsive_web_graphql_exclude_directive_enabled":true,"verified_phone_label_enabled":false,"freedom_of_speech_not_reach_fetch_enabled":true,"standardized_nudges_misinfo":true,"tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled":true,"responsive_web_graphql_skip_user_profile_image_extensions_enabled":false,"responsive_web_graphql_timeline_navigation_enabled":true,"responsive_web_enhance_cards_enabled":false},"queryId":"${EndpointQuery.CREATE_TWEET}"}`
  return proxyRequest(
    'POST',
    Endpoint.CREATE_TWEET,
    get_headers(token, csrf),
    body,
  )
}
