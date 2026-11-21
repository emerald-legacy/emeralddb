import '../testEnv'
import test from 'ava'
import express from 'express'
import type { User } from '@5rdb/api'
import { asyncHandler } from '../utils/asyncHandler'
import { sendRequest } from '../testUtils'
import { validate } from '../middlewares/validator'
import * as updateUser from './updateUser'
// `import = require` keeps the module object assignable, so the tests can stub its exports
import userStore = require('../gateways/storage/private/user')

const alice: User = { id: 'auth0|alice', public_id: 'public-alice', name: 'Alice', roles: [] }

function stubStore(): Pick<User, 'id' | 'name'>[] {
  const updates: Pick<User, 'id' | 'name'>[] = []
  userStore.getOrInsertDBUser = async () => alice
  userStore.updateUser = async (user) => {
    updates.push(user)
    return { ...alice, name: user.name }
  }
  return updates
}

function rename(body: unknown) {
  const app = express()
  app.use(express.json())
  // Stands in for authorizedOnly: the token's subject is the Auth0 id
  app.use((req, _res, next) => {
    req.auth = { iss: '', sub: alice.id, aud: [], iat: 0, exp: 0, azp: '', scope: '' }
    next()
  })
  app.put('/users/me', validate(updateUser.schema), asyncHandler(updateUser.handler))
  return sendRequest(app, 'PUT', '/users/me', body)
}

test.serial('the name alone renames the logged-in user', async (t) => {
  const updates = stubStore()
  const response = await rename({ name: 'Alicia' })
  t.is(response.status, 200)
  t.deepEqual(updates, [{ id: alice.id, name: 'Alicia' }])
  t.like(response.body, { name: 'Alicia' })
})

test.serial('older clients that send their own id still work', async (t) => {
  const updates = stubStore()
  const response = await rename({ id: alice.id, name: 'Alicia' })
  t.is(response.status, 200)
  t.deepEqual(updates, [{ id: alice.id, name: 'Alicia' }])
})

test.serial("someone else's id is a 403", async (t) => {
  const updates = stubStore()
  const response = await rename({ id: 'auth0|bob', name: 'Alicia' })
  t.is(response.status, 403)
  t.deepEqual(updates, [])
})
