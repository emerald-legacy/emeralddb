import { insertOrUpdateCardInPack } from '../gateways/storage'
import Joi from 'joi'
import { ValidatedRequest } from '../middlewares/validator'
import { CardInPacks$updateAll, CardInPack } from '@5rdb/api'

export const schema = {
  body: Joi.object<CardInPacks$updateAll['request']['body']>({
    cardsInPacks: Joi.array()
      .items(
        Joi.object<CardInPack>({
          card_id: Joi.string().required(),
          pack_id: Joi.string().required(),
        }).unknown(true)
      )
      .required(),
  }),
}

// Replies once every write has finished, so a failed write ends in an error response
export async function handler(req: ValidatedRequest<typeof schema>): Promise<CardInPack[]> {
  return Promise.all(
    req.body.cardsInPacks.map((cardInPack) => insertOrUpdateCardInPack(cardInPack))
  )
}
