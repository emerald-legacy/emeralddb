import { insertDecklist } from '../gateways/storage/index'
import Joi from 'joi'
import { ValidatedRequest } from '../middlewares/validator'
import { Decklist, Decklists$create } from '@5rdb/api'
import { resolveCardPackIds } from './resolveCardPackIds'
import { getUserId } from '../utils/getUserId'

export const schema = {
  body: Joi.object<Decklists$create['request']['body']>({
    deck_id: Joi.string().required(),
    format: Joi.string().required(),
    name: Joi.string().required(),
    primary_clan: Joi.string().allow('', null),
    secondary_clan: Joi.string().allow('', null),
    description: Joi.string().allow('', null),
    version_number: Joi.string().required(),
    cards: Joi.object().pattern(Joi.string(), Joi.number().min(1).max(3)).required(),
    card_pack_ids: Joi.object().pattern(Joi.string(), Joi.string()),
  }),
}

export async function handler(req: ValidatedRequest<typeof schema>): Promise<Decklist | undefined> {
  const userId = getUserId(req)
  console.log('Create decklist for user ' + userId)

  let cardPackIds = req.body.card_pack_ids
  if (!cardPackIds) {
    cardPackIds = await resolveCardPackIds(Object.keys(req.body.cards), req.body.format)
  }

  return await insertDecklist({ ...req.body, card_pack_ids: cardPackIds, user_id: userId })
}
