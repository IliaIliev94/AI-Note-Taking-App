import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import z, { email } from 'zod'
import bcrypt from 'bcrypt'
import db from '../db'
import { eq } from 'drizzle-orm'
import { users } from '../db/schema'
import jwt from 'jsonwebtoken'
import 'dotenv/config'
import { config } from '../config'
import { setCookie } from 'hono/cookie'

const schema = z.object({
  name: z.string().optional(),
  email: z.email(),
  password: z.string().min(8),
})

const auth = new Hono()

auth.post('/register', zValidator('json', schema), async (c) => {
  const data = c.req.valid('json')
  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, data.email),
  })
  if (existingUser) {
    return c.json({ error: 'User with same email already exists' }, 400)
  }
  const hashedPassword = await bcrypt.hash(data.password, 12)
  const user = await db
    .insert(users)
    .values({
      email: data.email,
      passwordHash: hashedPassword,
      name: data.name,
    })
    .returning({ email: users.email, name: users.name })

  return c.json(
    { message: 'User created successfully', user: user.find(Boolean) },
    201
  )
})

auth.post('/login', zValidator('json', schema), async (c) => {
  const data = c.req.valid('json')
  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, data.email),
  })
  if (!existingUser) {
    return c.json({ error: 'No user exists with that email' }, 400)
  }
  const isMatch = await bcrypt.compare(data.password, existingUser.passwordHash)
  if (!isMatch) {
    return c.json({ error: 'Incorrect login credentials' }, 400)
  }
  const accessToken = jwt.sign(
    {
      sub: existingUser.id,
    },
    config.jwt.accessSecret,
    { expiresIn: config.jwt.accessExpiry }
  )
  const refreshToken = jwt.sign(
    {
      sub: existingUser.id,
    },
    config.jwt.refreshSecret,
    { expiresIn: config.jwt.refreshExpiry }
  )
  setCookie(c, 'access_token', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax',
    maxAge: 60 * 15,
    path: '/',
  })
  setCookie(c, 'refresh_token', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })
  return c.json({
    message: 'Login successful',
    user: { name: existingUser.name, email: existingUser.email },
  })
})

export default auth
