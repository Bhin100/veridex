// Worker types and interfaces

export type WorkerId = string

export interface WorkerRegistration {
  id: WorkerId
  name: string
  version: string
  supportedTasks: string[]
  execute: (task: any) => Promise<any>
  validate: (task: any) => Promise<{ ok: boolean; reason?: string }>
  rollback?: (task: any, reason?: any) => Promise<void>
  heartbeat?: () => Promise<{ ok: boolean }>
}

export interface TaskRecord {
  id: string
  executionId: string
  type: string
  payload: any
  status: 'pending' | 'ready' | 'running' | 'waiting' | 'blocked' | 'completed' | 'failed' | 'cancelled'
  attempts: number
  maxAttempts?: number
  scheduledAt?: string | null
  startedAt?: string | null
  finishedAt?: string | null
  workerId?: string | null
  result?: any
  error?: any
  dependsOn?: string[]
  createdAt?: string | null
  updatedAt?: string | null
}

export interface ExecutionRecord {
  id: string
  contractId?: string | null
  opportunityId?: string | null
  clientId?: string | null
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
  priority: number
  tasks: TaskRecord[]
  timeline?: any
  audit?: any[]
  createdAt?: string | null
  updatedAt?: string | null
}
