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
  console.log('Update card ' + req.body.id)
  const existingCard = await getCard(req.body.id)
  if (!existingCard) {
    res.status(400).send(`Card with id ${req.body.id} doesn't exist.`)
    return
  }
  const validationErrors = await validateCardInput(req.body)
  if (validationErrors.length > 0) {
    res.status(400).send(validationErrors)
    return
  }

  return updateCard(req.body)
}
