import useSWR from 'swr'

async function fetcher(url: string) { const res = await fetch(url); if (!res.ok) throw new Error('fetch failed'); return res.json() }

export default function LearningDashboard() {
  const { data, error } = useSWR('/api/v1/learning/stats', fetcher)
  if (error) return <main style={{ padding: 20 }}><h2>Error loading learning stats</h2><pre>{String(error)}</pre></main>
  if (!data) return <main style={{ padding: 20 }}><h2>Loading learning stats...</h2></main>
  return (
    <main style={{ padding: 20 }}>
      <h1>Learning Dashboard</h1>
      <section>
        <h2>Win Rate</h2>
        <pre>{JSON.stringify(data.win, null, 2)}</pre>
      </section>
      <section>
        <h2>Revenue</h2>
        <pre>{JSON.stringify(data.revenue, null, 2)}</pre>
      </section>
      <section>
        <h2>Avg Response Time</h2>
        <pre>{JSON.stringify(data.resp, null, 2)}</pre>
      </section>
    </main>
  )
}
