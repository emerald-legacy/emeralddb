import '../../testEnv'
import test from 'ava'
import { makeCard } from '../../testUtils'
import { FIVE_MINUTES, clearValidationData, getValidationData } from './validationData'
// `import = require` keeps the module objects assignable, so the tests can stub their exports
import cardStore = require('../../gateways/storage/private/card')
import cardInPackStore = require('../../gateways/storage/private/card_in_pack')
import formatStore = require('../../gateways/storage/private/formats')

function stubStores() {
  const loads = { count: 0 }
  cardStore.getAllCards = async () => {
    loads.count += 1
    return [makeCard({ id: 'a' }), makeCard({ id: 'b' })]
  }
  cardInPackStore.getAllCardsInPacks = async () => [
    { card_id: 'a', pack_id: 'core', rotated: false },
    { card_id: 'a', pack_id: 'reprint', rotated: true },
  ]
  formatStore.getAllFormats = async () => [
    { id: 'emerald', name: 'Emerald', supported: true, position: 1 },
  ]
  clearValidationData()
  return loads
}

test.serial('cards come with their printings', async (t) => {
  stubStores()
  const { cards, formats } = await getValidationData()
  t.deepEqual(
    cards.map((card) => [card.id, card.versions.map((version) => version.pack_id)]),
    [
      ['a', ['core', 'reprint']],
      ['b', []],
    ]
  )
  t.is(formats.length, 1)
})

test.serial('the data is loaded once, also by parallel callers', async (t) => {
  const loads = stubStores()
  await Promise.all([getValidationData(), getValidationData()])
  await getValidationData()
  t.is(loads.count, 1)
})

test.serial('clearing loads the data again', async (t) => {
  const loads = stubStores()
  await getValidationData()
  clearValidationData()
  await getValidationData()
  t.is(loads.count, 2)
})

test.serial('the data is loaded again after the maximum age', async (t) => {
  const loads = stubStores()
  const realNow = Date.now
  try {
    await getValidationData()
    const loadedAt = Date.now()
    Date.now = () => loadedAt + FIVE_MINUTES + 1
    await getValidationData()
  } finally {
    Date.now = realNow
  }
  t.is(loads.count, 2)
})

test.serial('a failed load is not kept', async (t) => {
  const loads = stubStores()
  const workingGetAllCards = cardStore.getAllCards
  cardStore.getAllCards = async () => {
    throw new Error('database down')
  }
  await t.throwsAsync(getValidationData(), { message: 'database down' })
  cardStore.getAllCards = workingGetAllCards
  await getValidationData()
  t.is(loads.count, 1)
})
