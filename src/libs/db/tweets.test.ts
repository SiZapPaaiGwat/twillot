import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import 'fake-indexeddb/auto'
import {
  addRecords,
  findRecords,
  getRecord,
  countRecords,
  toRecord,
  getTweetId,
  aggregateUsers,
  getTopUsers,
  getTimeline,
  getRencentTweets,
  clearFolder,
  getRandomTweet,
} from './tweets'
import { openDb, getObjectStore } from './index'
import { Tweet, User, TweetWithPosition } from '../../types'

describe('dbModule', () => {
  afterEach(async () => {
    indexedDB = new IDBFactory()
  })

  describe('addRecords', () => {
    it('should add records to the database', async () => {
      const tweets: Tweet[] = [
        {
          tweet_id: '1',
          full_text: 'Hello World',
          created_at: 123456,
          screen_name: 'user1',
          sort_index: '1',
          has_image: false,
          has_video: false,
          has_gif: false,
          has_link: false,
          has_quote: false,
          is_long_text: false,
          folder: '',
          user_id: '1',
          username: 'User1',
          avatar_url: '',
          possibly_sensitive: false,
          lang: 'en',
          media_items: [],
        },
      ]
      await addRecords(tweets)

      const result = await getRecord('1')
      expect(result).toEqual(tweets[0])
    })
  })

  describe('findRecords', () => {
    it('should find records based on criteria', async () => {
      const tweets: Tweet[] = [
        {
          tweet_id: '1',
          full_text: 'Hello World',
          created_at: 123456,
          screen_name: 'user1',
          sort_index: '1',
          has_image: false,
          has_video: false,
          has_gif: false,
          has_link: false,
          has_quote: false,
          is_long_text: false,
          folder: '',
          user_id: '1',
          username: 'User1',
          avatar_url: '',
          possibly_sensitive: false,
          lang: 'en',
          media_items: [],
        },
        {
          tweet_id: '2',
          full_text: 'Another tweet',
          created_at: 123457,
          screen_name: 'user2',
          sort_index: '2',
          has_image: false,
          has_video: false,
          has_gif: false,
          has_link: false,
          has_quote: false,
          is_long_text: false,
          folder: '',
          user_id: '2',
          username: 'User2',
          avatar_url: '',
          possibly_sensitive: false,
          lang: 'en',
          media_items: [],
        },
      ]
      await addRecords(tweets)

      const results = await findRecords('Hello')
      expect(results.length).toBe(1)
      expect(results[0].tweet_id).toBe('1')
    })
  })

  describe('getRecord', () => {
    it('should get a record by id', async () => {
      const tweet: Tweet = {
        tweet_id: '1',
        full_text: 'Test Tweet',
        created_at: 123456,
        screen_name: 'user1',
        sort_index: '1',
        has_image: false,
        has_video: false,
        has_gif: false,
        has_link: false,
        has_quote: false,
        is_long_text: false,
        folder: '',
        user_id: '1',
        username: 'User1',
        avatar_url: '',
        possibly_sensitive: false,
        lang: 'en',
        media_items: [],
      }
      await addRecords([tweet])

      const result = await getRecord('1')
      expect(result).toEqual(tweet)
    })
  })

  describe('countRecords', () => {
    it('should count records correctly', async () => {
      const tweets: Tweet[] = [
        {
          tweet_id: '1',
          full_text: 'Hello World',
          created_at: 123456,
          screen_name: 'user1',
          sort_index: '1',
          has_image: true,
          has_video: false,
          has_gif: false,
          has_link: false,
          has_quote: false,
          is_long_text: false,
          folder: '',
          user_id: '1',
          username: 'User1',
          avatar_url: '',
          possibly_sensitive: false,
          lang: 'en',
          media_items: [],
        },
        {
          tweet_id: '2',
          full_text: 'Another tweet',
          created_at: 123457,
          screen_name: 'user2',
          sort_index: '2',
          has_image: false,
          has_video: true,
          has_gif: false,
          has_link: false,
          has_quote: false,
          is_long_text: false,
          folder: '',
          user_id: '2',
          username: 'User2',
          avatar_url: '',
          possibly_sensitive: false,
          lang: 'en',
          media_items: [],
        },
      ]
      await addRecords(tweets)

      const counts = await countRecords()
      expect(counts.total).toBe(2)
      expect(counts.image).toBe(1)
      expect(counts.video).toBe(1)
    })
  })

  describe('clearFolder', () => {
    it('should clear folder correctly', async () => {
      const tweets: Tweet[] = [
        {
          tweet_id: '1',
          full_text: 'Hello World',
          created_at: 123456,
          screen_name: 'user1',
          sort_index: '1',
          has_image: false,
          has_video: false,
          has_gif: false,
          has_link: false,
          has_quote: false,
          is_long_text: false,
          folder: 'test',
          user_id: '1',
          username: 'User1',
          avatar_url: '',
          possibly_sensitive: false,
          lang: 'en',
          media_items: [],
        },
      ]
      await addRecords(tweets)
      await clearFolder('test')
      const item = await getRecord('1')
      expect(item.folder).toBe('')
    })
  })

  describe('getTopUsers', () => {
    it('should get top users correctly', async () => {
      const tweets: Tweet[] = [
        {
          tweet_id: '1',
          full_text: 'Hello World',
          created_at: 123456,
          screen_name: 'user1',
          sort_index: '1',
          has_image: false,
          has_video: false,
          has_gif: false,
          has_link: false,
          has_quote: false,
          is_long_text: false,
          folder: '',
          user_id: '1',
          username: 'User1',
          avatar_url: '',
          possibly_sensitive: false,
          lang: 'en',
          media_items: [],
        },
        {
          tweet_id: '2',
          full_text: 'Another tweet',
          created_at: 123457,
          screen_name: 'user1',
          sort_index: '2',
          has_image: false,
          has_video: false,
          has_gif: false,
          has_link: false,
          has_quote: false,
          is_long_text: false,
          folder: '',
          user_id: '1',
          username: 'User1',
          avatar_url: '',
          possibly_sensitive: false,
          lang: 'en',
          media_items: [],
        },
        {
          tweet_id: '3',
          full_text: 'Third tweet',
          created_at: 123458,
          screen_name: 'user2',
          sort_index: '3',
          has_image: false,
          has_video: false,
          has_gif: false,
          has_link: false,
          has_quote: false,
          is_long_text: false,
          folder: '',
          user_id: '2',
          username: 'User2',
          avatar_url: '',
          possibly_sensitive: false,
          lang: 'en',
          media_items: [],
        },
      ]
      await addRecords(tweets)

      const topUsers = await getTopUsers(1)
      expect(topUsers.length).toBe(1)
      expect(topUsers[0].screen_name).toBe('user1')
    })
  })

  describe('getTimeline', () => {
    it('should get timeline correctly', async () => {
      const tweets: Tweet[] = [
        {
          tweet_id: '1',
          full_text: 'Hello World',
          created_at: 123456,
          screen_name: 'user1',
          sort_index: '1',
          has_image: false,
          has_video: false,
          has_gif: false,
          has_link: false,
          has_quote: false,
          is_long_text: false,
          folder: '',
          user_id: '1',
          username: 'User1',
          avatar_url: '',
          possibly_sensitive: false,
          lang: 'en',
          media_items: [],
        },
        {
          tweet_id: '2',
          full_text: 'Another tweet',
          created_at: 123457,
          screen_name: 'user1',
          sort_index: '2',
          has_image: false,
          has_video: false,
          has_gif: false,
          has_link: false,
          has_quote: false,
          is_long_text: false,
          folder: '',
          user_id: '1',
          username: 'User1',
          avatar_url: '',
          possibly_sensitive: false,
          lang: 'en',
          media_items: [],
        },
      ]
      await addRecords(tweets)

      const timeline = await getTimeline()
      expect(timeline.length).toBeGreaterThan(0)
      expect(timeline[0]).toHaveProperty('tweet')
      expect(timeline[0]).toHaveProperty('position')
    })
  })

  describe('getRencentTweets', () => {
    it('should get recent tweets correctly', async () => {
      const now = Math.floor(Date.now() / 1000)
      const tweets: Tweet[] = [
        {
          tweet_id: '1',
          full_text: 'Hello World',
          created_at: now,
          screen_name: 'user1',
          sort_index: '1',
          has_image: false,
          has_video: false,
          has_gif: false,
          has_link: false,
          has_quote: false,
          is_long_text: false,
          folder: '',
          user_id: '1',
          username: 'User1',
          avatar_url: '',
          possibly_sensitive: false,
          lang: 'en',
          media_items: [],
        },
        {
          tweet_id: '2',
          full_text: 'Another tweet',
          created_at: now - 60 * 60 * 24,
          screen_name: 'user1',
          sort_index: '2',
          has_image: false,
          has_video: false,
          has_gif: false,
          has_link: false,
          has_quote: false,
          is_long_text: false,
          folder: '',
          user_id: '1',
          username: 'User1',
          avatar_url: '',
          possibly_sensitive: false,
          lang: 'en',
          media_items: [],
        },
      ]
      await addRecords(tweets)

      const recentTweets = await getRencentTweets(2)
      expect(recentTweets.total).toBe(2)
      expect(recentTweets.data.length).toBe(2)
    })
  })

  describe('getRandomTweet', () => {
    it('should get a random tweet correctly', async () => {
      const tweets: Tweet[] = [
        {
          tweet_id: '1',
          full_text: 'Hello World',
          created_at: 123456,
          screen_name: 'user1',
          sort_index: '1',
          has_image: false,
          has_video: false,
          has_gif: false,
          has_link: false,
          has_quote: false,
          is_long_text: false,
          folder: '',
          user_id: '1',
          username: 'User1',
          avatar_url: '',
          possibly_sensitive: false,
          lang: 'en',
          media_items: [],
        },
        {
          tweet_id: '2',
          full_text: 'Another tweet',
          created_at: 123457,
          screen_name: 'user2',
          sort_index: '2',
          has_image: false,
          has_video: false,
          has_gif: false,
          has_link: false,
          has_quote: false,
          is_long_text: false,
          folder: '',
          user_id: '2',
          username: 'User2',
          avatar_url: '',
          possibly_sensitive: false,
          lang: 'en',
          media_items: [],
        },
      ]
      await addRecords(tweets)

      const randomTweet = await getRandomTweet(1)
      expect(randomTweet).toBeDefined()
    })
  })
})
