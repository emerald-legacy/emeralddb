import '../../testEnv'
import test from 'ava'
import type { Card, CardInPack, Format } from '@5rdb/api'
import { makeCard } from '../../testUtils'
import { isDeckValid } from './deckValidator'
// `import = require` keeps the module objects assignable, so the tests can stub their
// exports. isDeckValid sees the stubs through the re-exports in gateways/storage.
import cardStore = require('../../gateways/storage/private/card')
import cardInPackStore = require('../../gateways/storage/private/card_in_pack')
import formatStore = require('../../gateways/storage/private/formats')

const emerald: Format = {
  id: 'emerald',
  name: 'Emerald Legacy',
  legal_packs: ['core'],
  supported: true,
  position: 1,
}

function crabCard(overrides: Partial<Card> & Pick<Card, 'id' | 'type' | 'side'>): Card {
  return makeCard({ name: overrides.id, faction: 'crab', allowed_clans: ['crab'], ...overrides })
}

const stronghold = crabCard({
  id: 'crab-stronghold',
  type: 'stronghold',
  side: 'province',
  deck_limit: 1,
  influence_pool: 10,
})
const role = crabCard({ id: 'some-role', type: 'role', side: 'role', deck_limit: 1 })
const provinces = ['air', 'earth', 'fire', 'water', 'void'].map((element) =>
  crabCard({
    id: `${element}-province`,
    type: 'province',
    side: 'province',
    deck_limit: 1,
    elements: [element],
  })
)
// 14 x 3 = 42 cards in each deck, within 40 to 45
const dynastyCharacters = Array.from({ length: 14 }, (_, index) =>
  crabCard({ id: `dynasty-${index}`, type: 'character', side: 'dynasty' })
)
const conflictCharacters = Array.from({ length: 14 }, (_, index) =>
  crabCard({ id: `conflict-${index}`, type: 'character', side: 'conflict' })
)
const holdingLimitedToOne = crabCard({
  id: 'limited-holding',
  type: 'holding',
  side: 'dynasty',
  deck_limit: 1,
})
const allCards = [
  stronghold,
  role,
  ...provinces,
  ...dynastyCharacters,
  ...conflictCharacters,
  holdingLimitedToOne,
]

function stubStores() {
  cardStore.getAllCards = async () => allCards
  cardInPackStore.getAllCardsInPacks = async () =>
    allCards.map((card): CardInPack => ({ card_id: card.id, pack_id: 'core', rotated: false }))
  formatStore.getAllFormats = async () => [emerald]
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

test.serial('the base deck is valid', async (t) => {
  stubStores()
  t.deepEqual(await isDeckValid(validDeck(), 'emerald'), { valid: true, errors: [] })
})

test.serial('three copies of the stronghold are rejected (regression)', async (t) => {
  stubStores()
  const { valid, errors } = await isDeckValid({ ...validDeck(), [stronghold.id]: 3 }, 'emerald')
  t.false(valid)
  t.true(errors.includes('A deck must contain exactly 1 stronghold.'))
  t.true(errors.some((error) => error.includes('crab-stronghold (at most 1)')))
})

test.serial('two copies of the role are rejected (regression)', async (t) => {
  stubStores()
  const { valid, errors } = await isDeckValid({ ...validDeck(), [role.id]: 2 }, 'emerald')
  t.false(valid)
  t.true(errors.includes('A deck may contain only 1 role.'))
  t.true(errors.some((error) => error.includes('some-role (at most 1)')))
})

test.serial('the same province twice is rejected (regression)', async (t) => {
  stubStores()
  const deck = validDeck()
  delete deck['void-province']
  deck['air-province'] = 2
  const { valid, errors } = await isDeckValid(deck, 'emerald')
  t.false(valid)
  t.true(errors.some((error) => error.includes('air-province (at most 1)')))
})

test.serial('provinces are counted by quantity (regression)', async (t) => {
  stubStores()
  const { valid, errors } = await isDeckValid(
    { ...validDeck(), 'air-province': 3, 'earth-province': 3 },
    'emerald'
  )
  t.false(valid)
  t.true(errors.includes('A deck must contain exactly 5 provinces.'))
})

test.serial('a card limited to one copy may only appear once (regression)', async (t) => {
  stubStores()
  t.true((await isDeckValid({ ...validDeck(), [holdingLimitedToOne.id]: 1 }, 'emerald')).valid)

  const { valid, errors } = await isDeckValid(
    { ...validDeck(), [holdingLimitedToOne.id]: 2 },
    'emerald'
  )
  t.false(valid)
  t.true(errors.some((error) => error.includes('limited-holding (at most 1)')))
})

test.serial('other cards may appear three times, not four', async (t) => {
  stubStores()
  const { valid, errors } = await isDeckValid({ ...validDeck(), 'conflict-0': 4 }, 'emerald')
  t.false(valid)
  t.true(errors.some((error) => error.includes('conflict-0 (at most 3)')))
})
