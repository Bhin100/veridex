import { db } from '../lib/db'
import bcrypt from 'bcrypt'

async function seed() {
  const email = process.env.FOUNDER_EMAIL!
  const pass = process.env.FOUNDER_PASSWORD!

  if (!email || !pass) {
    console.warn('FOUNDER_EMAIL or FOUNDER_PASSWORD not provided; skipping seed')
    return
  }

  const existing = await db.user.findUnique({ where: { email } })
  if (existing) {
    console.log('Founder user already exists; skipping')
    return
  }

  const hashed = await bcrypt.hash(pass, 10)
  await db.user.create({ data: { email, password: hashed, role: 'founder' } })
  console.log('Founder user created')
}

seed().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1) })
