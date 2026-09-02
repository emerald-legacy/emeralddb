import { getCard, insertOrUpdateCard } from '../gateways/storage/index'
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
  console.log('Create card ' + req.body.id)
  const existingCard = await getCard(req.body.id)
  if (existingCard?.id === req.body.id) {
    res.status(400).send(`Card with id ${req.body.id} already exists!`)
    return
  }
  const validationErrors = await validateCardInput(req.body)
  console.log(validationErrors)
  console.log(validationErrors.length)
  if (validationErrors.length > 0) {
    res.status(400).send(validationErrors)
    return
  }
  return insertOrUpdateCard(req.body)
}
