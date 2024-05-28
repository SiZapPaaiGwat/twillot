import {
  MessageType,
  TriggerNames,
  TriggerReponsePayload,
} from '../libs/workflow/types'
import { Host } from '../types'
import { triggerResponse } from '../libs/workflow/trigger'

const origOpen = XMLHttpRequest.prototype.open
XMLHttpRequest.prototype.open = function (method: string, url: string) {
  this._method = method
  this._url = url

  origOpen.apply(this, arguments)
}

const origSend = XMLHttpRequest.prototype.send
XMLHttpRequest.prototype.send = function (data) {
  const url = this._url
  const trigger = url.split('/').pop()
  if (trigger && trigger in TriggerNames) {
    this.addEventListener('load', async function () {
      const parse = triggerResponse[trigger]
      const body =
        this.responseText && parse ? await parse(this.responseText) : {}
      window.postMessage(
        {
          type: MessageType.GetTriggerResponse,
          payload: {
            trigger,
            request: { method: this._method, url: this._url, body: data },
            response: {
              status: this.status,
              statusText: this.statusText,
              body,
            },
          } as TriggerReponsePayload,
        },
        Host,
      )
    })
  }

  origSend.apply(this, [data])
}

export default {}
