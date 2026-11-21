import '../testEnv'
import test from 'ava'
import express from 'express'
import type { Deck, Decklist, DecklistComment, User } from '@5rdb/api'
import { asyncHandler } from '../utils/asyncHandler'
import { sendRequest } from '../testUtils'
import { validate } from '../middlewares/validator'
import * as createDeck from './createDeck'
import * as createDecklist from './createDecklist'
import * as createDecklistComment from './createDecklistComment'
import * as deleteDeck from './deleteDeck'
import * as deleteDecklist from './deleteDecklist'
import * as deleteDecklistComment from './deleteDecklistComment'
import * as getAllDecksForUser from './getAllDecksForUser'
import * as publishDecklist from './publishDecklist'
import * as unpublishDecklist from './unpublishDecklist'
import * as updateDecklistComment from './updateDecklistComment'
// `import = require` keeps the module objects assignable, so the tests can stub their
// exports. The handlers see the stubs through the re-exports in gateways/storage.
import deckStore = require('../gateways/storage/private/deck')
import decklistStore = require('../gateways/storage/private/decklist')
import commentStore = require('../gateways/storage/private/decklist_comment')
import userStore = require('../gateways/storage/private/user')

// Decks, decklists and comments refer to users by public_id. The handlers must compare
// it with the logged-in user's public_id, never with the Auth0 id from the token.
const alice: User = { id: 'auth0|alice', public_id: 'public-alice', name: 'Alice', roles: [] }
const bob: User = { id: 'auth0|bob', public_id: 'public-bob', name: 'Bob', roles: [] }

const alicesDeck: Deck = { id: 'deck-a', owner_id: alice.public_id }
const alicesDecklist: Decklist = {
  id: 'decklist-a',
  deck_id: alicesDeck.id,
  format: 'emerald',
  name: 'A deck',
  version_number: '1.0',
  cards: {},
  created_at: new Date('2026-01-01'),
  owner_id: alice.public_id,
}
const alicesComment: DecklistComment = {
  id: 'comment-a',
  decklist_id: alicesDecklist.id,
  author_id: alice.public_id,
  comment: 'Hello',
  created_at: new Date('2026-01-02'),
}

interface Writes {
  decks: Omit<Deck, 'id'>[]
  decklists: Omit<Decklist, 'id' | 'created_at'>[]
  comments: Omit<DecklistComment, 'id' | 'created_at' | 'edited_at'>[]
  deleted: string[]
  changed: string[]
}

function stubStores(): Writes {
  const writes: Writes = { decks: [], decklists: [], comments: [], deleted: [], changed: [] }
  userStore.getOrInsertDBUser = async (id) => {
    const user = [alice, bob].find((candidate) => candidate.id === id)
    if (!user) throw new Error(`unexpected user ${id}`)
    return user
  }
  deckStore.getDeck = async (id) => (id === alicesDeck.id ? alicesDeck : undefined)
  deckStore.getDecksForOwner = async (ownerId) =>
    ownerId === alicesDeck.owner_id ? [alicesDeck] : []
  deckStore.insertDeckOnce = async (deck) => {
    writes.decks.push(deck)
    return { deck, inserted: true }
  }
  deckStore.deleteDeck = async (id) => {
    writes.deleted.push(id)
  }
  decklistStore.getDecklist = async (id) => (id === alicesDecklist.id ? alicesDecklist : undefined)
  decklistStore.getAllDecklistsForDeck = async () => []
  decklistStore.insertDecklist = async (decklist) => {
    writes.decklists.push(decklist)
    return { ...decklist, id: 'decklist-new', created_at: new Date() }
  }
  decklistStore.insertDecklistOnce = async (decklist) => {
    writes.decklists.push(decklist)
    return { decklist: { ...decklist, created_at: new Date() }, inserted: true }
  }
  decklistStore.deleteDecklist = async (id) => {
    writes.deleted.push(id)
  }
  decklistStore.publishDecklist = async (id) => {
    writes.changed.push(id)
    return alicesDecklist
  }
  decklistStore.unpublishDecklist = async (id) => {
    writes.changed.push(id)
    return alicesDecklist
  }
  commentStore.getComment = async (id) => (id === alicesComment.id ? alicesComment : undefined)
  commentStore.insertComment = async (comment) => {
    writes.comments.push(comment)
    return { ...comment, id: 'comment-new', created_at: new Date() }
  }
  commentStore.editComment = async (id) => {
    writes.changed.push(id)
    return alicesComment
  }
  commentStore.deleteComment = async (id) => {
    writes.deleted.push(id)
  }
  return writes
}

