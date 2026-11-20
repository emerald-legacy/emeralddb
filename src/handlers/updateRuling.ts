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
    source: Joi.string().allow('', null),
    link: Joi.string().allow('', null),
  }),
}

export async function handler(
  req: ValidatedRequest<typeof schema, Ruling$update['request']['params']>,
  res: Express.Response
): Promise<Ruling | undefined> {
  if (String(req.body.id) !== req.params.rulingId) {
    res.status(400).send({ message: ['The ruling id in the URL and in the body differ'] })
    return
  }
  // Without this check the upsert below would create a ruling under an unknown id
  const ruling = await getRuling(req.body.id)
  if (!ruling) {
    res.status(404).send()
    return
  }
  return insertOrUpdateRulingWithExistingId(req.body)
}
