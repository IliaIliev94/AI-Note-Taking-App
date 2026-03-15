import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import z, { email } from 'zod'
import bcrypt from 'bcrypt'
import db from '../db'
import { eq } from 'drizzle-orm'
import { users } from '../db/schema'

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
    return c.json({ error: 'User with same email already exists' }, 404)
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

export default auth
