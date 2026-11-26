// Import this first in tests that load handlers or gateways: env.ts reads
// DISCORD_CONFIG when it's loaded and throws if it's missing. The middlewares and the API
// read AUTH0_DOMAIN and AUTH0_CLIENT_ID the same way.
process.env.DISCORD_CONFIG =
  process.env.DISCORD_CONFIG || JSON.stringify({ clientId: '', botToken: '', isBotEnabled: false })
process.env.AUTH0_DOMAIN = process.env.AUTH0_DOMAIN || 'test.auth0.com'
process.env.AUTH0_CLIENT_ID = process.env.AUTH0_CLIENT_ID || 'test-client-id'
