import test from 'ava'
import { withCardQuantity } from './cardQuantities'

test('sets the quantity of a card', (t) => {
  t.deepEqual(withCardQuantity({ a: 1 }, 'a', 3), { a: 3 })
  t.deepEqual(withCardQuantity({ a: 1 }, 'b', 2), { a: 1, b: 2 })
})

test('a quantity of 0 removes the card', (t) => {
  t.deepEqual(withCardQuantity({ a: 1, b: 2 }, 'a', 0), { b: 2 })
})

test('leaves the given cards unchanged (regression)', (t) => {
  const cards = { a: 1, b: 2 }
  withCardQuantity(cards, 'a', 3)
  withCardQuantity(cards, 'b', 0)
  t.deepEqual(cards, { a: 1, b: 2 })
})
