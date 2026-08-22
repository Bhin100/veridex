import { workerManager } from './manager'
import { heartbeatMonitor } from './heartbeat'
import { collectQueueMetrics } from './metrics'

export function startWorkersSubsystem() {
  heartbeatMonitor.start()
  // initial metrics collect
  void collectQueueMetrics()
  const t = setInterval(() => {
    void collectQueueMetrics()
  }, Number(process.env.WORKER_METRICS_SEC || 60) * 1000)

  return {
    stop() {
      heartbeatMonitor.stop()
      clearInterval(t)
      workerManager.shutdown()
    }
  }
}
