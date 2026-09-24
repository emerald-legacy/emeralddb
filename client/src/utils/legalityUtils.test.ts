import test from 'ava'
import type { CardWithVersions, Format } from '@5rdb/api'
import { getCardLegality, getFormatLegalities, isInCardPool } from './legalityUtils'

function makeFormat(id: string, legalPacks: string[] | undefined, position = 1): Format {
  return { id, name: id, legal_packs: legalPacks, supported: true, position }
}

function makeCard(overrides: Partial<CardWithVersions>): CardWithVersions {
  return {
    id: 'test-card',
    name: 'Test Card',
    faction: 'crab',
    side: 'dynasty',
    type: 'character',
    is_unique: false,
    role_restrictions: [],
    deck_limit: 3,
    restricted_in: [],
    banned_in: [],
    versions: [],
    ...overrides,
  }
}

function printing(packId: string, rotated = false) {
  return { pack_id: packId, rotated }
}

const emerald = makeFormat('emerald', ['spreading-shadows', 'emerald-core-set'])
const obsidian = makeFormat('obsidian', ['core', 'spreading-shadows', 'emerald-core-set'])
const stronghold = makeFormat('standard', ['core', 'spreading-shadows'])
const sanctuary = makeFormat('sanctuary', ['emerald-core-set'])

test('a card printed in a legal pack is legal', (t) => {
  const card = makeCard({ versions: [printing('spreading-shadows')] })
  t.is(getCardLegality(card, stronghold), 'legal')
})

test('a card never printed in a legal pack is not legal', (t) => {
  const card = makeCard({ versions: [printing('spreading-shadows')] })
  t.is(getCardLegality(card, sanctuary), 'not-legal')
})

test('a format without legal packs allows no cards', (t) => {
  const card = makeCard({ versions: [printing('spreading-shadows')] })
  t.is(getCardLegality(card, makeFormat('jade-edict', undefined)), 'not-legal')
})

test('a card without printings is not legal', (t) => {
  t.is(getCardLegality(makeCard({ versions: [] }), emerald), 'not-legal')
})

test('a card banned in the format is banned', (t) => {
  const card = makeCard({
    versions: [printing('spreading-shadows')],
    banned_in: ['emerald', 'obsidian'],
  })
  t.is(getCardLegality(card, emerald), 'banned')
  t.is(getCardLegality(card, obsidian), 'banned')
  t.is(getCardLegality(card, stronghold), 'legal')
})

test('a card restricted in the format is restricted', (t) => {
  const card = makeCard({ versions: [printing('spreading-shadows')], restricted_in: ['emerald'] })
  t.is(getCardLegality(card, emerald), 'restricted')
  t.is(getCardLegality(card, obsidian), 'legal')
})

test('banned takes precedence over restricted', (t) => {
  const card = makeCard({
    versions: [printing('spreading-shadows')],
    banned_in: ['emerald'],
    restricted_in: ['emerald'],
  })
  t.is(getCardLegality(card, emerald), 'banned')
})

test('missing banned and restricted lists count as empty', (t) => {
  const card = makeCard({
    versions: [printing('spreading-shadows')],
    banned_in: undefined,
    restricted_in: undefined,
  })
  t.is(getCardLegality(card, emerald), 'legal')
})

test('a rotated printing is rotated in Emerald Legacy even if its pack is still legal', (t) => {
  const card = makeCard({ versions: [printing('spreading-shadows', true)] })
  t.is(getCardLegality(card, emerald), 'rotated')
})

test('a printing from a rotated pack is rotated in Emerald Legacy', (t) => {
  const card = makeCard({ versions: [printing('core', true)] })
  t.is(getCardLegality(card, emerald), 'rotated')
})

test('rotation only applies to Emerald Legacy', (t) => {
  const card = makeCard({ versions: [printing('core', true)] })
  t.is(getCardLegality(card, obsidian), 'legal')
  t.is(getCardLegality(card, stronghold), 'legal')
  t.is(getCardLegality(card, sanctuary), 'not-legal')
})

test('rotated takes precedence over banned and restricted', (t) => {
  const card = makeCard({
    versions: [printing('core', true)],
    banned_in: ['emerald'],
    restricted_in: ['emerald'],
  })
  t.is(getCardLegality(card, emerald), 'rotated')
})

test('a reprinted card is legal wherever any of its printings is legal', (t) => {
  const card = makeCard({ versions: [printing('emerald-core-set'), printing('core', true)] })
  t.is(getCardLegality(card, emerald), 'legal')
  t.is(getCardLegality(card, sanctuary), 'legal')
  t.is(getCardLegality(card, stronghold), 'legal')
  t.is(getCardLegality(card, obsidian), 'legal')
})

test('the order of printings does not matter', (t) => {
  const card = makeCard({ versions: [printing('core', true), printing('emerald-core-set')] })
  t.is(getCardLegality(card, emerald), 'legal')
})

test('banned and restricted cards are still in the card pool', (t) => {
  const card = makeCard({
    versions: [printing('spreading-shadows')],
    banned_in: ['emerald'],
    restricted_in: ['standard'],
  })
  t.true(isInCardPool(card, emerald))
  t.true(isInCardPool(card, stronghold))
  t.false(isInCardPool(card, sanctuary))
})

test('rotated cards are not in the Emerald Legacy card pool', (t) => {
  const card = makeCard({ versions: [printing('spreading-shadows', true)] })
  t.false(isInCardPool(card, emerald))
  t.true(isInCardPool(card, stronghold))
})

test('legalities are listed for every format in position order', (t) => {
  const card = makeCard({ versions: [printing('spreading-shadows')], restricted_in: ['emerald'] })
  const formats = [
    { ...obsidian, position: 6 },
    { ...sanctuary, position: 1 },
    { ...emerald, position: 2 },
  ]
  t.deepEqual(
    getFormatLegalities(card, formats).map(({ format, legality }) => [format.id, legality]),
    [
      ['sanctuary', 'not-legal'],
      ['emerald', 'restricted'],
      ['obsidian', 'legal'],
    ]
  )
})

test('listing legalities does not reorder the given formats', (t) => {
  const formats = [makeFormat('obsidian', [], 6), makeFormat('sanctuary', [], 1)]
  getFormatLegalities(makeCard({}), formats)
  t.deepEqual(
    formats.map((format) => format.id),
    ['obsidian', 'sanctuary']
  )
})
