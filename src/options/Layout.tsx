import { createEffect, For, onMount, Show } from 'solid-js'
import { Portal } from 'solid-js/web'
import { A, useSearchParams } from '@solidjs/router'

import dataStore from './store'
import Indicator from '../components/Indicator'
import Authenticate from './Authenticate'
import Search from './Search'
import { initHistory, initSync, queryByCondition, resetQuery } from './handlers'
import { Alert } from '../components/Alert'
import Notification from '../components/Notification'
import {
  IconBookmark,
  IconBranch,
  IconFolderMove,
  IconFolders,
  IconMoon,
  IconSun,
  IconTag,
  IconTrash,
  IconUp,
} from '../components/Icons'
import ZenMode from '../components/ZenMode'
import { createStyleSheet } from '../libs/dom'
import logo from '../../public/img/logo-128.png'
import { FolderForm } from '../components/FolderDropDown'
import { allCategories } from '../constants'
import {
  initFolders,
  moveTweetsToFolder,
  removeFolder,
} from '../stores/folders'
import { startTasksLitening } from '../libs/workflow'

export const Layout = (props) => {
  const [store, setStore] = dataStore
  const [searchParams] = useSearchParams()

  createEffect(() => {
    if (searchParams.q) {
      setStore('keyword', searchParams.q)
    }
  })

  createEffect(() => {
    queryByCondition()
  })

  createEffect(() => {
    const font = store.activeFont
    if (font) {
      createStyleSheet(font.url, 'active-font')
    }
  })

  createEffect(() => {
    const theme = store.theme
    if (theme) {
      document.documentElement.classList.replace(
        theme === 'light' ? 'dark' : 'light',
        theme,
      )
      localStorage.setItem('theme', theme)
    }
  })

  onMount(() => {
    if (!store.isSidePanel) {
      initHistory()
      initSync()
      initFolders()
      startTasksLitening()
    }
  })

  return (
    <>
      <nav
        class={`text-gary-700 fixed top-0 z-50 w-full border-b border-gray-200 bg-white text-base text-gray-700 dark:border-gray-700 dark:bg-[#121212] dark:text-white ${store.selectedTweet > -1 ? 'hidden' : ''}`}
      >
        <div class="px-3 py-3 lg:px-5 lg:pl-3">
          <div class="flex items-center justify-between">
            <div class="flex w-full flex-col items-center justify-start space-y-4  lg:w-auto lg:flex-row lg:space-y-0 rtl:justify-end">
              <a
                href="https://twillot.com?utm_source=extension"
                target="_blank"
                class="ms-2 flex w-60"
              >
                <img src={logo} class="me-3 h-8" />
                <span class="flex-1 self-center whitespace-nowrap text-xl font-semibold">
                  Twillot
                </span>
              </a>
              <div class="flex w-full lg:w-[500px]">
                <Search />
              </div>
            </div>
            <div class="fixed right-4 top-4 items-center lg:static lg:flex">
              <div class="ms-3 flex items-center">
                <button
                  class="cursor-pointer"
                  onClick={() =>
                    setStore(
                      'theme',
                      store.theme === 'light' ? 'dark' : 'light',
                    )
                  }
                >
                  <Show when={store.theme === 'light'} fallback={<IconMoon />}>
                    <IconSun />
                  </Show>
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <Show when={!store.isSidePanel}>
        <aside
          class={`fixed left-0 top-0 z-40 h-screen w-64 -translate-x-full border-r border-gray-200 bg-white pt-20 text-lg text-gray-700 transition-transform dark:border-gray-700 dark:bg-[#121212] dark:text-white sm:translate-x-0 ${store.selectedTweet > -1 ? 'hidden' : ''}`}
        >
          <div class="h-full overflow-y-auto px-3 pb-4 ">
            <ul class="space-y-1 font-medium">
              <li>
                <A
                  href="/"
                  class="flex w-full items-center rounded-lg p-2  transition duration-75 hover:bg-gray-100  dark:hover:bg-gray-700"
                  onClick={resetQuery}
                >
                  <IconBookmark />
                  <span class="ms-3 flex-1 whitespace-nowrap text-left rtl:text-right">
                    Bookmarks
                  </span>
                  <span class="ms-3 inline-flex items-center justify-center rounded-full text-xs opacity-60">
                    <Show when={store.totalCount}>
                      {store.totalCount.total}
                    </Show>
                  </span>
                </A>
                <ul class="space-y-1 py-1 text-base">
                  <For each={allCategories}>
                    {(category) => {
                      return (
                        <li class="cursor-pointer">
                          <A
                            href="/"
                            class={`flex w-full items-center rounded-lg p-1 pl-11 transition duration-75  ${category.value === store.category ? 'text-blue-500' : ''}`}
                            onClick={() => setStore('category', category.value)}
                          >
                            {category.name}
                            <span class="mr-1 flex-1 items-center rounded-full text-right text-xs opacity-60">
                              <Show when={store.totalCount}>
                                {
                                  store.totalCount[
                                    category.value.replace(/has_|is_/, '')
                                  ]
                                }
                              </Show>
                            </span>
                          </A>
                        </li>
                      )
                    }}
                  </For>
                </ul>
              </li>
              <li>
                <div class="flex items-center rounded-lg p-2 hover:bg-gray-100  dark:hover:bg-gray-700">
                  <IconFolders />
                  <span class="ms-3 flex-1 whitespace-nowrap">Folders</span>
                </div>
                <ul class="space-y-1 py-1 text-base">
                  <For each={store.folders}>
                    {(folder) => {
                      return (
                        <li>
                          <A
                            href="/"
                            class={`${folder.name === store.folder ? 'text-blue-500 ' : ''} group flex w-full items-center rounded-lg p-1 pl-11 transition duration-75`}
                            onClick={() => setStore('folder', folder.name)}
                          >
                            {folder.name}
                            <div class="ml-4 hidden flex-1 items-center justify-end gap-2 group-hover:flex">
                              <Show when={store.keyword}>
                                <span
                                  class="cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    moveTweetsToFolder(folder.name)
                                  }}
                                >
                                  <IconFolderMove />
                                </span>
                              </Show>
                              <span
                                class="cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  removeFolder(folder.name)
                                }}
                              >
                                <IconTrash />
                              </span>
                            </div>
                            <span class="mr-1 flex-1 items-center text-right text-xs font-medium opacity-60 group-hover:hidden">
                              {folder.count}
                            </span>
                          </A>
                        </li>
                      )
                    }}
                  </For>
                  <li>
                    <div class="flex w-full items-center rounded-lg p-1 pl-11 transition duration-75">
                      <FolderForm />
                    </div>
                  </li>
                </ul>
              </li>
              <li>
                <div class="cursor-d flex items-center rounded-lg p-2  hover:bg-gray-100 dark:hover:bg-gray-700">
                  <IconTag />
                  <span class="ms-3 flex-1 whitespace-nowrap">Tags</span>
                  <span class="ms-3 inline-flex items-center justify-center text-xs ">
                    Coming Soon
                  </span>
                </div>
              </li>
              <li>
                <a
                  class="cursor-d flex items-center rounded-lg p-2  hover:bg-gray-100 dark:hover:bg-gray-700"
                  href="/workflows"
                >
                  <IconBranch />
                  <span class="ms-3 flex-1 whitespace-nowrap">Workflows</span>
                </a>
              </li>
            </ul>
          </div>
        </aside>
      </Show>

      <main class="bg-white text-gray-700 dark:bg-[#121212] dark:text-white lg:ml-72">
        <div
          class={`flex-col items-center pt-28 lg:pt-[64px] ${store.selectedTweet > -1 ? 'hidden' : ''}`}
        >
          <div class="mx-auto hidden lg:block lg:w-[48rem]">
            <Show when={store.isAuthFailed}>
              <Authenticate />
            </Show>
            <Show when={store.isForceSyncTimedout}>
              <Alert
                message={
                  <>
                    <span class="font-medium">
                      Sync timed out, but that's not a big problem:
                    </span>
                    <ul class="mt-1.5 list-inside list-disc">
                      <li>All your synced tweets are available from now on.</li>
                      <li>
                        Refresh this page to continue syncing from where it last
                        failed.
                      </li>
                      <li>
                        Contact the{' '}
                        <a
                          href="https://x.com/SiZapPaaiGwat"
                          target="_blank"
                          class="text-blue-500 underline"
                        >
                          maker
                        </a>{' '}
                        of Twillot if the problem persists.
                      </li>
                    </ul>
                  </>
                }
                type="error"
              />
            </Show>
            <Show when={store.isForceSyncing}>
              <Indicator
                text={
                  <div class="text-center">
                    Sync in progress: {store.totalCount.total} tweets.
                  </div>
                }
              />
            </Show>
          </div>

          {props.children}
        </div>
        <Portal>
          <ZenMode />
          <Notification />
          <button
            class="fixed bottom-10 right-10 z-50 h-14 w-14 rounded-full border-0 bg-purple-500 p-4 text-lg font-semibold text-white opacity-40 shadow-md transition-colors duration-300 hover:bg-purple-700 hover:opacity-100"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <IconUp />
          </button>
        </Portal>
      </main>
    </>
  )
}

export default Layout
