import test from 'ava'
import express from 'express'
import type { AddressInfo } from 'net'
import { cacheControl } from './cacheControl'

async function withServer(
  run: (get: (path: string, method?: string) => Promise<Response>) => Promise<void>
): Promise<void> {
  const app = express()
  app.use('/api', cacheControl)
  app.get('/api/cards', (_req, res) => {
    res.json([])
  })
  app.get('/api/cards/:id', (_req, res) => {
    res.sendStatus(404)
  })
  app.get('/api/users/me', (_req, res) => {
    res.json({})
  })
  app.get('/api/auth0', (_req, res) => {
    res.json({})
  })
  app.get('/api/packs/export/:id', (_req, res) => {
    res.json({})
  })
  app.get('/api/broken', (_req, res) => {
    res.status(500).json({ message: 'boom' })
  })
  app.put('/api/cards', (_req, res) => {
    res.json({})
  })

  const server = app.listen(0)
  const { port } = server.address() as AddressInfo
  try {
    await run((path, method = 'GET') => fetch(`http://127.0.0.1:${port}${path}`, { method }))
  } finally {
    await new Promise((resolve) => server.close(resolve))
  }
}

test('successful GET responses are cached for 5 minutes', async (t) => {
  await withServer(async (get) => {
    const response = await get('/api/cards')
    t.is(response.status, 200)
    t.is(response.headers.get('cache-control'), 'public, max-age=300')
  })
})

test('not found responses are not cached', async (t) => {
  await withServer(async (get) => {
    const response = await get('/api/cards/unknown')
    t.is(response.status, 404)
    t.is(response.headers.get('cache-control'), 'no-store')
  })
})

test('server errors are not cached', async (t) => {
  await withServer(async (get) => {
    const response = await get('/api/broken')
    t.is(response.status, 500)
    t.is(response.headers.get('cache-control'), 'no-store')
  })
})

test('the current user is never cached', async (t) => {
  await withServer(async (get) => {
    const response = await get('/api/users/me')
    t.is(response.headers.get('cache-control'), 'no-store')
  })
})

test('the Auth0 configuration is never cached', async (t) => {
  await withServer(async (get) => {
    const response = await get('/api/auth0')
    t.is(response.headers.get('cache-control'), 'no-store')
  })
})

test('pack exports are never cached', async (t) => {
  await withServer(async (get) => {
    const response = await get('/api/packs/export/core')
    t.is(response.headers.get('cache-control'), 'no-store')
  })
})

test('non-GET requests get no cache header from the middleware', async (t) => {
  await withServer(async (get) => {
    const response = await get('/api/cards', 'PUT')
    t.false(response.headers.get('cache-control')?.includes('max-age') ?? false)
  })
})
