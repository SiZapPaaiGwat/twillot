import { Host, X_DOMAIN } from '../types'

export async function proxyRequest(
  method: string,
  url: string,
  headers: Record<string, string>,
  body?: any,
) {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
  if (tabs.length === 0) {
    console.error('No active tab found')
    return
  }

  chrome.tabs.sendMessage(tabs[0].id!, {
    type: 'PROXY_REQUEST',
    data: {
      method,
      url,
      headers,
      body,
    },
  })
}

export function onBookmarkCreated(callback: (tweeet_id: string) => void) {
  chrome.webRequest.onBeforeRequest.addListener(
    (details) => {
      if (
        details.method === 'POST' &&
        details.url.endsWith('/CreateBookmark')
      ) {
        const requestBody = details.requestBody
        if (requestBody && requestBody.raw && requestBody.raw.length > 0) {
          const decoder = new TextDecoder('utf-8')
          const bodyString = decoder.decode(requestBody.raw[0].bytes)
          try {
            const bodyJson = JSON.parse(bodyString)
            const tweetId = bodyJson.variables.tweet_id
            callback(tweetId)
          } catch (error) {
            console.error('Error parsing request body:', error)
          }
        }
      }
    },
    { urls: [`${Host}/*`] },
    ['requestBody'],
  )
}

export function onContentMessage() {
  async function sendReuqest(
    method: string,
    url: string,
    headers: Record<string, string>,
    body?: any,
  ) {
    try {
      const res = await fetch(url, {
        method,
        headers: new Headers(headers),
        body,
      })
      const json = await res.json()
      console.log('Request successful:', json)
    } catch (error) {
      console.error('Request failed:', error)
    }
  }

  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'PROXY_REQUEST') {
      const { method, url, headers, body } = message.data
      sendReuqest(method, url, headers, body)
    }
  })
}

export function openNewTab(url: string, active = true) {
  return chrome.tabs.create({
    url,
    active,
  })
}

export function openOptionsPageWhenIconClicked() {
  chrome.action.onClicked.addListener(function () {
    chrome.runtime.openOptionsPage()
  })
}

export async function onSendHeaders(
  details: chrome.webRequest.WebRequestHeadersDetails,
) {
  const { url } = details
  if (!url.includes('/Bookmarks?')) {
    return
  }

  let csrf = '',
    token = '',
    bookmarkUrl = url.replace(/variables=[^&]+/, '')

  for (const { name: t, value: o } of details.requestHeaders || []) {
    if (csrf && token) {
      break
    }

    if (t === 'x-csrf-token') {
      csrf = o || ''
    } else if (t === 'authorization') {
      token = o || ''
    }
  }

  if (csrf && token) {
    const cookies = await chrome.cookies.getAll({ domain: X_DOMAIN })
    const cookiesStr = cookies.map((c) => c.name + '=' + c.value).join('; ')
    await chrome.storage.local.set({
      cookie: cookiesStr,
      csrf,
      token,
      url: bookmarkUrl,
    })
    // NOTE 加了这一句获取登录态不稳定，导致登录失败，暂时注释掉
    // chrome.webRequest.onSendHeaders.removeListener(onSendHeaders)
  }
}

export function authTwitter() {
  chrome.webRequest.onSendHeaders.addListener(
    onSendHeaders,
    {
      urls: [`${Host}/i/api/graphql/*`],
    },
    ['requestHeaders'],
  )
}

export async function getAuthInfo() {
  const auth = await chrome.storage.local.get([
    'token',
    'url',
    'cookie',
    'csrf',
    'lastForceSynced',
  ])
  if (auth && auth.url) {
    const url = new URL(auth.url)
    /**
     * 2024.5.19 twitter 域名正式使用 x.com
     */
    if (url.hostname !== X_DOMAIN) {
      await chrome.storage.local.clear()
      return null
    }
  }

  return auth
}

export async function addLocalItem(key: string, value: string) {
  if (value && value.length > 0) {
    await chrome.storage.local.set({
      [key]: value,
    })
    return value.trim()
  }
}

export async function getLocalItem(key: string) {
  const item = await chrome.storage.local.get(key)
  return item && item[key]
}

export async function createPopup(url: string, width = 1, height = 1) {
  const tab = await chrome.tabs.create({
    url,
    active: true,
  })
  const window = await chrome.windows.create({
    tabId: tab.id,
    type: 'popup',
    width,
    height,
    focused: true,
  })

  return { tab, window }
}
