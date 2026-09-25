import test from 'ava'
import type { CardWithVersions, Format } from '@5rdb/api'
import { createDeckStatistics } from './DeckValidator'

function makeFormat(id: string, legalPacks: string[]): Format {
  return { id, name: id, legal_packs: legalPacks, supported: true, position: 1 }
}

function makeCard(id: string, versions: { pack_id: string; rotated: boolean }[]): CardWithVersions {
  return {
    id,
    name: id,
    faction: 'crab',
    side: 'dynasty',
    type: 'character',
    is_unique: false,
    role_restrictions: [],
    deck_limit: 3,
    allowed_clans: ['crab'],
    versions,
  }
}

const formats = [
  makeFormat('emerald', ['spreading-shadows', 'emerald-core-set']),
  makeFormat('standard', ['core', 'spreading-shadows']),
]

const cards = [
  makeCard('legal-card', [{ pack_id: 'spreading-shadows', rotated: false }]),
  makeCard('rotated-card', [{ pack_id: 'spreading-shadows', rotated: true }]),
  makeCard('rotated-pack-card', [{ pack_id: 'core', rotated: true }]),
  makeCard('emerald-only-card', [{ pack_id: 'emerald-core-set', rotated: false }]),
  makeCard('reprinted-card', [
    { pack_id: 'emerald-core-set', rotated: false },
    { pack_id: 'core', rotated: true },
  ]),
]

const deck = Object.fromEntries(cards.map((card) => [card.id, 3]))

function rotatedCardIds(formatId: string): string[] {
  return createDeckStatistics(deck, formatId, cards, formats)
    .rotatedCards.map((card) => card.id)
    .sort()
}

test('Emerald Legacy decks flag rotated cards and cards outside the pool', (t) => {
  t.deepEqual(rotatedCardIds('emerald'), ['rotated-card', 'rotated-pack-card'])
})

test('other formats ignore rotation and only flag cards outside the pool', (t) => {
  t.deepEqual(rotatedCardIds('standard'), ['emerald-only-card'])
})

test('decks for an unknown format flag every card', (t) => {
  t.is(rotatedCardIds('unknown').length, cards.length)
})

test('cards outside the pool are reported as a validation error', (t) => {
  const stats = createDeckStatistics(deck, 'emerald', cards, formats)
  const error = stats.validationErrors.find((e) =>
    e.startsWith("The deck contains cards from packs that aren't legal in the format:")
  )
  t.deepEqual(error?.split(': ')[1].split(', ').sort(), ['rotated-card', 'rotated-pack-card'])
})
