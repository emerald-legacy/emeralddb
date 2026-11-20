import '../testEnv'
import test from 'ava'
import { validate } from '../middlewares/validator'
import { schema as createCycleSchema } from './createCycle'
import { schema as createPackSchema } from './createPack'
import { schema as importPackSchema } from './importPack'
import { schema as updateCardsInPackSchema } from './updateCardsInPack'
import { schema as updateCardInPackSchema } from './updateCardInPack'
import { schema as deleteCardInPackSchema } from './deleteCardInPack'
import { schema as insertOrUpdateFormatSchema } from './insertOrUpdateFormat'
import { schema as updateTraitSchema } from './updateTrait'
import { schema as deleteTraitSchema } from './deleteTrait'
import { schema as createDeckSchema } from './createDeck'
import { schema as createDecklistSchema } from './createDecklist'
import { schema as validateDecklistSchema } from './validateDecklist'
import { schema as updateUserSchema } from './updateUser'
import { schema as createRulingSchema } from './createRuling'
import { schema as updateRulingSchema } from './updateRuling'
import { schema as createCommentSchema } from './createDecklistComment'
import { schema as updateCommentSchema } from './updateDecklistComment'

type Schema = Parameters<typeof validate>[0]

function runValidation(schema: Schema, body: unknown) {
  const statusCalls: number[] = []
  const res = {
    status(code: number) {
      statusCalls.push(code)
      return { send: () => undefined }
    },
  }
  let nextCalls = 0
  validate(schema)({ body, query: {} }, res, () => {
    nextCalls += 1
  })
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

test('importPack accepts the traits of the exported cards', (t) => {
  assertAccepted(t, importPackSchema, {
    pack: { id: 'p' },
    cards: [],
    cardsInPack: [],
    traits: [{ id: 'bushi', name: 'Bushi' }],
  })
})

test('importPack rejects a trait without a name', (t) => {
  assertRejected(t, importPackSchema, {
    pack: { id: 'p' },
    cards: [],
    cardsInPack: [],
    traits: [{ id: 'bushi' }],
  })
})

test('importPack rejects a missing required array', (t) => {
  assertRejected(t, importPackSchema, { pack: { id: 'p' }, cards: [] })
})

// --- cards-in-packs --------------------------------------------------------

test('updateCardsInPack accepts a cardsInPacks array', (t) => {
  assertAccepted(t, updateCardsInPackSchema, { cardsInPacks: [] })
  assertAccepted(t, updateCardsInPackSchema, {
    cardsInPacks: [{ card_id: 'c', pack_id: 'p', quantity: 3, position: '1' }],
  })
})

test('updateCardsInPack rejects a missing array and entries without ids', (t) => {
  assertRejected(t, updateCardsInPackSchema, {}, 'missing cardsInPacks')
  assertRejected(t, updateCardsInPackSchema, { cardsInPacks: [{ card_id: 'c' }] }, 'no pack_id')
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

// --- null-valued optional fields -------------------------------------------
// Optional columns are NULL in the database, so a client that loads an entity and
// saves it back sends null. Joi rejects null unless it is explicitly allowed.

test('createDecklist accepts a saved-back decklist (null clans, server-owned fields)', (t) => {
  assertAccepted(t, createDecklistSchema, {
    id: 'dl1',
    deck_id: 'd1',
    format: 'emerald',
    name: 'My Deck',
    primary_clan: null,
    secondary_clan: null,
    description: null,
    version_number: '0.2',
    cards: { 'daidoji-hiroteru': 3 },
    card_pack_ids: { 'daidoji-hiroteru': 'core' },
    published_date: undefined,
    created_at: '2026-01-01T00:00:00.000Z',
    user_id: 'auth0|123',
    username: 'someone',
  })
})

test('createDecklist strips the server-owned user_id', (t) => {
  const req: { body: object; query: object } = {
    body: {
      deck_id: 'd1',
      format: 'emerald',
      name: 'My Deck',
      version_number: '0.2',
      cards: { 'daidoji-hiroteru': 3 },
      user_id: 'auth0|attacker',
      created_at: '2026-01-01T00:00:00.000Z',
    },
    query: {},
  }
  const res = { status: () => ({ send: () => undefined }) }
  let nextCalls = 0
  const schema: Schema = createDecklistSchema
  validate(schema)(req, res, () => {
    nextCalls += 1
  })
  t.is(nextCalls, 1)
  t.false('user_id' in req.body)
  t.false('created_at' in req.body)
})

test('updateRuling accepts null source and link', (t) => {
  assertAccepted(t, updateRulingSchema, {
    id: 5,
    card_id: 'c',
    text: 'ruling',
    source: null,
    link: null,
  })
})

test('createRuling accepts null source and link', (t) => {
  assertAccepted(t, createRulingSchema, { card_id: 'c', text: 'ruling', source: null, link: null })
})

test('createPack accepts null optional fields', (t) => {
  assertAccepted(t, createPackSchema, {
    id: 'pack1',
    name: 'Pack',
    position: 1,
    cycle_id: 'core',
    publisher_id: null,
    released_at: null,
    rotated: null,
    size: null,
  })
})
