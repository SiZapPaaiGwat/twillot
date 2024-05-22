import { addFolder } from '../stores/folders'

export const FolderForm = () => {
  const submit = async (e) => {
    e.preventDefault()
    await addFolder(e.target.folder.value)
    e.target.folder.value = ''
  }

  return (
    <form class="flex items-center" onSubmit={submit}>
      <input
        type="text"
        name="folder"
        class="block w-full border-b border-gray-300 py-2 text-sm text-gray-900 outline-none focus:border-blue-500  dark:border-gray-600  dark:bg-[#121212] dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 "
        placeholder="Add a folder"
      />
    </form>
  )
}
