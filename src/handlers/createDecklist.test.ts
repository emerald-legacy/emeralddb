import '../testEnv'
import test from 'ava'
import express from 'express'
import type { Deck, Decklist, User } from '@5rdb/api'
import { asyncHandler } from '../utils/asyncHandler'
import { sendRequest } from '../testUtils'
import { validate } from '../middlewares/validator'
import * as createDecklist from './createDecklist'
// `import = require` keeps the module objects assignable, so the tests can stub their exports
import deckStore = require('../gateways/storage/private/deck')
import decklistStore = require('../gateways/storage/private/decklist')
import userStore = require('../gateways/storage/private/user')

const alice: User = { id: 'auth0|alice', public_id: 'public-alice', name: 'Alice', roles: [] }
const firstDeck: Deck = { id: 'deck-1', owner_id: alice.public_id }
const secondDeck: Deck = { id: 'deck-2', owner_id: alice.public_id }
const versionId = '6f1c2a54-8d1e-4f5b-9a37-2c0e8b7d4a19'

const newVersion = {
  id: versionId,
  deck_id: firstDeck.id,
  format: 'emerald',
  name: 'A deck',
  version_number: '1.1',
  cards: { 'some-card': 3 },
  card_pack_ids: { 'some-card': 'core' },
}

// The decklists table, keyed by id like the primary key
function stubStores(): Map<string, Decklist> {
  const decklists = new Map<string, Decklist>()
  userStore.getOrInsertDBUser = async () => alice
  deckStore.getDeck = async (id) => [firstDeck, secondDeck].find((deck) => deck.id === id)
  decklistStore.insertDecklistOnce = async (decklist) => {
    const existing = decklists.get(decklist.id)
    if (existing) {
      return { decklist: existing, inserted: false }
    }
    const inserted = { ...decklist, created_at: new Date() }
    decklists.set(decklist.id, inserted)
    return { decklist: inserted, inserted: true }
  }
  return decklists
}

function save(body: unknown) {
  const app = express()
  app.use(express.json())
  // Stands in for authorizedOnly: the token's subject is the Auth0 id
  app.use((req, _res, next) => {
    req.auth = { iss: '', sub: alice.id, aud: [], iat: 0, exp: 0, azp: '', scope: '' }
    next()
  })
  app.put('/decklists', validate(createDecklist.schema), asyncHandler(createDecklist.handler))
  return sendRequest(app, 'PUT', '/decklists', body)
}

test.serial('saving the same version twice adds it once and returns it both times', async (t) => {
  const decklists = stubStores()
  const first = await save(newVersion)
  const second = await save({ ...newVersion, name: 'Changed in between' })
  t.is(first.status, 200)
  t.is(second.status, 200)
  t.is(decklists.size, 1)
  t.deepEqual(second.body, first.body)
  t.like(second.body, { id: versionId, name: 'A deck' })
})

test.serial('an id that is already a version of another deck is a 409', async (t) => {
  const decklists = stubStores()
  await save(newVersion)
  const response = await save({ ...newVersion, deck_id: secondDeck.id })
  t.is(response.status, 409)
  t.is(decklists.size, 1)
  t.is(decklists.get(versionId)?.deck_id, firstDeck.id)
})

test.serial('without an id, the server picks one and every save adds a version', async (t) => {
  const decklists = stubStores()
  const { id: _id, ...withoutId } = newVersion
  await save(withoutId)
  await save(withoutId)
  t.is(decklists.size, 2)
})

test.serial('an id that is not a UUID is rejected', async (t) => {
  const decklists = stubStores()
  const response = await save({ ...newVersion, id: 'my-own-id' })
  t.is(response.status, 400)
  t.is(decklists.size, 0)
})
