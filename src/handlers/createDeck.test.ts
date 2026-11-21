import '../testEnv'
import test from 'ava'
import express from 'express'
import type { Deck, Decklist, User } from '@5rdb/api'
import { asyncHandler } from '../utils/asyncHandler'
import { sendRequest } from '../testUtils'
import { validate } from '../middlewares/validator'
import * as createDeck from './createDeck'
// `import = require` keeps the module objects assignable, so the tests can stub their exports
import deckStore = require('../gateways/storage/private/deck')
import decklistStore = require('../gateways/storage/private/decklist')
import userStore = require('../gateways/storage/private/user')

const alice: User = { id: 'auth0|alice', public_id: 'public-alice', name: 'Alice', roles: [] }
const bob: User = { id: 'auth0|bob', public_id: 'public-bob', name: 'Bob', roles: [] }
const deckId = '3d9a7e21-5c4b-4f08-8e6d-9b1a2c3f4e5d'

const publishedDecklist: Decklist = {
  id: 'published-decklist',
  deck_id: 'bobs-deck',
  format: 'emerald',
  name: 'Bob’s deck',
  version_number: '2.0',
  cards: { 'some-card': 3 },
  created_at: new Date('2026-01-01'),
  owner_id: bob.public_id,
}

interface Tables {
  decks: Map<string, Deck>
  copies: Omit<Decklist, 'id' | 'created_at'>[]
}

// The decks table keyed by id like the primary key, and the forked copies
function stubStores(): Tables {
  const tables: Tables = { decks: new Map(), copies: [] }
  userStore.getOrInsertDBUser = async (id) => {
    const user = [alice, bob].find((candidate) => candidate.id === id)
    if (!user) throw new Error(`unexpected user ${id}`)
    return user
  }
  deckStore.insertDeckOnce = async (deck) => {
    const existing = tables.decks.get(deck.id)
    if (existing) {
      return { deck: existing, inserted: false }
    }
    tables.decks.set(deck.id, deck)
    return { deck, inserted: true }
  }
  decklistStore.getDecklist = async (id) =>
    id === publishedDecklist.id ? publishedDecklist : undefined
  decklistStore.insertDecklist = async (decklist) => {
    tables.copies.push(decklist)
    return { ...decklist, id: 'copy', created_at: new Date() }
  }
  return tables
}

function create(user: User, body: unknown) {
  const app = express()
  app.use(express.json())
  // Stands in for authorizedOnly: the token's subject is the Auth0 id
  app.use((req, _res, next) => {
    req.auth = { iss: '', sub: user.id, aud: [], iat: 0, exp: 0, azp: '', scope: '' }
    next()
  })
  app.put('/decks', validate(createDeck.schema), asyncHandler(createDeck.handler))
  return sendRequest(app, 'PUT', '/decks', body)
}

test.serial('creating the same deck twice creates it once and returns it both times', async (t) => {
  const tables = stubStores()
  const first = await create(alice, { id: deckId })
  const second = await create(alice, { id: deckId })
  t.is(first.status, 200)
  t.is(second.status, 200)
  t.is(tables.decks.size, 1)
  t.deepEqual(second.body, first.body)
  t.like(second.body, { id: deckId, owner_id: alice.public_id })
})

test.serial('forking the same deck twice copies the version once', async (t) => {
  const tables = stubStores()
  await create(alice, { id: deckId, forkedFrom: publishedDecklist.id })
  await create(alice, { id: deckId, forkedFrom: publishedDecklist.id })
  t.is(tables.decks.size, 1)
  t.is(tables.copies.length, 1)
  t.like(tables.copies[0], { deck_id: deckId, owner_id: alice.public_id })
})

test.serial("the id of someone else's deck is a 409 and copies nothing", async (t) => {
  const tables = stubStores()
  await create(bob, { id: deckId })
  const response = await create(alice, { id: deckId, forkedFrom: publishedDecklist.id })
  t.is(response.status, 409)
  t.is(tables.decks.get(deckId)?.owner_id, bob.public_id)
  t.deepEqual(tables.copies, [])
})

test.serial('without an id, the server picks one and every request creates a deck', async (t) => {
  const tables = stubStores()
  await create(alice, {})
  await create(alice, {})
  t.is(tables.decks.size, 2)
})

test.serial('an id that is not a UUID is rejected', async (t) => {
  const tables = stubStores()
  const response = await create(alice, { id: 'my-own-id' })
  t.is(response.status, 400)
  t.is(tables.decks.size, 0)
})
