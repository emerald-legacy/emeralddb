import '../testEnv'
import test from 'ava'
import express from 'express'
import type { Decklist, DecklistComment, User } from '@5rdb/api'
import { asyncHandler } from '../utils/asyncHandler'
import { sendRequest } from '../testUtils'
import { validate } from '../middlewares/validator'
import * as createDecklistComment from './createDecklistComment'
// `import = require` keeps the module objects assignable, so the tests can stub their exports
import decklistStore = require('../gateways/storage/private/decklist')
import commentStore = require('../gateways/storage/private/decklist_comment')
import userStore = require('../gateways/storage/private/user')

const alice: User = { id: 'auth0|alice', public_id: 'public-alice', name: 'Alice', roles: [] }

function decklist(id: string): Decklist {
  return {
    id,
    deck_id: 'deck',
    format: 'emerald',
    name: 'A deck',
    version_number: '1.0',
    cards: {},
    created_at: new Date('2026-01-01'),
    owner_id: alice.public_id,
  }
}

const commentOnFirst: DecklistComment = {
  id: 'comment-on-first',
  decklist_id: 'first',
  author_id: alice.public_id,
  comment: 'Hello',
  created_at: new Date('2026-01-02'),
}

function stubStores(): Omit<DecklistComment, 'id' | 'created_at' | 'edited_at'>[] {
  const inserted: Omit<DecklistComment, 'id' | 'created_at' | 'edited_at'>[] = []
  userStore.getOrInsertDBUser = async () => alice
  decklistStore.getDecklist = async (id) =>
    ['first', 'second'].includes(id) ? decklist(id) : undefined
  commentStore.getComment = async (id) => (id === commentOnFirst.id ? commentOnFirst : undefined)
  commentStore.insertComment = async (comment) => {
    inserted.push(comment)
    return { ...comment, id: 'new-comment', created_at: new Date() }
  }
  return inserted
}

function comment(body: unknown) {
  const app = express()
  app.use(express.json())
  // Stands in for authorizedOnly: the token's subject is the Auth0 id
  app.use((req, _res, next) => {
    req.auth = { iss: '', sub: alice.id, aud: [], iat: 0, exp: 0, azp: '', scope: '' }
    next()
  })
  app.put(
    '/comments',
    validate(createDecklistComment.schema),
    asyncHandler(createDecklistComment.handler)
  )
  return sendRequest(app, 'PUT', '/comments', body)
}

test.serial('a comment on a decklist is saved', async (t) => {
  const inserted = stubStores()
  const response = await comment({ comment: 'Nice', decklist_id: 'first' })
  t.is(response.status, 200)
  t.like(inserted, [{ decklist_id: 'first', author_id: alice.public_id }])
})

test.serial('a reply to a comment on the same decklist is saved', async (t) => {
  const inserted = stubStores()
  const response = await comment({
    comment: 'Thanks',
    decklist_id: 'first',
    parent_comment_id: commentOnFirst.id,
  })
  t.is(response.status, 200)
  t.like(inserted, [{ parent_comment_id: commentOnFirst.id }])
})

test.serial('a comment on a decklist that does not exist is a 404 (regression)', async (t) => {
  const inserted = stubStores()
  const response = await comment({ comment: 'Nice', decklist_id: 'no-such-decklist' })
  t.is(response.status, 404)
  t.deepEqual(inserted, [])
})

test.serial('a reply to a comment on another decklist is a 400 (regression)', async (t) => {
  const inserted = stubStores()
  const response = await comment({
    comment: 'Thanks',
    decklist_id: 'second',
    parent_comment_id: commentOnFirst.id,
  })
  t.is(response.status, 400)
  t.deepEqual(inserted, [])
})

test.serial('a reply to a comment that does not exist is a 400', async (t) => {
  const inserted = stubStores()
  const response = await comment({
    comment: 'Thanks',
    decklist_id: 'first',
    parent_comment_id: 'no-such-comment',
  })
  t.is(response.status, 400)
  t.deepEqual(inserted, [])
})
