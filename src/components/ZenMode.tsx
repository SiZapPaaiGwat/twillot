import { For, Show, createMemo, createSignal } from 'solid-js'

import { Content } from './Tweet'
import dataStore from '../options/store'
import FolderSelect from './FolderSelect'
import {
  IconClose,
  IconLeft,
  IconQuote,
  IconRight,
  IconTextFont,
} from './Icons'
import { getNextTweet, getPrevTweet } from '../options/handlers'
import useKeyboard from '../hooks/useKeyboard'
import FontList from './CustomFonts/FontList'

export default function ZenMode() {
  const [isFontVisible, setFontVisible] = createSignal(false)
  const [store, setStore] = dataStore
  const tweet = createMemo(() => {
    const index = store.selectedTweet
    if (index < 0) {
      return null
    }

    return store.tweets[index]
  })

  useKeyboard({
    onLeft: getPrevTweet,
    onRight: getNextTweet,
    onEscape: () => setStore({ selectedTweet: -1 }),
  })

  return (
    <Show when={tweet()}>
      <div class="relative flex h-full min-h-[400px] w-full flex-col bg-white text-gray-700 dark:bg-[#121212] dark:text-white">
        <header class="sticky top-0 mx-auto w-[40rem] bg-white py-4 dark:bg-[#121212]">
          <address class="flex items-center not-italic">
            <div class="mr-3 inline-flex items-center text-sm text-gray-900 dark:text-white">
              <img
                class="mr-4 h-16 w-16 rounded-full"
                src={`${tweet().avatar_url.replace('_normal', '_x96')}`}
              />
              <div>
                <span class="text-xl font-bold text-gray-900 dark:text-white ">
                  {tweet().username}
                </span>
                <span class="dark:text-gray-40 ml-2 text-gray-500">
                  @{tweet().screen_name}
                </span>
                <span class="dark:text-gray-40 ml-2 inline-flex items-center gap-4 font-normal text-gray-500">
                  <time>
                    {new Date(tweet().created_at * 1000).toLocaleString()}
                  </time>
                  <FolderSelect tweet={tweet()} />
                </span>
              </div>
            </div>
          </address>
        </header>
        <article class="mx-auto w-[40rem] flex-1">
          <Content tweet={tweet()} />
          <Show when={tweet().conversations}>
            <For each={tweet().conversations}>
              {(conversation) => <Content tweet={conversation} />}
            </For>
          </Show>
          <Show when={tweet().quoted_tweet}>
            <div class="relative inline-flex w-full items-center justify-center">
              <hr class="my-8 h-1 w-64 rounded border-0 bg-gray-200 dark:bg-gray-700" />
              <div class="absolute left-1/2 -translate-x-1/2 px-4">
                <IconQuote />
              </div>
            </div>
            <Content tweet={tweet().quoted_tweet} isQuoted={true} />
          </Show>
        </article>
        <aside class="fixed bottom-0 left-[calc(50%+21rem)] right-0 top-0 flex text-base 2xl:left-[calc(50%+24rem)]">
          <div class="flex flex-col items-center justify-start gap-4 pt-8 *:cursor-pointer *:text-gray-500">
            <span onClick={() => setFontVisible((val) => !val)}>
              <IconTextFont />
            </span>
            {/* <span>
              <IconTextSize />
            </span> */}
          </div>
          <Show when={isFontVisible()}>
            <div class="ml-3 max-w-xl flex-1 overflow-y-auto border-x border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
              <h3 class="sticky left-0 right-0 top-0 mb-4 bg-gray-100 px-4 py-2 text-lg font-medium dark:bg-gray-900">
                Custom Fonts
                <span
                  class="ml-4 cursor-pointer text-sm font-normal text-blue-500"
                  onClick={() => {
                    setStore({ activeFont: null, fontSize: 16 })
                    localStorage.removeItem('activeFont')
                    localStorage.removeItem('fontSize')
                  }}
                >
                  Reset
                </span>
                <div class="float-right flex items-center justify-center">
                  <span
                    onClick={() => setFontVisible(false)}
                    class="cursor-pointer"
                  >
                    <IconClose />
                  </span>
                </div>
              </h3>
              <FontList />
            </div>
          </Show>
        </aside>
        <footer class="sticky bottom-0 mx-auto flex h-14 w-[40rem] select-none items-center justify-center gap-4  bg-white pb-2 pt-4 *:cursor-pointer dark:bg-[#121212]">
          <div class="flex items-center gap-4">
            <span onClick={getPrevTweet}>
              <IconLeft />
            </span>
            <span onClick={getNextTweet}>
              <IconRight />
            </span>
          </div>
        </footer>
        <div
          class="fixed left-8 top-8 cursor-pointer"
          onClick={() => {
            setStore({ selectedTweet: -1 })
            setFontVisible(false)
          }}
        >
          <IconClose />
        </div>
      </div>
    </Show>
  )
}
