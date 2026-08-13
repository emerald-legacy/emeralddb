import test from 'ava'
import type { NextFunction, Request, Response } from 'express'
import { validate } from '../middlewares/validator'

process.env.DISCORD_CONFIG =
  process.env.DISCORD_CONFIG || JSON.stringify({ clientId: '', botToken: '', isBotEnabled: false })

const { schema: renameSchema } = require('./renameCard')
const { schema: deleteSchema } = require('./deleteCard')
const { schema: createSchema } = require('./createCard')
const { schema: updateSchema } = require('./updateCard')

interface ResSpy {
  res: Response
  statusCalls: number[]
  sendCalls: unknown[]
}

function makeResSpy(): ResSpy {
  const statusCalls: number[] = []
  const sendCalls: unknown[] = []
  const res = {
    status(code: number) {
      statusCalls.push(code)
      return res
    },
    send(payload: unknown) {
      sendCalls.push(payload)
      return res
    },
  } as unknown as Response
  return { res, statusCalls, sendCalls }
}

function makeNextSpy(): { next: NextFunction; state: { calls: number } } {
  const state = { calls: 0 }
  const next = (() => {
    state.calls += 1
  }) as unknown as NextFunction
  return { next, state }
}

function runValidation(schema: Parameters<typeof validate>[0], body: unknown) {
  const req = { body, query: {} } as unknown as Request
  const { res, statusCalls, sendCalls } = makeResSpy()
  const nextSpy = makeNextSpy()
  validate(schema)(req, res, nextSpy.next)
  return { statusCalls, sendCalls, nextCalls: nextSpy.state.calls, req }
}

test('rename: empty nameExtra is accepted (regression for the 400 bug)', (t) => {
  const { statusCalls, nextCalls } = runValidation(renameSchema, {
    existingCardId: 'old-id',
    newCardId: 'new-id',
    name: 'New Name',
    nameExtra: '',
  })
  t.is(nextCalls, 1, 'passes control to the next handler')
  t.deepEqual(statusCalls, [], 'never responds with an error status')
})

test('rename: fully populated body is accepted', (t) => {
  const { statusCalls, nextCalls } = runValidation(renameSchema, {
    existingCardId: 'old-id',
    newCardId: 'new-id',
    name: 'New Name',
    nameExtra: 'Extra',
  })
  t.is(nextCalls, 1)
  t.deepEqual(statusCalls, [])
})

test('rename: missing required newCardId is rejected with 400', (t) => {
  const { statusCalls, sendCalls, nextCalls } = runValidation(renameSchema, {
    existingCardId: 'old-id',
    name: 'New Name',
  })
  t.is(nextCalls, 0, 'does not fall through to the handler')
  t.deepEqual(statusCalls, [400])
  t.is(sendCalls.length, 1, 'sends an error payload')
})

test('delete: empty replacementCardId is accepted (regression for the 400 bug)', (t) => {
  const { statusCalls, nextCalls } = runValidation(deleteSchema, {
    replacementCardId: '',
  })
  t.is(nextCalls, 1)
  t.deepEqual(statusCalls, [])
})

const validCard = {
  id: 'card-id',
  name: 'Card Name',
  faction: 'crab',
  side: 'dynasty',
  type: 'character',
  is_unique: false,
}

test('create: valid card with all required fields is accepted', (t) => {
  const { statusCalls, nextCalls } = runValidation(createSchema, validCard)
  t.is(nextCalls, 1)
  t.deepEqual(statusCalls, [])
})

test('create: empty nameExtra is accepted (regression for the 400 bug)', (t) => {
  const { statusCalls, nextCalls } = runValidation(createSchema, {
    ...validCard,
    name_extra: '',
  })
  t.is(nextCalls, 1)
  t.deepEqual(statusCalls, [])
})

test('create: missing required faction is now rejected with 400', (t) => {
  const { faction, ...withoutFaction } = validCard
  void faction
  const { statusCalls, nextCalls } = runValidation(createSchema, withoutFaction)
  t.is(nextCalls, 0)
  t.deepEqual(statusCalls, [400])
})

test('create: empty text is accepted', (t) => {
  const { statusCalls, nextCalls } = runValidation(createSchema, {
    ...validCard,
    text: '',
  })
  t.is(nextCalls, 1)
  t.deepEqual(statusCalls, [])
})

test('update: empty text and empty role_restrictions array are accepted', (t) => {
  const { statusCalls, nextCalls } = runValidation(updateSchema, {
    ...validCard,
    text: '',
    role_restrictions: [],
  })
  t.is(nextCalls, 1)
  t.deepEqual(statusCalls, [])
})

// --- null-valued optional fields -------------------------------------------
// Optional card columns are NULL in the database, so the editor sends null when a field is
// cleared. Joi rejects null unless it is explicitly allowed.

// The exact payload from the CardEditor dialog that returned 400.
const cardEditorPayload = {
  allowed_clans: ['crane'],
  banned_in: [],
  cost: '5',
  deck_limit: 3,
  elements: [],
  faction: 'crane',
  fate: null,
  glory: 2,
  honor: null,
  id: 'daidoji-hiroteru',
  influence_cost: null,
  influence_pool: null,
  is_unique: true,
  military: '4',
  military_bonus: null,
  name: 'Daidōji Hiroteru',
  name_extra: null,
  political: '2',
  political_bonus: null,
  restricted_in: [],
  role_restrictions: [],
  side: 'dynasty',
  splash_banned_in: [],
  strength: null,
  strength_bonus: null,
  text: 'While this character is dishonored...',
  traits: ['bushi', 'shinobi', 'commander'],
  type: 'character',
}

test('update: the CardEditor payload with null optional fields is accepted', (t) => {
  const { statusCalls, nextCalls } = runValidation(updateSchema, cardEditorPayload)
  t.is(nextCalls, 1)
  t.deepEqual(statusCalls, [])
})

test('create: the CardEditor payload with null optional fields is accepted', (t) => {
  const { statusCalls, nextCalls } = runValidation(createSchema, cardEditorPayload)
  t.is(nextCalls, 1)
  t.deepEqual(statusCalls, [])
})

test('update: a character without military/political values is accepted (dash on the card)', (t) => {
  const { statusCalls, nextCalls } = runValidation(updateSchema, {
    ...cardEditorPayload,
    military: null,
    political: null,
  })
  t.is(nextCalls, 1)
  t.deepEqual(statusCalls, [])
})

test('update: null in a required field is still rejected', (t) => {
  const { statusCalls, nextCalls } = runValidation(updateSchema, {
    ...cardEditorPayload,
    faction: null,
  })
  t.is(nextCalls, 0)
  t.deepEqual(statusCalls, [400])
})

test('update: an unknown key is still rejected', (t) => {
  const { statusCalls, nextCalls } = runValidation(updateSchema, {
    ...cardEditorPayload,
    unexpected: 'x',
  })
  t.is(nextCalls, 0)
  t.deepEqual(statusCalls, [400])
})

test('rename: a null nameExtra is accepted', (t) => {
  const { statusCalls, nextCalls } = runValidation(renameSchema, {
    existingCardId: 'a',
    newCardId: 'b',
    name: 'B',
    nameExtra: null,
  })
  t.is(nextCalls, 1)
  t.deepEqual(statusCalls, [])
})

test('delete: a null replacementCardId is accepted', (t) => {
  const { statusCalls, nextCalls } = runValidation(deleteSchema, { replacementCardId: null })
  t.is(nextCalls, 1)
  t.deepEqual(statusCalls, [])
})
