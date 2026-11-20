import Joi from 'joi'
import { ValidatedRequest } from '../middlewares/validator'
import { Decklists$validate } from '@5rdb/api'
import { validateDeck } from './validators/deckValidator'

// A public endpoint: EmeraldDB's builder and Jigoku call it on every deck change. The
// limits are generous, so that a broken deck gets validation errors, not a 400; they only
// keep out requests no deck builder sends.
const MAX_DIFFERENT_CARDS = 200
const MAX_COPIES = 10

export const schema = {
  body: Joi.object<Decklists$validate['request']['body']>({
    // Card id to the number of copies; 0 copies are allowed and ignored
    cards: Joi.object<Record<string, number>>()
      .pattern(Joi.string(), Joi.number().integer().min(0).max(MAX_COPIES))
      .max(MAX_DIFFERENT_CARDS)
      .required(),
    format: Joi.string().required(),
  }),
}

export async function handler(
  req: ValidatedRequest<typeof schema>
): Promise<Decklists$validate['response']> {
  return await validateDeck(req.body.cards, req.body.format)
}
