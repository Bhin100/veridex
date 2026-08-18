import { recordWorkerMetric } from './metrics'

export async function reportTaskDuration(workerId: string, durationMs: number) {
  await recordWorkerMetric(workerId, 'task_duration_ms', durationMs)
}

export async function reportTaskFailure(workerId: string) {
  await recordWorkerMetric(workerId, 'task_failure', 1)
}

export async function reportTaskSuccess(workerId: string) {
  await recordWorkerMetric(workerId, 'task_success', 1)
}
