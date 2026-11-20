import '../testEnv'
import test from 'ava'
import express from 'express'
import type { CardInPack } from '@5rdb/api'
import { asyncHandler } from '../utils/asyncHandler'
import { sendRequest } from '../testUtils'
import { validate } from '../middlewares/validator'
import { handler, schema } from './updateCardsInPack'
// `import = require` keeps the module object assignable, so the tests can stub its exports
import cardInPackStore = require('../gateways/storage/private/card_in_pack')

const printings: CardInPack[] = [
  { card_id: 'card-a', pack_id: 'core', quantity: 3, position: '1', rotated: false },
  { card_id: 'card-b', pack_id: 'core', quantity: 1, position: '2', rotated: false },
]

function updateAll(cardsInPacks: CardInPack[]) {
  const app = express()
  app.use(express.json())
  app.post('/cards-in-packs', validate(schema), asyncHandler(handler))
  return sendRequest(app, 'POST', '/cards-in-packs', { cardsInPacks })
}

test.serial('replies after all writes finished, with the written rows', async (t) => {
  const finished: string[] = []
  cardInPackStore.insertOrUpdateCardInPack = async (cardInPack) => {
    await new Promise((resolve) => setTimeout(resolve, 20))
    finished.push(cardInPack.card_id)
    return cardInPack
  }

  const response = await updateAll(printings)

  t.is(response.status, 200)
  t.deepEqual(finished.sort(), ['card-a', 'card-b'])
  t.deepEqual(response.body, printings)
})

test.serial('a failed write is an error response, not a 200 (regression)', async (t) => {
  cardInPackStore.insertOrUpdateCardInPack = async (cardInPack) => {
    if (cardInPack.card_id === 'card-b') throw new Error('insert failed')
    return cardInPack
  }

  const response = await updateAll(printings)

  t.is(response.status, 500)
})
