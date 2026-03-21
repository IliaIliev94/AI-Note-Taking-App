import { refreshTokens } from './db/schema'

function getEnvVar(key: string): string {
  const value = process.env[key]
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
  return value
}

export const config = {
  jwt: {
    accessSecret: getEnvVar('ACCESS_TOKEN_SECRET'),
    refreshSecret: getEnvVar('REFRESH_TOKEN_SECRET'),
    accessExpiry: '15m' as const,
    refreshExpiry: '7d' as const,
  },
}
