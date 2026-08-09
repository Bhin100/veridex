import Link from 'next/link'

export default function WorkersDashboard() {
  return (
    <main style={{ padding: 20 }}>
      <h1>Autonomous Workers — Dashboard (Placeholder)</h1>
      <ul>
        <li><Link href="/dashboard/workers">Workers</Link></li>
        <li><Link href="/dashboard/workers/running">Running Tasks</Link></li>
        <li><Link href="/dashboard/workers/failed">Failed Tasks</Link></li>
        <li><Link href="/dashboard/workers/completed">Completed Tasks</Link></li>
        <li><Link href="/dashboard/workers/health">Worker Health</Link></li>
        <li><Link href="/dashboard/workers/queues">Queue Status</Link></li>
      </ul>
    </main>
  )
}
