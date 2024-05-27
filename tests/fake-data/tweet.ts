import {
  build,
  sequence,
  oneOf,
  bool,
  perBuild,
} from '@jackfranklin/test-data-bot'
import { faker } from '@faker-js/faker'

import { Tweet, TweetQuoted } from '../../src/types'

const locales = ['en', 'ja', 'zh-cn']
const fields = {
  tweet_id: sequence((s) => `tweet_id_${s}`),
  user_id: sequence((s) => `user_id_${s}`),
  username: perBuild(() => faker.person.fullName()),
  screen_name: perBuild(() => faker.person.fullName()),
  avatar_url: perBuild(() => faker.image.avatar()),
  full_text: perBuild(() => faker.lorem.sentence()),
  lang: perBuild(() => faker.helpers.arrayElement(locales)),
  created_at: perBuild(() => faker.date.past().getTime()),
  possibly_sensitive: bool(),
  media_items: [],
  title: perBuild(() => faker.lorem.sentence()),
  note: perBuild(() => faker.lorem.sentences()),
  tags: perBuild(() => {
    const count = faker.number.int({ min: 0, max: 5 })
    return Array.from({ length: count }, faker.lorem.word)
  }),
  sort_index: perBuild(() => faker.string.uuid()),
  has_image: bool(),
  has_video: bool(),
  has_gif: bool(),
  has_link: bool(),
  has_quote: bool(),
  is_long_text: bool(),
  quoted_tweet: perBuild(() =>
    faker.datatype.boolean() ? tweetQuotedBuilder.one() : undefined,
  ),
  folder: perBuild(() => faker.lorem.word()),
  conversations: [],
}

const tweetQuotedBuilder = build<TweetQuoted>('TweetQuoted', {
  fields: {
    tweet_id: sequence((s) => `tweet_id_${s}`),
    user_id: sequence((s) => `user_id_${s}`),
    username: perBuild(() => faker.person.fullName()),
    screen_name: perBuild(() => faker.person.fullName()),
    avatar_url: perBuild(() => faker.image.avatar()),
    full_text: perBuild(() => faker.lorem.sentence()),
    lang: perBuild(() => faker.helpers.arrayElement(locales)),
    created_at: perBuild(() => faker.date.past().getTime()),
    possibly_sensitive: bool(),
    media_items: [],
  },
})

const tweetBuilder = build<Tweet>('Tweet', {
  fields,
})

const tweetWithConversationsBuilder = build<Tweet>('TweetWithConversations', {
  fields: {
    ...fields,
    conversations: perBuild(() => {
      const count = faker.number.int({ min: 0, max: 3 })
      return count > 0
        ? Array.from({ length: count }, () => tweetBuilder.one())
        : []
    }),
  },
})

class TweetGenerator {
  static generateTweet(): Tweet {
    return tweetWithConversationsBuilder.one()
  }

  static generateTweets(count: number): Tweet[] {
    return tweetWithConversationsBuilder.many(count)
  }
}

// Usage example
// console.log(TweetGenerator.generateTweet())
// console.log(TweetGenerator.generateTweets(5))

export default TweetGenerator
