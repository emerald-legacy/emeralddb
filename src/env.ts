import dotenv from 'dotenv'

dotenv.config()

interface DiscordConfig {
  clientId: string
  botToken: string
  isBotEnabled: boolean
}

function isDiscordConfig(value: unknown): value is DiscordConfig {
  return (
    typeof value === 'object' &&
    value !== null &&
    'clientId' in value &&
    typeof value.clientId === 'string' &&
    'botToken' in value &&
    typeof value.botToken === 'string' &&
    'isBotEnabled' in value &&
    typeof value.isBotEnabled === 'boolean'
  )
}

function parseDiscordConfig(): DiscordConfig {
  if (typeof process.env.DISCORD_CONFIG !== 'string') {
    throw Error('The DISCORD_CONFIG env variable is missing')
  }

  const errorMsgMalformed = 'The DISCORD_CONFIG env variable is malformed'
  let json: unknown
  try {
    json = JSON.parse(process.env.DISCORD_CONFIG)
  } catch {
    throw Error(errorMsgMalformed)
  }
  if (!isDiscordConfig(json)) {
    throw Error(errorMsgMalformed)
  }
  // Copy only the known fields, as before
  return { clientId: json.clientId, botToken: json.botToken, isBotEnabled: json.isBotEnabled }
}

function required(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw Error(`The ${name} env variable is missing`)
  }
  return value
}

/**
 * The Auth0 settings. Throws if one is missing, so the server fails at startup instead of
 * failing every request that needs them. A function, not part of the default export:
 * scripts like import:prod load env.ts too and don't need Auth0.
 */
export function auth0Settings(): { domain: string; clientId: string } {
  return { domain: required('AUTH0_DOMAIN'), clientId: required('AUTH0_CLIENT_ID') }
}

export default {
  databaseUrl: String(process.env.DATABASE_URL),
  host: String(process.env.HOST),
  nodeEnv: String(process.env.NODE_ENV).trim(),
  serverPort: parseInt(String(process.env.PORT), 10),
  betaUrl: String(process.env.BETA_URL),
  discord: parseDiscordConfig(),
}
