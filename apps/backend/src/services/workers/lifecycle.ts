import { workerManager } from './manager'
import { startWorkersSubsystem } from './startup'

let subsystem: any = null

export function start() {
  if (!subsystem) subsystem = startWorkersSubsystem()
}

export async function stop() {
  if (subsystem) {
    await subsystem.stop()
    subsystem = null
  }
  await workerManager.shutdown()
}
