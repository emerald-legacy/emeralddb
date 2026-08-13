import Joi from 'joi'
import { Card } from '@5rdb/api'

// Optional card fields are stored as NULL in the database, so the client sends them back as null.
// Joi rejects null by default, therefore every optional field explicitly allows it.
export const cardBodySchema = Joi.object<Card>({
  id: Joi.string().required(),
  name: Joi.string().required(),
  name_extra: Joi.string().allow('', null),
  faction: Joi.string().required(),
  side: Joi.string().required(),
  type: Joi.string().required(),
  is_unique: Joi.boolean().required(),
  role_restrictions: Joi.array().allow(null),
  text: Joi.string().allow('', null),
  restricted_in: Joi.array().allow(null),
  banned_in: Joi.array().allow(null),
  splash_banned_in: Joi.array().allow(null),
  allowed_clans: Joi.array().allow(null),
  traits: Joi.array().allow(null),
  cost: Joi.string().allow('', null),
  deck_limit: Joi.number().allow(null),
  influence_cost: Joi.number().allow(null),
  elements: Joi.array().allow(null),
  strength: Joi.string().allow('', null),
  glory: Joi.number().allow(null),
  fate: Joi.number().allow(null),
  honor: Joi.number().allow(null),
  influence_pool: Joi.number().allow(null),
  strength_bonus: Joi.string().allow('', null),
  military: Joi.string().allow('', null),
  political: Joi.string().allow('', null),
  military_bonus: Joi.string().allow('', null),
  political_bonus: Joi.string().allow('', null),
})
