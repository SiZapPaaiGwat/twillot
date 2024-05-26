import { Host, X_DOMAIN } from '../types'
import { Workflow } from './workflow/workflow'
import monitor from './workflow'

export const getRequestBody = (
  details: chrome.webRequest.WebRequestBodyDetails,
) => {
  const requestBody = details.requestBody
  if (requestBody && requestBody.raw && requestBody.raw.length > 0) {
    const decoder = new TextDecoder('utf-8')
    const bodyString = decoder.decode(requestBody.raw[0].bytes)
    try {
      return JSON.parse(bodyString)
    } catch (error) {
      console.error('Error parsing request body:', error)
    }
  }
}

/**
 * 开始监听用户的触发动作
 * @description bg only
 */
export function startTriggerListening() {
  chrome.webRequest.onBeforeRequest.addListener(
    (details) => {
      if (details.method !== 'POST') {
        return
      }

      monitor.setup(details)
    },
    { urls: [`${Host}/*`] },
    ['requestBody'],
  )
}

/**
 * @description bg only
 * */
export function startWorkflowListening() {
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'get_workflows') {
      const workflows = message.data as Workflow[]
      if (!workflows || workflows.length === 0) {
        return
      }

      chrome.storage.local.set({ workflows })
      monitor.workflows = workflows
    }
  })
}

/**
 * @description bg only
 */
export async function getWorkflows() {
  const item = await chrome.storage.local.get('workflows')
  return item.workflows || []
}

/**
 * @description options only
 */
export function sendWorkflows(workflows: Workflow[]) {
  chrome.runtime.sendMessage({
    type: 'get_workflows',
    data: workflows,
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
    token = ''

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

export async function addLocalItem(key: string, value: string | string[]) {
  if (value && value.length > 0) {
    await chrome.storage.local.set({
      [key]: value,
    })
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
