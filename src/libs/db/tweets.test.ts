import { describe, it, expect, afterEach } from 'vitest'
import 'fake-indexeddb/auto'

import {
  addRecords,
  findRecords,
  getRecord,
  countRecords,
  aggregateUsers,
  getTopUsers,
  getTimeline,
  getRencentTweets,
  clearFolder,
  getRandomTweet,
} from './tweets'
import TweetGenerator from '../../../__mocks__/tweet'

describe('dbModule', () => {
  afterEach(async () => {
    indexedDB = new IDBFactory()
  })

  describe('addRecords', () => {
    it('should add records to the database', async () => {
      const tweets = TweetGenerator.generateTweets(5)
      await addRecords(tweets)
      const result = await findRecords()
      expect(result.length).toEqual(tweets.length)
    })
  })

  describe('findRecords', () => {
    it('should find records based on criteria', async () => {
      const tweet = TweetGenerator.generateTweet()
      tweet.full_text = 'Hello World'
      await addRecords([tweet])
      const results = await findRecords('hello')
      expect(results.length).toBe(1)
      expect(results[0].tweet_id).toBe(tweet.tweet_id)
    })
  })

  describe('getRecord', () => {
    it('should get a record by tweet_id', async () => {
      const tweet = TweetGenerator.generateTweet()
      await addRecords([tweet])
      const result = await getRecord(tweet.tweet_id)
      expect(result).toBeDefined()
      expect(result?.tweet_id).toBe(tweet.tweet_id)
    })
  })

  describe('countRecords', () => {
    it('should count the number of records in the database', async () => {
      const tweets = TweetGenerator.generateTweets(3)
      await addRecords(tweets)
      const count = await countRecords()
      expect(count.total).toBe(3)
    })
  })

  describe('aggregateUsers', () => {
    it('should aggregate tweets by user', async () => {
      const tweets = TweetGenerator.generateTweets(5)
      await addRecords(tweets)
      const aggregated = await aggregateUsers()
      const size = Object.keys(aggregated).length
      expect(aggregated).toBeInstanceOf(Object)
      expect(size).toBeGreaterThan(0)
      expect(size).toBeLessThan(6)
    })
  })

  describe('getTopUsers', () => {
    it('should get top users by tweet count', async () => {
      const tweets = TweetGenerator.generateTweets(5)
      await addRecords(tweets)
      const topUsers = await getTopUsers()
      expect(topUsers).toBeInstanceOf(Array)
      expect(topUsers.length).toBeGreaterThan(0)
    })
  })

  describe('getTimeline', () => {
    it('should get a timeline of tweets', async () => {
      const tweets = TweetGenerator.generateTweets(5)
      await addRecords(tweets)
      const timeline = await getTimeline()
      expect(timeline).toBeInstanceOf(Array)
      expect(timeline.length).toBeGreaterThan(0)
    })
  })

  describe('getRecentTweets', () => {
    it('should get recent tweets', async () => {
      const tweets = TweetGenerator.generateTweets(5)
      await addRecords(tweets)
      const recentTweets = await getRencentTweets(Number.MAX_SAFE_INTEGER)
      expect(recentTweets.data).toBeInstanceOf(Array)
      expect(recentTweets.total).toBeGreaterThan(0)
    })
  })

  describe('clearFolder', () => {
    it('should clear tweets in a specified folder', async () => {
      const tweet = TweetGenerator.generateTweet()
      tweet.folder = 'testFolder'
      await addRecords([tweet])
      await clearFolder('testFolder')
      const results = await findRecords('', '', 'testFolder')
      expect(results.length).toBe(0)
    })
  })

  describe('getRandomTweet', () => {
    it('should get a random tweet', async () => {
      const tweets = TweetGenerator.generateTweets(5)
      await addRecords(tweets)
      const randomTweet = await getRandomTweet(2)
      expect(randomTweet).toBeDefined()
      expect(tweets).toContainEqual(randomTweet)
    })
  })
})
