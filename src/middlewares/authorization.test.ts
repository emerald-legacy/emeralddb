import '../testEnv'
import test from 'ava'
import express from 'express'
import type { User } from '@5rdb/api'
import { sendRequest } from '../testUtils'
import { asyncHandler } from '../utils/asyncHandler'
import { requireRole } from './authorization'
// `import = require` keeps the module object assignable, so the test can stub it
import userStore = require('../gateways/storage/private/user')

const admin: User = { id: 'auth0|admin', public_id: 'p-admin', name: 'A', roles: ['data_admin'] }
const player: User = { id: 'auth0|player', public_id: 'p-player', name: 'P', roles: [] }

userStore.getOrInsertDBUser = async (id) => {
  const user = [admin, player].find((candidate) => candidate.id === id)
  if (!user) throw new Error(`unexpected user ${id}`)
  return user
}

function app(user: User | undefined) {
  const server = express()
  // Stands in for authorizedOnly: the token's subject is the Auth0 id
  server.use((req, _res, next) => {
    if (user) {
      req.auth = { iss: '', sub: user.id, aud: [], iat: 0, exp: 0, azp: '', scope: '' }
    }
    next()
  })
  server.post(
    '/cards',
    asyncHandler(requireRole('data_admin')),
    asyncHandler(async () => ({ ok: true }))
  )
  return server
}

test('a user with the role gets through', async (t) => {
  const response = await sendRequest(app(admin), 'POST', '/cards')
  t.is(response.status, 200)
  t.deepEqual(response.body, { ok: true })
})

test('a logged-in user without the role gets a 403, not a 401', async (t) => {
  const response = await sendRequest(app(player), 'POST', '/cards')
  t.is(response.status, 403)
})

test('a request without a login gets a 401', async (t) => {
  const response = await sendRequest(app(undefined), 'POST', '/cards')
  t.is(response.status, 401)
})
