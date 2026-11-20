import Joi from 'joi'
import { ValidatedRequest } from '../middlewares/validator'
import { DecklistComment, DecklistComments$create } from '@5rdb/api'
import { insertComment } from '../gateways/storage'
import { getUserId } from '../utils/getUserId'

export const schema = {
  body: Joi.object<DecklistComments$create['request']['body']>({
    comment: Joi.string().required(),
    decklist_id: Joi.string().required(),
    parent_comment_id: Joi.string(),
  }),
}

export async function handler(
  req: ValidatedRequest<typeof schema>
): Promise<DecklistComment | undefined> {
  const userId = getUserId(req)
  return insertComment({
    comment: req.body.comment,
    decklist_id: req.body.decklist_id,
    parent_comment_id: req.body.parent_comment_id,
    user_id: userId,
  })
}
