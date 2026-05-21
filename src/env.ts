import dotenv from 'dotenv'

dotenv.config()

function parseDiscordConfig(): {
  clientId: string
  botToken: string
  isBotEnabled: boolean
} {
  if (typeof process.env.DISCORD_CONFIG !== 'string') {
    throw Error('The DISCORD_CONFIG env variable is missing')
  }

  const errorMsgMalformed = 'The DISCORD_CONFIG env variable is malformed'
  try {
    const json = JSON.parse(process.env.DISCORD_CONFIG)
    if (
      typeof json.clientId === 'string' &&
      typeof json.botToken === 'string' &&
      typeof json.isBotEnabled === 'boolean'
    ) {
      return {
        clientId: json.clientId,
        botToken: json.botToken,
        isBotEnabled: json.isBotEnabled,
      }
    }
  } catch {
    throw Error(errorMsgMalformed)
  }
  throw Error(errorMsgMalformed)
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
