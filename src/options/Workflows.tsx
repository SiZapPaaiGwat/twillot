import { For } from 'solid-js'

import dataStore from '../options/store'
import { IconArrow, IconPlus, IconTrash } from '../components/Icons'
import {
  addThen,
  addWorkflow,
  removeThen,
  removeWorkflow,
  ThenAction,
  updateThen,
  updateWhen,
  WhenAction,
} from '../stores/workflows'

const [store] = dataStore

const WorkflowConfigurator = () => {
  return (
    <div class="container mx-auto p-4 text-base">
      <h1 class="mb-4 text-2xl font-bold">Configure your workflow</h1>
      <button
        onClick={addWorkflow}
        type="button"
        class="mb-8 me-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
      >
        Add a new workflow
      </button>
      <For each={store.workflows}>
        {(workflow, workflowIndex) => (
          <div class="mb-4 rounded-md border border-gray-200 p-4 dark:border-gray-700">
            <div class="mb-2 flex items-center justify-between">
              <span class="font-bold">Workflow #{workflow.id}</span>
            </div>

            <div class="mb-4 flex items-center">
              <div class="w-56 rounded-lg border border-gray-200 text-sm text-gray-500 shadow-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400">
                <div class="group flex rounded-t-lg border-b border-gray-200 bg-gray-100 px-3 py-2 dark:border-gray-600 dark:bg-gray-700">
                  <h3 class="ml-6 flex-1 text-center font-semibold text-gray-900 dark:text-white">
                    When you
                  </h3>
                  <button
                    class="invisible ml-2 block text-xs text-red-600 group-hover:visible"
                    onClick={() => removeWorkflow(workflowIndex())}
                  >
                    <IconTrash />
                  </button>
                </div>
                <div class="p-4">
                  <select
                    class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                    value={workflow.when}
                    onInput={(e) =>
                      updateWhen(
                        workflowIndex(),
                        e.currentTarget.value as WhenAction,
                      )
                    }
                  >
                    {Object.values(WhenAction).map((action) => (
                      <option value={action}>{action}</option>
                    ))}
                  </select>
                  <div class="mt-4 text-center">a tweet</div>
                </div>
              </div>

              <For each={workflow.thenList}>
                {(thenAction, thenIndex) => (
                  <>
                    <div class="text-gray-500 dark:text-gray-400">
                      <IconArrow />
                    </div>
                    <div class="w-56 rounded-lg border border-gray-200 text-sm text-gray-500 shadow-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400">
                      <div class="group flex rounded-t-lg border-b border-gray-200 bg-gray-100 px-3 py-2 dark:border-gray-600 dark:bg-gray-700">
                        <h3 class="ml-6 flex-1 text-center font-semibold text-gray-900 dark:text-white">
                          Then
                        </h3>
                        <button
                          class="invisible ml-2 block text-xs text-red-600 group-hover:visible"
                          onClick={() =>
                            removeThen(workflowIndex(), thenIndex())
                          }
                        >
                          <IconTrash />
                        </button>
                      </div>
                      <div class="p-4">
                        <select
                          class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                          onChange={(e) =>
                            updateThen(
                              workflowIndex(),
                              thenIndex(),
                              e.currentTarget.value as ThenAction,
                            )
                          }
                        >
                          {Object.values(ThenAction).map((action) => (
                            <option
                              value={action}
                              selected={action === thenAction}
                            >
                              {action}
                            </option>
                          ))}
                        </select>
                        <div class="mt-4 text-center">this tweet</div>
                      </div>
                    </div>
                  </>
                )}
              </For>
              <button class="ml-4" onClick={() => addThen(workflowIndex())}>
                <IconPlus />
              </button>
            </div>
          </div>
        )}
      </For>
    </div>
  )
}

export default WorkflowConfigurator
