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

export default {
  databaseUrl: String(process.env.DATABASE_URL),
  host: String(process.env.HOST),
  jwtSecret: String(process.env.JWT_SECRET),
  nodeEnv: String(process.env.NODE_ENV).trim(),
  serverPort: parseInt(String(process.env.PORT), 10),
  dataDirectory: String(process.env.DATA_DIRECTORY),
  auth0Domain: String(process.env.AUTH0_DOMAIN),
  auth0ClientId: String(process.env.AUTH0_CLIENT_ID),
  betaUrl: String(process.env.BETA_URL),
  discord: parseDiscordConfig(),
}
