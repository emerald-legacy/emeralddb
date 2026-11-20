// Import this first in tests that load handlers or gateways: env.ts reads
// DISCORD_CONFIG when it's loaded and throws if it's missing.
process.env.DISCORD_CONFIG =
  process.env.DISCORD_CONFIG || JSON.stringify({ clientId: '', botToken: '', isBotEnabled: false })
