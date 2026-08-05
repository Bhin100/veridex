import { computeAllMetrics } from './engine'

const POLL_SEC = Number(process.env.LEARNING_POLL_SEC || 3600)

export function startLearningScheduler() {
  // initial run
  void computeAllMetrics()
  const t = setInterval(() => {
    void computeAllMetrics()
  }, POLL_SEC * 1000)
  return {
    stop() { clearInterval(t) }
  }
}
