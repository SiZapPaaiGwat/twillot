import { OptionName, Tweet } from '../types'
import dataStore, { mutateStore } from '../options/store'
import { addRecords, clearFolder, countRecords } from '../libs/db/tweets'
import { reconcile, unwrap } from 'solid-js/store'
import { readConfig, upsertConfig } from '../libs/db/configs'

export async function initFolders() {
  const [_, setStore] = dataStore
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
  const [store, setStore] = dataStore
  const folders = store.folders.filter((f) => f.name !== folder)
  await upsertConfig({
    option_name: OptionName.FOLDER,
    option_value: folders,
  })
  await clearFolder(folder)
  setStore(
    'tweets',
    reconcile(
      store.tweets.map((t) => ({
        ...t,
        folder: t.folder === folder ? '' : t.folder,
      })),
    ),
  )
  setStore('folders', [...folders])
}

export async function moveToFolder(folder: string, tweet: Tweet) {
  const [store, _] = dataStore
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
