import { setIdToSave } from '../browser'
import { ActionContext } from './workflow'

export default {
  /**
   * 将当前推文 id 保存到本地存储 idsToSave
   * idsToSave 列表会在入库时拉取主题推文全部内容
   */
  saveTweetId: async (context: ActionContext) => {
    const { requestBody, triggerName } = context
    let tweet_id = ''
    if (triggerName === 'CreateBookmark') {
      tweet_id = requestBody.variables.tweet_id
    } else {
      return Promise.reject(
        new Error('Currenttrigger is not supported for save_thread action'),
      )
    }

    if (!tweet_id) {
      console.error('save_thread: tweet_id is empty')
      return
    }

    await setIdToSave(tweet_id)
  },
}
