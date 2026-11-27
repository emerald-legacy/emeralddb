import test from 'ava'
import express from 'express'
import { sendRequest } from '../testUtils'
import { apiNotFound } from './apiNotFound'
import { cacheControl } from './cacheControl'

// Like app.ts: the API, then the client app for every other path
function app() {
  const server = express()
  server.use('/api', cacheControl)
  const api = express.Router()
  api.get('/cards', (_req, res) => {
    res.json([])
  })
  server.use('/api', api)
  server.use('/api', apiNotFound)
  server.get('/*path', (_req, res) => {
    res.send('<html>client app</html>')
  })
  return server
}

test('an unknown API path is a JSON 404, not the client app (regression)', async (t) => {
  const response = await sendRequest(app(), 'GET', '/api/no-such-endpoint')
  t.is(response.status, 404)
  t.deepEqual(response.body, { message: 'No API endpoint for GET /api/no-such-endpoint' })
})

test('an unknown method on an API path is a JSON 404 too', async (t) => {
  const response = await sendRequest(app(), 'DELETE', '/api/cards')
  t.is(response.status, 404)
  t.like(response.body, { message: 'No API endpoint for DELETE /api/cards' })
})

test('known API paths and client app paths still work', async (t) => {
  t.deepEqual((await sendRequest(app(), 'GET', '/api/cards')).body, [])
  t.is((await sendRequest(app(), 'GET', '/decks/some-deck')).body, '<html>client app</html>')
})

test('the 404 is not cached', async (t) => {
  const server = app().listen(0)
  try {
    const address = server.address()
    if (address === null || typeof address === 'string') throw new Error('no TCP address')
    const response = await fetch(`http://localhost:${address.port}/api/no-such-endpoint`)
    t.is(response.headers.get('cache-control'), 'no-store')
  } finally {
    server.close()
  }
})
