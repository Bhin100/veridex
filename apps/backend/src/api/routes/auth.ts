import { Router } from 'express'
import { db } from '../../lib/db'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { config } from '../../lib/config'
import { AuthError } from '../../lib/errors/AuthError'

const router = Router()

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body
    if (!email || !password) throw new AuthError('Email and password required')

    const user = await db.user.findUnique({ where: { email } })
    if (!user) throw new AuthError('Invalid credentials')

    const match = await bcrypt.compare(password, user.password)
    if (!match) throw new AuthError('Invalid credentials')

    const token = jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET as string, { expiresIn: '1h' })

    res.cookie(process.env.SESSION_COOKIE_NAME || 'veridex.sid', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    })

    res.json({ status: 'ok' })
  } catch (err) {
    next(err)
  }
})

router.post('/logout', async (req, res) => {
  res.clearCookie(process.env.SESSION_COOKIE_NAME || 'veridex.sid')
  res.json({ status: 'ok' })
})

export default router
