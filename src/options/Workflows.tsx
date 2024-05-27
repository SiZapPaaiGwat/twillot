import { For, onMount } from 'solid-js'

import dataStore from '../options/store'
import { IconArrow, IconPlus, IconTrash } from '../components/Icons'
import {
  addThen,
  addWorkflow,
  getWorkflows,
  removeThen,
  removeWorkflow,
  saveWorkflow,
  updateThen,
  updateWhen,
} from '../libs/workflow/store'
import { sendWorkflows } from '../libs/workflow'
import { Trigger, TriggerNames } from '../libs/workflow/triggers'
import { Action, ActionNames } from '../libs/workflow/actions'

const [store] = dataStore

const WorkflowConfigurator = () => {
  /**
   * 每次加载时将本地存储的工作流发送到 background
   */
  onMount(async () => {
    sendWorkflows(await getWorkflows())
  })

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
            <div class="mb-2 flex items-center justify-between gap-4">
              <span class="flex-1 font-bold">Workflow #{workflow.id}</span>
              <button
                type="button"
                class="mb-2 me-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                onClick={() => saveWorkflow(workflowIndex())}
              >
                Save
              </button>
            </div>

            <div class="mb-4 flex w-full items-center overflow-x-auto">
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
                        e.currentTarget.value as Trigger,
                      )
                    }
                  >
                    {Object.keys(TriggerNames).map((trigger) => (
                      <option
                        value={trigger}
                        selected={trigger === workflow.when}
                      >
                        {TriggerNames[trigger]}
                      </option>
                    ))}
                  </select>
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
                              e.currentTarget.value as Action,
                            )
                          }
                        >
                          {Object.keys(ActionNames).map((action) => (
                            <option
                              value={action}
                              selected={action === thenAction}
                            >
                              {ActionNames[action]}
                            </option>
                          ))}
                        </select>
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
