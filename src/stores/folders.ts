import { OptionName, Tweet } from '../types'
import dataStore, { mutateStore } from '../options/store'
import { addRecords, clearFolder, countRecords } from '../libs/db/tweets'
import { unwrap } from 'solid-js/store'
import { readConfig, upsertConfig } from '../libs/db/configs'

const [store, setStore] = dataStore

export async function initFolders() {
  const config = await readConfig(OptionName.FOLDER)
  if (!config || !config.option_value) {
    return
  }

  const folders = (config.option_value as string[]).map((f: string) => ({
    name: f,
    count: 0,
  }))
  if (folders.length < 1) {
    return
  }

  for (const folder of folders) {
    folder.count = (await countRecords('folder', folder.name)).total
  }
  setStore('folders', folders)
}

export async function removeFolder(folder: string) {
  const index = store.folders.findIndex((f) => f.name === folder)
  if (index === -1) {
    return
  }
  const folders = store.folders.filter((f) => f.name !== folder)
  await upsertConfig({
    option_name: OptionName.FOLDER,
    option_value: folders.map((f) => f.name),
  })
  await clearFolder(folder)
  mutateStore((state) => {
    state.tweets.forEach((t) => {
      if (t.folder === folder) {
        t.folder = ''
      }
    })
    state.folders.splice(index, 1)
  })
}

export async function moveTweetToFolder(folder: string, tweet: Tweet) {
  const index = store.tweets.findIndex((t) => t.tweet_id === tweet.tweet_id)
  const folderIndex = store.folders.findIndex((f) => f.name === folder)
  const oldFolderIndex = tweet.folder
    ? store.folders.findIndex((f) => f.name === tweet.folder)
    : -1
  await addRecords([{ ...unwrap(tweet), folder }], true)
  mutateStore((state) => {
    state.tweets[index].folder = folder
    state.folders[folderIndex].count += 1
    if (oldFolderIndex > -1) {
      state.folders[oldFolderIndex].count -= 1
    }
  })
}

/**
 * 仅移动没有分类的 tweets 到指定文件夹
 */
export const moveTweetsToFolder = async (folder: string) => {
  try {
    const index = store.folders.findIndex((f) => f.name === folder)
    if (index === -1) {
      return
    }
    let tweets = unwrap(store.tweets)
      .filter((x) => !x.folder)
      .map((tweet) => ({
        ...tweet,
        folder,
      }))
    await addRecords(tweets, true)
    mutateStore((state) => {
      state.tweets.forEach((t) => {
        if (!t.folder) {
          t.folder = folder
        }
      })
      state.folders[index].count += tweets.length
    })
    alert(`${tweets.length} tweets has been moved to folder ${folder}`)
  } catch (error) {
    console.error(error)
  }
}

export const addFolder = async (folderName: string) => {
  if (
    folderName &&
    store.folders.some((f) => f.name === folderName) === false
  ) {
    await upsertConfig({
      option_name: OptionName.FOLDER,
      option_value: store.folders.map((f) => f.name).concat(folderName),
    })
    mutateStore((state) => {
      state.folders.push({ name: folderName, count: 0 })
    })
  }
}
