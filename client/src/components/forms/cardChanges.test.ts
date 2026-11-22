import test from 'ava'
import type { Card, CardInput } from '@5rdb/api'
import { changedFields } from './cardChanges'

const original: Card = {
  id: 'some-card',
  name: 'Some Card',
  faction: 'crab',
  side: 'conflict',
  type: 'event',
  is_unique: false,
  role_restrictions: [],
  deck_limit: 3,
  cost: '1',
  traits: ['tactic'],
}

const unchanged: CardInput = { ...original, name_extra: null, text: null }

test('an unchanged card has no changes, also where the editor sends null for a missing value', (t) => {
  t.deepEqual(changedFields(original, unchanged), [])
})

test('a changed cost is listed (regression)', (t) => {
  t.deepEqual(changedFields(original, { ...unchanged, cost: '2' }), [
    { fieldId: 'cost', old: '1', new: '2' },
  ])
})

test('every field that is sent is compared, also clearing one', (t) => {
  t.deepEqual(changedFields(original, { ...unchanged, cost: null, deck_limit: 1 }), [
    { fieldId: 'deck_limit', old: '3', new: '1' },
    { fieldId: 'cost', old: '1', new: '{null}' },
  ])
})

test('arrays are compared by their contents', (t) => {
  t.deepEqual(changedFields(original, { ...unchanged, traits: ['tactic'] }), [])
  t.deepEqual(changedFields(original, { ...unchanged, traits: ['tactic', 'kiho'] }), [
    { fieldId: 'traits', old: 'tactic', new: 'tactic,kiho' },
  ])
})
