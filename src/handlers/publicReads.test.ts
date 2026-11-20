import '../testEnv'
import test from 'ava'
import express from 'express'
import type { Decklist, DecklistComment, User } from '@5rdb/api'
import { asyncHandler } from '../utils/asyncHandler'
import { makeCard, sendRequest } from '../testUtils'
import * as getDecklist from './getDecklist'
import * as getAllPublishedDecklists from './getAllPublishedDecklists'
import * as getAllCommentsForDecklist from './getAllCommentsForDecklist'
// `import = require` keeps the module objects assignable, so the tests can stub their
// exports. The handlers see the stubs through the re-exports in gateways/storage.
import cardStore = require('../gateways/storage/private/card')
import decklistStore = require('../gateways/storage/private/decklist')
import commentStore = require('../gateways/storage/private/decklist_comment')
import userStore = require('../gateways/storage/private/user')

// Public reads show names by public id and never load whole users: a user row holds the
// Auth0 id, which must not reach a public response.
const alice: User = { id: 'auth0|alice', public_id: 'public-alice', name: 'Alice', roles: [] }
const bob: User = { id: 'auth0|bob', public_id: 'public-bob', name: 'Bob', roles: [] }

function decklist(id: string, owner: User): Decklist {
  return {
    id,
    deck_id: `deck-of-${id}`,
    format: 'emerald',
    name: id,
    version_number: '1.0',
    cards: { 'some-stronghold': 1 },
    created_at: new Date('2026-01-01'),
    published_date: new Date('2026-01-02'),
    owner_id: owner.public_id,
  }
}
const comment: DecklistComment = {
  id: 'comment-1',
  decklist_id: 'list-a',
  author_id: bob.public_id,
  comment: 'Nice',
  created_at: new Date('2026-01-03'),
}

function stubStores() {
  const users = [alice, bob]
  const noWholeUsers = async (): Promise<never> => {
    throw new Error('public reads must not load whole users')
  }
  userStore.getUser = noWholeUsers
  userStore.getOrInsertDBUser = noWholeUsers
  userStore.getUserNames = async (publicIds) =>
    new Map(
      users
        .filter((user) => publicIds.includes(user.public_id))
        .map((user) => [user.public_id, user.name])
    )
  cardStore.getCards = async () => [makeCard({ id: 'some-stronghold', type: 'stronghold' })]
  decklistStore.getDecklist = async (id) =>
    id === 'list-a' ? decklist('list-a', alice) : undefined
  decklistStore.getAllPublishedDecklists = async () => [
    decklist('list-a', alice),
    decklist('list-b', bob),
  ]
  commentStore.getAllCommentsForDecklist = async () => [comment]
}

async function get(path: string) {
  const app = express()
  app.get('/decklists', asyncHandler(getAllPublishedDecklists.handler))
  app.get('/decklists/:decklistId', asyncHandler(getDecklist.handler))
  app.get('/decklists/:decklistId/comments', asyncHandler(getAllCommentsForDecklist.handler))
  const response = await sendRequest(app, 'GET', path)
  return { ...response, json: JSON.stringify(response.body) }
}

function assertNoAuth0Ids(t: import('ava').ExecutionContext, json: string) {
  t.false(json.includes('auth0|'), 'no Auth0 id')
  t.false(json.includes('user_id'), 'no user_id field')
}

test.serial('GET /decklists names each owner', async (t) => {
  stubStores()
  const { status, body, json } = await get('/decklists')
  t.is(status, 200)
  assertNoAuth0Ids(t, json)
  t.like(body, [
    {
      id: 'list-a',
      owner_id: 'public-alice',
      username: 'Alice',
      stronghold: { type: 'stronghold' },
    },
    { id: 'list-b', owner_id: 'public-bob', username: 'Bob' },
  ])
})

test.serial('GET /decklists/:id names the owner', async (t) => {
  stubStores()
  const { status, body, json } = await get('/decklists/list-a')
  t.is(status, 200)
  assertNoAuth0Ids(t, json)
  t.like(body, { id: 'list-a', owner_id: 'public-alice', username: 'Alice' })
})

test.serial('GET /decklists/:id/comments names each author', async (t) => {
  stubStores()
  const { status, body, json } = await get('/decklists/list-a/comments')
  t.is(status, 200)
  assertNoAuth0Ids(t, json)
  t.like(body, [{ id: 'comment-1', author_id: 'public-bob', username: 'Bob' }])
})
