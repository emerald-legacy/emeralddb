import test from 'ava'
import type { CardWithVersions } from '@5rdb/api'
import { createDeckStatistics } from './deckStatistics'

function makeCard(overrides: Partial<CardWithVersions> & Pick<CardWithVersions, 'id'>) {
  const card: CardWithVersions = {
    name: overrides.id,
    faction: 'crab',
    side: 'dynasty',
    type: 'character',
    is_unique: false,
    role_restrictions: [],
    deck_limit: 3,
    versions: [],
    ...overrides,
  }
  return card
}

const cards = [
  makeCard({ id: 'stronghold', type: 'stronghold', side: 'province', faction: 'lion' }),
  makeCard({ id: 'role', type: 'role', side: 'role', faction: 'neutral' }),
  makeCard({ id: 'province', type: 'province', side: 'province' }),
  makeCard({ id: 'dynasty-character', cost: '2' }),
  makeCard({ id: 'holding', type: 'holding' }),
  makeCard({ id: 'conflict-event', type: 'event', side: 'conflict', faction: 'lion', cost: '1' }),
  makeCard({ id: 'splash-attachment', type: 'attachment', side: 'conflict', faction: 'crane' }),
]

const deck = {
  stronghold: 1,
  role: 1,
  province: 1,
  'dynasty-character': 3,
  holding: 2,
  'conflict-event': 3,
  'splash-attachment': 1,
}

test('cards are grouped by side and type, with their quantities', (t) => {
  const stats = createDeckStatistics(deck, 'emerald', cards)
  t.is(stats.stronghold?.id, 'stronghold')
  t.is(stats.role?.id, 'role')
  t.deepEqual(
    stats.provinces.map((card) => card.id),
    ['province']
  )
  t.deepEqual(
    stats.dynastyCards.dynastyCharacters.map((card) => [card.id, card.quantity]),
    [['dynasty-character', 3]]
  )
  t.is(stats.dynastyCards.size, 5)
  t.is(stats.conflictCards.size, 4)
})

test('the primary clan is the stronghold’s, the secondary the splash’s', (t) => {
  const stats = createDeckStatistics(deck, 'emerald', cards)
  t.is(stats.primaryClan, 'lion')
  t.is(stats.secondaryClan, 'crane')
})

test('the fate curve counts copies per cost, X for none', (t) => {
  const stats = createDeckStatistics(deck, 'emerald', cards)
  t.deepEqual(stats.dynastyFateCost, { '2': 3, X: 2 })
  t.deepEqual(stats.conflictFateCost, { '1': 3, X: 1 })
})

test('cards that are not known are left out', (t) => {
  const stats = createDeckStatistics({ ...deck, unknown: 3 }, 'emerald', cards)
  t.is(stats.dynastyCards.size + stats.conflictCards.size, 9)
})
