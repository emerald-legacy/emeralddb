import { getCard, updateCard } from '../gateways/storage/index'
import * as Express from 'express'
import { ValidatedRequest } from '../middlewares/validator'
import { Card } from '@5rdb/api'
import { validateCardInput } from './validators/validateCardInput'
import { cardBodySchema } from './validators/cardBodySchema'

export const schema = {
  body: cardBodySchema,
}

export async function handler(
  req: ValidatedRequest<typeof schema>,
  res: Express.Response
): Promise<Card | undefined> {
  const cardId = req.params.cardId
  // The id in the body used to win, so a request could update another card than its URL
  if (req.body.id !== cardId) {
    res
      .status(400)
      .send(`The id in the body (${req.body.id}) is not ${cardId}. To change it, rename the card.`)
    return
  }
  console.log('Update card ' + cardId)
  const existingCard = await getCard(cardId)
  if (!existingCard) {
    res.status(400).send(`Card with id ${cardId} doesn't exist.`)
    return
  }
  const validationErrors = await validateCardInput(req.body)
  if (validationErrors.length > 0) {
    res.status(400).send(validationErrors)
    return
  }

  const updated = await updateCard(req.body)
  if (!updated) {
    res.status(404).send()
  }
  return updated
}
