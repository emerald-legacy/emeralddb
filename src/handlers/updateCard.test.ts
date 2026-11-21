import '../testEnv'
import test from 'ava'
import express from 'express'
import type { CardInput } from '@5rdb/api'
import { asyncHandler } from '../utils/asyncHandler'
import { makeCard, sendRequest } from '../testUtils'
import { validate } from '../middlewares/validator'
import * as updateCard from './updateCard'
// `import = require` keeps the module objects assignable, so the tests can stub their exports
import cardStore = require('../gateways/storage/private/card')
import traitStore = require('../gateways/storage/private/trait')

function stubStores(): string[] {
  const updated: string[] = []
  cardStore.getCard = async (id) =>
    ['card-a', 'card-b'].includes(id) ? makeCard({ id }) : undefined
  cardStore.updateCard = async (card: CardInput) => {
    updated.push(card.id)
    return makeCard({ id: card.id, name: card.name })
  }
  traitStore.getAllTraits = async () => []
  return updated
}

function update(urlId: string, bodyId: string) {
  const app = express()
  app.use(express.json())
  app.post('/cards/:cardId', validate(updateCard.schema), asyncHandler(updateCard.handler))
  // A valid character, so that only the id decides
  const { id: _id, ...card } = makeCard({ allowed_clans: ['crab'], glory: 1 })
  return sendRequest(app, 'POST', `/cards/${urlId}`, { ...card, id: bodyId, name: 'Changed' })
}

test.serial('the card in the URL is updated', async (t) => {
  const updated = stubStores()
  const response = await update('card-a', 'card-a')
  t.is(response.status, 200)
  t.deepEqual(updated, ['card-a'])
})

test.serial('another id in the body is a 400 and updates nothing (regression)', async (t) => {
  const updated = stubStores()
  const response = await update('card-a', 'card-b')
  t.is(response.status, 400)
  t.deepEqual(updated, [])
})
