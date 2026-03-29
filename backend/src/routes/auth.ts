import { zValidator } from '@hono/zod-validator'
import { Context, Hono } from 'hono'
import z, { email } from 'zod'
import bcrypt from 'bcrypt'
import db from '../db'
import { and, eq, gt, isNull } from 'drizzle-orm'
import { refreshTokens, users } from '../db/schema'
import jwt from 'jsonwebtoken'
import 'dotenv/config'
import { config } from '../config'
import { getCookie, setCookie } from 'hono/cookie'
import crypto from 'crypto'

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
  const tokenHash = crypto
    .createHash('sha256')
    .update(refreshToken)
    .digest('hex')
  await db.insert(refreshTokens).values({
    userId: existingUser.id,
    tokenHash: tokenHash,
    expiresAt: new Date(Date.now() + config.jwt.refreshExpiryNumerical * 1000), // 7 days
  })
  setTokenCookies({ c, accessToken, refreshToken })
  return c.json({
    message: 'Login successful',
    user: { name: existingUser.name, email: existingUser.email },
  })
})

auth.post('/refresh', async (c) => {
  const refreshToken = getCookie(c, 'refresh_token')
  if (!refreshToken) {
    return c.json(
      { error: 'Invalid request! Refresh token not passed in cookies' },
      401
    )
  }
  try {
    const payload = jwt.verify(refreshToken, config.jwt.refreshSecret) as {
      sub: string
    }
    const tokenHash = crypto
      .createHash('sha256')
      .update(refreshToken)
      .digest('hex')

    const storedToken = await db.query.refreshTokens.findFirst({
      where: and(
        eq(refreshTokens.tokenHash, tokenHash),
        eq(refreshTokens.userId, payload.sub),
        isNull(refreshTokens.revokedAt),
        gt(refreshTokens.expiresAt, new Date())
      ),
    })
    if (!storedToken) {
      return c.json({ error: 'Token has expired or is invalid' }, 401)
    }
    const accessToken = jwt.sign(
      {
        sub: storedToken.userId,
      },
      config.jwt.accessSecret,
      { expiresIn: config.jwt.accessExpiry }
    )
    const newRefreshToken = jwt.sign(
      {
        sub: storedToken.userId,
      },
      config.jwt.refreshSecret,
      { expiresIn: config.jwt.refreshExpiry }
    )
    const newRefreshTokenHash = crypto
      .createHash('sha256')
      .update(newRefreshToken)
      .digest('hex')
    await db.insert(refreshTokens).values({
      userId: payload.sub,
      tokenHash: newRefreshTokenHash,
      expiresAt: new Date(
        Date.now() + config.jwt.refreshExpiryNumerical * 1000
      ),
    })
    await db
      .update(refreshTokens)
      .set({ revokedAt: new Date() })
      .where(eq(refreshTokens.tokenHash, tokenHash))
    setTokenCookies({ c, accessToken, refreshToken })
    return c.text('', 200)
  } catch (error) {
    return c.json({ error: 'Invalid refresh token' }, 400)
  }
})

function setTokenCookies({
  c,
  accessToken,
  refreshToken,
}: {
  c: Context
  accessToken: string
  refreshToken: string
}) {
  const isProductionConfig = process.env.NODE_ENV === 'production'
  setCookie(c, 'access_token', accessToken, {
    httpOnly: true,
    secure: isProductionConfig,
    sameSite: 'Lax',
    maxAge: config.jwt.accessExpiryNumerical,
    path: '/',
  })
  setCookie(c, 'refresh_token', refreshToken, {
    httpOnly: true,
    secure: isProductionConfig,
    sameSite: 'Lax',
    maxAge: config.jwt.refreshExpiryNumerical,
    path: '/',
  })
}

export default auth
