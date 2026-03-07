import 'dotenv/config'
import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { testConnection } from './db'

const app = new Hono()

app.get('/', (c) => {
  return c.json({ message: 'Hello from NoteSync API!' })
})

app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  })
})

await testConnection();

const port = 3000
console.log(`🚀 Server is running on http://localhost:${port}`)

serve({
  fetch: app.fetch,
  port,
})
