import Joi from 'joi'
import { ValidatedRequest } from '../middlewares/validator'
import { Decklists$validate } from '@5rdb/api'
import { validateDeck } from './validators/deckValidator'

export const schema = {
  body: Joi.object<Decklists$validate['request']['body']>({
    cards: Joi.object<Record<string, number>>().required(),
    format: Joi.string().required(),
  }),
}

export async function handler(
  req: ValidatedRequest<typeof schema>
): Promise<Decklists$validate['response']> {
  return await validateDeck(req.body.cards, req.body.format)
}
