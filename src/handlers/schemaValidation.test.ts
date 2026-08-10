import test from 'ava'
import type { NextFunction, Request, Response } from 'express'
import { validate } from '../middlewares/validator'

process.env.DISCORD_CONFIG =
  process.env.DISCORD_CONFIG || JSON.stringify({ clientId: '', botToken: '', isBotEnabled: false })

const { schema: createCycleSchema } = require('./createCycle')
const { schema: createPackSchema } = require('./createPack')
const { schema: importPackSchema } = require('./importPack')
const { schema: updateCardsInPackSchema } = require('./updateCardsInPack')
const { schema: updateCardInPackSchema } = require('./updateCardInPack')
const { schema: deleteCardInPackSchema } = require('./deleteCardInPack')
const { schema: insertOrUpdateFormatSchema } = require('./insertOrUpdateFormat')
const { schema: updateTraitSchema } = require('./updateTrait')
const { schema: deleteTraitSchema } = require('./deleteTrait')
const { schema: createDeckSchema } = require('./createDeck')
const { schema: createDecklistSchema } = require('./createDecklist')
const { schema: validateDecklistSchema } = require('./validateDecklist')
const { schema: updateUserSchema } = require('./updateUser')
const { schema: createRulingSchema } = require('./createRuling')
const { schema: updateRulingSchema } = require('./updateRuling')
const { schema: createCommentSchema } = require('./createDecklistComment')
const { schema: updateCommentSchema } = require('./updateDecklistComment')

type Schema = Parameters<typeof validate>[0]

function runValidation(schema: Schema, body: unknown) {
  const req = { body, query: {} } as unknown as Request
  const statusCalls: number[] = []
  const res = {
    status(code: number) {
      statusCalls.push(code)
      return res
    },
    send() {
      return res
    },
  } as unknown as Response
  let nextCalls = 0
  const next = (() => {
    nextCalls += 1
  }) as unknown as NextFunction
  validate(schema)(req, res, next)
  return { statusCalls, nextCalls }
}

function assertAccepted(
  t: import('ava').ExecutionContext,
  schema: Schema,
  body: unknown,
  msg = ''
) {
  const { statusCalls, nextCalls } = runValidation(schema, body)
  t.is(nextCalls, 1, `accepted: ${msg}`)
  t.deepEqual(statusCalls, [], `no error status: ${msg}`)
}

function assertRejected(
  t: import('ava').ExecutionContext,
  schema: Schema,
  body: unknown,
  msg = ''
) {
  const { statusCalls, nextCalls } = runValidation(schema, body)
  t.is(nextCalls, 0, `rejected: ${msg}`)
  t.deepEqual(statusCalls, [400], `400 status: ${msg}`)
}

// --- createCycle -----------------------------------------------------------

test('createCycle accepts the real client payload', (t) => {
  assertAccepted(t, createCycleSchema, {
    id: 'core',
    name: 'Core Set',
    size: 100,
    position: 1,
    publisher: 'emerald-legacy',
  })
})

test('createCycle rejects a missing required field', (t) => {
  assertRejected(t, createCycleSchema, { id: 'core', size: 100, position: 1, publisher: 'x' })
})

test('createCycle rejects an unknown key', (t) => {
  assertRejected(t, createCycleSchema, {
    id: 'core',
    name: 'Core',
    size: 100,
    position: 1,
    publisher: 'x',
    rotated: false,
  })
})

// --- createPack ------------------------------------------------------------

test('createPack accepts the minimal (ManageCyclesView) payload', (t) => {
  assertAccepted(t, createPackSchema, { cycle_id: 'core', name: 'Pack', id: 'pack1', position: 1 })
})

test('createPack accepts the full (EditPackView) payload', (t) => {
  assertAccepted(t, createPackSchema, {
    id: 'pack1',
    name: 'Pack',
    position: 1,
    cycle_id: 'core',
    publisher_id: 'ffg',
    released_at: '2021-01-01',
    rotated: true,
  })
})

// --- importPack ------------------------------------------------------------

test('importPack accepts pack + cards + cardsInPack', (t) => {
  assertAccepted(t, importPackSchema, { pack: { id: 'p' }, cards: [], cardsInPack: [] })
})

test('importPack rejects a missing required array', (t) => {
  assertRejected(t, importPackSchema, { pack: { id: 'p' }, cards: [] })
})

// --- cards-in-packs --------------------------------------------------------

test('updateCardsInPack accepts a cardsInPacks array', (t) => {
  assertAccepted(t, updateCardsInPackSchema, { cardsInPacks: [] })
})

test('updateCardInPack accepts a wrapped cardInPack with empty strings', (t) => {
  assertAccepted(t, updateCardInPackSchema, {
    cardInPack: {
      card_id: 'c',
      pack_id: 'p',
      flavor: '',
      illustrator: '',
      image_url: '',
      position: '',
      quantity: 0,
      rotated: false,
    },
  })
})

test('deleteCardInPack accepts a wrapped cardInPack', (t) => {
  assertAccepted(t, deleteCardInPackSchema, { cardInPack: { card_id: 'c', pack_id: 'p' } })
})

