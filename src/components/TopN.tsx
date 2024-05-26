import { For, onMount } from 'solid-js'
import { A } from '@solidjs/router'
import tooltip from './Tooltip'

function TopN(props) {
  let el = null
  const users = props.users // Sort users by count in descending order
  const maxCount = users[0]?.count
  const minCount = users[users.length - 1]?.count
  const maxAvatarSize = 120
  const minAvatarSize = 40
  const stageSize = props.stageSize
  const scaleSize = (count) => {
    return (
      ((count - minCount) / (maxCount - minCount)) *
        (maxAvatarSize - minAvatarSize) +
      minAvatarSize
    )
  }
  let size = maxAvatarSize
  let x = stageSize / 2 - maxAvatarSize / 2
  let y = stageSize / 2 - maxAvatarSize / 2
  const initX = stageSize / 2 - minAvatarSize / 2
  const initY = stageSize / 2 - minAvatarSize / 2

  onMount(() => {
    setTimeout(() => {
      el.querySelectorAll('[data-size]').forEach((item) => {
        const size = item.getAttribute('data-size')
        const x = item.getAttribute('data-x')
        const y = item.getAttribute('data-y')
        item.style.width = `${size}px`
        item.style.height = `${size}px`
        item.style.left = `${x}px`
        item.style.top = `${y}px`
      })
    }, 200)
  })

  return (
    <div
      class={`relative`}
      style={{ width: `${stageSize}px`, height: `${stageSize}px` }}
      ref={el}
    >
      <For each={users}>
        {(user, index) => {
          if (index() !== 0) {
            const angle =
              ((360 / (users.length - 1)) * (index() - 1) * Math.PI) / 180
            size = scaleSize(user.count)
            x = Math.cos(angle) * 190 + stageSize / 2 - size / 2
            y = Math.sin(angle) * 190 + stageSize / 2 - size / 2
          }

          return (
            <div
              // @ts-ignore
              use:tooltip="top"
              class="absolute cursor-pointer overflow-hidden rounded-full border-2 border-[rgba(0,0,0,0.25)] dark:border-gray-400"
              title={`You bookmarked ${user.username} ${user.count} times`}
              data-size={size}
              data-x={x}
              data-y={y}
              onClick={() => props.onClick(user.screen_name)}
              style={{
                width: `${minAvatarSize}px`,
                height: `${minAvatarSize}px`,
                left: `${initX}px`,
                top: `${initY}px`,
                transition: `all ${200 + Math.random() * 200}ms ease-out`,
                'z-index': 20 - index(),
              }}
            >
              <A href={`/?q=from:${user.screen_name}`}>
                <img
                  src={user.avatar_url.replace('normal', '200x200')}
                  class="block h-auto w-full"
                />
              </A>
            </div>
          )
        }}
      </For>
    </div>
  )
}

export default TopN
