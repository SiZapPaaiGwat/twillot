const props = {
  xmlns: 'https://www.w3.org/2000/svg',
  fill: 'none',
}

export const IconCheck = () => (
  <svg class="h-6 w-6" aria-hidden="true" {...props} viewBox="0 0 24 24">
    <path
      stroke="currentColor"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      d="M5 11.917 9.724 16.5 19 7.5"
    />
  </svg>
)

export const IconTextSize = () => (
  <svg class="h-6 w-6" {...props} viewBox="0 0 24 24">
    <path
      stroke="currentColor"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      d="M3 6.2V5h11v1.2M8 5v14m-3 0h6m2-6.8V11h8v1.2M17 11v8m-1.5 0h3"
    />
  </svg>
)

export const IconTextFont = () => (
  <svg class="h-6 w-6" {...props} viewBox="0 0 24 24">
    <path
      stroke="currentColor"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      d="m13 19 3.5-9 3.5 9m-6.125-2h5.25M3 7h7m0 0h2m-2 0c0 1.63-.793 3.926-2.239 5.655M7.5 6.818V5m.261 7.655C6.79 13.82 5.521 14.725 4 15m3.761-2.345L5 10m2.761 2.655L10.2 15"
    />
  </svg>
)

export const IconClose = () => (
  <svg class="h-6 w-6" {...props} viewBox="0 0 24 24">
    <path
      stroke="currentColor"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      d="M6 18 17.94 6M18 18 6.06 6"
    />
  </svg>
)

export const IconExpand = () => (
  <svg
    xmlns="https://www.w3.org/2000/svg"
    width="18"
    height="18"
    fill="none"
    viewBox="0 0 24 24"
  >
    <path
      stroke="currentColor"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      d="M8 4H4m0 0v4m0-4 5 5m7-5h4m0 0v4m0-4-5 5M8 20H4m0 0v-4m0 4 5-5m7 5h4m0 0v-4m0 4-5-5"
    />
  </svg>
)

export const IconRefresh = () => (
  <svg class="h-8 w-8" {...props} viewBox="0 0 24 24">
    <path
      stroke="currentColor"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="1"
      d="M17.651 7.65a7.131 7.131 0 0 0-12.68 3.15M18.001 4v4h-4m-7.652 8.35a7.13 7.13 0 0 0 12.68-3.15M6 20v-4h4"
    />
  </svg>
)

export const IconLeft = () => (
  <svg class="h-8 w-8" {...props} viewBox="0 0 24 24">
    <path
      stroke="currentColor"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="1"
      d="M16 16.881V7.119a1 1 0 0 0-1.636-.772l-5.927 4.881a1 1 0 0 0 0 1.544l5.927 4.88a1 1 0 0 0 1.636-.77Z"
    />
  </svg>
)

export const IconRight = () => (
  <svg class="h-8 w-8" {...props} viewBox="0 0 24 24">
    <path
      stroke="currentColor"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="1"
      d="M8 16.881V7.119a1 1 0 0 1 1.636-.772l5.927 4.881a1 1 0 0 1 0 1.544l-5.927 4.88A1 1 0 0 1 8 16.882Z"
    />
  </svg>
)

export const IconAnnotation = () => (
  <svg class="h-6 w-6" {...props} viewBox="0 0 24 24">
    <path
      stroke="currentColor"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="1"
      d="M7.556 8.5h8m-8 3.5H12m7.111-7H4.89a.896.896 0 0 0-.629.256.868.868 0 0 0-.26.619v9.25c0 .232.094.455.26.619A.896.896 0 0 0 4.89 16H9l3 4 3-4h4.111a.896.896 0 0 0 .629-.256.868.868 0 0 0 .26-.619v-9.25a.868.868 0 0 0-.26-.619.896.896 0 0 0-.63-.256Z"
    />
  </svg>
)

