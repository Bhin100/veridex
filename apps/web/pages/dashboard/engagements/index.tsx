import Link from 'next/link'

export default function EngagementsIndex() {
  return (
    <main style={{ padding: 20 }}>
      <h1>Client Engagements</h1>
      <ul>
        <li><Link href="/dashboard/engagements/workspaces">Client Workspace</Link></li>
        <li><Link href="/dashboard/engagements/drafts">Draft Queue</Link></li>
        <li><Link href="/dashboard/engagements/reviews">Pending Reviews</Link></li>
        <li><Link href="/dashboard/engagements/recent">Recent Engagements</Link></li>
      </ul>
      <p>Workspace, drafts, review queue and recent engagements pod placeholders.</p>
    </main>
  )
}
