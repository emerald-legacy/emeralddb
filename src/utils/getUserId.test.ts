import test from 'ava'
import express from 'express'
import { asyncHandler } from './asyncHandler'
import { getUserId } from './getUserId'

async function requestMe(
  setAuth: express.RequestHandler
): Promise<{ status: number; body: string }> {
  const app = express()
  app.set('env', 'test') // keeps Express's default error handler from logging
  app.get(
    '/me',
    setAuth,
    asyncHandler(async (req) => ({ userId: getUserId(req) }))
  )

  const server = app.listen(0)
  try {
    const address = server.address()
    if (address === null || typeof address === 'string') {
      throw new Error('Expected a TCP server address')
    }
    const { port } = address
    const response = await fetch(`http://localhost:${port}/me`)
    return { status: response.status, body: await response.text() }
  } finally {
    server.close()
  }
}

test('getUserId returns the sub of the authenticated user', async (t) => {
  const result = await requestMe((req, _res, next) => {
    req.auth = { iss: '', sub: 'auth0|123', aud: [], iat: 0, exp: 0, azp: '', scope: '' }
    next()
  })
  t.is(result.status, 200)
  t.deepEqual(JSON.parse(result.body), { userId: 'auth0|123' })
})

test('getUserId responds with 401 when the request is not authenticated', async (t) => {
  const result = await requestMe((_req, _res, next) => next())
  t.is(result.status, 401)
})
