import Link from 'next/link'

export default function PaymentsIndex() {
  return (
    <main style={{ padding: 20 }}>
      <h1>Payment Guardian & Contracts</h1>
      <ul>
        <li><Link href="/dashboard/payments/contracts">Active Contracts</Link></li>
        <li><Link href="/dashboard/payments/deposits">Deposits Awaiting Verification</Link></li>
        <li><Link href="/dashboard/payments/authorized">Authorized Jobs</Link></li>
        <li><Link href="/dashboard/payments/outstanding">Outstanding Balances</Link></li>
      </ul>
      <p>Placeholder dashboards for payment and contract state.</p>
    </main>
  )
}
