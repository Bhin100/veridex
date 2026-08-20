import { executionOrchestrator } from '../../services/execution/orchestrator'
import { learningRepository } from '../../repos/learningRepository'

// Trigger execution start when payment guardian confirms payment
export async function onContractPaymentConfirmed(contract: any) {
  if (!contract) return
  // find executions for contract
  // @ts-ignore
  const execs = await (await import('../../lib/db')).db.execution.findMany({ where: { contractId: contract.id } })
  // Concurrently start execution for all associated executions to reduce latency from O(N) to O(1)
  await Promise.all(
    execs.map(async (e: any) => {
      try {
        await executionOrchestrator.startExecution(e.id)
      } catch (err) {
        // record audit
        await learningRepository.recordMetric('execution_start_failed', `exec_start:${e.id}`, { error: String(err) })
      }
    })
  )
}
