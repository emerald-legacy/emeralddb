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

// Without these, the server would start and fail every request that needs them
function required(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw Error(`The ${name} env variable is missing`)
  }
  return value
}

export default {
  databaseUrl: String(process.env.DATABASE_URL),
  host: String(process.env.HOST),
  nodeEnv: String(process.env.NODE_ENV).trim(),
  serverPort: parseInt(String(process.env.PORT), 10),
  auth0Domain: required('AUTH0_DOMAIN'),
  auth0ClientId: required('AUTH0_CLIENT_ID'),
  betaUrl: String(process.env.BETA_URL),
  discord: parseDiscordConfig(),
}
