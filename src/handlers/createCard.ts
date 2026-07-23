import { getCard, insertOrUpdateCard } from '../gateways/storage/index'
import * as Express from 'express'
import Joi from 'joi'
import { ValidatedRequest } from '../middlewares/validator'
import { Card, Cards$create } from '@5rdb/api'
import { validateCardInput } from './validators/validateCardInput'

export const schema = {
  body: Joi.object<Cards$create['request']['body']>({
    id: Joi.string().required(),
    name: Joi.string().required(),
    name_extra: Joi.string().allow(''),
    faction: Joi.string().required,
    side: Joi.string().required,
    type: Joi.string().required,
    is_unique: Joi.boolean().required,
    role_restrictions: Joi.array(),
    text: Joi.string,
    restricted_in: Joi.array(),
    banned_in: Joi.array(),
    splash_banned_in: Joi.array(),
    allowed_clans: Joi.array(),
    traits: Joi.array(),
    cost: Joi.string().allow(''),
    deck_limit: Joi.number(),
    influence_cost: Joi.number(),
    elements: Joi.array(),
    strength: Joi.string().allow(''),
    glory: Joi.number(),
    fate: Joi.number(),
    honor: Joi.number(),
    influence_pool: Joi.number(),
    strength_bonus: Joi.string().allow(''),
    military: Joi.string().allow(''),
    political: Joi.string().allow(''),
    military_bonus: Joi.string().allow(''),
    political_bonus: Joi.string().allow(''),
  }),
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
