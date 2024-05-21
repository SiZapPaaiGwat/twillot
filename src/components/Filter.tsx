import { Show } from 'solid-js'

import dataStore, { isFilterVisible } from '../options/store'
import { IconTrash } from './Icons'

export default function Filter() {
  const [store, setStore] = dataStore

  return (
    <Show when={isFilterVisible()}>
      <div class="flex items-center gap-2">
        <span class="font-medium">Filter:</span>
        <Show when={store.category}>
          <button
            onClick={() => setStore('category', '')}
            class="me-2 inline-flex items-center justify-center rounded border border-blue-400 bg-blue-100 px-2.5 py-0.5 text-sm font-medium text-blue-800 hover:bg-blue-200 dark:bg-gray-700 dark:text-blue-400"
          >
            {store.category.replace(/has_|is_/, '')}
          </button>
        </Show>
        <Show when={store.folder}>
          <button
            onClick={() => setStore('folder', '')}
            class="me-2 inline-flex items-center justify-center rounded border border-blue-400 bg-blue-100 px-2.5 py-0.5 text-sm font-medium text-blue-800 hover:bg-blue-200 dark:bg-gray-700 dark:text-blue-400"
          >
            {store.folder}
          </button>
        </Show>
        <Show when={store.keyword}>
          <button
            onClick={() => setStore('keyword', '')}
            class="me-2 inline-flex items-center justify-center rounded border border-blue-400 bg-blue-100 px-2.5 py-0.5 text-sm font-medium text-blue-800 hover:bg-blue-200 dark:bg-gray-700 dark:text-blue-400"
          >
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
