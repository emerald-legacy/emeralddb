import { getRuling, insertOrUpdateRulingWithExistingId } from '../gateways/storage/index'
import * as Express from 'express'
import Joi from 'joi'
import { ValidatedRequest } from '../middlewares/validator'
import { Ruling, Ruling$update } from '@5rdb/api'

export const schema = {
  body: Joi.object<Ruling$update['request']['body']>({
    id: Joi.number().required(),
    card_id: Joi.string().required(),
    text: Joi.string().required(),
    source: Joi.string().allow(''),
    link: Joi.string().allow(''),
  }),
}

export async function handler(
  req: ValidatedRequest<typeof schema>,
  res: Express.Response
): Promise<Ruling | undefined> {
  const ruling = getRuling(req.body.id)
  if (!ruling) {
    res.status(404).send()
    return
  }
  return insertOrUpdateRulingWithExistingId(req.body)
}
