import { workerQueues, createWorker } from './queues'
import { workerManager } from './manager'
import { executionRepo } from '../../repos/executionRepository'

// pending consumer
createWorker(async (job) => {
  const { taskId } = job.data
  // fetch task
  // @ts-ignore
  const task = await (await import('../../lib/db')).db.task.findUnique({ where: { id: taskId } })
  if (!task) return
  // assign and run
  await workerManager.assignAndRun(task)
}, 'workers:pending')

// retry consumer
createWorker(async (job) => {
  const { taskId } = job.data
  // @ts-ignore
  const task = await (await import('../../lib/db')).db.task.findUnique({ where: { id: taskId } })
  if (!task) return
  // re-attempt
  await workerManager.assignAndRun(task)
}, 'workers:retry')

// waiting consumer - attempts to schedule again
createWorker(async (job) => {
  const { taskId } = job.data
  // @ts-ignore
  const task = await (await import('../../lib/db')).db.task.findUnique({ where: { id: taskId } })
  if (!task) return
  await workerManager.scheduleTask(task)
}, 'workers:waiting')
