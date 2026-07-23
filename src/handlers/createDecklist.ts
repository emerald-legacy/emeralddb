import { insertDecklist } from '../gateways/storage/index'
import Joi from 'joi'
import { ValidatedRequest } from '../middlewares/validator'
import { Decklist } from '@5rdb/api'
import { resolveCardPackIds } from './resolveCardPackIds'

export const schema = {
  body: Joi.object<Decklist>({
    id: Joi.string().allow(''),
    deck_id: Joi.string().required(),
    format: Joi.string().required(),
    name: Joi.string().required(),
    primary_clan: Joi.string().allow(''),
    secondary_clan: Joi.string().allow(''),
    description: Joi.string().allow(''),
    version_number: Joi.string().required(),
    cards: Joi.object().pattern(Joi.string(), Joi.number().min(1).max(3)).required(),
    card_pack_ids: Joi.object().pattern(Joi.string(), Joi.string()),
    published_date: Joi.date(),
  }),
}

export async function handler(req: ValidatedRequest<typeof schema>): Promise<Decklist | undefined> {
  const user = (req as any).auth as { sub: string }
  console.log('Create decklist for user ' + user.sub)

  let cardPackIds = req.body.card_pack_ids
  if (!cardPackIds) {
    cardPackIds = await resolveCardPackIds(Object.keys(req.body.cards), req.body.format)
  }

  return await insertDecklist({ ...req.body, card_pack_ids: cardPackIds, user_id: user.sub })
}
