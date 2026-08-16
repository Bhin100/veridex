import Link from 'next/link'

export default function WorkersRunning() {
  return (
    <main style={{ padding: 20 }}>
      <h1>Running Tasks</h1>
      <p>Placeholder list — data fetched from /api/v1/workers/status and /api/v1/workers/queues</p>
    </main>
  )
}