export const IconMagic = () => (
  <svg class="h-6 w-6" {...props} viewBox="0 0 24 24">
    <path
      stroke="currentColor"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="1"
      d="M16.872 9.687 20 6.56 17.44 4 4 17.44 6.56 20 16.873 9.687Zm0 0-2.56-2.56M6 7v2m0 0v2m0-2H4m2 0h2m7 7v2m0 0v2m0-2h-2m2 0h2M8 4h.01v.01H8V4Zm2 2h.01v.01H10V6Zm2-2h.01v.01H12V4Zm8 8h.01v.01H20V12Zm-2 2h.01v.01H18V14Zm2 2h.01v.01H20V16Z"
    />
  </svg>
)

export const IconFolder = (props) => (
  <svg class="h-6 w-6" {...props} viewBox="0 0 24 24">
    <path
      stroke="currentColor"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width={props.strokeWidth || 1}
      d="M13.5 8H4m0-2v13a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1h-5.032a1 1 0 0 1-.768-.36l-1.9-2.28a1 1 0 0 0-.768-.36H5a1 1 0 0 0-1 1Z"
    />
  </svg>
)

export const IconFolderPlus = () => (
  <svg class="h-6 w-6" {...props} viewBox="0 0 24 24">
    <path
      stroke="currentColor"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="1"
      d="M14 8H4m8 3.5v5M9.5 14h5M4 6v13a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1h-5.032a1 1 0 0 1-.768-.36l-1.9-2.28a1 1 0 0 0-.768-.36H5a1 1 0 0 0-1 1Z"
    />
  </svg>
)

export const IconFolderMove = () => (
  <svg class="h-5 w-5" {...props} viewBox="0 0 24 24">
    <path
      stroke="currentColor"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      d="M12.5 7H3m4 6h9m0 0-2-2m2 2-2 2M3 5v14a1 1 0 0 0 1 1h15a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1h-6.032a1 1 0 0 1-.768-.36l-1.9-2.28a1 1 0 0 0-.768-.36H4a1 1 0 0 0-1 1Z"
    />
  </svg>
)

export const IconQuote = () => (
  <svg
    class="h-4 w-4 text-gray-500 dark:text-gray-300"
    xmlns="https://www.w3.org/2000/svg"
    fill="currentColor"
    viewBox="0 0 18 14"
  >
    <path d="M6 0H2a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h4v1a3 3 0 0 1-3 3H2a1 1 0 0 0 0 2h1a5.006 5.006 0 0 0 5-5V2a2 2 0 0 0-2-2Zm10 0h-4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h4v1a3 3 0 0 1-3 3h-1a1 1 0 0 0 0 2h1a5.006 5.006 0 0 0 5-5V2a2 2 0 0 0-2-2Z" />
  </svg>
)

export const IconArrowDown = () => (
  <svg class="ms-2.5 h-2.5 w-2.5" {...props} viewBox="0 0 10 6">
    <path
      stroke="currentColor"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="1"
      d="m1 1 4 4 4-4"
    />
  </svg>
)

export const IconSearch = () => (
  <svg class="mx-4 h-4 w-4" {...props} viewBox="0 0 20 20">
    <path
      stroke="currentColor"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
    />
  </svg>
)

export const IconPlus = () => (
  <svg class="h-6 w-6" {...props} viewBox="0 0 24 24">
    <path
      stroke="currentColor"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="1"
      d="M5 12h14m-7 7V5"
    />
  </svg>
)

export const IconChevronArrowDown = () => (
  <svg class="h-6 w-6 cursor-pointer" {...props} viewBox="0 0 24 24">
    <path
      stroke="currentColor"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="1"
      d="m8 7 4 4 4-4m-8 6 4 4 4-4"
    />
  </svg>
)

export const IconUp = () => (
  <svg
    xmlns="https://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    class="ml-[2px] h-5 w-5"
  >
    <path d="M12 4l8 8h-6v8h-4v-8H4l8-8z" />
  </svg>
)

