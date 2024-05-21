import dataStore from './store'
import { IconSearch } from '../components/Icons'

export default function Search() {
  const [store, setStore] = dataStore
  const onSubmit = async (e) => {
    try {
      e.preventDefault()
      const keyword = e.target.keyword.value.trim()
      setStore('keyword', keyword)
    } catch (err) {}
  }

  return (
    <form onSubmit={onSubmit} class="flex w-full">
      <div class="relative flex w-full">
        <div class="relative w-full">
          <input
            type="search"
            name="keyword"
            placeholder="keyword / from:author / since:YYYY-MM-DD / until:YYYY-MM-DD"
            value={store.keyword}
            class="z-20 block w-full rounded-lg border border-gray-200  bg-gray-50 p-2.5 text-sm text-gray-900 outline-0 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:border-s-gray-700  dark:bg-[#121212] dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500"
          />
          <button
            type="submit"
            class="absolute end-0 top-0 h-full rounded-e-lg border border-blue-700 bg-blue-700 p-2.5 text-center text-sm font-medium text-white hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 "
          >
            <IconSearch />
          </button>
        </div>
      </div>
    </form>
  )
}