function requestAs(
  user: User,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  path: string,
  body?: unknown
) {
  const app = express()
  app.use(express.json())
  // Stands in for authorizedOnly: the token's subject is the Auth0 id
  app.use((req, _res, next) => {
    req.auth = { iss: '', sub: user.id, aud: [], iat: 0, exp: 0, azp: '', scope: '' }
    next()
  })
  app.post('/decks', asyncHandler(getAllDecksForUser.handler))
  app.put('/decks', validate(createDeck.schema), asyncHandler(createDeck.handler))
  app.delete('/decks/:deckId', asyncHandler(deleteDeck.handler))
  app.put('/decklists', validate(createDecklist.schema), asyncHandler(createDecklist.handler))
  app.delete('/decklists/:decklistId', asyncHandler(deleteDecklist.handler))
  app.post('/decklists/:decklistId/publish', asyncHandler(publishDecklist.handler))
  app.post('/decklists/:decklistId/unpublish', asyncHandler(unpublishDecklist.handler))
  app.put(
    '/comments',
    validate(createDecklistComment.schema),
    asyncHandler(createDecklistComment.handler)
  )
  app.post(
    '/comments/:id',
    validate(updateDecklistComment.schema),
    asyncHandler(updateDecklistComment.handler)
  )
  app.delete('/comments/:id', asyncHandler(deleteDecklistComment.handler))
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

// --- creating: the owner is always the logged-in user ----------------------------------

test.serial('a new deck belongs to the logged-in user', async (t) => {
  const writes = stubStores()
  const response = await requestAs(bob, 'PUT', '/decks', {})
  t.is(response.status, 200)
  t.deepEqual(
    writes.decks.map((deck) => deck.owner_id),
    [bob.public_id]
  )
  t.like(response.body, { owner_id: bob.public_id })
})

test.serial('a new version of an own deck belongs to its owner', async (t) => {
  const writes = stubStores()
  const response = await requestAs(alice, 'PUT', '/decklists', newVersion)
  t.is(response.status, 200)
  t.is(writes.decklists.length, 1)
  t.is(writes.decklists[0].owner_id, alice.public_id)
})

test.serial('server-owned fields in the body are rejected and nothing is saved', async (t) => {
  const writes = stubStores()
  for (const serverOwned of [
    { owner_id: bob.public_id },
    { user_id: bob.id },
    // Publishing goes through POST /decklists/:id/publish, which validates the deck
    { published_date: '2026-01-01T00:00:00.000Z' },
  ]) {
    const response = await requestAs(alice, 'PUT', '/decklists', { ...newVersion, ...serverOwned })
    t.is(response.status, 400, Object.keys(serverOwned)[0])
  }
  t.deepEqual(writes.decklists, [])
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

test.serial('a new comment belongs to the logged-in user', async (t) => {
  const writes = stubStores()
  const response = await requestAs(bob, 'PUT', '/comments', {
    comment: 'Nice',
    decklist_id: alicesDecklist.id,
  })
  t.is(response.status, 200)
  t.deepEqual(
    writes.comments.map((comment) => comment.author_id),
    [bob.public_id]
  )
})

// --- reading own decks -----------------------------------------------------------------

test.serial("the deck list contains the logged-in user's decks only", async (t) => {
  stubStores()
  const forAlice = await requestAs(alice, 'POST', '/decks')
  const forBob = await requestAs(bob, 'POST', '/decks')
  t.like(forAlice.body, [{ id: alicesDeck.id }])
  t.deepEqual(forBob.body, [])
})

// --- changing and deleting: owner only -------------------------------------------------

const ownerOnly: {
  name: string
  method: 'POST' | 'DELETE'
  path: string
  body?: unknown
  changes: 'deleted' | 'changed'
}[] = [
  { name: 'deleting a deck', method: 'DELETE', path: '/decks/deck-a', changes: 'deleted' },
  {
    name: 'deleting a decklist',
    method: 'DELETE',
    path: '/decklists/decklist-a',
    changes: 'deleted',
  },
  {
    name: 'unpublishing a decklist',
    method: 'POST',
    path: '/decklists/decklist-a/unpublish',
    changes: 'changed',
  },
  {
    name: 'editing a comment',
    method: 'POST',
    path: '/comments/comment-a',
    body: { comment: 'Changed' },
    changes: 'changed',
  },
  { name: 'deleting a comment', method: 'DELETE', path: '/comments/comment-a', changes: 'deleted' },
]

for (const action of ownerOnly) {
  test.serial(`${action.name} works for the owner`, async (t) => {
    const writes = stubStores()
    const response = await requestAs(alice, action.method, action.path, action.body)
    t.is(response.status, 200)
    t.true(writes[action.changes].length > 0)
  })

  test.serial(`${action.name} is a 403 for anyone else`, async (t) => {
    const writes = stubStores()
    const response = await requestAs(bob, action.method, action.path, action.body)
    t.is(response.status, 403)
    t.deepEqual(writes[action.changes], [])
  })
}

// Publishing an own deck runs the deck validator against the database, so only the
// rejection is tested here
test.serial("publishing someone else's decklist is a 403", async (t) => {
  const writes = stubStores()
  const response = await requestAs(bob, 'POST', '/decklists/decklist-a/publish')
  t.is(response.status, 403)
  t.deepEqual(writes.changed, [])
})
