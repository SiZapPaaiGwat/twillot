Create Tweet Request

```json
{
  "variables": {
    "tweet_text": "以前叫 Bionic Reading - Focused",
    "reply": {
      "in_reply_to_tweet_id": "1795133837082497085",
      "exclude_reply_user_ids": []
    },
    "batch_compose": "BatchSubsequent",
    "dark_request": false,
    "media": { "media_entities": [], "possibly_sensitive": false },
    "semantic_annotation_ids": []
  },
  "features": {
    "communities_web_enable_tweet_community_results_fetch": true,
    "c9s_tweet_anatomy_moderator_badge_enabled": true,
    "tweetypie_unmention_optimization_enabled": true,
    "responsive_web_edit_tweet_api_enabled": true,
    "graphql_is_translatable_rweb_tweet_is_translatable_enabled": true,
    "view_counts_everywhere_api_enabled": true,
    "longform_notetweets_consumption_enabled": true,
    "responsive_web_twitter_article_tweet_consumption_enabled": true,
    "tweet_awards_web_tipping_enabled": false,
    "creator_subscriptions_quote_tweet_preview_enabled": false,
    "longform_notetweets_rich_text_read_enabled": true,
    "longform_notetweets_inline_media_enabled": true,
    "articles_preview_enabled": true,
    "rweb_video_timestamps_enabled": true,
    "rweb_tipjar_consumption_enabled": true,
    "responsive_web_graphql_exclude_directive_enabled": true,
    "verified_phone_label_enabled": false,
    "freedom_of_speech_not_reach_fetch_enabled": true,
    "standardized_nudges_misinfo": true,
    "tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled": true,
    "responsive_web_graphql_skip_user_profile_image_extensions_enabled": false,
    "responsive_web_graphql_timeline_navigation_enabled": true,
    "responsive_web_enhance_cards_enabled": false
  },
  "queryId": "31-6kYrWwW7ZqHmLu2mm9w"
}
```

```json
{
  "data": {
    "create_tweet": {
      "tweet_results": {
        "result": {
          "rest_id": "1795134444975673779",
          "core": {
            "user_results": {
              "result": {
                "__typename": "User",
                "id": "VXNlcjoyNzUxOTIzODIw",
                "rest_id": "2751923820",
                "affiliates_highlighted_label": {},
                "has_graduated_access": true,
                "is_blue_verified": true,
                "profile_image_shape": "Circle",
                "legacy": {
                  "can_dm": true,
                  "can_media_tag": true,
                  "created_at": "Thu Aug 21 11:41:20 +0000 2014",
                  "default_profile": false,
                  "default_profile_image": false,
                  "description": "\uD83D\uDD16 Twillot: searching twitter bookmarks https://t.co/8N09FfZyKY\n\uD83D\uDCB5 Millionaire Calculator: https://t.co/cD4zMnl2Sn",
                  "entities": {
                    "description": {
                      "urls": [
                        {
                          "display_url": "dub.sh/7ubLVdF",
                          "expanded_url": "https://dub.sh/7ubLVdF",
                          "url": "https://t.co/8N09FfZyKY",
                          "indices": [39, 62]
                        },
                        {
                          "display_url": "millionairecalculator.org",
                          "expanded_url": "https://millionairecalculator.org",
                          "url": "https://t.co/cD4zMnl2Sn",
                          "indices": [89, 112]
                        }
                      ]
                    },
                    "url": {
                      "urls": [
                        {
                          "display_url": "twillot.com",
                          "expanded_url": "https://twillot.com/",
                          "url": "https://t.co/4jBXyW6cep",
                          "indices": [0, 23]
                        }
                      ]
                    }
                  },
                  "fast_followers_count": 0,
                  "favourites_count": 967,
                  "followers_count": 385,
                  "friends_count": 2084,
                  "has_custom_timelines": true,
                  "is_translator": false,
                  "listed_count": 17,
                  "location": "",
                  "media_count": 54,
                  "name": "饭特稀",
                  "needs_phone_verification": false,
                  "normal_followers_count": 385,
                  "pinned_tweet_ids_str": ["1777325561947549814"],
                  "possibly_sensitive": false,
                  "profile_image_url_https": "https://pbs.twimg.com/profile_images/1789982655100194816/eznb-5Di_normal.png",
                  "profile_interstitial_type": "",
                  "screen_name": "SiZapPaaiGwat",
                  "statuses_count": 1453,
                  "translator_type": "none",
                  "url": "https://t.co/4jBXyW6cep",
                  "verified": false,
                  "want_retweets": false,
                  "withheld_in_countries": []
                },
                "tipjar_settings": {}
              }
            }
          },
          "unmention_data": {},
          "edit_control": {
            "edit_tweet_ids": ["1795134444975673779"],
            "editable_until_msecs": "1716831978000",
            "is_edit_eligible": false,
            "edits_remaining": "5"
          },
          "is_translatable": false,
          "views": {
            "state": "Enabled"
          },
          "source": "<a href=\"https://mobile.twitter.com\" rel=\"nofollow\">Twitter Web App</a>",
          "legacy": {
            "bookmark_count": 0,
            "bookmarked": false,
            "created_at": "Mon May 27 16:46:18 +0000 2024",
            "conversation_id_str": "1795125276143165444",
            "display_text_range": [0, 28],
            "entities": {
              "hashtags": [],
              "symbols": [],
              "timestamps": [],
              "urls": [],
              "user_mentions": []
            },
            "favorite_count": 0,
            "favorited": false,
            "full_text": "以前叫 Bionic Reading - Focused",
            "in_reply_to_screen_name": "SiZapPaaiGwat",
            "in_reply_to_status_id_str": "1795133837082497085",
            "in_reply_to_user_id_str": "2751923820",
            "is_quote_status": false,
            "lang": "zh",
            "quote_count": 0,
            "reply_count": 0,
            "retweet_count": 0,
            "retweeted": false,
            "user_id_str": "2751923820",
            "id_str": "1795134444975673779"
          },
          "unmention_info": {}
        }
      }
    }
  }
}
```