// --- formats / traits ------------------------------------------------------

test('insertOrUpdateFormat accepts a wrapped format with null optionals', (t) => {
  assertAccepted(t, insertOrUpdateFormatSchema, {
    format: {
      id: 'std',
      name: 'Standard',
      legal_packs: [],
      supported: true,
      position: 0,
      maintainer: null,
      description: null,
      info_link: null,
    },
  })
})

test('updateTrait accepts a wrapped trait', (t) => {
  assertAccepted(t, updateTraitSchema, { trait: { id: 'water', name: 'Water' } })
})

test('deleteTrait accepts a wrapped trait', (t) => {
  assertAccepted(t, deleteTraitSchema, { trait: { id: 'water', name: 'Water' } })
})

// --- createDeck ------------------------------------------------------------

test('createDeck accepts an empty body', (t) => {
  assertAccepted(t, createDeckSchema, {})
})

test('createDeck accepts a forkedFrom id', (t) => {
  assertAccepted(t, createDeckSchema, { forkedFrom: 'deck-1' })
})

// --- createDecklist --------------------------------------------------------

test('createDecklist accepts empty id/clans/description with a real format + name', (t) => {
  assertAccepted(t, createDecklistSchema, {
    id: '',
    deck_id: 'deck-1',
    format: 'standard',
    name: 'New Deck',
    primary_clan: '',
    secondary_clan: '',
    description: '',
    version_number: '0.1',
    cards: {},
    card_pack_ids: {},
  })
})

test('createDecklist rejects an empty format (required, non-empty)', (t) => {
  assertRejected(t, createDecklistSchema, {
    deck_id: 'deck-1',
    format: '',
    name: 'New Deck',
    version_number: '0.1',
    cards: {},
  })
})

test('createDecklist rejects an empty name (required, non-empty)', (t) => {
  assertRejected(t, createDecklistSchema, {
    deck_id: 'deck-1',
    format: 'standard',
    name: '',
    version_number: '0.1',
    cards: {},
  })
})

test('createDecklist rejects an unknown key', (t) => {
  assertRejected(t, createDecklistSchema, {
    deck_id: 'deck-1',
    format: 'standard',
    name: 'D',
    version_number: '0.1',
    cards: {},
    bogus: true,
  })
})

test('createDecklist rejects card quantities above 3', (t) => {
  assertRejected(t, createDecklistSchema, {
    deck_id: 'deck-1',
    format: 'standard',
    name: 'D',
    version_number: '0.1',
    cards: { 'some-card': 4 },
  })
})

// --- validateDecklist ------------------------------------------------------

test('validateDecklist accepts cards + format', (t) => {
  assertAccepted(t, validateDecklistSchema, { cards: {}, format: 'standard' })
})

test('validateDecklist rejects a missing format', (t) => {
  assertRejected(t, validateDecklistSchema, { cards: {} })
})

// --- updateUser ------------------------------------------------------------

test('updateUser accepts { id, name }', (t) => {
  assertAccepted(t, updateUserSchema, { id: 'auth0|1', name: 'Alice' })
})

test('updateUser rejects an unknown roles key', (t) => {
  assertRejected(t, updateUserSchema, { id: 'auth0|1', name: 'Alice', roles: ['data_admin'] })
})

// --- rulings ---------------------------------------------------------------

test('createRuling accepts empty source/link (nullable columns)', (t) => {
  assertAccepted(t, createRulingSchema, { card_id: 'c', text: 'ruling', source: '', link: '' })
})

test('createRuling accepts a missing source/link (nullable columns)', (t) => {
  assertAccepted(t, createRulingSchema, { card_id: 'c', text: 'ruling' })
})

test('createRuling rejects a missing text (required)', (t) => {
  assertRejected(t, createRulingSchema, { card_id: 'c', source: '', link: '' })
})

test('createRuling rejects an empty text (required, non-empty)', (t) => {
  assertRejected(t, createRulingSchema, { card_id: 'c', text: '', source: '', link: '' })
})

test('updateRuling accepts a numeric id (regression)', (t) => {
  assertAccepted(t, updateRulingSchema, {
    id: 5,
    card_id: 'c',
    text: 'ruling',
    source: '',
    link: '',
  })
})

test('updateRuling rejects a non-numeric id', (t) => {
  assertRejected(t, updateRulingSchema, {
    id: 'not-a-number',
    card_id: 'c',
    text: 'x',
    source: 'x',
    link: 'x',
  })
})

// --- comments --------------------------------------------------------------

test('createDecklistComment accepts a top-level comment (no parent_comment_id)', (t) => {
  assertAccepted(t, createCommentSchema, { comment: 'nice', decklist_id: 'd1' })
})

test('createDecklistComment accepts a reply (with parent_comment_id)', (t) => {
  assertAccepted(t, createCommentSchema, {
    comment: 'reply',
    decklist_id: 'd1',
    parent_comment_id: 'c1',
  })
})

test('updateDecklistComment accepts { comment }', (t) => {
  assertAccepted(t, updateCommentSchema, { comment: 'edited' })
})
