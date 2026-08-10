import { insertNewRuling } from '../gateways/storage/index'
import Joi from 'joi'
import { ValidatedRequest } from '../middlewares/validator'
import { Ruling, Ruling$create } from '@5rdb/api'

export const schema = {
  body: Joi.object<Ruling$create['request']['body']>({
    card_id: Joi.string().required(),
    text: Joi.string().required(),
    source: Joi.string().allow(''),
    link: Joi.string().allow(''),
  }),
}

export async function handler(req: ValidatedRequest<typeof schema>): Promise<Ruling | undefined> {
  return insertNewRuling(req.body)
}