export const IconBookmark = ({ cls = 'h-6 w-6' }) => (
  <svg class={cls} {...props} viewBox="0 0 24 24">
    <path
      stroke="currentColor"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      d="m17 21-5-4-5 4V3.889a.92.92 0 0 1 .244-.629.808.808 0 0 1 .59-.26h8.333a.81.81 0 0 1 .589.26.92.92 0 0 1 .244.63V21Z"
    />
  </svg>
)

export const IconTag = () => (
  <svg class="h-6 w-6" {...props} viewBox="0 0 24 24">
    <path
      stroke="currentColor"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      d="M15.583 8.445h.01M10.86 19.71l-6.573-6.63a.993.993 0 0 1 0-1.4l7.329-7.394A.98.98 0 0 1 12.31 4l5.734.007A1.968 1.968 0 0 1 20 5.983v5.5a.992.992 0 0 1-.316.727l-7.44 7.5a.974.974 0 0 1-1.384.001Z"
    />
  </svg>
)

export const IconFolders = ({ cls = 'h-6 w-6' }) => (
  <svg class={cls} {...props} viewBox="0 0 24 24">
    <path
      stroke="currentColor"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      d="M12 11H4m15.5 5a.5.5 0 0 0 .5-.5V8a1 1 0 0 0-1-1h-3.75a1 1 0 0 1-.829-.44l-1.436-2.12a1 1 0 0 0-.828-.44H8a1 1 0 0 0-1 1M4 9v10a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-7a1 1 0 0 0-1-1h-3.75a1 1 0 0 1-.829-.44L9.985 8.44A1 1 0 0 0 9.157 8H5a1 1 0 0 0-1 1Z"
    />
  </svg>
)

export const IconSun = () => (
  <svg class="h-6 w-6 " {...props} viewBox="0 0 24 24">
    <path
      stroke="currentColor"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      d="M12 5V3m0 18v-2M7.05 7.05 5.636 5.636m12.728 12.728L16.95 16.95M5 12H3m18 0h-2M7.05 16.95l-1.414 1.414M18.364 5.636 16.95 7.05M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"
    />
  </svg>
)

export const IconMoon = () => (
  <svg class="h-6 w-6" aria-hidden="true" {...props} viewBox="0 0 24 24">
    <path
      stroke="currentColor"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      d="M12 21a9 9 0 0 1-.5-17.986V3c-.354.966-.5 1.911-.5 3a9 9 0 0 0 9 9c.239 0 .254.018.488 0A9.004 9.004 0 0 1 12 21Z"
    />
  </svg>
)

export const IconTrash = () => (
  <svg class="h-5 w-5" {...props} viewBox="0 0 24 24">
    <path
      stroke="currentColor"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      d="M5 7h14m-9 3v8m4-8v8M10 3h4a1 1 0 0 1 1 1v3H9V4a1 1 0 0 1 1-1ZM6 7h12v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7Z"
    />
  </svg>
)

export const IconArrow = () => (
  <svg
    width="100"
    height="30"
    viewBox="0 0 100 30"
    fill="none"
    xmlns="https://www.w3.org/2000/svg"
  >
    <line
      x1="0"
      y1="15"
      x2="100"
      y2="15"
      stroke="currentColor"
      stroke-width="2"
    />
    <line
      x1="100"
      y1="15"
      x2="85"
      y2="5"
      stroke="currentColor"
      stroke-width="2"
    />
    <line
      x1="100"
      y1="15"
      x2="85"
      y2="25"
      stroke="currentColor"
      stroke-width="2"
    />
  </svg>
)

export const IconBranch = () => (
  <svg class="h-6 w-6" {...props} viewBox="0 0 24 24">
    <path
      stroke="currentColor"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      d="M8 8v8m0-8a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm0 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm8-8a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm0 0a4 4 0 0 1-4 4h-1a3 3 0 0 0-3 3"
    />
  </svg>
)
