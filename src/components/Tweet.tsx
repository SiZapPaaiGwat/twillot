import { Accessor, createMemo, createSignal, Show, For } from 'solid-js'

import {
  escapeHtml,
  escapeRegExp,
  highlightAndLinkify,
  maxChars,
} from '../libs/text'
import { Media, Tweet, TweetQuoted } from '../types'
import dataStore from '../options/store'

export const FullText = (props: {
  text: string
  keyword?: string
  isQuoted?: boolean
}) => {
  const [store] = dataStore
  const shouldShowFullText = props.text.length < maxChars
  const [showFullText, setShowFullText] = createSignal(
    shouldShowFullText || (props.isQuoted ? false : !props.keyword),
  )
  const keyword = props.keyword ? escapeHtml(props.keyword) : ''
  const text = createMemo(() => (keyword ? escapeHtml(props.text) : props.text))
  const escapedQueryForRegex = keyword ? escapeRegExp(keyword) : ''
  const highlightRegex = keyword
    ? new RegExp(`(${escapedQueryForRegex})`, 'gi')
    : null
  const matches = keyword ? text().match(highlightRegex)?.length || 0 : 0
  const html = createMemo(() =>
    highlightAndLinkify(text(), highlightRegex, showFullText()),
  )
  const style = createMemo(() => ({
    'font-family': store.activeFont ? `"${store.activeFont.name}"` : 'inherit',
    'font-size': store.fontSize + 'px',
  }))

  return (
    <Show
      when={showFullText()}
      fallback={
        <>
          <span
            style={style()}
            class="whitespace-pre-wrap break-words leading-snug"
            innerHTML={html()}
          />
          <div
            class="mt-2 cursor-pointer text-blue-500"
            onClick={() => setShowFullText(true)}
          >
            {matches > 1 ? `Show all ${matches} matches` : 'Show full text'}
          </div>
        </>
      }
    >
      <span
        style={style()}
        class="whitespace-pre-wrap break-words leading-snug"
        innerHTML={html()}
      />
    </Show>
  )
}

export const MediaItems = (props: { media_items: Media[] }) => {
  const width = createMemo(() =>
    props.media_items.length > 1 ? 'w-[calc(50%-4px)]' : 'w-full',
  )

  return (
    <For each={props.media_items}>
      {(item) => (
        <div class={`relative ${width()} flex items-center`}>
          <Image
            src={item.media_url_https}
            alt={item.ext_alt_text}
            url={
              item.video_info
                ? item.video_info.variants[item.video_info.variants.length - 1]
                    .url
                : item.media_url_https.split('?')[0] + '?format=jpg&name=large'
            }
          />
          <Show when={item.type !== 'photo'}>
            <div class="pointer-events-none absolute left-1/2 top-1/2 -ml-8 -mt-8 flex h-14 w-14 items-center justify-center rounded-full">
              <svg viewBox="0 0 60 61" aria-hidden="true">
                <g>
                  <circle
                    cx="30"
                    cy="30.4219"
                    fill="#333333"
                    opacity="0.6"
                    r="30"
                  ></circle>
                  <path
                    d="M22.2275 17.1971V43.6465L43.0304 30.4218L22.2275 17.1971Z"
                    fill="white"
                  ></path>
                </g>
              </svg>
            </div>
          </Show>
        </div>
      )}
    </For>
  )
}

export function Image(props: { src: string; alt?: string; url?: string }) {
  return (
    <figure class="h-auto w-full cursor-pointer" title={props.alt || ''}>
      <a href={props.url || props.src} target="_blank">
        <img class="rounded-lg" src={props.src} loading="lazy" />
      </a>
    </figure>
  )
}

export const Content = (props: {
  tweet: Tweet | TweetQuoted | Accessor<Tweet | TweetQuoted>
  keyword?: string
  isQuoted?: boolean
}) => {
  const tweet = createMemo(() =>
    typeof props.tweet === 'function' ? props.tweet() : props.tweet,
  )
  const text = createMemo(() => tweet().full_text)
  const media_items = createMemo(() => tweet().media_items)
  return (
    <>
      <div class="width-auto text-base font-normal leading-6 ">
        <FullText
          text={text()}
          keyword={props.keyword}
          isQuoted={props.isQuoted}
        />
      </div>
      <Show when={media_items()}>
        <div class="my-2 flex flex-wrap space-x-1 space-y-1">
          <MediaItems media_items={media_items()} />
        </div>
      </Show>
    </>
  )
}
