import { createMemo, Show } from 'solid-js'

import dataStore, { isFilterVisible } from '../options/store'
import { IconBookmark, IconFolders, IconTrash } from './Icons'
import { allCategories } from '../constants'

export default function Filter() {
  const [store, setStore] = dataStore
  const category = createMemo(
    () => allCategories.find((c) => c.value === store.category)?.name,
  )
  const clsName =
    'me-2 inline-flex items-center justify-center gap-1 rounded border border-blue-400 bg-blue-100 px-2.5 py-0.5 text-sm font-medium text-blue-800 hover:bg-blue-200 dark:bg-gray-700 dark:text-blue-400'

  return (
    <Show when={isFilterVisible()}>
      <div class="flex items-center gap-2">
        <h3 class="text-lg font-medium">Filter:</h3>
        <Show when={category()}>
          <button onClick={() => setStore('category', '')} class={clsName}>
            <IconBookmark cls="h-4 w-4" />
            {category()}
          </button>
        </Show>
        <Show when={store.folder}>
          <button onClick={() => setStore('folder', '')} class={clsName}>
            <IconFolders cls="h-4 w-4" />
            {store.folder}
          </button>
        </Show>
        <Show when={store.keyword}>
          <button onClick={() => setStore('keyword', '')} class={clsName}>
            {store.keyword}
          </button>
        </Show>
        <button
          onClick={() =>
            setStore({
              category: '',
              folder: '',
              keyword: '',
            })
          }
        >
          <IconTrash />
        </button>
      </div>
    </Show>
  )
}
