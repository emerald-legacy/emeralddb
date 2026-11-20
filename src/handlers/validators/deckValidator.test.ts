import '../../testEnv'
import test from 'ava'
import type { Card, CardInPack, Format } from '@5rdb/api'
import { makeCard } from '../../testUtils'
import { validateDeck } from './deckValidator'
import { clearValidationData } from './validationData'
// `import = require` keeps the module objects assignable, so the tests can stub their
// exports. validateDeck sees the stubs through the re-exports in gateways/storage.
import cardStore = require('../../gateways/storage/private/card')
import cardInPackStore = require('../../gateways/storage/private/card_in_pack')
import formatStore = require('../../gateways/storage/private/formats')

const emerald: Format = {
  id: 'emerald',
  name: 'Emerald Legacy',
  legal_packs: ['core', 'expansion'],
  supported: true,
  position: 1,
}
// Rotation only applies to Emerald Legacy
const obsidian: Format = { ...emerald, id: 'obsidian', name: 'Obsidian Heresy' }

// A card a Crab deck may include: Crab, or another faction with Crab in allowed_clans
function cardForCrabDeck(overrides: Partial<Card> & Pick<Card, 'id' | 'type' | 'side'>): Card {
  return makeCard({ name: overrides.id, faction: 'crab', allowed_clans: ['crab'], ...overrides })
}

const stronghold = cardForCrabDeck({
  id: 'crab-stronghold',
  type: 'stronghold',
  side: 'province',
  deck_limit: 1,
  influence_pool: 10,
})
const role = cardForCrabDeck({ id: 'some-role', type: 'role', side: 'role', deck_limit: 1 })
const provinces = ['air', 'earth', 'fire', 'water', 'void'].map((element) =>
  cardForCrabDeck({
    id: `${element}-province`,
    type: 'province',
    side: 'province',
    deck_limit: 1,
    elements: [element],
  })
)
// 14 x 3 = 42 cards in each deck, within 40 to 45
const dynastyCharacters = Array.from({ length: 14 }, (_, index) =>
  cardForCrabDeck({ id: `dynasty-${index}`, type: 'character', side: 'dynasty' })
)
const conflictCharacters = Array.from({ length: 14 }, (_, index) =>
  cardForCrabDeck({ id: `conflict-${index}`, type: 'character', side: 'conflict' })
)
const supportRole = cardForCrabDeck({
  id: 'support-of-the-crab',
  type: 'role',
  side: 'role',
  deck_limit: 1,
})
// A splash card: Lion, but allowed in Crab decks
const lionConflictCard = cardForCrabDeck({
  id: 'lion-conflict-card',
  type: 'event',
  side: 'conflict',
  faction: 'lion',
  influence_cost: 2,
})
const rallyCard = cardForCrabDeck({
  id: 'rally-card',
  type: 'holding',
  side: 'dynasty',
  text: 'Rally.',
})
const holdingLimitedToOne = cardForCrabDeck({
  id: 'limited-holding',
  type: 'holding',
  side: 'dynasty',
  deck_limit: 1,
})
// Its printings differ from 'core, not rotated', for the card pool tests
const reprinted = cardForCrabDeck({ id: 'reprinted', type: 'character', side: 'conflict' })
const reprintedPrintings: CardInPack[] = [
  // Rotated in a legal pack, not rotated in a pack outside the format
  { card_id: 'reprinted', pack_id: 'core', rotated: true },
  { card_id: 'reprinted', pack_id: 'old-pack', rotated: false },
]
const allCards = [
  stronghold,
  role,
  ...provinces,
  ...dynastyCharacters,
  ...conflictCharacters,
  holdingLimitedToOne,
  reprinted,
  supportRole,
  lionConflictCard,
  rallyCard,
]

function stubStores(extraPrintings: CardInPack[] = [], formats: Format[] = [emerald, obsidian]) {
  cardStore.getAllCards = async () => allCards
  cardInPackStore.getAllCardsInPacks = async () => [
    ...allCards
      .filter((card) => card.id !== reprinted.id)
      .map((card): CardInPack => ({ card_id: card.id, pack_id: 'core', rotated: false })),
    ...reprintedPrintings,
    ...extraPrintings,
  ]
  formatStore.getAllFormats = async () => formats
  // The stubs replace the data, so the cached copy must go
  clearValidationData()
}

function validDeck(): Record<string, number> {
  return {
    [stronghold.id]: 1,
    [role.id]: 1,
    ...Object.fromEntries(provinces.map((province) => [province.id, 1])),
    ...Object.fromEntries(dynastyCharacters.map((card) => [card.id, 3])),
    ...Object.fromEntries(conflictCharacters.map((card) => [card.id, 3])),
  }
}

// The base deck with one conflict character swapped for the reprinted card
function deckWithReprintedCard(): Record<string, number> {
  const deck = validDeck()
  delete deck['conflict-0']
  return { ...deck, [reprinted.id]: 3 }
}

test.serial('the base deck is valid', async (t) => {
  stubStores()
  t.like(await validateDeck(validDeck(), 'emerald'), { valid: true, errors: [] })
})

test.serial('three copies of the stronghold are rejected (regression)', async (t) => {
  stubStores()
  const { valid, errors } = await validateDeck({ ...validDeck(), [stronghold.id]: 3 }, 'emerald')
  t.false(valid)
  t.true(errors.includes('A deck must contain exactly 1 stronghold.'))
  t.true(errors.some((error) => error.includes('crab-stronghold (at most 1)')))
})

