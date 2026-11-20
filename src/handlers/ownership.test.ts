import '../testEnv'
import test from 'ava'
import express from 'express'
import type { Deck, Decklist } from '@5rdb/api'
import { asyncHandler } from '../utils/asyncHandler'
import { sendRequest } from '../testUtils'
import { validate } from '../middlewares/validator'
import * as createDecklist from './createDecklist'
// `import = require` keeps the module objects assignable, so the tests can stub their
// exports. The handlers see the stubs through the re-exports in gateways/storage.
import deckStore = require('../gateways/storage/private/deck')
import decklistStore = require('../gateways/storage/private/decklist')

const alice = 'auth0|alice'
const bob = 'auth0|bob'

const alicesDeck: Deck = { id: 'deck-a', user_id: alice }

interface Writes {
  decklists: Omit<Decklist, 'id' | 'created_at'>[]
}

function stubStores(): Writes {
  const writes: Writes = { decklists: [] }
  deckStore.getDeck = async (id) => (id === alicesDeck.id ? alicesDeck : undefined)
  decklistStore.insertDecklist = async (decklist) => {
    writes.decklists.push(decklist)
    return { ...decklist, id: 'decklist-new', created_at: new Date() }
  }
  return writes
}

function requestAs(userId: string, method: 'PUT', path: string, body?: unknown) {
  const app = express()
  app.use(express.json())
  // Stands in for authorizedOnly: the token's subject is the Auth0 id
  app.use((req, _res, next) => {
    req.auth = { iss: '', sub: userId, aud: [], iat: 0, exp: 0, azp: '', scope: '' }
    next()
  })
  app.put('/decklists', validate(createDecklist.schema), asyncHandler(createDecklist.handler))
  return sendRequest(app, method, path, body)
}

const newVersion = {
  deck_id: alicesDeck.id,
  format: 'emerald',
  name: 'A deck',
  version_number: '1.1',
  cards: { 'some-card': 3 },
  card_pack_ids: { 'some-card': 'core' },
}

test.serial('a new version of an own deck belongs to its owner', async (t) => {
  const writes = stubStores()
  const response = await requestAs(alice, 'PUT', '/decklists', newVersion)
  t.is(response.status, 200)
  t.is(writes.decklists.length, 1)
  t.is(writes.decklists[0].user_id, alice)
})

test.serial("adding a version to someone else's deck is a 403 (regression)", async (t) => {
  const writes = stubStores()
  const response = await requestAs(bob, 'PUT', '/decklists', newVersion)
  t.is(response.status, 403)
  t.deepEqual(writes.decklists, [])
})

test.serial('adding a version to a deck that does not exist is a 404', async (t) => {
  const writes = stubStores()
  const response = await requestAs(alice, 'PUT', '/decklists', {
    ...newVersion,
    deck_id: 'no-such-deck',
  })
  t.is(response.status, 404)
  t.deepEqual(writes.decklists, [])
})
