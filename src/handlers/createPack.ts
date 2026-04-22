import { insertOrUpdatePack } from '../gateways/storage/index'
import Joi from 'joi'
import { ValidatedRequest } from '../middlewares/validator'
import { Pack, Packs$create } from '@5rdb/api'

export const schema = {
  body: Joi.object<Packs$create['request']['body']>({
    id: Joi.string().required(),
    name: Joi.string().required(),
    position: Joi.number().required(),
    size: Joi.number().required(),
    cycle_id: Joi.string().required(),
    publisher_id: Joi.string(),
    released_at: Joi.date(),
    rotated: Joi.boolean(),
  }),
}

export async function handler(req: ValidatedRequest<typeof schema>): Promise<Pack | undefined> {
  return insertOrUpdatePack(req.body)
}