test.serial('two copies of the role are rejected (regression)', async (t) => {
  stubStores()
  const { valid, errors } = await validateDeck({ ...validDeck(), [role.id]: 2 }, 'emerald')
  t.false(valid)
  t.true(errors.includes('A deck may contain only 1 role.'))
  t.true(errors.some((error) => error.includes('some-role (at most 1)')))
})

test.serial('the same province twice is rejected (regression)', async (t) => {
  stubStores()
  const deck = validDeck()
  delete deck['void-province']
  deck['air-province'] = 2
  const { valid, errors } = await validateDeck(deck, 'emerald')
  t.false(valid)
  t.true(errors.some((error) => error.includes('air-province (at most 1)')))
})

test.serial('provinces are counted by quantity (regression)', async (t) => {
  stubStores()
  const { valid, errors } = await validateDeck(
    { ...validDeck(), 'air-province': 3, 'earth-province': 3 },
    'emerald'
  )
  t.false(valid)
  t.true(errors.includes('A deck must contain exactly 5 provinces.'))
})

test.serial('a card limited to one copy may only appear once (regression)', async (t) => {
  stubStores()
  t.true((await validateDeck({ ...validDeck(), [holdingLimitedToOne.id]: 1 }, 'emerald')).valid)

  const { valid, errors } = await validateDeck(
    { ...validDeck(), [holdingLimitedToOne.id]: 2 },
    'emerald'
  )
  t.false(valid)
  t.true(errors.some((error) => error.includes('limited-holding (at most 1)')))
})

test.serial('other cards may appear three times, not four', async (t) => {
  stubStores()
  const { valid, errors } = await validateDeck({ ...validDeck(), 'conflict-0': 4 }, 'emerald')
  t.false(valid)
  t.true(errors.some((error) => error.includes('conflict-0 (at most 3)')))
})

// --- card pool ---------------------------------------------------------------------------

const outOfPool = "The deck contains cards from packs that aren't legal in the format: reprinted"

test.serial(
  'a card whose only legal printing is rotated is out of the Emerald pool (regression)',
  async (t) => {
    // The old server rule took "some printing in a legal pack" and "not all printings
    // rotated" from different printings, and accepted this card
    stubStores()
    const { valid, errors } = await validateDeck(deckWithReprintedCard(), 'emerald')
    t.false(valid)
    t.true(errors.includes(outOfPool))
  }
)

test.serial('rotation only applies to Emerald Legacy', async (t) => {
  stubStores()
  t.like(await validateDeck(deckWithReprintedCard(), 'obsidian'), { valid: true, errors: [] })
})

test.serial('a card is in the pool if one printing is legal and not rotated', async (t) => {
  stubStores([{ card_id: 'reprinted', pack_id: 'expansion', rotated: false }])
  t.like(await validateDeck(deckWithReprintedCard(), 'emerald'), { valid: true, errors: [] })
})

test.serial('a card without a printing in a legal pack is out of the pool', async (t) => {
  stubStores([], [{ ...obsidian, legal_packs: ['expansion'] }])
  const { valid, errors } = await validateDeck(deckWithReprintedCard(), 'obsidian')
  t.false(valid)
  t.true(errors.some((error) => error.includes('reprinted')))
})

// --- statistics --------------------------------------------------------------------------

test.serial('the statistics show influence and the deck sizes with their limits', async (t) => {
  stubStores()
  const { statistics } = await validateDeck(validDeck(), 'emerald')
  t.deepEqual(statistics, {
    influence: { used: 0, maximum: 10 },
    dynastyDeck: { size: 42, minimum: 40, maximum: 45 },
    conflictDeck: { size: 42, minimum: 40, maximum: 45 },
  })
})

test.serial('splash cards use influence', async (t) => {
  stubStores()
  const { statistics } = await validateDeck({ ...validDeck(), [lionConflictCard.id]: 2 }, 'emerald')
  t.deepEqual(statistics?.influence, { used: 4, maximum: 10 })
  t.is(statistics?.conflictDeck.size, 44)
})

test.serial('a support role adds 8 influence', async (t) => {
  stubStores()
  const deck = validDeck()
  delete deck[role.id]
  const { statistics } = await validateDeck({ ...deck, [supportRole.id]: 1 }, 'emerald')
  t.deepEqual(statistics?.influence, { used: 0, maximum: 18 })
})

test.serial('Rally cards raise the dynasty minimum in Emerald Legacy', async (t) => {
  stubStores()
  const { statistics } = await validateDeck({ ...validDeck(), [rallyCard.id]: 2 }, 'emerald')
  t.deepEqual(statistics?.dynastyDeck, { size: 44, minimum: 42, maximum: 45 })
})

test.serial('an unknown format has no statistics', async (t) => {
  stubStores()
  t.deepEqual(await validateDeck(validDeck(), 'unknown'), {
    valid: false,
    errors: ['Illegal format supplied'],
  })
})

test.serial('cards with 0 copies are ignored', async (t) => {
  stubStores()
  t.like(await validateDeck({ ...validDeck(), [supportRole.id]: 0 }, 'emerald'), {
    valid: true,
    errors: [],
  })
})
