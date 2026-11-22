import test from 'ava'
import type { Pack } from '@5rdb/api'
import { createFilterFromUrlSearchParams } from './cardsUrlFilter'

const noFilter = { text: '', packs: [], cycles: [], format: 'emerald' }
const packs: Pack[] = [
  { id: 'core', name: 'Core', cycle_id: 'core-cycle', position: 1, size: 200, rotated: false },
  { id: 'first', name: 'First', cycle_id: 'second-cycle', position: 1, size: 20, rotated: false },
  { id: 'second', name: 'Second', cycle_id: 'second-cycle', position: 2, size: 20, rotated: false },
]

function fromUrl(search: string) {
  return createFilterFromUrlSearchParams(new URLSearchParams(search), packs, noFilter)
}

test('a query with a % is searched for as it is (regression)', (t) => {
  // The header bar encodes the search: "100%" becomes "100%25"
  t.is(fromUrl(`?query=${encodeURIComponent('100%')}`).text, '100%')
  t.is(fromUrl('?query=%25').text, '%')
})

test('a query with spaces and an ampersand is decoded once', (t) => {
  t.is(fromUrl(`?query=${encodeURIComponent('Way of the Crab & co')}`).text, 'Way of the Crab & co')
})

test('a cycle stands for its packs', (t) => {
  t.like(fromUrl('?cycle=second-cycle'), { packs: ['first', 'second'], cycles: ['second-cycle'] })
})

test('a pack filters by that pack, other fields stay', (t) => {
  t.deepEqual(fromUrl('?pack=core'), { ...noFilter, packs: ['core'] })
})
