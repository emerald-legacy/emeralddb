import test from 'ava'
import { deepEqual } from './deepEqual'

test('equal primitives', (t) => {
  t.true(deepEqual('a', 'a'))
  t.true(deepEqual(1, 1))
  t.true(deepEqual(NaN, NaN))
  t.true(deepEqual(undefined, undefined))
  t.false(deepEqual(1, '1'))
  t.false(deepEqual(null, undefined))
  t.false(deepEqual(null, {}))
})

test('arrays compare element by element in order', (t) => {
  t.true(deepEqual(['a', 'b'], ['a', 'b']))
  t.false(deepEqual(['a', 'b'], ['b', 'a']))
  t.false(deepEqual(['a'], ['a', 'b']))
  t.false(deepEqual([], {}))
})

test('objects ignore key order and compare nested values', (t) => {
  t.true(
    deepEqual(
      {
        text: 'x',
        factions: ['crab'],
        numericValues: [{ name: 'cost', typeAndValue: { type: 'eq', value: 2 } }],
      },
      {
        numericValues: [{ typeAndValue: { value: 2, type: 'eq' }, name: 'cost' }],
        factions: ['crab'],
        text: 'x',
      }
    )
  )
  t.false(deepEqual({ a: 1 }, { a: 2 }))
  t.false(deepEqual({ a: 1 }, { a: 1, b: 2 }))
  t.false(deepEqual({ a: undefined }, { b: undefined }))
})
