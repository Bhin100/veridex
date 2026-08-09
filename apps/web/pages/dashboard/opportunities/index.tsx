import Link from 'next/link'

export default function OpportunitiesDashboard() {
  return (
    <main style={{ padding: 20 }}>
      <h1>Opportunities Dashboard (Placeholder)</h1>
      <ul>
        <li><Link href="/dashboard/opportunities/waiting">Opportunities waiting</Link></li>
        <li><Link href="/dashboard/opportunities/top">Highest priority</Link></li>
        <li><Link href="/dashboard/opportunities/recent">Recently analyzed</Link></li>
      </ul>
      <p>Widgets for processing rate, analysis health, and queue sizes will appear here.</p>
    </main>
  )
}
