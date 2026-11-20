// Waits until something accepts connections on localhost:<port>, e.g. the dev server.
// Usage: node bin/wait-for-port.mjs 8080
import net from 'node:net'

const port = Number(process.argv[2])
const timeoutMs = 120_000
const startedAt = Date.now()

function tryConnect() {
  const socket = net.connect({ port, host: 'localhost' })
  socket.once('connect', () => {
    socket.end()
    process.exit(0)
  })
  socket.once('error', () => {
    socket.destroy()
    if (Date.now() - startedAt > timeoutMs) {
      console.error(`Nothing is listening on port ${port} after ${timeoutMs / 1000}s`)
      process.exit(1)
    }
    setTimeout(tryConnect, 500)
  })
}

tryConnect()
