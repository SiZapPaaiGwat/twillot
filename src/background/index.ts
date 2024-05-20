import { createTweet } from '../libs/api-twitter'
import {
  authTwitter,
  openOptionsPageWhenIconClicked,
  onBookmarkCreated,
} from '../libs/browser'

openOptionsPageWhenIconClicked()
authTwitter()

onBookmarkCreated(
  // TODO 抓取推文内容以及主题，使用 AI 对其进行翻译和总结
  async (tweet_id: string) =>
    await createTweet(tweet_id, new Date().toLocaleString()),
)
